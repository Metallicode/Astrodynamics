// Chandra view: the Moon's phase as you see it, the nodes (Rahu & Ketu) in 3D, and the Moon's path
// through the real stars, nakshatras and signs. Depends on app.js, atlas.js (star data helpers),
// moon-lore.js and astronomy-engine.

const MOON_KEY = 'astrodynamics.moon.v1';
const MOON_INCL = 5.145;                       // mean inclination of the lunar orbit to the ecliptic
const SYNODIC = 29.530589, DRACONIC = 27.212221;
const NODE_RATE = 360 / 6798.38;               // mean node regression, ° per day
const NAK_SPAN = 360 / 27;
const SOLAR_LIMIT = 18.5, LUNAR_LIMIT = 12.2;  // greatest Sun–node distance for a (partial) eclipse
const STRIP_LAT = 15;                          // the strip map covers ±15° of ecliptic latitude

const moon = {
    yaw: -55, pitch: 24, exaggerate: true,
    layers: { nakshatras: true, signs: true, bounds: false, figures: true, planets: true },
    span: 90, centre: null,                    // strip window width (°) and centre (sidereal °); null = follow the Moon
    anim: null
};

// ---------------------------------------------------------------------------
// Settings

function loadMoon() {
    try {
        const saved = JSON.parse(localStorage.getItem(MOON_KEY) || '{}');
        for (const k of ['yaw', 'pitch', 'exaggerate', 'span']) if (saved[k] !== undefined) moon[k] = saved[k];
        if (saved.layers) Object.assign(moon.layers, saved.layers);
    } catch (e) {
        console.warn('Could not read moon settings', e);
    }
}

function saveMoon() {
    const { yaw, pitch, exaggerate, span, layers } = moon;
    localStorage.setItem(MOON_KEY, JSON.stringify({ yaw, pitch, exaggerate, span, layers }));
}

// ---------------------------------------------------------------------------
// Astronomy

const observer = () => state.location ? new Astronomy.Observer(state.location.lat, state.location.lon, 0) : null;
const toSid = (trop, date) => norm360(trop - ayanamsa(date));
const nodeTrop = date => state.nodeType === 'true' ? trueNodeLongitude(date) : meanNodeLongitude(date);
const moonLat = date => Astronomy.EclipticGeoMoon(date).lat;

// Ecliptic J2000 longitude/latitude of a unit vector in J2000 equatorial coordinates.
function eclJ2000(v) {
    const e = OBLIQUITY_J2000 * DEG;
    return {
        lon: norm360(Math.atan2(v[1] * Math.cos(e) + v[2] * Math.sin(e), v[0]) / DEG),
        lat: Math.asin(Math.max(-1, Math.min(1, v[2] * Math.cos(e) - v[1] * Math.sin(e)))) / DEG
    };
}

// Sidereal position of a star (constant: the Lahiri frame moves with the stars).
const starSidCache = new Map();
function starSid(hip) {
    if (!starSidCache.has(hip)) {
        const s = STAR.get(hip);
        const e = eclJ2000(s.v);
        starSidCache.set(hip, { lon: norm360(e.lon - SIDEREAL_OFFSET_J2000), lat: e.lat });
    }
    return starSidCache.get(hip);
}

// Lore names yogataras by Bayer letter or Flamsteed number within a constellation.
const yogataraCache = {};
function yogataraHip(i) {
    if (!(i in yogataraCache)) {
        const [con, ref] = MOON_LORE.nakshatras[i].yogatara;
        const hit = Object.entries(SKY.names).find(([hip, n]) => n[3] === con && (n[1] === ref || n[2] === ref) && STAR.has(+hip));
        yogataraCache[i] = hit ? +hit[0] : null;
    }
    return yogataraCache[i];
}

// Previous and next New Moon around a date.
function lunationAround(date) {
    const age = Astronomy.MoonPhase(date) / 360 * SYNODIC;
    let prev = Astronomy.SearchMoonPhase(0, addDays(date, -age - 1.5), 3);
    if (!prev || prev.date > date) prev = Astronomy.SearchMoonPhase(0, addDays(date, -SYNODIC - 2), SYNODIC + 2);
    let next = Astronomy.SearchMoonPhase(0, addHours(prev.date, 1), SYNODIC + 2);
    if (next.date <= date) { prev = next; next = Astronomy.SearchMoonPhase(0, addHours(prev.date, 1), SYNODIC + 2); } // exactly at New Moon
    return { start: prev.date, end: next.date };
}

// Everything about one lunation, cached: tithi start times and the Full Moon.
const lunationCache = new Map();
function lunation(date) {
    const { start, end } = lunationAround(date);
    const key = start.getTime();
    if (lunationCache.has(key)) return lunationCache.get(key);
    const tithis = [];
    for (let n = 0; n < 30; n++) tithis.push(n === 0 ? start : Astronomy.SearchMoonPhase(12 * n, start, SYNODIC + 2).date);
    const full = tithis[15];
    const L = { start, end, tithis, full, fullDist: Astronomy.Libration(full).dist_km };
    lunationCache.set(key, L);
    if (lunationCache.size > 24) lunationCache.delete(lunationCache.keys().next().value);
    return L;
}

// The Moon's track from ~13.6 days before to ~13.6 days after a date (one sidereal month) every 3 hours,
// plus its place at each local midnight.
let trackCache = { key: null };
function moonTrack(date) {
    const key = Math.floor(date / (3 * HOUR_MS));
    if (trackCache.key === key) return trackCache;
    const at = t => ({ t, lon: toSid(tropicalLongitude('Moon', t), t), lat: moonLat(t) });
    const start = addDays(date, -13.6), pts = [], days = [];
    for (let k = 0; k <= 8 * 27.2; k++) pts.push(at(addHours(start, 3 * k)));
    const day = new Date(start);
    day.setHours(24, 0, 0, 0);
    for (; day < addDays(date, 13.6); day.setDate(day.getDate() + 1)) days.push(at(new Date(day)));
    trackCache = { key, pts, days };
    return trackCache;
}

// Position angle of the Moon's bright limb (from north through east), and as turned in your own sky.
function brightLimb(date) {
    const obs = observer() || new Astronomy.Observer(0, 0, 0);
    const s = Astronomy.Equator('Sun', date, obs, true, true), m = Astronomy.Equator('Moon', date, obs, true, true);
    const a0 = s.ra * 15 * DEG, d0 = s.dec * DEG, a = m.ra * 15 * DEG, d = m.dec * DEG;
    const chi = Math.atan2(Math.cos(d0) * Math.sin(a0 - a), Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(a0 - a)) / DEG;
    let q = 0, hor = null;
    if (state.location) {
        const H = (norm360(Astronomy.SiderealTime(date) * 15 + state.location.lon) - m.ra * 15) * DEG;
        const phi = state.location.lat * DEG;
        q = Math.atan2(Math.sin(H), Math.tan(phi) * Math.cos(d) - Math.sin(d) * Math.cos(H)) / DEG;
        hor = Astronomy.Horizon(date, obs, m.ra, m.dec, 'normal');
    }
    return { chi, q, sky: chi - q, hor, dec: m.dec };
}

// ---------------------------------------------------------------------------
// Drawing helpers

const f1 = x => x.toFixed(1);

// Lit part of a Moon disc of radius r, bright limb towards screen angle `rot` (degrees, 0 = right, clockwise).
function moonDisc(cx, cy, r, illum, rot, { earthshine = true, id = 'md' } = {}) {
    const rx = r * Math.abs(2 * illum - 1);
    const lit = illum < 0.005 ? '' : illum > 0.995
        ? `<circle cx="0" cy="0" r="${r}" fill="url(#${id}-lit)"/>`
        : `<path d="M0,${-r} A${r},${r} 0 0 1 0,${r} A${f1(rx)},${r} 0 0 ${illum < 0.5 ? 0 : 1} 0,${-r} Z" fill="url(#${id}-lit)"/>`;
    return `<defs><radialGradient id="${id}-lit" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fffbeb"/><stop offset="0.7" stop-color="#e7e5e4"/><stop offset="1" stop-color="#a8a29e"/></radialGradient></defs>
        <g transform="translate(${f1(cx)},${f1(cy)}) rotate(${f1(rot)})">
        <circle r="${r}" fill="${earthshine && illum < 0.4 ? '#334155' : '#1e293b'}" stroke="#475569" stroke-width="0.5"/>
        ${lit}</g>`;
}

// Screen rotation for a bright-limb angle measured from "up" towards the left (east, or counterclockwise in your sky).
const limbRotation = theta => Math.atan2(-Math.cos(theta * DEG), -Math.sin(theta * DEG)) / DEG;

const svgOpen = (w, h, extra = '') => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block" ${extra}>`;
const txt = (x, y, s, attrs = '') => `<text x="${f1(x)}" y="${f1(y)}" ${attrs}>${s}</text>`;

// ---------------------------------------------------------------------------
// Panel 1: the phase

function renderMoonPhase(date) {
    const info = moonPhaseInfo(date);
    const lib = Astronomy.Libration(date);
    const L = lunation(date);
    const limb = brightLimb(date);
    const asSeen = !!state.location;
    const theta = asSeen ? limb.sky : limb.chi;
    const age = (date - L.start) / DAY_MS;
    const tithi = tithiOf(current.pos);

    // The disc, turned as it hangs in your sky (or north up without a location)
    const disc = `${svgOpen(220, 220)}
        <circle cx="110" cy="110" r="104" fill="url(#halo)"/>
        <defs><radialGradient id="halo"><stop offset="0.75" stop-color="#e2e8f0" stop-opacity="${0.08 * info.illum}"/><stop offset="1" stop-color="#e2e8f0" stop-opacity="0"/></radialGradient></defs>
        ${moonDisc(110, 110, 80, info.illum, limbRotation(theta), { id: 'bigmoon' })}
        ${asSeen ? txt(110, 14, 'zenith ↑', 'fill="#64748b" font-size="10" text-anchor="middle"') + txt(110, 214, 'horizon ↓', 'fill="#64748b" font-size="10" text-anchor="middle"')
            : txt(110, 14, 'N', 'fill="#64748b" font-size="10" text-anchor="middle"') + txt(8, 114, 'E', 'fill="#64748b" font-size="10"') + txt(204, 114, 'W', 'fill="#64748b" font-size="10"')}
        </svg>`;

    // Top-down Sun–Earth–Moon diagram with the 30 tithi wedges
    const C = 100, R = 66;
    const elong = norm360(current.pos.Moon.trop - current.pos.Sun.trop);
    const at = (r, a) => [C + r * Math.cos(a * DEG), C - r * Math.sin(a * DEG)];
    let wedges = '';
    for (let n = 0; n < 30; n++) {
        const [x0, y0] = at(R + 12, n * 12), [x1, y1] = at(R + 12, n * 12 + 12);
        const on = n === tithi.n - 1;
        wedges += `<path d="M${C},${C} L${f1(x0)},${f1(y0)} A${R + 12},${R + 12} 0 0 0 ${f1(x1)},${f1(y1)} Z" fill="${on ? 'rgba(251,191,36,0.25)' : n < 15 ? 'rgba(148,163,184,0.05)' : 'rgba(30,41,59,0.25)'}" stroke="#1e293b" stroke-width="0.5"/>`;
    }
    const [mx, my] = at(R, elong);
    const tithiLabels = [[90, 'tithi 8'], [180, 'Full'], [270, 'tithi 23']].map(([a, s]) => {
        const [x, y] = at(R + 22, a);
        return txt(x, y + 3, s, 'fill="#64748b" font-size="9" text-anchor="middle"');
    }).join('') + txt(C + R + 4, C + 14, 'New', 'fill="#64748b" font-size="9" text-anchor="middle"');
    const sem = `${svgOpen(200, 200)}
        ${wedges}
        <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#475569" stroke-dasharray="2 3"/>
        <line x1="${C + 14}" y1="${C}" x2="196" y2="${C}" stroke="#fcd34d" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
        ${txt(196, C - 6, 'to the Sun ☉ →', 'fill="#fcd34d" font-size="9" text-anchor="end"')}
        <circle cx="${C}" cy="${C}" r="9" fill="#1e3a8a"/><path d="M${C},${C - 9} A9,9 0 0 1 ${C},${C + 9} Z" fill="#60a5fa"/>
        <circle cx="${f1(mx)}" cy="${f1(my)}" r="7" fill="#1e293b" stroke="#64748b" stroke-width="0.5"/>
        <path d="M${f1(mx)},${f1(my - 7)} A7,7 0 0 1 ${f1(mx)},${f1(my + 7)} Z" fill="#e7e5e4"/>
        ${tithiLabels}
        </svg>`;

    // Rise / set and where to look
    let sky = '<p class="text-sm text-slate-500">Set a location to see moonrise, moonset and where to look. <button class="underline text-sky-300" data-moon-action="locate">📍 Use my location</button></p>';
    if (state.location) {
        const obs = observer();
        const rise = Astronomy.SearchRiseSet('Moon', obs, +1, date, 2);
        const set = Astronomy.SearchRiseSet('Moon', obs, -1, date, 2);
        const alt = limb.hor.altitude, az = limb.hor.azimuth;
        const sunAlt = altAz(planetRaDec('Sun', date), observerFrame(date)).alt;
        const riseEq = rise && Astronomy.Equator('Moon', rise.date, obs, true, true);
        const riseAz = rise ? Astronomy.Horizon(rise.date, obs, riseEq.ra, riseEq.dec, 'normal').azimuth : null;
        sky = `<div class="text-sm ${alt > 0 ? 'text-emerald-300' : 'text-slate-400'}">${alt > 0
            ? `<b>Up now</b>: ${Math.round(alt)}° above the ${compass(az)} horizon${sunAlt > -6 ? (sunAlt > 0 ? ' (in daylight)' : ' (twilight)') : ''}.`
            : `<b>Below the horizon</b> (${compass(az)}).`}</div>
            <div class="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                ${rise ? `<span>☽↑ rises ${fmtDate(rise.date)}${riseAz !== null ? ` in the ${compass(riseAz)}` : ''}</span>` : ''}
                ${set ? `<span>☽↓ sets ${fmtDate(set.date)}</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 mt-1">The disc is turned as it hangs in your sky: the lit side always points back along the Moon's path towards the Sun.</p>`;
    }

    // Distance, apsides, supermoon
    const apsis = Astronomy.SearchLunarApsis(date);
    const pct = (384400 / lib.dist_km - 1) * 100;
    const fullTag = L.fullDist < 360000 ? '<span class="text-amber-300">a supermoon</span>' : L.fullDist > 405000 ? '<span class="text-slate-400">a micromoon</span>' : '';
    const lunaRows = factTable([
        ['Phase', `${link('phase', String(info.index), `<b>${info.emoji} ${info.name}</b>`)} · ${Math.round(info.illum * 100)}% lit`],
        ['Age', `${age.toFixed(1)} of ${((L.end - L.start) / DAY_MS).toFixed(1)} days`],
        ['Tithi', `${link('glossary', 'Tithi', `<b>${tithi.n}. ${tithi.name}</b>`)} · ${tithi.paksha}`],
        ['Sun–Moon', `${Math.round(elong)}° apart (each tithi is 12°)`],
        ['Distance', `${Math.round(lib.dist_km).toLocaleString()} km · ${f1(lib.diam_deg * 60)}′ across (${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% vs average)`],
        ['Next', `${apsis.kind === 0 ? 'Perigee (closest)' : 'Apogee (farthest)'} ${fmtDate(apsis.time.date)}, ${Math.round(apsis.dist_km).toLocaleString()} km`],
        ['Full Moon', `${link('jump', L.full.toISOString(), fmtDate(L.full), 'underline')}${fullTag ? ' · ' + fullTag : ''}`]
    ]);

    document.getElementById('moon-phase').innerHTML = `
        <h3 class="moon-h text-slate-300 mb-2">🌙 The Moon tonight</h3>
        <div class="grid grid-cols-1 sm:grid-cols-[220px,1fr] gap-4 items-start">
            <div class="max-w-[220px] mx-auto w-full">${disc}</div>
            <div class="flex flex-col gap-3">${lunaRows}${sky}</div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-[200px,1fr] gap-4 items-center mt-3 pt-3 border-t border-slate-800">
            <div class="max-w-[200px] mx-auto w-full">${sem}</div>
            <p class="text-sm text-slate-400 leading-relaxed">Seen from above, the Moon circles the Earth anticlockwise. The phase is just the angle between the Moon and the Sun: at 0° the lit side faces away from us (<b>New</b>), at 180° it faces us fully (<b>Full</b>). Jyotish cuts that circle into <b>30 tithis</b> of 12° each, 15 waxing (<i>Shukla</i>) and 15 waning (<i>Krishna</i>). Because the Moon's speed varies, a tithi lasts anywhere from about 19 to 26 hours.</p>
        </div>`;
}

// ---------------------------------------------------------------------------
// The lunation strip: 30 tithis from New Moon to New Moon

function renderLunation(date) {
    const L = lunation(date);
    const W = 1000, H = 74, x0 = 10, x1 = W - 10;
    const total = L.end - L.start;
    const X = t => x0 + (t - L.start) / total * (x1 - x0);
    let cells = '';
    for (let n = 0; n < 30; n++) {
        const a = L.tithis[n], b = n < 29 ? L.tithis[n + 1] : L.end;
        const xa = X(a), xb = X(b);
        const bright = n < 15 ? (n + 1) / 15 : (30 - n) / 15;
        const name = n === 14 ? 'Purnima' : n === 29 ? 'Amavasya' : LORE.tithis[n % 15];
        const fill = `rgba(226,232,240,${(0.06 + 0.32 * bright).toFixed(2)})`;
        const on = date >= a && date < b;
        cells += `<g class="cursor-pointer" data-type="jump" data-key="${new Date(a.getTime() + 60000).toISOString()}"><title>${n + 1}. ${name} (${n < 15 ? 'Shukla' : 'Krishna'}) · from ${fmtDate(a)}</title>
            <rect x="${f1(xa)}" y="18" width="${f1(xb - xa - 1)}" height="30" rx="3" fill="${fill}" stroke="${on ? '#fbbf24' : 'none'}" stroke-width="1.5"/>
            ${txt((xa + xb) / 2, 37, n < 15 ? n + 1 : n - 14, `fill="${bright > 0.6 ? '#0f172a' : '#cbd5e1'}" font-size="10" text-anchor="middle"`)}</g>`;
    }
    const marks = [[0, '🌑'], [7, '🌓'], [15, '🌕'], [22, '🌗']].map(([n, e]) => txt(X(L.tithis[n]), 13, e, 'font-size="11" text-anchor="middle"')).join('');
    const nx = X(date);
    const svg = `${svgOpen(W, H)}
        ${cells}${marks}
        ${txt(X(L.tithis[7]), 64, 'Shukla Paksha · waxing', 'fill="#94a3b8" font-size="10" text-anchor="middle"')}
        ${txt(X(L.tithis[22]), 64, 'Krishna Paksha · waning', 'fill="#94a3b8" font-size="10" text-anchor="middle"')}
        <line x1="${f1(nx)}" y1="14" x2="${f1(nx)}" y2="52" stroke="#fbbf24" stroke-width="2"/>
        <path d="M${f1(nx - 5)},52 L${f1(nx + 5)},52 L${f1(nx)},46 Z" fill="#fbbf24"/>
        </svg>`;
    const fullNak = nakshatraOf(toSid(tropicalLongitude('Moon', L.full), L.full));
    const month = MOON_LORE.monthOfNakshatra[fullNak.index];
    document.getElementById('moon-lunation').innerHTML = `
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <h3 class="moon-h text-slate-300">The lunation: ${fmtDate(L.start, { hour: undefined, minute: undefined })} → ${fmtDate(L.end, { hour: undefined, minute: undefined })}</h3>
            <span class="text-xs text-slate-400">Lunar month <b class="text-amber-200">${month}</b>, named after ${link('nakshatra', String(fullNak.index), fullNak.name, 'underline')}, where its Full Moon falls</span>
        </div>
        ${svg}
        <p class="text-xs text-slate-500">Click a tithi to jump to its start. Numbers restart at 1 after Purnima, the 15th tithi.</p>`;
}

// ---------------------------------------------------------------------------
// Panel 2: the nodes in 3D

function projector(W, H) {
    const psi = moon.yaw * DEG, th = moon.pitch * DEG, S = W * 0.3;
    const cx = W / 2, cy = H / 2 - 4;
    return ([x, y, z]) => {
        const x1 = x * Math.cos(psi) - y * Math.sin(psi), y1 = x * Math.sin(psi) + y * Math.cos(psi);
        return { x: cx + S * x1, y: cy - S * (z * Math.cos(th) + y1 * Math.sin(th)), depth: -y1 * Math.cos(th) + z * Math.sin(th) };
    };
}
const eclVec = (lon, lat = 0, r = 1) => [r * Math.cos(lat * DEG) * Math.cos(lon * DEG), r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG)];

function renderOrbit(date) {
    const W = 560, H = 360;
    const P = projector(W, H);
    const pt = v => { const p = P(v); return `${f1(p.x)},${f1(p.y)}`; };
    const seg = (a, b, attrs) => { const p = P(a), q = P(b); return `<line x1="${f1(p.x)}" y1="${f1(p.y)}" x2="${f1(q.x)}" y2="${f1(q.y)}" ${attrs}/>`; };
    const om = nodeTrop(date);
    const incl = MOON_INCL * (moon.exaggerate ? 3 : 1);
    const orbitAt = u => {
        const U = u * DEG, O = om * DEG, I = incl * DEG;
        return [Math.cos(O) * Math.cos(U) - Math.sin(O) * Math.sin(U) * Math.cos(I), Math.sin(O) * Math.cos(U) + Math.cos(O) * Math.sin(U) * Math.cos(I), Math.sin(U) * Math.sin(I)];
    };
    const sun = current.pos.Sun.trop, mlon = current.pos.Moon.trop, mlat = moonLat(date);
    const uMoon = Math.atan2(Math.sin((mlon - om) * DEG) / Math.cos(MOON_INCL * DEG), Math.cos((mlon - om) * DEG)) / DEG;
    const sunNode = Math.min(Math.abs(wrap180(sun - om)), Math.abs(wrap180(sun - om - 180)));
    const season = sunNode < SOLAR_LIMIT;

    // Ecliptic plane with the signs of the active zodiac around its rim
    const rim = [];
    for (let a = 0; a <= 360; a += 5) rim.push(pt(eclVec(a, 0, 1.3)));
    const offset = state.mode === 'tropical' ? 0 : ayanamsa(date);
    let signs = '';
    for (let k = 0; k < 12; k++) {
        const a = k * 30 + offset;
        signs += seg(eclVec(a, 0, 1.24), eclVec(a, 0, 1.3), 'stroke="#a16207" stroke-width="0.8"');
        const p = P(eclVec(a + 15, 0, 1.39));
        signs += txt(p.x, p.y + 4, signSymbol(ZODIAC[k]), `fill="#ca8a04" font-size="12" text-anchor="middle" opacity="${(0.55 + 0.45 * (p.depth + 1) / 2).toFixed(2)}"`);
    }

    // Moon orbit, split at the nodes into the half above (north) and below (south) the ecliptic
    const half = (u0, u1) => { const a = []; for (let u = u0; u <= u1; u += 3) a.push(pt(orbitAt(u))); return a.join(' '); };
    let drops = '';
    for (let u = 15; u < 360; u += 30) {
        const v = orbitAt(u);
        drops += seg(v, [v[0], v[1], 0], `stroke="${v[2] > 0 ? '#94a3b8' : '#475569'}" stroke-width="0.5" stroke-dasharray="1 2"`);
    }

    // Sun, Earth's shadow, nodes, Moon
    const sunP = P(eclVec(sun, 0, 1.5)), earth = P([0, 0, 0]);
    const sh0 = P(eclVec(sun + 180 - 2.5, 0, 1.12)), sh1 = P(eclVec(sun + 180 + 2.5, 0, 1.12));
    const rahu = P(eclVec(om, 0, 1)), ketu = P(eclVec(om + 180, 0, 1));
    const rahuL = P(eclVec(om, 0, 1.13)), ketuL = P(eclVec(om + 180, 0, 1.13));
    const mv = orbitAt(uMoon), mp = P(mv), mBase = P([mv[0], mv[1], 0]);
    const elong = norm360(mlon - sun);
    // Bright side of the little Moon faces the Sun on screen
    const sunDir = Math.atan2(sunP.y - mp.y, sunP.x - mp.x) / DEG;
    const nodeCol = BODY.NorthNode.color, ketuCol = BODY.SouthNode.color;

    const svg = `${svgOpen(W, H, 'id="moon-orbit-svg"')}
        <polyline points="${half(180, 360)}" fill="none" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4 3"/>
        <polygon points="${rim.join(' ')}" fill="rgba(234,179,8,0.07)" stroke="#a16207" stroke-width="1"/>
        ${signs}
        ${drops}
        <line x1="${f1(rahu.x)}" y1="${f1(rahu.y)}" x2="${f1(ketu.x)}" y2="${f1(ketu.y)}" stroke="${season ? '#e879f9' : '#a3e635'}" stroke-width="${season ? 2 : 1.2}" stroke-dasharray="5 3"/>
        <line x1="${f1(earth.x)}" y1="${f1(earth.y)}" x2="${f1(sunP.x)}" y2="${f1(sunP.y)}" stroke="#fcd34d" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.7"/>
        <path d="M${f1(earth.x)},${f1(earth.y)} L${f1(sh0.x)},${f1(sh0.y)} L${f1(sh1.x)},${f1(sh1.y)} Z" fill="#020617" opacity="0.85"/>
        <circle cx="${f1(earth.x)}" cy="${f1(earth.y)}" r="9" fill="#1d4ed8" stroke="#93c5fd" stroke-width="0.6"/>
        ${txt(earth.x, earth.y + 22, 'Earth', 'fill="#93c5fd" font-size="10" text-anchor="middle"')}
        <polyline points="${half(0, 180)}" fill="none" stroke="#e2e8f0" stroke-width="2"/>
        <circle cx="${f1(sunP.x)}" cy="${f1(sunP.y)}" r="13" fill="#fbbf24" opacity="0.9"/><circle cx="${f1(sunP.x)}" cy="${f1(sunP.y)}" r="19" fill="#fbbf24" opacity="0.15"/>
        ${txt(sunP.x, sunP.y + 32, 'Sun', 'fill="#fcd34d" font-size="10" text-anchor="middle"')}
        <circle cx="${f1(rahu.x)}" cy="${f1(rahu.y)}" r="4" fill="${nodeCol}"/><circle cx="${f1(ketu.x)}" cy="${f1(ketu.y)}" r="4" fill="none" stroke="${ketuCol}" stroke-width="1.5"/>
        <g class="cursor-pointer" data-type="planets" data-key="NorthNode">${txt(rahuL.x, rahuL.y - 6, '☊ Rahu', `fill="${nodeCol}" font-size="13" font-weight="600" text-anchor="middle"`)}</g>
        <g class="cursor-pointer" data-type="planets" data-key="SouthNode">${txt(ketuL.x, ketuL.y - 6, '☋ Ketu', `fill="${ketuCol}" font-size="13" font-weight="600" text-anchor="middle"`)}</g>
        <line x1="${f1(mp.x)}" y1="${f1(mp.y)}" x2="${f1(mBase.x)}" y2="${f1(mBase.y)}" stroke="#e2e8f0" stroke-width="1"/>
        <circle cx="${f1(mBase.x)}" cy="${f1(mBase.y)}" r="1.8" fill="#e2e8f0"/>
        <g class="cursor-pointer" data-type="planets" data-key="Moon">${moonDisc(mp.x, mp.y, 8, moonPhaseInfo(date).illum, sunDir, { earthshine: false, id: 'orbmoon' })}</g>
        ${txt(mp.x + 12, mp.y + 16, `Moon ${fmtOrb(Math.abs(mlat))} ${mlat >= 0 ? 'N' : 'S'}`, 'fill="#e2e8f0" font-size="10"')}
        ${txt(8, H - 8, `${moon.exaggerate ? 'Tilt drawn 3× larger (real: 5.1°). ' : 'True 5.1° tilt. '}Solid = north of the ecliptic, dashed = south. Drag to turn.`, 'fill="#64748b" font-size="10"')}
        </svg>`;

    // Narrative
    const next = Astronomy.SearchMoonNode(date);
    const nextName = next.kind > 0 ? '☊ Rahu (heading north)' : '☋ Ketu (heading south)';
    const dir = moonLat(addHours(date, 1)) > mlat ? 'climbing north' : 'sinking south';
    const pos = current.pos;
    document.getElementById('moon-orbit').innerHTML = svg;
    document.getElementById('moon-orbit-text').innerHTML = `
        <p class="text-sm text-slate-300 leading-relaxed">The Moon is <b>${fmtOrb(Math.abs(mlat))} ${mlat >= 0 ? 'north' : 'south'}</b> of the ecliptic and ${dir}. It crosses at ${nextName} on <b>${link('jump', next.time.date.toISOString(), fmtDate(next.time.date), 'underline')}</b> (in ${fmtDuration(next.time.date - date)}).</p>
        <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div class="bg-slate-900/60 rounded-lg p-2">${planetLink('NorthNode')} <span class="text-slate-500">· Rahu</span><div class="font-mono text-lime-300">${posLink(pos.NorthNode.lon)}</div></div>
            <div class="bg-slate-900/60 rounded-lg p-2">${planetLink('SouthNode')} <span class="text-slate-500">· Ketu</span><div class="font-mono text-lime-400">${posLink(pos.SouthNode.lon)}</div></div>
        </div>
        <p class="text-xs mt-2 ${season ? 'text-fuchsia-300' : 'text-slate-500'}">${season ? `⚠ Eclipse season: the Sun is only ${Math.round(sunNode)}° from the nodal axis, so the line glows.` : `The Sun is ${Math.round(sunNode)}° from the nodal axis.`} Showing the <b>${state.nodeType}</b> node.</p>`;
}

// ---------------------------------------------------------------------------
// The latitude wave and eclipse seasons

function renderWave(date) {
    const W = 1000, H = 190, padL = 34, padR = 10, top = 22, bot = 150;
    const t0 = addDays(date, -15), t1 = addDays(date, 15);
    const X = t => padL + (t - t0) / (t1 - t0) * (W - padL - padR);
    const Y = lat => (top + bot) / 2 - lat / 6 * (bot - top) / 2;
    const pts = [];
    for (let t = t0.getTime(); t <= t1.getTime(); t += 3 * HOUR_MS) pts.push({ t: new Date(t), lat: moonLat(new Date(t)) });

    let marks = '';
    // Node crossings
    let ev = Astronomy.SearchMoonNode(t0);
    for (let i = 0; i < 4 && ev.time.date < t1; i++) {
        const x = X(ev.time.date), asc = ev.kind > 0;
        const col = asc ? BODY.NorthNode.color : BODY.SouthNode.color;
        marks += `<g class="cursor-pointer" data-type="jump" data-key="${ev.time.date.toISOString()}"><line x1="${f1(x)}" y1="${top}" x2="${f1(x)}" y2="${bot}" stroke="${col}" stroke-width="0.8" stroke-dasharray="2 3"/>
            ${txt(x, top - 6, asc ? '☊ Rahu' : '☋ Ketu', `fill="${col}" font-size="11" text-anchor="middle" font-weight="600"`)}
            ${txt(x, bot + 14, fmtDate(ev.time.date, { hour: undefined, minute: undefined }), 'fill="#64748b" font-size="9" text-anchor="middle"')}</g>`;
        ev = Astronomy.NextMoonNode(ev);
    }
    // New and Full Moons on the curve, with eclipses ringed
    const ecl = eclipsePeaks(t0, t1);
    for (const target of [0, 180]) {
        let ph = Astronomy.SearchMoonPhase(target, t0, 40);
        while (ph && ph.date < t1) {
            const lat = moonLat(ph.date), x = X(ph.date), y = Y(lat);
            const isEcl = ecl.some(e => Math.abs(e - ph.date) < DAY_MS);
            const label = `${target ? 'Full' : 'New'}${isEcl ? ' · ECLIPSE' : ''}`;
            marks += `<circle cx="${f1(x)}" cy="${f1(y)}" r="6" fill="${target ? '#f8fafc' : '#0f172a'}" stroke="#e2e8f0" stroke-width="1.2"/>
                ${isEcl ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="11" fill="none" stroke="#e879f9" stroke-width="2"/>` : ''}
                ${txt(x, lat > 0 ? y + (isEcl ? 24 : 18) : y - (isEcl ? 16 : 10), label, `fill="${isEcl ? '#e879f9' : '#94a3b8'}" font-size="9" font-weight="${isEcl ? 700 : 400}" text-anchor="middle"`)}`;
            ph = Astronomy.SearchMoonPhase(target, addDays(ph.date, 1), 40);
        }
    }
    const curve = pts.map(p => `${f1(X(p.t))},${f1(Y(p.lat))}`).join(' ');
    const grid = [-5, 5].map(l => `<line x1="${padL}" y1="${f1(Y(l))}" x2="${W - padR}" y2="${f1(Y(l))}" stroke="#1e293b"/>${txt(padL - 4, Y(l) + 3, `${Math.abs(l)}°${l > 0 ? 'N' : 'S'}`, 'fill="#64748b" font-size="9" text-anchor="end"')}`).join('');
    const nx = X(date);
    const svg = `${svgOpen(W, H)}
        <rect x="${padL}" y="${f1(Y(1.5))}" width="${W - padL - padR}" height="${f1(Y(-1.5) - Y(1.5))}" fill="rgba(232,121,249,0.07)"/>
        ${grid}
        <line x1="${padL}" y1="${f1(Y(0))}" x2="${W - padR}" y2="${f1(Y(0))}" stroke="#ca8a04" stroke-width="1"/>
        ${txt(padL + 4, Y(0) - 4, 'ecliptic (the Sun\'s path)', 'fill="#ca8a04" font-size="9"')}
        ${txt(W - padR - 4, Y(1.5) + 10, 'close enough for an eclipse', 'fill="#c084fc" font-size="9" text-anchor="end" opacity="0.8"')}
        <polyline points="${curve}" fill="none" stroke="#e2e8f0" stroke-width="1.8"/>
        ${marks}
        <line x1="${f1(nx)}" y1="${top}" x2="${f1(nx)}" y2="${bot}" stroke="#fbbf24" stroke-width="1.5"/>
        ${txt(nx, H - 4, 'now', 'fill="#fbbf24" font-size="10" text-anchor="middle"')}
        </svg>`;

    // Eclipse-season gauge
    const sun = current.pos.Sun.trop;
    const seasonInfo = eclipseSeason(date);
    const gx = d => 10 + Math.min(d, 90) / 90 * 480;
    const gauge = `${svgOpen(500, 46)}
        <rect x="10" y="12" width="${f1(gx(LUNAR_LIMIT) - 10)}" height="12" fill="rgba(232,121,249,0.5)" rx="2"/>
        <rect x="${f1(gx(LUNAR_LIMIT))}" y="12" width="${f1(gx(SOLAR_LIMIT) - gx(LUNAR_LIMIT))}" height="12" fill="rgba(232,121,249,0.25)"/>
        <rect x="${f1(gx(SOLAR_LIMIT))}" y="12" width="${f1(490 - gx(SOLAR_LIMIT))}" height="12" fill="#1e293b" rx="2"/>
        ${[0, 12, 18.5, 45, 90].map(d => txt(gx(d), 38, `${d}°`, 'fill="#64748b" font-size="9" text-anchor="middle"')).join('')}
        <path d="M${f1(gx(seasonInfo.dist))},9 l-5,-7 h10 z" fill="#fbbf24"/><line x1="${f1(gx(seasonInfo.dist))}" y1="10" x2="${f1(gx(seasonInfo.dist))}" y2="26" stroke="#fbbf24" stroke-width="2"/>
        </svg>`;
    const ekey = Math.floor(date / DAY_MS);
    if (!eclListCache.has(ekey)) eclListCache.set(ekey, nextEclipses(date));
    const ecls = eclListCache.get(ekey);
    document.getElementById('moon-wave').innerHTML = `
        <h3 class="moon-h text-slate-300 mb-1">The dragon's path: the Moon's latitude, ±15 days</h3>
        ${svg}
        <p class="text-xs text-slate-500">Each month the Moon weaves about 5° above and below the Sun's path. It crosses going north at ☊ Rahu and going south at ☋ Ketu. A New or Full Moon on the pink band, close to a crossing, is an eclipse.</p>`;
    document.getElementById('moon-season').innerHTML = `
        <h3 class="moon-h text-fuchsia-300 mb-2">Eclipse seasons</h3>
        <p class="text-sm text-slate-300">The Sun is <b>${Math.round(seasonInfo.dist)}°</b> from ${seasonInfo.node === 'NorthNode' ? '☊ Rahu' : '☋ Ketu'}.
            ${seasonInfo.inSeason ? `<b class="text-fuchsia-300">Eclipse season now</b>, until ${fmtDate(seasonInfo.end, { hour: undefined, minute: undefined })}.` : `Next eclipse season: <b>${fmtDate(seasonInfo.start, { hour: undefined, minute: undefined })} – ${fmtDate(seasonInfo.end, { hour: undefined, minute: undefined })}</b>.`}</p>
        ${gauge}
        <p class="text-xs text-slate-500">Within about ${LUNAR_LIMIT}° of a node any Full Moon is eclipsed (at least partly) and within about ${SOLAR_LIMIT}° any New Moon. The Sun crosses the axis every ~173 days, which gives two (sometimes three) seasons a year.</p>
        <ul class="flex flex-col gap-1 text-sm mt-2">${ecls.map(e => `<li>${link('jump', e.time.toISOString(), `<span class="text-slate-400">${fmtDate(e.time, { year: 'numeric' })}</span> ${e.text}`)}</li>`).join('')}</ul>`;
}

// Peaks of lunar and solar eclipses between two dates (cached per day).
const peakCache = new Map(), eclListCache = new Map();
function eclipsePeaks(t0, t1) {
    const key = Math.floor(t0 / DAY_MS);
    if (!peakCache.has(key)) {
        const out = [];
        let le = Astronomy.SearchLunarEclipse(t0);
        while (le.peak.date < t1) { out.push(le.peak.date); le = Astronomy.NextLunarEclipse(le.peak); }
        let se = Astronomy.SearchGlobalSolarEclipse(t0);
        while (se.peak.date < t1) { out.push(se.peak.date); se = Astronomy.NextGlobalSolarEclipse(se.peak); }
        peakCache.set(key, out);
        if (peakCache.size > 400) peakCache.delete(peakCache.keys().next().value);
    }
    return peakCache.get(key);
}

// Where the Sun stands relative to the nodal axis, and the current or next eclipse season (mean node; cached per day).
const seasonCache = new Map();
function eclipseSeason(date) {
    const key = Math.floor(date / DAY_MS);
    if (seasonCache.has(key)) return seasonCache.get(key);
    const dist = t => {
        const s = tropicalLongitude('Sun', t), om = meanNodeLongitude(t);
        return Math.min(Math.abs(wrap180(s - om)), Math.abs(wrap180(s - om - 180)));
    };
    const s = tropicalLongitude('Sun', date), om = nodeTrop(date);
    const dR = Math.abs(wrap180(s - om)), dK = Math.abs(wrap180(s - om - 180));
    const inSeason = dist(date) < SOLAR_LIMIT;
    let start = null, end = null;
    if (inSeason) {
        for (let d = 0; d < 60 && !end; d++) if (dist(addDays(date, d)) >= SOLAR_LIMIT) end = addDays(date, d);
    } else {
        for (let d = 0; d < 200 && !start; d++) if (dist(addDays(date, d)) < SOLAR_LIMIT) start = addDays(date, d);
        for (let d = 1; d < 60 && start && !end; d++) if (dist(addDays(start, d)) >= SOLAR_LIMIT) end = addDays(start, d);
    }
    const out = { dist: Math.min(dR, dK), node: dR < dK ? 'NorthNode' : 'SouthNode', inSeason, start, end };
    seasonCache.set(key, out);
    if (seasonCache.size > 400) seasonCache.delete(seasonCache.keys().next().value);
    return out;
}

// ---------------------------------------------------------------------------
// The 18.6-year cycle

function renderCycle(date) {
    const meanOm = meanNodeLongitude(date), trueOm = trueNodeLongitude(date);
    const eps = meanObliquity(date);
    const maxDec = eps + MOON_INCL * Math.cos(meanOm * DEG);
    const toMajor = norm360(meanOm) / NODE_RATE, toMinor = norm360(meanOm - 180) / NODE_RATE;
    const lastMajor = addDays(date, toMajor - 360 / NODE_RATE);
    const ing = moon.anim ? null : nextIngress('NorthNode', date, 700);
    const yearFmt = d => d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    const bx = d => 10 + (d - (eps - MOON_INCL)) / (2 * MOON_INCL) * 300;
    const bar = `${svgOpen(320, 40)}
        <rect x="10" y="12" width="300" height="10" rx="5" fill="url(#stand)"/>
        <defs><linearGradient id="stand"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>
        <circle cx="${f1(bx(maxDec))}" cy="17" r="7" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>
        ${txt(10, 36, `minor ±${(eps - MOON_INCL).toFixed(1)}°`, 'fill="#64748b" font-size="9"')}
        ${txt(310, 36, `major ±${(eps + MOON_INCL).toFixed(1)}°`, 'fill="#a78bfa" font-size="9" text-anchor="end"')}
        </svg>`;
    document.getElementById('moon-cycle').innerHTML = `
        <h3 class="moon-h text-violet-300 mb-2">The 18.6-year node cycle</h3>
        ${factTable([
            ['Moving', `backwards ~19.3°/year, a full circle in 18.6 years`],
            ['Next sign', ing ? `Rahu enters ${zoneLink(ing.sign)} on ${link('jump', ing.time.toISOString(), yearFmt(ing.time), 'underline')}` : '–'],
            ['Mean vs true', `${fmtOrb(Math.abs(wrap180(trueOm - meanOm)))} apart right now (the true node ${wrap180(trueOm - meanOm) > 0 ? 'ahead' : 'behind'})`]
        ])}
        <div class="mt-3 text-sm text-slate-300">This month the Moon swings to <b>±${maxDec.toFixed(1)}°</b> declination.</div>
        <div class="max-w-sm">${bar}</div>
        <p class="text-xs text-slate-500">Last major lunar standstill ${yearFmt(lastMajor)} · next minor ${yearFmt(addDays(date, toMinor))} · next major ${yearFmt(addDays(date, toMajor))}.</p>`;
}

// ---------------------------------------------------------------------------
// Panel 3: the strip map of the Moon's road through the stars

let stripStars = null, stripBounds = null;
function prepareStrip() {
    if (stripStars) return;
    stripStars = [];
    for (const s of STAR.values()) {
        if (s.mag > 5.3) continue;
        const p = starSid(s.hip);
        if (Math.abs(p.lat) < STRIP_LAT + 2) stripStars.push({ hip: s.hip, mag: s.mag, bv: s.bv, ...p });
    }
    // IAU borders, densified (their edges follow lines of constant RA or declination) and turned into ecliptic coordinates
    stripBounds = [];
    for (const [abbr, polys] of Object.entries(SKY.bounds)) {
        for (const poly of polys) {
            const out = [];
            for (let i = 0; i < poly.length; i++) {
                const [ra0, de0] = poly[i], [ra1, de1] = poly[(i + 1) % poly.length];
                const dra = wrap180(ra1 - ra0), n = Math.max(1, Math.ceil(Math.max(Math.abs(dra), Math.abs(de1 - de0)) / 1));
                for (let k = 0; k < n; k++) {
                    const e = eclJ2000(radec(ra0 + dra * k / n, de0 + (de1 - de0) * k / n));
                    out.push({ lon: norm360(e.lon - SIDEREAL_OFFSET_J2000), lat: e.lat });
                }
            }
            if (out.some(p => Math.abs(p.lat) < STRIP_LAT + 5)) stripBounds.push({ abbr, pts: out });
        }
    }
}

function renderStrip(date) {
    prepareStrip();
    const box = document.getElementById('moon-strip-box');
    const W = Math.max(600, box.clientWidth || 1000);
    const ppd = W / moon.span;
    const H = Math.round(Math.min(2 * STRIP_LAT * ppd, 420));
    const latMax = H / 2 / ppd;
    const pos = current.pos;
    const moonSid = pos.Moon.sid;
    const centre = moon.centre ?? moonSid;
    const X = lon => W / 2 - wrap180(lon - centre) * ppd;     // east (greater longitude) to the left, as in the sky
    const Y = lat => H / 2 - lat * ppd;
    const vis = lon => Math.abs(wrap180(lon - centre)) <= moon.span / 2 + 2;
    const parts = [];
    const sc = Math.min(1.4, Math.max(0.6, ppd / 11));

    // Moon's road: the band the Moon can reach
    parts.push(`<rect x="0" y="${f1(Y(5.3))}" width="${W}" height="${f1(10.6 * ppd)}" fill="rgba(148,163,184,0.04)"/>`);

    // Nakshatras
    const curNak = nakshatraOf(moonSid).index;
    if (moon.layers.nakshatras) {
        for (let i = 0; i < 27; i++) {
            const a = i * NAK_SPAN, mid = a + NAK_SPAN / 2;
            if (i === curNak) parts.push(`<rect x="${f1(X(a + NAK_SPAN))}" y="0" width="${f1(NAK_SPAN * ppd)}" height="${H}" fill="rgba(251,146,60,0.07)"/>`);
            if (vis(a)) parts.push(`<line x1="${f1(X(a))}" y1="0" x2="${f1(X(a))}" y2="${H}" stroke="#fb923c" stroke-width="0.7" stroke-dasharray="3 4" opacity="0.5"/>`);
            if (vis(mid)) parts.push(`<g class="cursor-pointer" data-type="nakshatra" data-key="${i}">${txt(X(mid), 14, `${i + 1}. ${LORE.nakshatras[i].name}`, `fill="#fdba74" font-size="${f1(11 * Math.min(1, sc))}" text-anchor="middle" font-weight="${i === curNak ? 700 : 400}"`)}</g>`);
        }
    }
    // Sidereal signs
    if (moon.layers.signs) {
        for (let k = 0; k < 12; k++) {
            const a = k * 30;
            if (vis(a)) parts.push(`<line x1="${f1(X(a))}" y1="${H - 26}" x2="${f1(X(a))}" y2="${H}" stroke="#a78bfa" stroke-width="1.2" opacity="0.7"/>`);
            if (vis(a + 15)) parts.push(`<g class="cursor-pointer" data-type="zodiac" data-key="${ZODIAC[k]}">${txt(X(a + 15), H - 8, `${signSymbol(ZODIAC[k])} ${ZODIAC[k]}`, 'fill="#c4b5fd" font-size="11" text-anchor="middle"')}</g>`);
        }
    }
    // IAU borders
    if (moon.layers.bounds) {
        for (const b of stripBounds) {
            let d = '', pen = false, prevX = null;
            for (const p of b.pts) {
                const x = X(p.lon), y = Y(p.lat);
                const jump = prevX !== null && Math.abs(x - prevX) > W / 2;
                d += `${!pen || jump ? 'M' : 'L'}${f1(x)},${f1(y)} `;
                pen = true; prevX = x;
            }
            parts.push(`<path d="${d}" fill="none" stroke="#38bdf8" stroke-width="0.7" stroke-dasharray="2 3" opacity="0.45"/>`);
        }
    }
    // Ecliptic
    parts.push(`<line x1="0" y1="${f1(Y(0))}" x2="${W}" y2="${f1(Y(0))}" stroke="#ca8a04" stroke-width="1" opacity="0.8"/>`);
    for (const l of [-10, -5, 5, 10]) if (Math.abs(l) < latMax) parts.push(txt(4, Y(l) + 3, `${Math.abs(l)}°${l > 0 ? 'N' : 'S'}`, 'fill="#334155" font-size="9"'));

    // Constellation figures and names
    if (moon.layers.figures) {
        const figs = SKY.figures[atlas.figure] || SKY.figures.rey;
        for (const [abbr, lines] of Object.entries(figs)) {
            for (const l of lines) {
                for (let i = 0; i < l.length - 1; i++) {
                    if (!STAR.has(l[i]) || !STAR.has(l[i + 1])) continue;
                    const a = starSid(l[i]), b = starSid(l[i + 1]);
                    if (Math.abs(a.lat) > latMax + 12 || Math.abs(b.lat) > latMax + 12 || Math.abs(wrap180(a.lon - b.lon)) > 40) continue;
                    if (!vis(a.lon) && !vis(b.lon)) continue;
                    const xa = X(a.lon), xb = xa - wrap180(b.lon - a.lon) * ppd;
                    parts.push(`<line x1="${f1(xa)}" y1="${f1(Y(a.lat))}" x2="${f1(xb)}" y2="${f1(Y(b.lat))}" stroke="#3b82f6" stroke-width="0.8" opacity="0.45"/>`);
                }
            }
            const c = eclJ2000(conCentre(abbr));
            const clon = norm360(c.lon - SIDEREAL_OFFSET_J2000);
            if (Math.abs(c.lat) < latMax - 3 && vis(clon)) parts.push(`<g class="cursor-pointer" data-con-open="${abbr}">${txt(X(clon), Y(c.lat) + (c.lat > 0 ? -18 : 26), SKY.conNames[abbr].toUpperCase(), 'fill="#60a5fa" font-size="10" letter-spacing="2" text-anchor="middle" opacity="0.55"')}</g>`);
        }
    }
    // Stars
    for (const s of stripStars) {
        if (!vis(s.lon) || Math.abs(s.lat) > latMax + 1) continue;
        const r = Math.max(0.6, (3.4 - 0.55 * s.mag) * sc);
        parts.push(`<circle class="m-star" data-hip="${s.hip}" cx="${f1(X(s.lon))}" cy="${f1(Y(s.lat))}" r="${f1(r)}" fill="${bvColour(s.bv)}"/>`);
    }
    // Yogataras: on the strip, or an arrow at the edge if they lie far off the ecliptic
    if (moon.layers.nakshatras) {
        for (let i = 0; i < 27; i++) {
            const hip = yogataraHip(i);
            if (!hip) continue;
            const p = starSid(hip), name = starName(hip).name || starLabel(hip);
            if (!vis(p.lon)) continue;
            const x = X(p.lon);
            if (Math.abs(p.lat) < latMax - 1) {
                parts.push(`<circle class="m-star" data-hip="${hip}" cx="${f1(x)}" cy="${f1(Y(p.lat))}" r="${f1(7 * sc)}" fill="none" stroke="#fb923c" stroke-width="1.2"/>`);
                parts.push(txt(x + 9 * sc, Y(p.lat) + 12 * sc, name, `fill="#fdba74" font-size="${f1(10 * Math.min(1, sc))}"`));
            } else {
                const up = p.lat > 0, y = up ? 28 : H - 34;
                parts.push(`<g class="m-star cursor-pointer" data-hip="${hip}">${txt(x, y, `${up ? '↑' : '↓'} ${name} ${Math.round(Math.abs(p.lat))}°${up ? 'N' : 'S'}`, 'fill="#fdba74" font-size="10" text-anchor="middle" opacity="0.8"')}</g>`);
            }
        }
    }

    // The Moon's path over one circuit of the sky centred on now (dashed behind, solid ahead), a dot at each midnight
    const { pts: track, days } = moonTrack(date);
    const pathD = pts => {
        let d = '', prevX = null;
        for (const p of pts) {
            const x = X(p.lon), jump = prevX !== null && Math.abs(x - prevX) > W / 2;
            d += `${prevX === null || jump ? 'M' : 'L'}${f1(x)},${f1(Y(p.lat))} `;
            prevX = x;
        }
        return d;
    };
    const nowK = track.findIndex(p => p.t >= date);
    parts.push(`<path d="${pathD(track.slice(0, nowK + 1))}" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.6"/>`);
    parts.push(`<path d="${pathD(track.slice(Math.max(0, nowK - 1)))}" fill="none" stroke="#e2e8f0" stroke-width="1.4" opacity="0.75"/>`);
    for (const p of days) {
        if (!vis(p.lon)) continue;
        parts.push(`<circle cx="${f1(X(p.lon))}" cy="${f1(Y(p.lat))}" r="2" fill="#e2e8f0" opacity="${p.t < date ? 0.45 : 0.9}"/>`);
        if (ppd > 6) parts.push(txt(X(p.lon), Y(p.lat) + (p.lat > 0 ? -6 : 13), p.t.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), `fill="#94a3b8" font-size="9" text-anchor="middle" opacity="${p.t < date ? 0.6 : 1}"`));
    }

    // Nodes, Sun and planets on their real latitudes
    if (moon.layers.planets) {
        for (const id of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
            const lon = pos[id].sid;
            if (!vis(lon)) continue;
            const lat = id === 'Sun' ? 0 : Astronomy.Ecliptic(Astronomy.GeoVector(id, date, true)).elat;
            const b = BODY[id];
            parts.push(`<g class="cursor-pointer" data-type="planets" data-key="${id}"><circle cx="${f1(X(lon))}" cy="${f1(Y(lat))}" r="${id === 'Sun' ? 9 : 4}" fill="${b.color}" opacity="${id === 'Sun' ? 0.9 : 1}"/>${txt(X(lon), Y(lat) - (id === 'Sun' ? 13 : 7), b.symbol, `fill="${b.color}" font-size="13" text-anchor="middle"`)}</g>`);
        }
    }
    for (const id of ['NorthNode', 'SouthNode']) {
        const lon = pos[id].sid;
        if (!vis(lon)) continue;
        const b = BODY[id];
        parts.push(`<g class="cursor-pointer" data-type="planets" data-key="${id}"><path d="M${f1(X(lon))},${f1(Y(0) - 7)} l6,7 l-6,7 l-6,-7 z" fill="#0f172a" stroke="${b.color}" stroke-width="1.5"/>${txt(X(lon), Y(0) + 22, `${b.symbol} ${id === 'NorthNode' ? 'Rahu' : 'Ketu'}`, `fill="${b.color}" font-size="11" text-anchor="middle" font-weight="600"`)}</g>`);
    }
    // The Moon itself, true size (or at least visible), with the lit side as in the sky (north up, east left)
    const lat = moonLat(date), lib = Astronomy.Libration(date);
    const rm = Math.max(5, lib.diam_deg / 2 * ppd);
    const mx = X(moonSid), my = Y(lat);
    parts.push(`<circle cx="${f1(mx)}" cy="${f1(my)}" r="${f1(rm + 5)}" fill="none" stroke="#fbbf24" stroke-width="1.2" opacity="0.8"/>`);
    parts.push(`<g class="cursor-pointer" data-type="planets" data-key="Moon">${moonDisc(mx, my, rm, moonPhaseInfo(date).illum, limbRotation(brightLimb(date).chi), { id: 'stripmoon' })}</g>`);

    const svg = document.getElementById('moon-strip');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = parts.join('');

    // Readout: where the Moon is, three ways
    const nak = nakshatraOf(moonSid);
    const con = trueConstellation('Moon', date);
    const abbr = abbrOf(con);
    document.getElementById('moon-strip-info').innerHTML = `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <div class="bg-slate-900/60 rounded-lg p-2"><div class="text-xs text-slate-500">Tropical sign</div>${link('zodiac', signName(pos.Moon.trop), fmtSign(pos.Moon.trop))}</div>
            <div class="bg-slate-900/60 rounded-lg p-2"><div class="text-xs text-slate-500">Sidereal sign</div>${link('zodiac', signName(moonSid), fmtSign(moonSid))}</div>
            <div class="bg-slate-900/60 rounded-lg p-2"><div class="text-xs text-slate-500">In front of (real stars)</div>${CONSTELLATIONS.some(c => c.name === con) ? link('constellation', con, `${LORE.constellations[con]?.symbol || '✧'} ${con}`) : link('constellation', con, `✧ ${con}`)}${abbr && SKY_LORE[abbr] ? ` <button class="text-xs text-sky-300 underline" data-con-open="${abbr}">atlas</button>` : ''}</div>
            <div class="bg-slate-900/60 rounded-lg p-2"><div class="text-xs text-slate-500">Nakshatra</div>${link('nakshatra', String(nak.index), `<b>${nak.index + 1}. ${nak.name}</b> pada ${nak.pada}`)}</div>
        </div>`;
}

// ---------------------------------------------------------------------------
// Close passes and occultations of bright stars and planets

const PASS_PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
let passCache = { key: null, list: [] };

function passTargets() {
    const hips = new Set([17702, 21421, 49669, 65474, 80763]); // Pleiades, Aldebaran, Regulus, Spica, Antares
    for (let i = 0; i < 27; i++) {
        const h = yogataraHip(i);
        if (h && Math.abs(starSid(h).lat) < 6.8 && STAR.get(h).mag < 4.5) hips.add(h);
    }
    return [...hips].map(h => ({ kind: 'star', hip: h, name: starName(h).name || starLabel(h), v: STAR.get(h).v }));
}

function moonPasses(date, days = 45) {
    const key = `${Math.floor(date / (6 * HOUR_MS))}|${state.location ? state.location.lat + ',' + state.location.lon : ''}`;
    if (passCache.key === key) return passCache.list;
    const targets = [...passTargets(), ...PASS_PLANETS.map(id => ({ kind: 'planet', id, name: BODY[id].name }))];
    const vecAt = (tg, t) => tg.kind === 'star' ? tg.v : unit((({ x, y, z }) => [x, y, z])(Astronomy.GeoVector(tg.id, t, true)));
    const geoMoon = t => unit((({ x, y, z }) => [x, y, z])(Astronomy.GeoMoon(t)));
    const sep = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) / DEG;
    const obs = observer();
    const topoMoon = t => { const e = Astronomy.Equator('Moon', t, obs, false, true); return radec(e.ra * 15, e.dec); };
    const minimise = (f, a, b) => {
        for (let i = 0; i < 40; i++) {
            const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3;
            if (f(m1) < f(m2)) b = m2; else a = m1;
        }
        return (a + b) / 2;
    };
    const step = 2 * HOUR_MS, n = days * 12;
    const hist = targets.map(() => []);
    const out = [];
    for (let k = 0; k <= n; k++) {
        const t = new Date(date.getTime() + k * step), m = geoMoon(t);
        targets.forEach((tg, i) => {
            const h = hist[i];
            h.push(sep(m, vecAt(tg, t)));
            if (h.length >= 3) {
                const [a, b, c] = h.slice(-3);
                if (b < a && b <= c && b < 1.8) {
                    const tm = t.getTime() - step;
                    let best = minimise(x => sep(geoMoon(new Date(x)), vecAt(tg, new Date(x))), tm - step, tm + step);
                    let s = sep(geoMoon(new Date(best)), vecAt(tg, new Date(best)));
                    if (obs) {
                        best = minimise(x => sep(topoMoon(new Date(x)), vecAt(tg, new Date(x))), best - 3 * HOUR_MS, best + 3 * HOUR_MS);
                        s = sep(topoMoon(new Date(best)), vecAt(tg, new Date(best)));
                    }
                    const time = new Date(best);
                    if (s < 1.5 && time >= date) {
                        const radius = Astronomy.Libration(time).diam_deg / 2;
                        const mv = obs ? topoMoon(time) : geoMoon(time);
                        const north = eclJ2000(mv).lat > eclJ2000(vecAt(tg, time)).lat;
                        let alt = null, sunAlt = null;
                        if (obs) {
                            const fr = observerFrame(time);
                            alt = altAz(mv, fr).alt;
                            sunAlt = altAz(planetRaDec('Sun', time), fr).alt;
                        }
                        out.push({ ...tg, time, sep: s, occult: s < radius, north, alt, sunAlt });
                    }
                }
                h.shift();
            }
        });
    }
    out.sort((a, b) => a.time - b.time);
    passCache = { key, list: out };
    return out;
}

function renderPasses(date) {
    const el = document.getElementById('moon-passes');
    if (moon.anim) { el.innerHTML = '<h3 class="moon-h text-sky-300 mb-2">Close passes & occultations</h3><p class="text-sm text-slate-500">Paused while animating.</p>'; return; }
    const list = moonPasses(date).slice(0, 9);
    const rows = list.map(p => {
        const what = p.kind === 'planet' ? `<span style="color:${BODY[p.id].color}">${BODY[p.id].symbol}</span> ${p.name}` : `✦ ${p.name}`;
        const how = p.occult ? `<b class="text-fuchsia-300">covers</b> ${what} <span class="text-fuchsia-300">(occultation)</span>` : `passes ${fmtOrb(p.sep)} ${p.north ? 'north' : 'south'} of ${what}`;
        let seen = '';
        if (p.alt !== null) seen = p.alt < 0 ? '<span class="text-slate-600">below your horizon</span>'
            : p.sunAlt > -6 ? `<span class="text-slate-500">${Math.round(p.alt)}° up, ${p.sunAlt > 0 ? 'daylight' : 'twilight'}</span>`
            : `<span class="text-emerald-300">${Math.round(p.alt)}° up, dark sky ✓</span>`;
        return `<li><button class="w-full text-left hover:bg-slate-900/60 rounded px-2 py-1" data-type="jump" data-key="${p.time.toISOString()}">
            <span class="text-slate-400 font-mono text-xs">${fmtDate(p.time)}</span> ☽ ${how}<div class="text-xs">${seen}</div></button></li>`;
    }).join('');
    el.innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Close passes & occultations · next 45 days</h3>
        ${list.length ? `<ul class="flex flex-col gap-0.5 text-sm">${rows}</ul>` : '<p class="text-sm text-slate-500">No close passes of bright stars or planets in the next 45 days.</p>'}
        <p class="text-xs text-slate-500 mt-2">${state.location ? 'Calculated for your location: the Moon is close enough that its position shifts by up to 1° depending on where you stand, so occultations are local events.' : 'Geocentric. Set a location to see what happens from where you stand: occultations are local events.'} Click a row to jump there.</p>`;
}

// ---------------------------------------------------------------------------
// Astrology: panchanga and the Moon's condition

// Find when f(t) next changes value, within maxHours.
function nextChange(f, from, maxHours = 36, stepH = 1) {
    const v0 = f(from);
    let prev = from;
    for (let h = stepH; h <= maxHours; h += stepH) {
        const t = addHours(from, h);
        if (f(t) !== v0) return bisect(prev, t, x => f(x) !== v0);
        prev = t;
    }
    return null;
}

const elongAt = t => norm360(tropicalLongitude('Moon', t) - tropicalLongitude('Sun', t));
const nakAt = t => Math.floor(toSid(tropicalLongitude('Moon', t), t) / NAK_SPAN);
const yogaAt = t => Math.floor(norm360(toSid(tropicalLongitude('Moon', t), t) + toSid(tropicalLongitude('Sun', t), t)) / NAK_SPAN);
const karanaAt = t => Math.floor(elongAt(t) / 6);

function karanaName(k) {
    const K = MOON_LORE.karanas;
    return K.fixed[k] || K.movable[(k - 1) % 7];
}

function renderPanchanga(date) {
    const pos = current.pos;
    const tithi = tithiOf(pos);
    const hour = planetaryHour(date, state.location);
    const lord = hour ? hour.dayRuler : DAY_RULERS[date.getDay()];
    const varaIdx = MOON_LORE.varas.findIndex(v => v.lord === lord);
    const vara = MOON_LORE.varas[varaIdx];
    const nak = nakshatraOf(pos.Moon.sid);
    const yi = Math.floor(norm360(pos.Moon.sid + pos.Sun.sid) / NAK_SPAN), yoga = MOON_LORE.yogas[yi];
    const ki = karanaAt(date), karana = karanaName(ki);
    const until = t => t ? `<span class="text-slate-500 text-xs">until ${fmtDate(t)}</span>` : '';
    const live = !moon.anim;
    const tEnd = live ? nextChange(t => Math.floor(elongAt(t) / 12), date, 32) : null;
    const nEnd = live ? nextChange(nakAt, date, 32) : null;
    const yEnd = live ? nextChange(yogaAt, date, 32) : null;
    const kEnd = live ? nextChange(karanaAt, date, 18, 0.5) : null;

    // Rahu Kaal: an eighth of the daylight, by weekday
    let rahuKaal = '';
    if (hour) {
        const part = [8, 2, 7, 5, 6, 4, 3][varaIdx];
        const len = (hour.sunset - hour.sunrise) / 8;
        const s = new Date(hour.sunrise.getTime() + (part - 1) * len), e = new Date(s.getTime() + len);
        const now = date >= s && date < e;
        rahuKaal = `<div class="mt-3 text-sm ${now ? 'text-rose-300' : 'text-slate-400'}">☊ <b>Rahu Kaal</b> ${fmtTime(s)} – ${fmtTime(e)}${now ? ' · <b>now</b>' : ''}</div>`;
    }
    const row = (label, value, note) => `<div class="py-2 border-b border-slate-800 last:border-0">
        <div class="flex items-baseline justify-between gap-2"><span class="text-xs text-slate-500 uppercase tracking-wider">${label}</span>${note || ''}</div>
        <div class="text-sm">${value}</div></div>`;
    document.getElementById('moon-panchanga').innerHTML = `
        <h3 class="moon-h text-orange-300 mb-1">Panchanga · the five limbs</h3>
        ${row('Tithi', `${link('glossary', 'Tithi', `<b>${tithi.n}. ${tithi.name}</b>`)} <span class="text-slate-400">${tithi.paksha}</span>`, until(tEnd))}
        ${row('Vara', `${planetLink(vara.lord)} <b>${vara.name}</b> <span class="text-slate-400">${vara.note}</span>`, hour ? '<span class="text-slate-500 text-xs">from sunrise</span>' : '')}
        ${row('Nakshatra', `${link('nakshatra', String(nak.index), `<b>${nak.name}</b> pada ${nak.pada}`)} <span class="text-slate-400">· ${planetLink(nak.ruler)} · ${nak.deity}</span>`, until(nEnd))}
        ${row('Yoga', `<b class="${yoga[2] ? 'text-emerald-300' : 'text-rose-300'}">${yi + 1}. ${yoga[0]}</b> <span class="text-slate-400">"${yoga[1]}"${yoga[2] ? '' : ' · inauspicious'}</span>`, until(yEnd))}
        ${row('Karana', `<b class="${karana[0] === 'Vishti' ? 'text-rose-300' : ''}">${karana[0]}</b> <span class="text-slate-400">${karana[1]}</span>`, until(kEnd))}
        ${rahuKaal}
        <p class="text-xs text-slate-500 mt-3">${MOON_LORE.panchangaNote} ${MOON_LORE.yogaNote}</p>`;
}

function renderMoonCondition(date) {
    const pos = current.pos;
    const sidSign = signName(pos.Moon.sid);
    const elong = norm360(pos.Moon.trop - pos.Sun.trop);
    const waxing = elong < 180;
    const strength = (waxing ? elong : 360 - elong) / 180;
    const items = [];
    const dig = dignitiesOf('Moon', sidSign);
    items.push(`<li>In sidereal ${signLink(sidSign)}${dig.length ? ' ' + dignityChips('Moon', sidSign) : ''}${sidSign === 'Taurus' ? ' <span class="text-slate-400">(deepest exaltation at 3°)</span>' : ''}</li>`);
    items.push(`<li><b>${waxing ? 'Waxing' : 'Waning'}</b>: ${waxing ? 'a benefic, growing Moon' : 'a waning Moon, counted as a malefic when dark'}. Paksha bala (brightness strength) <b>${Math.round(strength * 100)}%</b>
        <div class="h-1.5 bg-slate-800 rounded mt-1"><div class="h-1.5 rounded bg-slate-200" style="width:${Math.round(strength * 100)}%"></div></div></li>`);

    if (!moon.anim) {
        const voc = voidOfCourse(date);
        if (voc && voc.active) items.push(`<li class="text-amber-200">Void of course until ${fmtDate(voc.end)} (then ${signLink(voc.nextSign)})</li>`);
    }

    // Moon with the nodes: an eclipse-like combination
    for (const id of ['NorthNode', 'SouthNode']) {
        const d = Math.abs(wrap180(pos.Moon.sid - pos[id].sid));
        if (signName(pos[id].sid) === sidSign) items.push(`<li class="text-fuchsia-200">☽ with ${planetLink(id)} in the same sign (${fmtOrb(d)} apart). Tradition calls the Moon "eclipsed" or "seized" (<i>grahana</i>) here: emotions run intense, restless or uncanny.</li>`);
    }
    // Two classic Moon yogas, by whole sign from the Moon
    const fromMoon = id => (signIndex(pos[id].sid) - signIndex(pos.Moon.sid) + 12) % 12 + 1;
    if ([1, 4, 7, 10].includes(fromMoon('Jupiter'))) items.push(`<li class="text-emerald-200"><b>Gaja Kesari yoga</b>: ${planetLink('Jupiter')} is ${fromMoon('Jupiter') === 1 ? 'with the Moon' : `in the ${ordinal(fromMoon('Jupiter'))} sign from the Moon`}, a kendra (angle), a combination traditionally read as wisdom, reputation and protection.</li>`);
    const flanking = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter(id => [2, 12].includes(fromMoon(id)));
    const withMoon = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter(id => fromMoon(id) === 1);
    if (!flanking.length && !withMoon.length) items.push(`<li class="text-rose-200"><b>Kemadruma</b>: no planet in the signs on either side of the Moon (or with it). The "lonely Moon" is traditionally read as an isolated or unsupported mood.</li>`);
    else if (flanking.length) items.push(`<li class="text-slate-300">Planets beside the Moon (2nd/12th sign): ${flanking.map(planetLink).join(', ')}, which gives Sunapha/Anapha support.</li>`);

    const aspects = current.aspects.filter(a => a.a === 'Moon' || a.b === 'Moon');
    const drishti = current.drishti.filter(d => d.receiver === 'Moon');
    document.getElementById('moon-condition').innerHTML = `
        <h3 class="moon-h text-emerald-300 mb-2">The Moon's condition</h3>
        <ul class="flex flex-col gap-2 text-sm">${items.join('')}</ul>
        <div class="mt-3 pt-3 border-t border-slate-800">
            <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Western aspects to the Moon</div>
            ${aspects.length ? `<ul class="flex flex-col">${aspects.map(aspectRow).join('')}</ul>` : '<p class="text-sm text-slate-500">None within orb.</p>'}
            <div class="text-xs text-slate-500 uppercase tracking-wider mt-3 mb-1">Graha drishti on the Moon</div>
            ${drishti.length ? `<ul class="flex flex-col">${drishti.map(drishtiRow).join('')}</ul>` : '<p class="text-sm text-slate-500">No planet glances at the Moon\'s sign.</p>'}
        </div>`;
}

// ---------------------------------------------------------------------------
// Lore cards (static)

function renderMoonLore() {
    const N = MOON_LORE.nodes, C = MOON_LORE.chandra;
    const card = (title, body, color = 'text-slate-300') => `<section class="moon-card"><h3 class="moon-h ${color} mb-2">${title}</h3><div class="text-sm text-slate-300 leading-relaxed flex flex-col gap-2">${body}</div></section>`;
    document.getElementById('moon-learn-nodes').innerHTML = [
        card('What are the nodes?', `<p>${N.what}</p>`, 'text-lime-300'),
        card('Why eclipses need them', `<p>${N.eclipses}</p>`, 'text-fuchsia-300'),
        card('Moving backwards', `<p>${N.regression}</p><p class="text-slate-400">${N.meanTrue}</p>`, 'text-lime-300'),
        card('Standstills & the Saros', `<p>${N.standstill}</p><p class="text-slate-400">${N.saros}</p>`, 'text-violet-300')
    ].join('');
    document.getElementById('moon-learn-myth').innerHTML = [
        card('The churning of the ocean', `<p>${N.myth}</p><p class="text-slate-400">${N.west}</p>`, 'text-orange-300'),
        card('Rahu & Ketu in a chart', `<p>${N.rahu}</p><p>${N.ketu}</p><p class="text-slate-400">${N.axis}</p><p class="text-slate-400">${N.rahuKaal}</p>`, 'text-lime-300'),
        card('Chandra and the 27 wives', `<p>${C.myth}</p><p class="text-slate-400">${C.soma}</p>`, 'text-amber-200'),
        card('The Moon in myth & astrology', `<p>${C.west}</p><p class="text-slate-400">${C.astrology}</p>`, 'text-slate-200')
    ].join('');
}

// Extra cards for the nakshatra detail view in the side panel.
function nakshatraLoreCards(i) {
    const N = MOON_LORE.nakshatras[i];
    if (!N) return '';
    const hip = yogataraHip(i);
    const p = hip && starSid(hip);
    const con = hip && starName(hip).con;
    const starBtn = hip ? `<button class="link-btn underline" data-type="skystar" data-key="${hip}">${starLabel(hip)}</button>` : '';
    return [
        card('The stars', `<p class="text-sm text-slate-300 leading-relaxed">${N.stars}</p>
            ${hip ? `<p class="text-sm text-slate-400 mt-2">Yogatara (junction star): ${starBtn}, ${fmtOrb(Math.abs(p.lat))} ${p.lat >= 0 ? 'north' : 'south'} of the ecliptic${Math.abs(p.lat) > 6.7 ? ', too far for the Moon ever to cover it' : Math.abs(p.lat) < 5.3 ? ', within reach of the Moon, which can pass right over it' : ''}.</p>` : ''}
            <p class="text-sm text-slate-400 mt-2"><b class="text-slate-300">How to find it:</b> ${N.find}</p>
            <div class="flex gap-3 mt-2 text-xs">
                <button class="text-sky-300 underline" data-moon-focus="${(i + 0.5) * NAK_SPAN}">Show on the Moon's path</button>
                ${con && SKY_LORE[con] ? `<button class="text-sky-300 underline" data-atlas-open="${con}">Open ${SKY.conNames[con]} in the Sky Atlas</button>` : ''}
            </div>`, 'text-sky-400'),
        card('Myth', `<p class="text-sm text-slate-300 leading-relaxed">${N.myth}</p>`, 'text-orange-400')
    ].join('');
}

// ---------------------------------------------------------------------------
// Render & bind

function renderMoon() {
    if (state.view !== 'moon' || !current.pos) return;
    const date = state.date;
    document.getElementById('moon-clock').textContent = fmtDate(date, { weekday: 'short', year: 'numeric' });
    renderMoonPhase(date);
    renderLunation(date);
    renderOrbit(date);
    renderWave(date);
    renderCycle(date);
    renderStrip(date);
    renderPasses(date);
    renderPanchanga(date);
    renderMoonCondition(date);
    syncMoonControls();
}

function syncMoonControls() {
    document.querySelectorAll('[data-moon-layer]').forEach(cb => { cb.checked = !!moon.layers[cb.dataset.moonLayer]; });
    document.querySelectorAll('[data-moon-span]').forEach(b => b.classList.toggle('seg-active', Number(b.dataset.moonSpan) === moon.span));
    document.querySelectorAll('[data-moon-anim]').forEach(b => {
        const on = moon.anim && moon.anim.kind === b.dataset.moonAnim;
        b.classList.toggle('seg-active', !!on);
        b.textContent = (on ? '❚❚ ' : '▶ ') + b.dataset.label;
    });
    document.getElementById('moon-exaggerate').checked = moon.exaggerate;
    document.getElementById('moon-follow').classList.toggle('hidden', moon.centre === null);
}

function stopMoonAnim() {
    if (!moon.anim) return;
    clearInterval(moon.anim.timer);
    moon.anim = null;
    renderMoon();
    renderPanel();
}

function startMoonAnim(kind) {
    if (moon.anim) { const same = moon.anim.kind === kind; stopMoonAnim(); if (same) return; }
    const stepH = kind === 'month' ? 3 : 24 * 8;
    moon.centre = null;
    moon.anim = { kind, timer: setInterval(() => setDate(addHours(state.date, stepH)), 60) };
    syncMoonControls();
}

function focusStrip(lon) {
    moon.centre = norm360(lon);
    if (state.view !== 'moon') setView('moon');
    renderStrip(state.date);
    syncMoonControls();
    document.getElementById('moon-strip-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function bindMoon() {
    loadMoon();
    renderMoonLore();
    const root = document.getElementById('moon-view');
    root.addEventListener('click', e => {
        const t = e.target.closest('[data-moon-time],[data-moon-anim],[data-moon-span],[data-moon-action],[data-con-open],[data-type],#moon-follow');
        if (!t) return;
        const d = t.dataset;
        if (stripDrag.moved) return;
        if (d.moonTime) {
            stopMoonAnim();
            if (d.moonTime === 'now') resetToNow();
            else changeTime(Number(d.moonTime.slice(0, -1)), { h: 'hour', d: 'day', M: 'month' }[d.moonTime.slice(-1)]);
        }
        else if (d.moonAnim) startMoonAnim(d.moonAnim);
        else if (d.moonSpan) { moon.span = Number(d.moonSpan); saveMoon(); renderStrip(state.date); syncMoonControls(); }
        else if (d.moonAction === 'locate') useGeolocation();
        else if (t.id === 'moon-follow') { moon.centre = null; renderStrip(state.date); syncMoonControls(); }
        else if (d.conOpen) { setView('atlas'); selectConstellation(d.conOpen, true); }
        else if (d.type) openDetail(d.type, d.key);
    });
    root.addEventListener('change', e => {
        const k = e.target.dataset.moonLayer;
        if (k) { moon.layers[k] = e.target.checked; saveMoon(); renderStrip(state.date); }
        if (e.target.id === 'moon-exaggerate') { moon.exaggerate = e.target.checked; saveMoon(); renderOrbit(state.date); }
    });

    // Drag the 3D orbit to turn it
    const orbit = document.getElementById('moon-orbit');
    let od = null;
    orbit.addEventListener('pointerdown', e => { od = { x: e.clientX, y: e.clientY }; orbit.setPointerCapture(e.pointerId); });
    orbit.addEventListener('pointermove', e => {
        if (!od) return;
        moon.yaw -= (e.clientX - od.x) * 0.5;
        moon.pitch = Math.max(-5, Math.min(90, moon.pitch + (e.clientY - od.y) * 0.4));
        od = { x: e.clientX, y: e.clientY };
        renderOrbit(state.date);
    });
    const endOrbit = () => { if (od) saveMoon(); od = null; };
    orbit.addEventListener('pointerup', endOrbit);
    orbit.addEventListener('pointercancel', endOrbit);

    // Drag the strip map sideways to travel along the zodiac
    const strip = document.getElementById('moon-strip-box');
    strip.addEventListener('pointerdown', e => { stripDrag.x = e.clientX; stripDrag.down = true; stripDrag.moved = false; });
    strip.addEventListener('pointermove', e => {
        if (!stripDrag.down) return;
        const dx = e.clientX - stripDrag.x;
        if (!stripDrag.moved && Math.abs(dx) < 4) return;
        if (!stripDrag.moved) { stripDrag.moved = true; strip.setPointerCapture(e.pointerId); hideTooltip(); }
        const ppd = strip.clientWidth / moon.span;
        moon.centre = norm360((moon.centre ?? current.pos.Moon.sid) + dx / ppd);
        stripDrag.x = e.clientX;
        renderStrip(state.date);
        syncMoonControls();
    });
    const endStrip = () => { stripDrag.down = false; setTimeout(() => { stripDrag.moved = false; }, 0); };
    strip.addEventListener('pointerup', endStrip);
    strip.addEventListener('pointercancel', endStrip);
    const svg = document.getElementById('moon-strip');
    svg.addEventListener('click', e => {
        if (stripDrag.moved) return;
        const s = e.target.closest('.m-star');
        if (s) openDetail('skystar', s.dataset.hip);
    });
    svg.addEventListener('mouseover', e => { const s = e.target.closest('.m-star'); if (s) showTooltip(e, 'skystar', s.dataset.hip); });
    svg.addEventListener('mousemove', e => { if (e.target.closest('.m-star')) moveTooltip(e); });
    svg.addEventListener('mouseout', e => { if (e.target.closest('.m-star')) hideTooltip(); });

    // Links from the side panel
    document.getElementById('info-sidebar').addEventListener('click', e => {
        const f = e.target.closest('[data-moon-focus]');
        if (f) focusStrip(Number(f.dataset.moonFocus));
        if (e.target.closest('[data-view-open]')) setView(e.target.closest('[data-view-open]').dataset.viewOpen);
    });

    new ResizeObserver(() => { if (state.view === 'moon') renderStrip(state.date); }).observe(strip);
}
const stripDrag = { x: 0, down: false, moved: false };

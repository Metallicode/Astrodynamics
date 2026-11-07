// Pair view: two birth charts as nested spheres (A inside, "Us" between, B outside), the contacts between them,
// a relationship profile, Ashtakoot, house overlays, elements, the harmonic spectrum of moments between the two
// births with echoes after them, shared transits, and the age gap in planetary cycles.
// Depends on app.js, atlas.js (cross, unit), moon.js (f1, NAK_SPAN), aspects.js (saved charts, chart form, natal(),
// POINT_INFO, ASPECT_WEIGHT) and pair-lore.js.

const PAIR_KEY = 'astrodynamics.pair.v1';
const PAIR_COLORS = { A: '#2dd4bf', U: '#fbbf24', B: '#c084fc' };
const SHELL = { A: 0.56, U: 0.78, B: 1 };
const pview = {
    a: null, b: null, moment: '1/2', us: 'moment', threads: 'ab', groom: 'A', weatherDays: 365,
    horizons: true, equator: false, latX: false, spin: true,
    focus: null,            // 'A:Venus' (a point) or 'A:Venus|B:Mars' (a contact)
    formSlot: null, deleteArmed: false,
    cam: { yaw: 0.6, tilt: 55 * DEG, zoom: 1 }, flat: 0, flatTarget: 0,
    raf: null, drag: null, hits: []
};
const PAIR_SAVED = ['a', 'b', 'moment', 'us', 'threads', 'groom', 'weatherDays', 'horizons', 'equator', 'latX', 'spin'];
const PARALLEL_ORB = 1;
const EXTRA_ASPECTS = {
    parallel: { name: 'Parallel', symbol: '∥', color: '#e2e8f0', weight: 0.8, feel: 'alike in a quiet, underlying way' },
    contraparallel: { name: 'Contraparallel', symbol: '⋕', color: '#fb923c', weight: 0.75, feel: 'balanced across a divide' }
};
const PROFILE_OF = {
    trine: 'harmony', sextile: 'harmony', quintile: 'harmony', biquintile: 'harmony', semisextile: 'harmony',
    square: 'friction', opposition: 'friction', quincunx: 'friction', semisquare: 'friction', sesquiquadrate: 'friction',
    conjunction: 'intensity', parallel: 'intensity', contraparallel: 'intensity'
};
// The profile is compared with this many random pairs of births (a fixed sample, so it never changes between visits).
const BASELINE_PAIRS = 300;
const VULGAR = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘', '1/6': '⅙', '5/6': '⅚', '1/7': '⅐', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞', '1/9': '⅑', '1/10': '⅒' };

function loadPair() {
    try {
        const saved = JSON.parse(localStorage.getItem(PAIR_KEY) || '{}');
        for (const k of PAIR_SAVED) if (saved[k] !== undefined) pview[k] = saved[k];
    } catch (e) {
        console.warn('Could not read pair settings', e);
    }
}

function savePair() {
    localStorage.setItem(PAIR_KEY, JSON.stringify(Object.fromEntries(PAIR_SAVED.map(k => [k, pview[k]]))));
}

// ---------------------------------------------------------------------------
// Points, people and moments

const pointInfo = id => BODY[id] || POINT_INFO[id];
const aspInfo = type => EXTRA_ASPECTS[type] || { name: LORE.aspects[type].name, symbol: LORE.aspects[type].symbol, color: ASPECT_COLORS[type], weight: ASPECT_WEIGHT[type], feel: ASPECT_LORE.aspects[type].feel };
const pairChart = id => aview.charts.find(c => c.id === id) || null;
const gcd = (a, b) => b ? gcd(b, a % b) : a;

function pairCharts() {
    const A = pairChart(pview.a), B = pairChart(pview.b);
    return A && B && A.id !== B.id ? [A, B] : null;
}

// Fill empty slots from the saved charts.
function fillPairSlots() {
    const ids = aview.charts.map(c => c.id);
    if (!ids.includes(pview.a)) pview.a = ids.find(i => i !== pview.b) || null;
    if (!ids.includes(pview.b) || pview.b === pview.a) pview.b = ids.find(i => i !== pview.a) || null;
}

// Ecliptic longitude (tropical), latitude and declination of every point, in degrees.
const skyCache = new Map();
function skyPoints(date, loc, cache = true) {
    const key = `${date.getTime()}|${loc ? `${loc.lat},${loc.lon}` : ''}`;
    if (cache && skyCache.has(key)) return skyCache.get(key);
    const eps = meanObliquity(date) * DEG;
    const mk = (trop, lat) => {
        const l = trop * DEG, b = lat * DEG;
        return { trop, lat, dec: Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l)) / DEG };
    };
    const pts = {};
    for (const id of PLANET_IDS) {
        const e = Astronomy.Ecliptic(Astronomy.GeoVector(id, date, true));
        pts[id] = mk(e.elon, e.elat);
    }
    let frame = null;
    if (loc) {
        frame = localFrame(date, loc);
        pts.ASC = mk(frame.asc, 0);
        pts.MC = mk(frame.mc, 0);
    }
    const sky = { date, loc, pts, frame, ids: Object.keys(pts) };
    if (!cache) return sky;
    if (skyCache.size > 400) skyCache.clear();
    skyCache.set(key, sky);
    return sky;
}

function personOf(chart) {
    const date = new Date(chart.date), loc = chart.lat != null ? { lat: chart.lat, lon: chart.lon } : null;
    return { name: chart.name, chart, ...skyPoints(date, loc) };
}

// The point a fraction t of the way along the great circle from place a to place b.
function slerpLoc(a, b, t) {
    const vec = l => [Math.cos(l.lat * DEG) * Math.cos(l.lon * DEG), Math.cos(l.lat * DEG) * Math.sin(l.lon * DEG), Math.sin(l.lat * DEG)];
    const p = vec(a), q = vec(b);
    const om = Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])));
    if (om < 1e-9) return { lat: a.lat, lon: a.lon };
    const s0 = Math.sin((1 - t) * om) / Math.sin(om), s1 = Math.sin(t * om) / Math.sin(om);
    const r = p.map((x, i) => s0 * x + s1 * q[i]);
    return { lat: Math.asin(Math.max(-1, Math.min(1, r[2]))) / DEG, lon: Math.atan2(r[1], r[0]) / DEG };
}

function frac(p, q) {
    const g = gcd(p, q);
    return { p: p / g, q: q / g, key: `${p / g}/${q / g}`, t: p / q };
}
const parseFrac = key => { const [p, q] = key.split('/').map(Number); return p > 0 && q > 0 ? frac(p, q) : frac(1, 2); };
// How many of the divisions ÷2 … ÷12 have a node here.
const depthOf = f => f.q === 1 ? 11 : Math.floor(12 / f.q);
const divisionsOf = f => Array.from({ length: 11 }, (_, i) => i + 2).filter(n => n % f.q === 0);

function fmtFrac(f) {
    const whole = Math.floor(f.p / f.q), rest = f.p % f.q;
    const part = rest ? (VULGAR[`${rest}/${f.q}`] || `${rest}⁄${f.q}`) : '';
    return `${whole || !part ? whole : ''}${part}`;
}

// Echoes are labelled by how far past the later birth they fall, in gaps.
const echoOf = f => frac(f.p - f.q, f.q);

function momentAt(f, d) {
    const date = new Date(d.early.date.getTime() + f.t * d.gap);
    let loc = null, place = 'none';
    if (f.t <= 1 && d.early.loc && d.late.loc) { loc = slerpLoc(d.early.loc, d.late.loc, f.t); place = 'between'; }
    else if (f.t > 1 && state.location) { loc = state.location; place = 'here'; }
    return { f, place, ...skyPoints(date, loc) };
}

function composite(A, B) {
    const date = new Date((A.date.getTime() + B.date.getTime()) / 2), eps = meanObliquity(date) * DEG;
    const pts = {};
    for (const id of A.ids) {
        if (!B.pts[id]) continue;
        const trop = norm360(A.pts[id].trop + wrap180(B.pts[id].trop - A.pts[id].trop) / 2);
        pts[id] = { trop, lat: 0, dec: Math.asin(Math.sin(eps) * Math.sin(trop * DEG)) / DEG };
    }
    return { date, loc: null, pts, frame: null, ids: Object.keys(pts), composite: true };
}

// ---------------------------------------------------------------------------
// Contacts between two sets of points

function contactStrength(type, orb, allowed, idA, idB) {
    const tight = Math.max(0, 1 - orb / allowed);
    const bodies = (ASPECT_LORE.natures[idA].weight + ASPECT_LORE.natures[idB].weight) / 2;
    return { tight, total: 0.55 * tight + 0.25 * aspInfo(type).weight + 0.2 * bodies };
}

function contactsBetween(P, Q, parallels = true) {
    const out = [];
    for (const a of P.ids) for (const b of Q.ids) {
        const pa = P.pts[a], pb = Q.pts[b];
        const asp = aspectBetween(a, pa.trop, 0, b, pb.trop, 0);
        if (asp) {
            const s = contactStrength(asp.type, asp.orb, asp.allowed, a, b);
            out.push({ a, b, type: asp.type, orb: asp.orb, allowed: asp.allowed, strength: s.total, tight: s.tight });
        }
        if (!parallels) continue;
        for (const [type, diff] of [['parallel', Math.abs(pa.dec - pb.dec)], ['contraparallel', Math.abs(pa.dec + pb.dec)]]) {
            // Points near the equator are "parallel" to everything: require some declination.
            if (diff > PARALLEL_ORB || Math.abs(pa.dec) < 1) continue;
            const s = contactStrength(type, diff, PARALLEL_ORB, a, b);
            out.push({ a, b, type, orb: diff, allowed: PARALLEL_ORB, strength: s.total, tight: s.tight });
        }
    }
    return out.sort((x, y) => y.strength - x.strength);
}

// Each contact counts by its strength times its tightness, so the many wide contacts any two charts have count little.
function profileOf(contacts) {
    const sums = { harmony: 0, friction: 0, intensity: 0 }, counts = { harmony: 0, friction: 0, intensity: 0 };
    for (const c of contacts) {
        const k = PROFILE_OF[c.type], w = c.strength * c.tight;
        sums[k] += w; counts[k]++;
        if (c.type === 'opposition') { sums.intensity += w / 2; counts.intensity++; }
    }
    return { sums, counts };
}

// Profile totals of random pairs of births (born within 15 years of each other), sorted, per measure.
const baseCache = { key: null, sorted: null };
function profileBaseline() {
    const key = `${state.orbSystem}|${state.minorAspects}`;
    if (baseCache.key === key) return baseCache.sorted;
    let seed = 20261106;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const place = () => ({ lat: -40 + rnd() * 100, lon: -180 + rnd() * 360 });
    const sorted = { harmony: [], friction: [], intensity: [] };
    for (let i = 0; i < BASELINE_PAIRS; i++) {
        const da = new Date(Date.UTC(1940, 0, 1) + rnd() * 70 * 365.25 * DAY_MS), db = new Date(da.getTime() + (rnd() - 0.5) * 30 * 365.25 * DAY_MS);
        const pr = profileOf(contactsBetween(skyPoints(da, place(), false), skyPoints(db, place(), false)));
        for (const k in sorted) sorted[k].push(pr.sums[k]);
    }
    for (const k in sorted) sorted[k].sort((x, y) => x - y);
    baseCache.key = key;
    baseCache.sorted = sorted;
    return sorted;
}

// Share of the random pairs below x (0–1).
function percentileOf(sorted, x) {
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < x) lo = mid + 1; else hi = mid; }
    return lo / sorted.length;
}

// How strongly a sky touches both charts. Only contacts within 2° count, and both people must be touched.
function resonanceOf(M, A, B) {
    const score = P => contactsBetween(M, P, false).reduce((s, c) => {
        const close = Math.max(0, 1 - c.orb / 2);
        return s + close * close * aspInfo(c.type).weight * (ASPECT_LORE.natures[c.a].weight + ASPECT_LORE.natures[c.b].weight) / 2;
    }, 0);
    const sa = score(A), sb = score(B);
    return { sa, sb, raw: Math.sqrt(sa * sb) };
}

// ---------------------------------------------------------------------------
// Everything that depends only on the two charts and the settings

const pairCache = { key: null, data: null };
function pairData() {
    const cs = pairCharts();
    if (!cs) return null;
    const key = [...cs.map(c => `${c.id}|${c.date}|${c.lat}|${c.lon}`), state.mode, state.orbSystem, state.minorAspects, state.location ? `${state.location.lat},${state.location.lon}` : ''].join('#');
    if (pairCache.key === key) return pairCache.data;
    const A = personOf(cs[0]), B = personOf(cs[1]);
    const [early, late] = A.date <= B.date ? [A, B] : [B, A];
    const d = { A, B, early, late, gap: late.date - early.date };
    d.contacts = contactsBetween(A, B);
    d.profile = profileOf(d.contacts);
    const base = profileBaseline();
    d.profile.pct = Object.fromEntries(Object.keys(base).map(k => [k, percentileOf(base[k], d.profile.sums[k])]));
    d.comp = composite(A, B);
    d.spectrum = [];
    d.echoes = [];
    if (d.gap >= HOUR_MS) {
        const seen = new Set();
        for (let n = 2; n <= 12; n++) for (let k = 1; k < n; k++) {
            const f = frac(k, n);
            if (seen.has(f.key)) continue;
            seen.add(f.key);
            d.spectrum.push(momentAt(f, d));
        }
        d.spectrum.sort((x, y) => x.f.t - y.f.t);
        // Echoes: simple fractions (halves, thirds, quarters) of the gap after the later birth, for a lifetime.
        const maxT = Math.min(1 + 12, 1 + 100 * 365.25 * DAY_MS / d.gap);
        const eseen = new Set();
        for (let q = 1; q <= 4; q++) for (let p = q + 1; p / q <= maxT; p++) {
            const f = frac(p, q);
            if (eseen.has(f.key)) continue;
            eseen.add(f.key);
            d.echoes.push(momentAt(f, d));
        }
        d.echoes.sort((x, y) => x.f.t - y.f.t);
        for (const set of [d.spectrum, d.echoes]) {
            for (const m of set) Object.assign(m, resonanceOf(m, A, B));
            const max = Math.max(1e-9, ...set.map(m => m.raw));
            for (const m of set) m.res = m.raw / max;
        }
    }
    pairCache.key = key;
    pairCache.data = d;
    return d;
}

// The sky shown on the middle shell.
function usOf(d) {
    if (pview.us === 'composite') return d.comp;
    const f = parseFrac(pview.moment);
    return [...d.spectrum, ...d.echoes].find(m => m.f.key === f.key) || d.spectrum.find(m => m.f.key === '1/2') || null;
}

const usName = (U) => !U ? 'Us' : U.composite ? 'composite' : U.f.t > 1 ? `echo +${fmtFrac(echoOf(U.f))}` : U.f.key === '1/2' ? 'Davison ½' : fmtFrac(U.f);

// ---------------------------------------------------------------------------
// Words

const pname = id => pointInfo(id).name;
const pglyph = id => `<span style="color:${pointInfo(id).color}">${pointInfo(id).symbol}</span>`;
const who = (side, d) => side === 'A' ? d.A.name : side === 'B' ? d.B.name : 'Us';
const whoTag = (side, d) => `<span style="color:${PAIR_COLORS[side]}">${esc(who(side, d))}</span>`;

function contactNote(a, b) {
    return PAIR_LORE.pairs[[a, b].sort().join('|')]
        || ['Saturn', 'Pluto', 'Neptune', 'Uranus', 'Jupiter', 'MC'].map(p => (a === p || b === p) && PAIR_LORE.planets[p]).find(Boolean) || '';
}

// Planets get their glyph before the name; the angles' "glyphs" (AC, MC) would only repeat it.
const pnamed = id => BODY[id] ? `${pglyph(id)} ${pname(id)}` : `<span style="color:${pointInfo(id).color}">${pname(id)}</span>`;

function contactLine(c, d, sideA = 'A', sideB = 'B') {
    const ai = aspInfo(c.type);
    return `${whoTag(sideA, d)}'s ${pnamed(c.a)} <span style="color:${ai.color}">${ai.symbol} ${PAIR_LORE.verbs[c.type]}</span> ${whoTag(sideB, d)}'s ${pnamed(c.b)}`;
}

function contactReading(c, d) {
    const ai = aspInfo(c.type);
    const note = contactNote(c.a, c.b);
    return `${cap(PAIR_LORE.themes[c.a])} ↔ ${PAIR_LORE.themes[c.b]}: ${ai.feel}.${note ? ' ' + note : ''}`;
}

// ---------------------------------------------------------------------------
// The sphere

const v3 = (lon, lat, r) => [r * Math.cos(lat * DEG) * Math.cos(lon * DEG), r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG)];

// Equatorial direction (RA, Dec in radians) to ecliptic coordinates.
function eqToEcl(ra, dec, eps) {
    const x = Math.cos(dec) * Math.cos(ra), y = Math.cos(dec) * Math.sin(ra), z = Math.sin(dec);
    return [x, y * Math.cos(eps) + z * Math.sin(eps), -y * Math.sin(eps) + z * Math.cos(eps)];
}

// A circle on the unit sphere around the axis n, at angular distance 90° − alt from it (alt = 0 gives a great circle).
function circleAround(n, alt = 0, steps = 96) {
    n = unit(n);
    const u = unit(Math.abs(n[2]) < 0.9 ? cross(n, [0, 0, 1]) : cross(n, [1, 0, 0])), w = cross(n, u);
    const c = Math.cos(alt * DEG), s = Math.sin(alt * DEG);
    return Array.from({ length: steps + 1 }, (_, i) => {
        const th = i / steps * 2 * Math.PI;
        return [0, 1, 2].map(k => c * (u[k] * Math.cos(th) + w[k] * Math.sin(th)) + s * n[k]);
    });
}

function sphereCamera(cv) {
    const w = cv.clientWidth, h = cv.clientHeight;
    const f = pview.flat;
    const yaw = Math.atan2(Math.sin(pview.cam.yaw), Math.cos(pview.cam.yaw)) * (1 - f);
    const tilt = pview.cam.tilt + (Math.PI / 2 - pview.cam.tilt) * f;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    const S = Math.min(w, h) * 0.41 * pview.cam.zoom;
    const latK = (pview.latX ? 4 : 1) * (1 - f);
    return {
        w, h, S, latK,
        // Screen x, y and depth (towards the viewer). Seen from straight above it is the Wheel: 0° Aries on the left.
        proj([x, y, z]) {
            const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
            return [w / 2 - x1 * S, h / 2 + (y1 * st - z * ct) * S, y1 * ct + z * st];
        },
        // A sky direction to a point on a shell, with the latitude scaled for display.
        place(v, r) {
            const lon = Math.atan2(v[1], v[0]) / DEG, lat = Math.asin(Math.max(-1, Math.min(1, v[2] / Math.hypot(...v)))) / DEG;
            return v3(lon, Math.max(-89, Math.min(89, lat * latK)), r);
        }
    };
}

function sphereModel(d) {
    const U = usOf(d);
    const people = [['A', d.A], ['U', U], ['B', d.B]].filter(([, P]) => P);
    const contacts = pview.threads === 'us' && U
        ? [...contactsBetween(U, d.A).slice(0, 24).map(c => ({ ...c, sa: 'U', sb: 'A' })), ...contactsBetween(U, d.B).slice(0, 24).map(c => ({ ...c, sa: 'U', sb: 'B' }))]
        : d.contacts.map(c => ({ ...c, sa: 'A', sb: 'B' }));
    return { U, people, contacts };
}

// Focus: which points and threads are highlighted.
function focusSets(model) {
    const f = pview.focus;
    if (!f) return null;
    const [p1, p2] = f.split('|');
    const threads = new Set(), points = new Set([p1, p2].filter(Boolean));
    model.contacts.forEach((c, i) => {
        const ka = `${c.sa}:${c.a}`, kb = `${c.sb}:${c.b}`;
        if (p2 ? (ka === p1 && kb === p2) || (ka === p2 && kb === p1) : ka === p1 || kb === p1) { threads.add(i); points.add(ka); points.add(kb); }
    });
    return { threads, points, contact: p2 ? model.contacts.find(c => [`${c.sa}:${c.a}`, `${c.sb}:${c.b}`].sort().join('|') === [p1, p2].sort().join('|')) : null };
}

function drawSphere() {
    const cv = document.getElementById('pair-sphere');
    const d = pairData();
    if (!cv || !d || cv.offsetParent === null) return;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(cv.clientWidth * dpr) || cv.height !== Math.round(cv.clientHeight * dpr)) {
        cv.width = Math.round(cv.clientWidth * dpr);
        cv.height = Math.round(cv.clientHeight * dpr);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    const cam = sphereCamera(cv), model = sphereModel(d), focus = focusSets(model);
    const flatFade = 1 - pview.flat;
    const prims = [];
    const fade = z => 0.25 + 0.75 * (z + 1) / 2;
    const polyline = (pts, r, color, width, alpha, dash) => {
        const P = pts.map(v => cam.proj(cam.place(v, r)));
        for (let i = 1; i < P.length; i++) {
            const z = (P[i][2] + P[i - 1][2]) / 2 / r;
            prims.push({ z: z * r, seg: [P[i - 1], P[i]], color, width, alpha: alpha * fade(z), dash });
        }
    };

    // Shell silhouettes
    for (const [side] of model.people) {
        const r = SHELL[side] * cam.S;
        const g = ctx.createRadialGradient(cam.w / 2, cam.h / 2, r * 0.6, cam.w / 2, cam.h / 2, r);
        g.addColorStop(0, 'rgba(15,23,42,0)');
        g.addColorStop(1, PAIR_COLORS[side] + '14');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cam.w / 2, cam.h / 2, r, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = PAIR_COLORS[side] + '30'; ctx.lineWidth = 1; ctx.stroke();
    }

    // The ecliptic on each shell, the zodiac around the outside
    const ecl = circleAround([0, 0, 1]);
    for (const [side] of model.people) polyline(ecl, SHELL[side], PAIR_COLORS[side], 1, 0.55, null);
    const ayan = ayanamsa(d.late.date);
    const zones = isAstro()
        ? CONSTELLATIONS.map(c => ({ start: c.start + ayan, mid: c.start + c.width / 2 + ayan, symbol: c.symbol, color: '#94a3b8' }))
        : ZODIAC.map((z, i) => ({ start: i * 30 + (state.mode === 'sidereal' ? ayan : 0), mid: i * 30 + 15 + (state.mode === 'sidereal' ? ayan : 0), symbol: LORE.zodiac[z].symbol, color: ELEMENT_COLORS[LORE.zodiac[z].element] }));
    for (const z of zones) {
        const a = cam.proj(v3(z.start, 0, 1.0)), b = cam.proj(v3(z.start, 0, 1.06));
        prims.push({ z: a[2], seg: [a, b], color: '#64748b', width: 1, alpha: fade(a[2]) });
        const g = cam.proj(v3(z.mid, 0, 1.13));
        prims.push({ z: g[2], text: z.symbol, x: g[0], y: g[1], color: z.color, size: 13, alpha: 0.35 + 0.5 * fade(g[2]) });
    }

    // Birth horizons and meridians, and the celestial equator
    const eps = meanObliquity(d.late.date) * DEG;
    const pole = [0, Math.sin(eps), Math.cos(eps)];
    if (pview.horizons && flatFade > 0.05) {
        for (const [side, P] of model.people) {
            if (!P.frame) continue;
            const zen = eqToEcl(P.frame.ramc, P.frame.lat, P.frame.eps);
            polyline(circleAround(zen), SHELL[side], PAIR_COLORS[side], 1.3, 0.7 * flatFade, [5, 4]);
            polyline(circleAround(cross(zen, pole)), SHELL[side], PAIR_COLORS[side], 1, 0.4 * flatFade, [1, 4]);
        }
    }
    const parallelFocus = focus?.contact && EXTRA_ASPECTS[focus.contact.type];
    if ((pview.equator || parallelFocus) && flatFade > 0.05) {
        for (const [side] of model.people) polyline(circleAround(pole), SHELL[side], '#94a3b8', 1, 0.5 * flatFade, [2, 3]);
    }
    if (parallelFocus) {
        const c = focus.contact;
        for (const [side, id] of [[c.sa, c.a], [c.sb, c.b]]) {
            const P = model.people.find(p => p[0] === side)[1];
            polyline(circleAround(pole, P.pts[id].dec), SHELL[side], aspInfo(c.type).color, 1.4, 0.9 * flatFade, [4, 3]);
        }
    }

    // Threads
    const pos = {};
    for (const [side, P] of model.people) for (const id of P.ids) {
        const p = P.pts[id];
        pos[`${side}:${id}`] = cam.proj(cam.place(v3(p.trop, p.lat, 1), SHELL[side]));
    }
    model.contacts.forEach((c, i) => {
        const a = pos[`${c.sa}:${c.a}`], b = pos[`${c.sb}:${c.b}`];
        if (!a || !b) return;
        const on = !focus || focus.threads.has(i);
        const alpha = (on ? 0.25 + 0.65 * c.tight : 0.05) * fade((a[2] + b[2]) / 2);
        prims.push({ z: (a[2] + b[2]) / 2, seg: [a, b], color: aspInfo(c.type).color, width: (focus && on ? 1.5 : 0.6) + 2.2 * c.strength * c.tight, alpha: focus && on ? Math.max(alpha, 0.85) : alpha, dash: EXTRA_ASPECTS[c.type] ? [3, 3] : null });
    });

    // Spokes and the angle at the centre for a focused contact
    if (focus?.contact && !EXTRA_ASPECTS[focus.contact.type]) {
        const c = focus.contact;
        const da = model.people.find(p => p[0] === c.sa)[1].pts[c.a], db = model.people.find(p => p[0] === c.sb)[1].pts[c.b];
        const ua = cam.place(v3(da.trop, da.lat, 1), 1), ub = cam.place(v3(db.trop, db.lat, 1), 1);
        const o = cam.proj([0, 0, 0]), color = aspInfo(c.type).color;
        for (const [u, side] of [[ua, c.sa], [ub, c.sb]]) {
            const e = cam.proj(u.map(x => x * SHELL[side]));
            prims.push({ z: e[2] / 2, seg: [o, e], color, width: 1, alpha: 0.8, dash: [2, 2] });
        }
        const om = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1] + ua[2] * ub[2])));
        const arc = Array.from({ length: 25 }, (_, i) => {
            const t = i / 24;
            if (om < 1e-6) return ua;
            return ua.map((x, k) => (Math.sin((1 - t) * om) * x + Math.sin(t * om) * ub[k]) / Math.sin(om));
        });
        const P = arc.map(v => cam.proj(v.map(x => x * 0.22)));
        for (let i = 1; i < P.length; i++) prims.push({ z: 0.3, seg: [P[i - 1], P[i]], color, width: 2, alpha: 0.95 });
        const m = P[12];
        prims.push({ z: 0.31, text: `${Math.round(om / DEG)}°`, x: m[0] + (m[0] - o[0]) * 0.7, y: m[1] + (m[1] - o[1]) * 0.7, color, size: 12, alpha: 1, bold: true });
    }

    // Points
    pview.hits = [];
    for (const [side, P] of model.people) for (const id of P.ids) {
        const k = `${side}:${id}`, p = pos[k];
        const on = !focus || focus.points.has(k);
        prims.push({ z: p[2] + 0.001, dot: true, x: p[0], y: p[1], side, id, alpha: on ? fade(p[2]) * 0.6 + 0.4 : 0.18, ring: focus && on });
        pview.hits.push({ x: p[0], y: p[1], z: p[2], key: k });
    }

    prims.sort((a, b) => a.z - b.z);
    ctx.lineCap = 'round';
    for (const p of prims) {
        ctx.globalAlpha = p.alpha;
        if (p.seg) {
            ctx.strokeStyle = p.color; ctx.lineWidth = p.width;
            ctx.setLineDash(p.dash || []);
            ctx.beginPath(); ctx.moveTo(p.seg[0][0], p.seg[0][1]); ctx.lineTo(p.seg[1][0], p.seg[1][1]); ctx.stroke();
        } else if (p.text) {
            ctx.fillStyle = p.color; ctx.font = `${p.bold ? '600 ' : ''}${p.size}px system-ui, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(p.text, p.x, p.y);
        } else if (p.dot) {
            const info = pointInfo(p.id), r = p.side === 'U' ? 8 : 9.5;
            ctx.setLineDash([]);
            ctx.fillStyle = '#0b1220';
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 2 * Math.PI); ctx.fill();
            ctx.strokeStyle = p.ring ? '#facc15' : PAIR_COLORS[p.side]; ctx.lineWidth = p.ring ? 2.5 : 1.5; ctx.stroke();
            ctx.fillStyle = info.color; ctx.font = `${['ASC', 'MC'].includes(p.id) ? 8 : r + 2}px system-ui, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(info.symbol, p.x, p.y + 0.5);
        }
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
}

function pairLoop() {
    pview.raf = null;
    if (state.view !== 'pair') return;
    let again = false;
    if (pview.flat !== pview.flatTarget) {
        pview.flat = pview.flatTarget > pview.flat ? Math.min(pview.flatTarget, pview.flat + 0.035) : Math.max(pview.flatTarget, pview.flat - 0.035);
        again = true;
    } else if (pview.spin && !pview.drag && !pview.flatTarget && !pview.focus) {
        pview.cam.yaw += 0.003;
        again = true;
    }
    drawSphere();
    if (again) pview.raf = requestAnimationFrame(pairLoop);
}

function kickSphere() {
    if (!pview.raf) pview.raf = requestAnimationFrame(pairLoop);
}

function stopPairAnim() {
    if (pview.raf) cancelAnimationFrame(pview.raf);
    pview.raf = null;
}

function hitAt(e) {
    const r = e.target.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null;
    for (const h of pview.hits) {
        const dist = Math.hypot(h.x - x, h.y - y);
        if (dist < 11 && (!best || h.z > best.z)) best = h;
    }
    return best;
}

function pointTip(key, d) {
    const [side, id] = key.split(':');
    const P = side === 'A' ? d.A : side === 'B' ? d.B : usOf(d);
    const p = P.pts[id], lon = toMode(p.trop, P.date);
    const n = d.contacts.filter(c => (side === 'A' && c.a === id) || (side === 'B' && c.b === id)).length;
    return `<div class="font-semibold">${whoTag(side, d)}'s ${pnamed(id)}${side === 'U' ? ` <span class="text-slate-500">(${usName(P)})</span>` : ''}</div>
        <div class="text-slate-300">${fmtPos(lon)}</div>
        <div class="text-slate-400">latitude ${p.lat >= 0 ? '+' : '−'}${Math.abs(p.lat).toFixed(1)}° · declination ${p.dec >= 0 ? '+' : '−'}${Math.abs(p.dec).toFixed(1)}°</div>
        ${side !== 'U' ? `<div class="text-slate-500">${n} contact${n === 1 ? '' : 's'} with ${esc(side === 'A' ? d.B.name : d.A.name)} · click to isolate</div>` : ''}`;
}

// ---------------------------------------------------------------------------
// Panels

function renderSphereFocus(d) {
    const el = document.getElementById('pair-focus');
    const model = sphereModel(d), focus = focusSets(model);
    if (!pview.focus) {
        el.innerHTML = `<p class="text-xs text-slate-400 leading-relaxed">${PAIR_LORE.sphere} Drag to turn it; click a planet or a contact to isolate it.</p>`;
        return;
    }
    if (focus?.contact) {
        const c = focus.contact, ai = aspInfo(c.type);
        el.innerHTML = `<div class="text-sm">${contactLine(c, d, c.sa, c.sb)} <span class="text-slate-500 text-xs">orb ${fmtOrb(c.orb)}${EXTRA_ASPECTS[c.type] ? ' in declination' : ''}</span></div>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">${contactReading(c, d)}</p>
            <p class="text-[11px] text-slate-500 mt-1">${EXTRA_ASPECTS[c.type] ? `The dashed circles are the two declinations: ${c.type === 'parallel' ? 'the same height on the same side of the celestial equator' : 'the same height on opposite sides of the celestial equator'}.` : `The spokes from the centre show the angle itself: ${ai.name.toLowerCase()} = ${LORE.aspects[c.type].angle}°.`} <button class="text-sky-300 underline decoration-dotted" data-pair-focus="">Clear</button></p>`;
        return;
    }
    const [side, id] = pview.focus.split(':');
    const list = model.contacts.filter((c, i) => focus.threads.has(i));
    el.innerHTML = `<div class="text-sm">${whoTag(side, d)}'s ${pnamed(id)}: ${PAIR_LORE.themes[id]}. <span class="text-xs text-slate-500">${list.length} contact${list.length === 1 ? '' : 's'}</span> <button class="text-xs text-sky-300 underline decoration-dotted" data-pair-focus="">Clear</button></div>
        <ul class="text-xs mt-1 flex flex-col gap-0.5">${list.slice(0, 8).map(c => `<li><button class="hover:text-white text-left" data-pair-focus="${c.sa}:${c.a}|${c.sb}:${c.b}">${contactLine(c, d, c.sa, c.sb)} <span class="text-slate-500">${fmtOrb(c.orb)}</span></button></li>`).join('')}</ul>`;
}

function renderPairControls(d) {
    const U = d && usOf(d);
    document.querySelectorAll('[data-pair-us]').forEach(b => b.classList.toggle('seg-active', b.dataset.pairUs === pview.us));
    document.querySelectorAll('[data-pair-threads]').forEach(b => b.classList.toggle('seg-active', b.dataset.pairThreads === pview.threads));
    for (const k of ['horizons', 'equator', 'latX', 'spin']) document.getElementById(`pair-${k}`).checked = pview[k];
    document.getElementById('pair-flat').textContent = pview.flatTarget ? '◍ Back to the sphere' : '◎ Flatten to a wheel';
    document.getElementById('pair-legend').innerHTML = d ? [['A', d.A.name], ['U', `Us: ${usName(U)}`], ['B', d.B.name]].map(([s, n]) =>
        `<span class="inline-flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-full border-2" style="border-color:${PAIR_COLORS[s]}"></span>${esc(n)}</span>`).join('') : '';
}

const pctWord = p => p >= 0.9 ? 'very high' : p >= 0.7 ? 'high' : p > 0.3 ? 'typical' : p > 0.1 ? 'low' : 'very low';

function profileBar(key, d) {
    const L = PAIR_LORE.profile[key], p = d.profile.pct[key];
    return `<div><div class="flex items-baseline justify-between text-sm"><span style="color:${L.color}" class="font-semibold">${L.name} <span class="text-xs font-normal text-slate-400">${pctWord(p)}</span></span>
        <span class="text-xs text-slate-500">${d.profile.counts[key]} contacts · above ${Math.round(p * 100)} of 100 random pairs</span></div>
        <div class="relative">${bar(p, L.color)}<div class="absolute top-[-2px] bottom-[-2px] left-1/2 w-px bg-slate-400/70" title="A typical pair"></div></div>
        <p class="text-[11px] text-slate-400 mt-0.5">${L.text} <span class="text-slate-500">(${L.types})</span></p></div>`;
}

function renderProfile(d) {
    const p = d.profile.pct, tilt = p.harmony - p.friction;
    const balance = tilt > 0.25 ? 'leans to <b class="text-green-400">ease</b>: much flows naturally, so the work is to stay awake to each other'
        : tilt < -0.25 ? 'leans to <b class="text-red-400">friction</b>: you push each other hard, which can build a lot or wear you down'
        : 'is <b class="text-slate-200">balanced</b> between ease and friction';
    document.getElementById('pair-profile').innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Relationship profile</h3>
        <div class="flex flex-col gap-3">${['harmony', 'friction', 'intensity'].map(k => profileBar(k, d)).join('')}</div>
        <p class="text-sm text-slate-300 mt-3 leading-relaxed">This pair ${balance}. ${p.intensity >= 0.7 ? 'The bond is <b class="text-amber-300">intense</b>: many fusing contacts.' : p.intensity <= 0.3 ? 'Few fusing contacts: more like two orbits that meet than one shared one.' : ''}</p>
        <p class="text-[11px] text-slate-500 mt-2">${PAIR_LORE.profile.note}</p>`;
}

function renderContacts(d) {
    const top = d.contacts.slice(0, 10);
    document.getElementById('pair-contacts').innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Strongest contacts</h3>
        <ul class="flex flex-col gap-2">${top.map(c => {
            const k = `A:${c.a}|B:${c.b}`;
            return `<li><button class="w-full text-left rounded-lg px-2 py-1 ${pview.focus === k ? 'bg-amber-400/10 ring-1 ring-amber-400/70' : 'hover:bg-slate-800/60'}" data-pair-focus="${k}">
                <div class="flex items-center justify-between gap-2 text-sm"><span>${contactLine(c, d)}</span><span class="text-[11px] text-slate-500 whitespace-nowrap">${fmtOrb(c.orb)}</span></div>
                <div class="w-full mt-0.5">${bar(c.strength, aspInfo(c.type).color)}</div>
                <p class="text-[11px] text-slate-400 mt-0.5">${contactReading(c, d)}</p></button></li>`;
        }).join('') || '<li class="text-sm text-slate-500">No contacts within orb.</li>'}</ul>`;
}

function renderMatrix(d) {
    const head = (id, side) => `<th class="asp-head ${BODY[id] ? '' : 'text-[10px]'}" title="${esc(who(side, d))}'s ${pname(id)}">${pglyph(id)}</th>`;
    const cell = (a, b) => {
        const all = d.contacts.filter(c => c.a === a && c.b === b);
        const main = all.find(c => !EXTRA_ASPECTS[c.type]), par = all.find(c => EXTRA_ASPECTS[c.type]);
        const k = `A:${a}|B:${b}`, sel = pview.focus === k;
        const title = all.map(c => `${aspInfo(c.type).name} ${fmtOrb(c.orb)}`).join(', ') || 'no contact';
        if (!all.length) return `<td class="asp-cell" title="${esc(d.A.name)}'s ${pname(a)} – ${esc(d.B.name)}'s ${pname(b)}: no contact"></td>`;
        const c = main || par, ai = aspInfo(c.type);
        return `<td class="asp-cell ${sel ? 'asp-cell-sel' : ''}" data-pair-focus="${k}" style="background:${ai.color}${Math.round(10 + c.tight * 40).toString(16).padStart(2, '0')};position:relative" title="${esc(d.A.name)}'s ${pname(a)} – ${esc(d.B.name)}'s ${pname(b)}: ${title}">
            <span style="color:${ai.color};opacity:${(0.45 + c.tight * 0.55).toFixed(2)}">${ai.symbol}</span><span class="block text-[8px] leading-none text-slate-400">${Math.floor(c.orb)}°</span>
            ${main && par ? `<span class="absolute top-0 right-0.5 text-[8px]" style="color:${aspInfo(par.type).color}">${aspInfo(par.type).symbol}</span>` : ''}</td>`;
    };
    document.getElementById('pair-matrix').innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Contact matrix</h3>
        <div class="flex flex-wrap gap-4 items-start"><table class="border-collapse">
        <tr><th class="text-[10px] font-normal pr-1 text-right"><span style="color:${PAIR_COLORS.A}">${esc(d.A.name)} ↓</span> · <span style="color:${PAIR_COLORS.B}">${esc(d.B.name)} →</span></th>${d.B.ids.map(id => head(id, 'B')).join('')}</tr>
        ${d.A.ids.map(a => `<tr>${head(a, 'A')}${d.B.ids.map(b => cell(a, b)).join('')}</tr>`).join('')}</table>
        <div class="text-xs text-slate-400 max-w-[15rem] leading-relaxed">Every planet of one person against every planet of the other. Glyph = aspect, brighter = tighter, number = orb. A small ∥ or ⋕ in the corner adds a parallel or contraparallel in declination. Click a cell to see that thread on the sphere.
        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2">${[...activeAspectTypes(), 'parallel', 'contraparallel'].map(t => `<span><span style="color:${aspInfo(t).color}">${aspInfo(t).symbol}</span> ${aspInfo(t).name}</span>`).join('')}</div></div></div>`;
}

// Resonance colour: slate blue (low) to gold (high).
// Squared, so that only the stronger moments turn gold.
const resColor = r => `rgb(${[[71, 251], [85, 191], [105, 36]].map(([a, b]) => Math.round(a + (b - a) * r * r)).join(',')})`;
const fmtWhen = date => date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function fmtSpan(ms) {
    const days = ms / DAY_MS;
    return days < 2 ? `${(days * 24).toFixed(1)} hours` : days < 60 ? `${days.toFixed(1)} days` : days < 730 ? `${(days / 30.44).toFixed(1)} months` : `${(days / 365.25).toFixed(1)} years`;
}

function renderSpectrum(d) {
    const el = document.getElementById('pair-spectrum');
    if (!d.spectrum.length) {
        el.innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Harmonic spectrum</h3><p class="text-sm text-slate-400">These two births are less than an hour apart: there is no time between them to divide.</p>`;
        return;
    }
    const W = 1000, L = 64, Rm = 24, top = 34, rowH = 17;
    const X = t => L + t * (W - L - Rm);
    const sel = pview.us === 'moment' ? parseFrac(pview.moment).key : null;
    const yMoon = top + 11 * rowH + 8;
    const H = yMoon + 40;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto block">`;
    for (const m of d.spectrum) if (depthOf(m.f) >= 3) s += `<line x1="${f1(X(m.f.t))}" y1="${top - 8}" x2="${f1(X(m.f.t))}" y2="${yMoon + 10}" stroke="#334155" stroke-dasharray="2 3"/>`;
    for (let n = 2; n <= 12; n++) {
        const y = top + (n - 2) * rowH;
        s += `<line x1="${X(0)}" y1="${y}" x2="${X(1)}" y2="${y}" stroke="#1e293b"/>`;
        s += t2(L - 10, y, `÷${n}`, `fill="#64748b" font-size="11" text-anchor="end" dominant-baseline="central"`);
        for (let k = 1; k < n; k++) {
            const m = d.spectrum.find(x => x.f.key === frac(k, n).key), on = m.f.key === sel;
            s += `<circle cx="${f1(X(m.f.t))}" cy="${y}" r="${(2.6 + depthOf(m.f) * 0.55).toFixed(1)}" fill="${resColor(m.res)}" ${on ? 'stroke="#fff" stroke-width="2"' : 'stroke="#0f172a"'} class="cursor-pointer" data-pair-moment="${m.f.key}"><title>${fmtFrac(m.f)} · ${fmtWhen(m.date)} · resonance ${Math.round(m.res * 100)}%</title></circle>`;
        }
    }
    for (const [t, P, side] of [[0, d.early, d.early === d.A ? 'A' : 'B'], [1, d.late, d.late === d.A ? 'A' : 'B']]) {
        s += `<line x1="${X(t)}" y1="${top - 14}" x2="${X(t)}" y2="${yMoon + 10}" stroke="${PAIR_COLORS[side]}" stroke-width="2"/>`;
        s += t2(X(t), top - 22, `${esc(P.name)} · ${fmtWhen(P.date)}`, `fill="${PAIR_COLORS[side]}" font-size="11" text-anchor="${t ? 'end' : 'start'}"`);
    }
    if (sel) {
        const m = d.spectrum.find(x => x.f.key === sel);
        if (m) s += `<line x1="${f1(X(m.f.t))}" y1="${top - 8}" x2="${f1(X(m.f.t))}" y2="${yMoon + 10}" stroke="#fbbf24" stroke-width="1.5"/>`;
    }
    // The Moon thread: the Moon's nakshatra at each moment, coloured by its ruling planet.
    s += t2(L - 10, yMoon, '☽', `fill="#e2e8f0" font-size="12" text-anchor="end" dominant-baseline="central"`);
    for (const m of d.spectrum) {
        const nk = nakshatraOf(norm360(m.pts.Moon.trop - ayanamsa(m.date)));
        s += `<rect x="${f1(X(m.f.t) - 4)}" y="${yMoon - 5}" width="8" height="10" rx="2" fill="${BODY[nk.ruler].color}" fill-opacity="0.8" class="cursor-pointer" data-pair-moment="${m.f.key}"><title>${fmtFrac(m.f)}: Moon in ${nk.name} (ruled by ${BODY[nk.ruler].name})</title></rect>`;
    }
    s += t2(X(0), yMoon + 24, 'Dot size: how many divisions share the moment · colour: resonance with both charts (blue → gold) · ☽ row: the Moon\'s nakshatra, coloured by its ruler', `fill="#64748b" font-size="11"`);
    s += '</svg>';
    const chords = [...d.spectrum].sort((x, y) => y.res - x.res).slice(0, 5);
    el.innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1"><h3 class="moon-h text-sky-300">Harmonic spectrum: the ${d.spectrum.length} moments between your births</h3>
        <span class="text-xs text-slate-500">gap ${fmtSpan(d.gap)} · <span class="text-amber-300/80">experimental</span></span></div>
        <p class="text-xs text-slate-400 mb-2 leading-relaxed">${PAIR_LORE.spectrum}</p>
        <div class="overflow-x-auto"><div class="min-w-[640px]">${s}</div></div>
        <div class="flex flex-wrap items-center gap-2 mt-2 text-xs"><span class="text-slate-500">Strongest chords:</span>${chords.map(m => `<button class="lib-pill ${m.f.key === sel ? 'ring-1 ring-amber-400' : ''}" data-pair-moment="${m.f.key}">${fmtFrac(m.f)} <span class="text-slate-500">${fmtWhen(m.date)}</span> <span style="color:${resColor(m.res)}">●</span></button>`).join('')}</div>
        <p class="text-[11px] text-slate-500 mt-2">${PAIR_LORE.resonance} ${PAIR_LORE.experimental}</p>`;
}

function renderMoment(d) {
    const el = document.getElementById('pair-moment');
    const U = usOf(d);
    el.classList.toggle('hidden', !U);
    if (!U) return;
    if (U.composite) {
        el.innerHTML = `<h3 class="moon-h text-amber-300 mb-1">Us: the composite chart</h3>
            <p class="text-xs text-slate-400 leading-relaxed">The midpoint of each pair of planets: ${esc(d.A.name)}'s Sun with ${esc(d.B.name)}'s Sun, and so on. No sky ever looked like this, so it has no latitudes, place or time. Pick a moment on the spectrum to see a real sky instead.</p>
            ${momentTable(U, d)}`;
        return;
    }
    const f = U.f, H = PAIR_LORE.harmonics[f.q], echo = f.t > 1;
    const title = f.key === '1/2' ? '½: the Davison chart' : echo ? `Echo +${fmtFrac(echoOf(f))} gap` : `${fmtFrac(f)} of the way`;
    const nk = nakshatraOf(norm360(U.pts.Moon.trop - ayanamsa(U.date)));
    const place = U.place === 'between' ? `${fmtLat(U.loc.lat)}, ${fmtLon(U.loc.lon)} (on the great circle between the birthplaces)`
        : U.place === 'here' ? `your location (${fmtLat(U.loc.lat)}, ${fmtLon(U.loc.lon)})`
        : echo ? 'no place: set your location on the Wheel to get angles for echoes' : 'no place: both charts need a birthplace';
    const youngerAge = echo ? U.date - d.late.date : null;
    el.innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="moon-h text-amber-300">Us: ${title}</h3>
        <span class="text-xs text-slate-500">resonance ${Math.round(U.res * 100)}%</span></div>
        <div class="text-sm text-slate-200 mt-1">${U.date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} <span class="text-slate-500 text-xs">your time zone</span></div>
        <div class="text-xs text-slate-400">${place}</div>
        ${echo ? `<div class="text-xs text-slate-300 mt-1">${esc(d.late.name)} is ${fmtSpan(youngerAge)} old, ${fmtFrac(echoOf(f))} × the gap between you. ${U.date > state.date ? `In ${fmtSpan(U.date - state.date)}.` : `${fmtSpan(state.date - U.date)} ago.`}</div>` : ''}
        <div class="text-xs text-slate-300 mt-2 leading-relaxed">${f.q === 1 ? 'A whole number of gaps: every division meets here.' : `<b>${ordinal(f.q)} harmonic</b>, the ${H.interval}; the ${H.aspect}'s number among the aspects. Shared by ${depthOf(f)} division${depthOf(f) === 1 ? '' : 's'} (${divisionsOf(f).map(n => '÷' + n).join(' ')}).`} ${ASPECT_LORE.harmonics[f.q] || ''}</div>
        <div class="text-xs text-slate-300 mt-1">Moon in <b>${nk.name}</b> <span class="text-slate-500">(${nk.keywords.toLowerCase()})</span></div>
        <div class="text-xs mt-2 grid grid-cols-2 gap-2"><div><span style="color:${PAIR_COLORS.A}">Touches ${esc(d.A.name)}</span> ${bar(Math.min(1, U.sa / 6), PAIR_COLORS.A)}</div><div><span style="color:${PAIR_COLORS.B}">Touches ${esc(d.B.name)}</span> ${bar(Math.min(1, U.sb / 6), PAIR_COLORS.B)}</div></div>
        ${momentTable(U, d)}
        <div class="flex gap-2 mt-2"><button class="bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-xs" data-pair-clock="${U.date.getTime()}">Set the app's clock to this moment</button></div>`;
}

const fmtLat = x => `${Math.abs(x).toFixed(1)}°${x >= 0 ? 'N' : 'S'}`;
const fmtLon = x => `${Math.abs(x).toFixed(1)}°${x >= 0 ? 'E' : 'W'}`;

function momentTable(U, d) {
    const hits = side => contactsBetween(U, side === 'A' ? d.A : d.B, false).slice(0, 4);
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <div class="text-xs grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">${U.ids.map(id => `<span>${pglyph(id)}</span><span class="text-slate-300">${fmtPos(toMode(U.pts[id].trop, U.date))}</span>`).join('')}</div>
        <div class="text-xs flex flex-col gap-1"><div class="text-slate-500 uppercase tracking-wider">Tightest contacts</div>
        ${['A', 'B'].map(side => hits(side).map(c => `<div>${pglyph(c.a)} <span style="color:${aspInfo(c.type).color}">${aspInfo(c.type).symbol}</span> ${whoTag(side, d)}'s ${pglyph(c.b)} <span class="text-slate-500">${fmtOrb(c.orb)}</span></div>`).join('')).join('')}</div></div>`;
}

function renderEchoes(d) {
    const el = document.getElementById('pair-echoes');
    el.classList.toggle('hidden', !d.echoes.length);
    if (!d.echoes.length) return;
    const now = state.date, sel = pview.us === 'moment' ? parseFrac(pview.moment).key : null;
    const shown = d.echoes.filter(m => m.f.q <= 4);
    const W = 640, L = 44, Rm = 14, top = 30, rowH = 17, H = top + 4 * rowH + 18;
    const t0 = 1, t1 = shown[shown.length - 1].f.t;
    const X = t => L + (t - t0) / (t1 - t0) * (W - L - Rm);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto block">`;
    const rowLabel = ['whole', '½', '⅓', '¼'];
    for (let q = 1; q <= 4; q++) {
        const y = top + (q - 1) * rowH;
        s += `<line x1="${X(t0)}" y1="${y}" x2="${X(t1)}" y2="${y}" stroke="#1e293b"/>` + t2(L - 10, y, rowLabel[q - 1], `fill="#64748b" font-size="11" text-anchor="end" dominant-baseline="central"`);
    }
    s += `<line x1="${X(1)}" y1="${top - 12}" x2="${X(1)}" y2="${top + 3 * rowH + 8}" stroke="${PAIR_COLORS[d.late === d.A ? 'A' : 'B']}" stroke-width="2"/>`;
    const tNow = 1 + (now - d.late.date) / d.gap;
    if (tNow > t0 && tNow < t1) s += `<line x1="${f1(X(tNow))}" y1="${top - 12}" x2="${f1(X(tNow))}" y2="${top + 3 * rowH + 8}" stroke="#38bdf8" stroke-width="1.5"/>` + t2(X(tNow), top - 18, 'today', `fill="#38bdf8" font-size="11" text-anchor="middle"`);
    for (const m of shown) {
        const past = m.date < now, on = m.f.key === sel;
        // A moment sits on every row whose fraction divides it: whole gaps are also halves, thirds and quarters.
        for (let q = 1; q <= 4; q++) {
            if (q % m.f.q) continue;
            s += `<circle cx="${f1(X(m.f.t))}" cy="${top + (q - 1) * rowH}" r="${(2.2 + depthOf(m.f) * 0.3).toFixed(1)}" fill="${resColor(m.res)}" fill-opacity="${past ? 0.4 : 1}" ${on ? 'stroke="#fff" stroke-width="2"' : 'stroke="#0f172a"'} class="cursor-pointer" data-pair-moment="${m.f.key}"><title>+${fmtFrac(echoOf(m.f))} gap · ${fmtWhen(m.date)} · resonance ${Math.round(m.res * 100)}%</title></circle>`;
        }
        if (m.f.q === 1) s += t2(X(m.f.t), top + 3 * rowH + 18, `${m.date.getFullYear()}`, `fill="#64748b" font-size="11" text-anchor="middle"`);
    }
    s += '</svg>';
    const upcoming = shown.filter(m => m.date >= now).slice(0, 6), last = shown.filter(m => m.date < now).slice(-2);
    const row = m => `<li><button class="w-full text-left flex items-center gap-2 rounded px-1 ${m.f.key === sel ? 'bg-amber-400/10 ring-1 ring-amber-400/70' : 'hover:bg-slate-800/60'}" data-pair-moment="${m.f.key}">
        <span class="w-10 text-amber-300">+${fmtFrac(echoOf(m.f))}</span><span class="w-28 text-slate-200">${fmtWhen(m.date)}</span>
        <span class="flex-1 text-slate-400">${esc(d.late.name)} aged ${fmtSpan(m.date - d.late.date)}</span><span class="w-16">${bar(m.res, resColor(m.res))}</span></button></li>`;
    el.innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1"><h3 class="moon-h text-sky-300">Echoes after ${esc(d.late.name)}'s birth</h3><span class="text-xs text-amber-300/80">experimental</span></div>
        <p class="text-xs text-slate-400 mb-1 leading-relaxed">${PAIR_LORE.echoes}</p>
        <div class="overflow-x-auto"><div class="min-w-[420px]">${s}</div></div>
        <div class="grid grid-cols-1 gap-2 text-xs mt-1">
        ${last.length ? `<div><div class="text-slate-500 uppercase tracking-wider mb-0.5">Recent</div><ul class="flex flex-col gap-0.5">${last.map(row).join('')}</ul></div>` : ''}
        <div><div class="text-slate-500 uppercase tracking-wider mb-0.5">Coming up</div><ul class="flex flex-col gap-0.5">${upcoming.map(row).join('') || '<li class="text-slate-500">None in the next lifetime window.</li>'}</ul></div></div>
        <p class="text-[11px] text-slate-500 mt-1">Shown: whole gaps, halves, thirds and quarters. Echo skies are seen from ${state.location ? 'your location' : 'the centre of the Earth (set a location on the Wheel for angles)'}.</p>`;
}

// ---------------------------------------------------------------------------
// Ashtakoot (Guna Milan): the eight Vedic tests of the two sidereal Moons, and Mangal Dosha

const VASHYA = ['C', 'C', 'M', 'J', 'V', 'M', 'M', 'K', null, null, 'M', 'J'];
const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12];
const sidOf = (P, id) => norm360(P.pts[id].trop - ayanamsa(P.date));

function moonOf(P) {
    const sid = sidOf(P, 'Moon');
    return { sid, sign: signIndex(sid), nak: Math.floor(sid / NAK_SPAN), pada: Math.floor((sid % NAK_SPAN) / (NAK_SPAN / 4)) + 1 };
}

// Sagittarius is human in its first half and four-footed in its second; Capricorn four-footed, then water.
function vashyaOf(m) {
    const half = m.sid % 30 < 15;
    return VASHYA[m.sign] || (m.sign === 8 ? (half ? 'M' : 'C') : (half ? 'C' : 'J'));
}

function friendship(a, b) {
    const F = PAIR_LORE.ashtakoot.friends[a];
    return F.f.includes(b) ? 'f' : F.e.includes(b) ? 'e' : 'n';
}

function ashtakoot(d) {
    const K = PAIR_LORE.ashtakoot;
    const [G, W] = pview.groom === 'B' ? [d.B, d.A] : [d.A, d.B];
    const g = moonOf(G), w = moonOf(W);
    const kootas = [];
    const add = (key, score, detail) => kootas.push({ key, ...K.kootas[key], score, detail });

    const vg = K.varna[g.sign], vw = K.varna[w.sign];
    add('varna', vg >= vw ? 1 : 0, `${K.varnaNames[vg]} → ${K.varnaNames[vw]}`);
    const sg = vashyaOf(g), sw = vashyaOf(w);
    add('vashya', K.vashyaTable[sg][sw], `${K.vashyaNames[sg]} and ${K.vashyaNames[sw]}`);
    // Count inclusively from one nakshatra to the other, in rounds of nine: the 3rd, 5th and 7th taras are unlucky.
    const tara = (from, to) => (to - from + 27) % 27 % 9 + 1;
    const t1 = tara(w.nak, g.nak), t2 = tara(g.nak, w.nak);
    const lucky = t => ![3, 5, 7].includes(t);
    add('tara', 1.5 * lucky(t1) + 1.5 * lucky(t2), `taras ${t1} and ${t2} (3, 5 and 7 are unlucky)`);
    const [ag, xg] = K.yoni[g.nak], [aw, xw] = K.yoni[w.nak];
    add('yoni', K.yoniTable[ag][aw], `${K.animals[ag]} (${xg === 'm' ? '♂' : '♀'}) and ${K.animals[aw]} (${xw === 'm' ? '♂' : '♀'})`);
    const lg = LORE.zodiac[ZODIAC[g.sign]].ruler, lw = LORE.zodiac[ZODIAC[w.sign]].ruler;
    const rel = [friendship(lg, lw), friendship(lw, lg)].sort().join('');
    add('maitri', lg === lw ? 5 : { ff: 5, fn: 4, nn: 3, ef: 1, en: 0.5, ee: 0 }[rel], lg === lw ? `both ruled by ${lg}` : `${lg} and ${lw}: ${{ f: 'friend', n: 'neutral', e: 'enemy' }[rel[0]]} / ${{ f: 'friend', n: 'neutral', e: 'enemy' }[rel[1]]}`);
    const gg = K.gana[g.nak], gw = K.gana[w.nak], gp = [gg, gw].sort().join('');
    add('gana', gg === gw ? 6 : { DM: 5, DR: 1, MR: 0 }[gp], `${K.ganaNames[gg]} and ${K.ganaNames[gw]}`);
    const n = (w.sign - g.sign + 12) % 12 + 1, back = n === 1 ? 1 : 14 - n;
    add('bhakoot', [2, 12, 5, 9, 6, 8].includes(n) ? 0 : 7, `the Moon signs are ${ordinal(Math.min(n, back))} and ${ordinal(Math.max(n, back))} from each other`);
    add('nadi', K.nadi[g.nak] === K.nadi[w.nak] ? 0 : 8, `${K.nadiNames[K.nadi[g.nak]]} and ${K.nadiNames[K.nadi[w.nak]]}`);

    const total = kootas.reduce((s, k) => s + k.score, 0);
    const doshas = [['nadi', 'Nadi dosha'], ['bhakoot', 'Bhakoot dosha'], ['gana', 'Gana dosha']].filter(([k]) => kootas.find(x => x.key === k).score === 0).map(([, name]) => name);
    return { G, W, g, w, kootas, total, doshas, band: K.bands.find(([min]) => total >= min) };
}

function mangalOf(P) {
    const mars = signIndex(sidOf(P, 'Mars'));
    const from = id => (mars - signIndex(sidOf(P, id)) + 12) % 12 + 1;
    const moon = from('Moon'), lagna = P.pts.ASC ? from('ASC') : null;
    const moonHit = MANGAL_HOUSES.includes(moon), lagnaHit = lagna !== null && MANGAL_HOUSES.includes(lagna);
    return { moon, lagna, moonHit, lagnaHit, has: moonHit || lagnaHit };
}

function renderAshtakoot(d) {
    const K = PAIR_LORE.ashtakoot, a = ashtakoot(d);
    const moonLine = (P, m) => `${whoTag(P === d.A ? 'A' : 'B', d)}: Moon in <b>${LORE.nakshatras[m.nak].name}</b> pada ${m.pada}, ${ZODIAC[m.sign]} <span class="text-slate-500">(${K.ganaNames[K.gana[m.nak]].split(' ')[0]}, ${K.animals[K.yoni[m.nak][0]].toLowerCase()})</span>`;
    const mangal = [d.A, d.B].map(P => ({ P, m: mangalOf(P) }));
    const mangalLine = ({ P, m }) => `${whoTag(P === d.A ? 'A' : 'B', d)}: Mars is ${ordinal(m.moon)} from the Moon${m.moonHit ? ' <b class="text-rose-300">(dosha)</b>' : ''}${m.lagna !== null ? `, ${ordinal(m.lagna)} from the Lagna${m.lagnaHit ? ' <b class="text-rose-300">(dosha)</b>' : ''}` : ', Lagna unknown (no birthplace)'}`;
    const both = mangal.every(x => x.m.has), one = mangal.some(x => x.m.has);
    document.getElementById('pair-ashtakoot').innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="moon-h text-orange-300">Ashtakoot · Guna Milan</h3>
        <div class="flex items-center gap-1 text-[11px] text-slate-500">Varna counted from
        ${['A', 'B'].map(s => `<button class="seg-btn !flex-none px-2 rounded ${pview.groom === s ? 'seg-active' : 'bg-slate-800'}" data-pair-groom="${s}">${esc(who(s, d))}</button>`).join('')}</div></div>
        <div class="flex items-end gap-3 mt-2"><div class="text-4xl font-semibold" style="color:${a.band[2]}">${a.total % 1 ? a.total.toFixed(1) : a.total}<span class="text-lg text-slate-500">/36</span></div>
        <div class="text-sm pb-1"><span style="color:${a.band[2]}">${a.band[1]}</span>${a.doshas.length ? ` · <span class="text-rose-300">${a.doshas.join(', ')}</span>` : ''}</div></div>
        <div class="text-xs text-slate-300 mt-1 flex flex-col gap-0.5"><div>${moonLine(d.A, moonOf(d.A))}</div><div>${moonLine(d.B, moonOf(d.B))}</div></div>
        <div class="flex flex-col gap-1.5 mt-3">${a.kootas.map(k => `<div class="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-2 text-xs">
            <span class="text-slate-200">${k.name}</span><div>${bar(k.score / k.max, k.score === k.max ? '#4ade80' : k.score === 0 ? '#f87171' : '#facc15')}<div class="text-[10px] text-slate-500 mt-0.5">${k.about}: ${k.detail}</div></div>
            <span class="text-right text-slate-300">${k.score}/${k.max}</span></div>`).join('')}</div>
        <div class="mt-3 text-xs text-slate-300 flex flex-col gap-0.5"><div class="text-slate-500 uppercase tracking-wider">Mangal Dosha</div>${mangal.map(mangalLine).map(l => `<div>${l}</div>`).join('')}
        <div class="${both ? 'text-green-300' : one ? 'text-amber-300' : 'text-slate-400'}">${both ? 'Both charts have it: traditionally it is balanced.' : one ? 'Only one chart has it: traditionally a point to weigh.' : 'Neither chart has it.'}</div></div>
        <p class="text-[11px] text-slate-500 mt-2">${K.note} ${K.mangal}</p>`;
}

// ---------------------------------------------------------------------------
// House overlays: one person's planets in the other's houses

function overlayOf(owner, guest) {
    const houses = natal(owner.chart).houses;
    if (!houses) return null;
    const rows = Array.from({ length: 12 }, () => []);
    for (const id of guest.ids) rows[houseOf(toMode(guest.pts[id].trop, guest.date), houses) - 1].push(id);
    return rows;
}

function overlayPanel(owner, guest, d) {
    const so = owner === d.A ? 'A' : 'B', sg = guest === d.A ? 'A' : 'B';
    const rows = overlayOf(owner, guest);
    const title = `<h4 class="text-sm mb-1">${whoTag(sg, d)}'s planets in ${whoTag(so, d)}'s houses</h4>`;
    if (!rows) return `<div>${title}<p class="text-xs text-slate-400">${HOUSE_SYSTEMS[state.houseSystem].name} houses need ${esc(owner.name)}'s birthplace. Moon-sign or Sun-sign houses need none.</p></div>`;
    const key = PAIR_LORE.overlayKeyHouses;
    const notes = [];
    rows.forEach((ids, i) => ids.filter(id => ['Sun', 'Moon', 'Venus', 'Mars', 'Saturn', 'Jupiter', 'ASC'].includes(id) && key.includes(i + 1)).forEach(id => notes.push({ id, h: i + 1 })));
    return `<div>${title}
        <div class="grid grid-cols-[2rem_1fr_auto] gap-x-2 gap-y-0.5 text-xs">${rows.map((ids, i) => `
            <span class="text-slate-500 ${key.includes(i + 1) ? 'text-amber-300/80' : ''}">${ROMAN[i]}</span>
            <span class="text-slate-400 truncate">${LORE.houses[i + 1].keywords.slice(0, 2).join(', ')}</span>
            <span class="text-right whitespace-nowrap">${ids.map(pglyph).join(' ')}</span>`).join('')}</div>
        <ul class="text-xs text-slate-300 mt-2 flex flex-col gap-1">${notes.slice(0, 5).map(n => `<li>${pnamed(n.id)} in the ${ordinal(n.h)}: lights up ${PAIR_LORE.overlays[n.h]}.</li>`).join('') || '<li class="text-slate-500">No personal planet falls in their 1st, 4th, 5th, 7th or 8th house.</li>'}</ul></div>`;
}

function renderOverlays(d) {
    document.getElementById('pair-overlays').innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2 mb-2"><h3 class="moon-h text-sky-300">House overlays</h3>
        <label class="flex items-center gap-1 text-xs text-slate-400">Houses <select id="pair-house" class="asp-input">${Object.entries(HOUSE_SYSTEMS).map(([k, v]) => `<option value="${k}" ${k === state.houseSystem ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${overlayPanel(d.A, d.B, d)}${overlayPanel(d.B, d.A, d)}</div>
        <p class="text-[11px] text-slate-500 mt-2">Highlighted numerals are the houses most read for relationships (1st, 4th, 5th, 7th and 8th). The house system is shared with the Wheel.</p>`;
}

// ---------------------------------------------------------------------------
// Elements and modalities

const BALANCE_WEIGHT = { Sun: 2, Moon: 2, ASC: 2, Mercury: 1, Venus: 1, Mars: 1, Jupiter: 1, Saturn: 1, Uranus: 0.5, Neptune: 0.5, Pluto: 0.5, MC: 0 };

function balanceOf(P) {
    const out = { Fire: 0, Earth: 0, Air: 0, Water: 0, Cardinal: 0, Fixed: 0, Mutable: 0 };
    let total = 0;
    for (const id of P.ids) {
        const z = LORE.zodiac[ZODIAC[signIndex(toMode(P.pts[id].trop, P.date))]], w = BALANCE_WEIGHT[id];
        out[z.element] += w; out[z.modality] += w; total += w;
    }
    for (const k in out) out[k] /= total;
    return out;
}

function balanceInsights(a, b, keys, d) {
    const out = [];
    for (const k of keys) {
        const what = `<b>${k}</b> (${PAIR_LORE.elements[k]})`;
        if (a[k] < 0.12 && b[k] >= 0.25) out.push(`${whoTag('B', d)} brings the ${what} that ${whoTag('A', d)} lacks.`);
        else if (b[k] < 0.12 && a[k] >= 0.25) out.push(`${whoTag('A', d)} brings the ${what} that ${whoTag('B', d)} lacks.`);
        else if (a[k] < 0.12 && b[k] < 0.12) out.push(`Neither of you has much ${what}: a shared blind spot.`);
        else if (a[k] >= 0.35 && b[k] >= 0.35) out.push(`You share a strong ${what}: easy understanding there, but you can also amplify each other.`);
    }
    return out;
}

function renderElements(d) {
    const a = balanceOf(d.A), b = balanceOf(d.B);
    const COLORS = { ...ELEMENT_COLORS, Cardinal: '#f472b6', Fixed: '#38bdf8', Mutable: '#a78bfa' };
    const row = k => `<div class="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-xs"><span style="color:${COLORS[k]}">${k}</span>
        <div class="flex flex-col gap-0.5"><div class="flex items-center gap-1"><div class="flex-1">${bar(a[k] / 0.6, PAIR_COLORS.A)}</div><span class="w-8 text-right text-slate-500">${Math.round(a[k] * 100)}%</span></div>
        <div class="flex items-center gap-1"><div class="flex-1">${bar(b[k] / 0.6, PAIR_COLORS.B)}</div><span class="w-8 text-right text-slate-500">${Math.round(b[k] * 100)}%</span></div></div></div>`;
    const els = ['Fire', 'Earth', 'Air', 'Water'], mods = ['Cardinal', 'Fixed', 'Mutable'];
    const notes = [...balanceInsights(a, b, els, d), ...balanceInsights(a, b, mods, d)];
    document.getElementById('pair-elements').innerHTML = `<h3 class="moon-h text-sky-300 mb-1">Elements &amp; modalities</h3>
        <div class="flex gap-3 text-[11px] mb-2">${['A', 'B'].map(s => `<span style="color:${PAIR_COLORS[s]}">▬ ${esc(who(s, d))}</span>`).join('')}</div>
        <div class="flex flex-col gap-2">${els.map(row).join('')}</div>
        <div class="flex flex-col gap-2 mt-3">${mods.map(row).join('')}</div>
        <ul class="text-xs text-slate-300 mt-3 flex flex-col gap-1">${notes.map(n => `<li>${n}</li>`).join('') || '<li class="text-slate-400">Your balances are broadly alike: no element or modality that one of you lacks and the other supplies.</li>'}</ul>
        <p class="text-[11px] text-slate-500 mt-2">Sun, Moon and Ascendant count double, the outer planets half. Signs follow the selected zodiac.</p>`;
}

// ---------------------------------------------------------------------------
// The age gap in planetary cycles

function cycleIcon(frac, color) {
    const r = 9, a = frac * 2 * Math.PI, x = 11 + r * Math.sin(a), y = 11 - r * Math.cos(a);
    return `<svg width="22" height="22" viewBox="0 0 22 22" class="inline-block align-middle"><circle cx="11" cy="11" r="${r}" fill="none" stroke="#334155" stroke-width="2"/>
        ${frac > 0.995 || frac < 0.005 ? '' : `<path d="M11,${11 - r} A${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${f1(x)},${f1(y)}" fill="none" stroke="${color}" stroke-width="2.5"/>`}<circle cx="11" cy="${11 - r}" r="1.6" fill="#94a3b8"/></svg>`;
}

function renderAgeGap(d) {
    const years = d.gap / (365.25 * DAY_MS);
    const rows = Object.entries(PAIR_LORE.cycles).map(([id, period]) => {
        const la = tropicalLongitude(id, d.A.date), lb = tropicalLongitude(id, d.B.date);
        const sep = Math.abs(wrap180(la - lb));
        const asp = PTOLEMAIC.find(t => Math.abs(sep - LORE.aspects[t].angle) <= 5);
        const cycles = years / period;
        return { id, la, lb, sep, asp, cycles, sameSign: signIndex(toMode(la, d.A.date)) === signIndex(toMode(lb, d.B.date)) };
    });
    const by = id => rows.find(r => r.id === id);
    const notes = [];
    if (by('Jupiter').sameSign) notes.push('<b>Same Jupiter sign</b>: born in the same year of the 12-year growth cycle, so your Jupiter returns (ages 12, 24, 36 …) arrive together in spirit.');
    const sat = by('Saturn');
    if (sat.sameSign) notes.push('<b>Same Saturn generation</b>: you meet the same lessons of duty and maturity, and your Saturn returns fall a short time apart.');
    else if (Math.abs(sat.sep - 180) <= 15) notes.push('<b>Opposite Saturns</b>: each of you hits Saturn\'s milestones while the other is halfway between them.');
    else if (Math.abs(sat.sep - 90) <= 10) notes.push('<b>Square Saturns</b>: your Saturn turning points interleave, a quarter cycle apart.');
    const node = by('NorthNode'), rahu = BODY.NorthNode.name;
    if (node.sep <= 12) notes.push(`<b>Aligned nodes</b>: your ${rahu}s are together (the gap is close to a whole number of 18.6-year nodal cycles): a shared sense of direction.`);
    else if (node.sep >= 168) notes.push(`<b>Reversed nodes</b>: one person's ${rahu} lies on the other's ${BODY.SouthNode.name}. In Jyotish this is read as a strong karmic link: what one is reaching for, the other already knows.`);
    for (const id of ['Uranus', 'Neptune', 'Pluto']) if (by(id).sameSign) notes.push(`Same ${pname(id)} sign: the same ${id === 'Pluto' ? 'generation' : 'generational mood'}.`);
    document.getElementById('pair-agegap').innerHTML = `<h3 class="moon-h text-sky-300 mb-1">The age gap in planetary cycles</h3>
        <p class="text-xs text-slate-400 mb-2">Born ${fmtSpan(d.gap)} apart. The circles show how far each planet travelled between the two births; the angle is where it left the two of you.</p>
        <table class="w-full text-xs"><tr class="text-slate-500 text-left"><th class="font-normal pb-1">Cycle</th><th class="font-normal">Gap</th><th class="font-normal">${esc(d.A.name)}</th><th class="font-normal">${esc(d.B.name)}</th><th class="font-normal text-right">Apart</th></tr>
        ${rows.map(r => `<tr class="border-t border-slate-800"><td class="py-1">${pnamed(r.id)} <span class="text-slate-500">${PAIR_LORE.cycles[r.id] < 2 ? `${PAIR_LORE.cycles[r.id]} y` : `${Math.round(PAIR_LORE.cycles[r.id] * 10) / 10} y`}</span></td>
            <td class="whitespace-nowrap">${cycleIcon(r.cycles % 1, pointInfo(r.id).color)} <span class="text-slate-400">${r.cycles >= 10 ? Math.round(r.cycles) : r.cycles.toFixed(2)}×</span></td>
            <td class="text-slate-300 whitespace-nowrap">${fmtPos(toMode(r.la, d.A.date), false)}</td><td class="text-slate-300 whitespace-nowrap">${fmtPos(toMode(r.lb, d.B.date), false)}</td>
            <td class="text-right whitespace-nowrap">${r.asp ? `<span style="color:${ASPECT_COLORS[r.asp]}">${LORE.aspects[r.asp].symbol}</span> ` : ''}${Math.round(r.sep)}°</td></tr>`).join('')}</table>
        <ul class="text-xs text-slate-300 mt-2 flex flex-col gap-1">${notes.map(n => `<li>${n}</li>`).join('') || '<li class="text-slate-400">No generational alignments: your slow planets sit in different signs.</li>'}</ul>`;
}

// ---------------------------------------------------------------------------
// Shared weather: transits that touch both charts at once

const WEATHER_PLANETS = ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const WEATHER_ORB = 1, ECLIPSE_ORB = 3;
const weatherCache = { key: null, events: null };

function sharedWeather(d) {
    const start = new Date(state.date);
    start.setHours(0, 0, 0, 0);
    const days = pview.weatherDays, end = addDays(start, days);
    const key = `${pairCache.key}|${start.getTime()}|${days}|${state.nodeType}`;
    if (weatherCache.key === key) return weatherCache.events;
    const dav = d.spectrum.find(m => m.f.key === '1/2');
    const targets = [['A', d.A], ['B', d.B], ['U', dav]].filter(([, P]) => P).flatMap(([side, P]) => P.ids.map(id => ({ side, id, trop: P.pts[id].trop })));
    const hitsAt = (lon, orb, types) => {
        const hits = [];
        for (const t of targets) {
            const sep = Math.abs(wrap180(lon - t.trop));
            for (const type of types) {
                const dev = Math.abs(sep - LORE.aspects[type].angle);
                if (dev <= orb) hits.push({ ...t, type, dev });
            }
        }
        return hits;
    };
    const both = hits => hits.some(h => h.side === 'A') && hits.some(h => h.side === 'B');
    const events = [], open = {};
    for (let i = 0; i <= days; i++) {
        const date = addDays(start, i);
        for (const body of WEATHER_PLANETS) {
            const hits = hitsAt(tropicalLongitude(body, date), WEATHER_ORB, PTOLEMAIC);
            if (!both(hits)) { open[body] = null; continue; }
            const score = ['A', 'B'].reduce((s, side) => s + Math.min(...hits.filter(h => h.side === side).map(h => h.dev)), 0);
            let ev = open[body];
            if (!ev) { ev = open[body] = { body, start: date, end: date, peak: date, best: Infinity, hits: new Map() }; events.push(ev); }
            ev.end = date;
            if (score < ev.best) { ev.best = score; ev.peak = date; }
            for (const h of hits) {
                const k = `${h.side}:${h.id}:${h.type}`;
                if (!ev.hits.has(k) || h.dev < ev.hits.get(k).dev) ev.hits.set(k, h);
            }
        }
    }
    // Eclipses on points of both charts (conjunct or opposite the eclipse degree).
    const eclipse = (date, body, kind) => {
        const hits = hitsAt(tropicalLongitude(body, date), ECLIPSE_ORB, ['conjunction', 'opposition']);
        if (both(hits)) events.push({ body: 'eclipse', kind: `${kind} ${body === 'Sun' ? 'solar' : 'lunar'} eclipse`, start: date, end: date, peak: date, hits: new Map(hits.map(h => [`${h.side}:${h.id}:${h.type}`, h])) });
    };
    for (let e = Astronomy.SearchGlobalSolarEclipse(start); e.peak.date < end; e = Astronomy.NextGlobalSolarEclipse(e.peak)) eclipse(e.peak.date, 'Sun', e.kind);
    for (let e = Astronomy.SearchLunarEclipse(start); e.peak.date < end; e = Astronomy.NextLunarEclipse(e.peak)) eclipse(e.peak.date, 'Moon', e.kind);
    events.sort((a, b) => a.start - b.start);
    weatherCache.key = key;
    weatherCache.events = events;
    return events;
}

function renderWeather(d) {
    const events = sharedWeather(d);
    const hitList = (ev, side) => [...ev.hits.values()].filter(h => h.side === side).sort((x, y) => x.dev - y.dev)
        .map(h => `<span style="color:${ASPECT_COLORS[h.type]}">${LORE.aspects[h.type].symbol}</span>${pglyph(h.id)}`).join(' ');
    const range = ev => ev.start.getTime() === ev.end.getTime() ? fmtWhen(ev.start) : `${ev.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${fmtWhen(ev.end)}`;
    const item = ev => {
        const top = side => [...ev.hits.values()].filter(h => h.side === side).sort((x, y) => x.dev - y.dev)[0];
        const ta = top('A'), tb = top('B'), us = hitList(ev, 'U');
        const head = ev.body === 'eclipse' ? `<span class="text-amber-200">🌘 ${cap(ev.kind)}</span>` : `${pnamed(ev.body)}`;
        return `<li class="border-t border-slate-800 pt-1.5">
            <div class="flex flex-wrap items-baseline justify-between gap-x-2 text-sm"><span>${head}</span>
            <button class="text-xs text-sky-300 hover:text-white underline decoration-dotted" data-pair-clock="${ev.peak.getTime()}" title="Set the app's clock to the peak">${range(ev)}</button></div>
            <div class="text-xs mt-0.5">${whoTag('A', d)} ${hitList(ev, 'A')} · ${whoTag('B', d)} ${hitList(ev, 'B')}${us ? ` · <span style="color:${PAIR_COLORS.U}">Davison</span> ${us}` : ''}</div>
            <p class="text-[11px] text-slate-400 mt-0.5">${cap(PAIR_LORE.weather[ev.body])}, touching ${esc(d.A.name)}'s ${PAIR_LORE.themes[ta.id]} and ${esc(d.B.name)}'s ${PAIR_LORE.themes[tb.id]}.</p></li>`;
    };
    document.getElementById('pair-weather').innerHTML = `<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1"><h3 class="moon-h text-sky-300">Shared weather</h3>
        <div class="flex gap-1 bg-slate-800 p-1 rounded-lg seg-sm">${[[365, '1 year'], [1095, '3 years']].map(([n, l]) => `<button class="seg-btn ${pview.weatherDays === n ? 'seg-active' : ''}" data-pair-weather="${n}">${l}</button>`).join('')}</div></div>
        <p class="text-xs text-slate-400 mb-2">Slow-planet transits and eclipses that touch both charts at once, from ${fmtWhen(state.date)} (the app's clock). Orb 1° (eclipses 3°).</p>
        <ul class="flex flex-col gap-1.5 max-h-[30rem] overflow-y-auto pr-1">${events.map(item).join('') || '<li class="text-sm text-slate-500">Nothing touches both charts at once in this window.</li>'}</ul>`;
}

function renderPairLearn() {
    document.getElementById('pair-learn').innerHTML = PAIR_LORE.learn.map(l => `
        <section class="moon-card"><h3 class="font-semibold text-slate-100 mb-1">${l.title}</h3>
        <p class="text-sm text-slate-300 leading-relaxed">${l.text}</p></section>`).join('');
}

function syncPairPickers() {
    const opts = sel => aview.charts.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
    for (const [slot, id] of [['a', 'pair-pick-a'], ['b', 'pair-pick-b']]) {
        const cur = pview[slot];
        document.getElementById(id).innerHTML = (cur ? '' : '<option value="">Choose…</option>') + opts(cur)
            + `<option value="__new">+ Add a birth chart…</option>${cur ? '<option value="__edit">✎ Edit or delete this chart…</option>' : ''}`;
    }
}

function renderPair() {
    if (state.view !== 'pair' || !current.pos) return;
    fillPairSlots();
    syncPairPickers();
    const d = pairData();
    document.getElementById('pair-empty').classList.toggle('hidden', !!d);
    document.getElementById('pair-main').classList.toggle('hidden', !d);
    renderPairControls(d);
    if (!d) {
        document.getElementById('pair-empty').innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Two birth charts</h3>
            <p class="text-sm text-slate-300">The Pair view compares two people. ${aview.charts.length ? `You have ${aview.charts.length === 1 ? 'one saved chart' : 'saved charts'}; pick two different ones above` : 'Add two birth charts with the pickers above'} (the charts are shared with the Aspects view and stored only in this browser).</p>
            <p class="text-xs text-slate-500 mt-2">${PAIR_LORE.learn[7].text}</p>`;
        return;
    }
    if (pview.focus && !sphereModel(d).people.some(([s, P]) => P.ids.some(id => pview.focus.startsWith(`${s}:${id}`)))) pview.focus = null;
    renderSphereFocus(d);
    renderProfile(d);
    renderContacts(d);
    renderAshtakoot(d);
    renderElements(d);
    renderOverlays(d);
    renderSpectrum(d);
    renderMoment(d);
    renderEchoes(d);
    renderWeather(d);
    renderAgeGap(d);
    renderMatrix(d);
    drawSphere();
    kickSphere();
}

function setPairFocus(key) {
    pview.focus = key && key !== pview.focus ? key : null;
    renderPair();
}

function openPairForm(slot, chart) {
    pview.formSlot = slot;
    openChartForm(chart, 'pair-chart-form');
}

function bindPair() {
    loadPair();
    renderPairLearn();
    const root = document.getElementById('pair-view');
    root.addEventListener('click', e => {
        const t = e.target.closest('[data-pair-us],[data-pair-threads],[data-pair-focus],[data-pair-moment],[data-pair-action],[data-pair-clock],[data-pair-groom],[data-pair-weather],[data-asp-action]');
        if (!t) return;
        const d = t.dataset;
        if (d.pairUs) { pview.us = d.pairUs; savePair(); renderPair(); }
        else if (d.pairThreads) { pview.threads = d.pairThreads; pview.focus = null; savePair(); renderPair(); }
        else if (d.pairFocus !== undefined) setPairFocus(d.pairFocus);
        else if (d.pairMoment) { pview.moment = d.pairMoment; pview.us = 'moment'; savePair(); renderPair(); }
        else if (d.pairClock) { setDate(new Date(Number(d.pairClock))); }
        else if (d.pairGroom) { pview.groom = d.pairGroom; savePair(); renderPair(); }
        else if (d.pairWeather) { pview.weatherDays = Number(d.pairWeather); savePair(); renderPair(); }
        else if (d.pairAction === 'swap') { [pview.a, pview.b] = [pview.b, pview.a]; pview.focus = null; savePair(); renderPair(); }
        else if (d.pairAction === 'flat') { pview.flatTarget = pview.flatTarget ? 0 : 1; renderPairControls(pairData()); kickSphere(); }
        else if (d.pairAction === 'zoom-in' || d.pairAction === 'zoom-out') { pview.cam.zoom = Math.max(0.6, Math.min(2.2, pview.cam.zoom * (d.pairAction === 'zoom-in' ? 1.2 : 1 / 1.2))); drawSphere(); }
        else if (d.pairAction === 'reset') { pview.cam = { yaw: 0.6, tilt: 55 * DEG, zoom: 1 }; drawSphere(); }
        else if (d.aspAction === 'chart-save') {
            const c = saveChartForm(d.id, 'pair-chart-form');
            if (!c) return;
            pview[pview.formSlot] = c.id;
            saveAspects(); savePair(); syncAspectControls(); renderPair();
        }
        else if (d.aspAction === 'chart-cancel') { document.getElementById('pair-chart-form').classList.add('hidden'); renderPair(); }
        else if (d.aspAction === 'chart-delete') {
            if (!aview.deleteArmed) { aview.deleteArmed = true; t.textContent = 'Click again to delete'; return; }
            deleteChart(d.id);
            document.getElementById('pair-chart-form').classList.add('hidden');
            if (aview.chartId === d.id) setChart(null); else syncAspectControls();
            if (pview.a === d.id) pview.a = null;
            if (pview.b === d.id) pview.b = null;
            savePair(); renderPair();
        }
    });
    root.addEventListener('change', e => {
        const id = e.target.id;
        if (id === 'pair-pick-a' || id === 'pair-pick-b') {
            const slot = id === 'pair-pick-a' ? 'a' : 'b', v = e.target.value;
            if (v === '__new') { openPairForm(slot, null); syncPairPickers(); return; }
            if (v === '__edit') { openPairForm(slot, pairChart(pview[slot])); syncPairPickers(); return; }
            const other = slot === 'a' ? 'b' : 'a';
            if (v === pview[other]) pview[other] = pview[slot];
            pview[slot] = v;
            pview.focus = null;
            savePair(); renderPair();
        }
        else if (id === 'pair-house') setHouseSystem(e.target.value);
        else if (['pair-horizons', 'pair-equator', 'pair-latX', 'pair-spin'].includes(id)) {
            pview[id.slice(5)] = e.target.checked;
            savePair(); drawSphere(); kickSphere();
        }
    });

    const cv = document.getElementById('pair-sphere'), tip = document.getElementById('pair-tip');
    cv.addEventListener('pointerdown', e => {
        pview.drag = { x: e.clientX, y: e.clientY, moved: 0 };
        cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', e => {
        if (pview.drag) {
            const dx = e.clientX - pview.drag.x, dy = e.clientY - pview.drag.y;
            pview.drag.moved += Math.abs(dx) + Math.abs(dy);
            pview.drag.x = e.clientX; pview.drag.y = e.clientY;
            if (pview.drag.moved > 3) {
                pview.cam.yaw -= dx * 0.008;
                pview.cam.tilt = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pview.cam.tilt + dy * 0.008));
                tip.classList.add('hidden');
                drawSphere();
                return;
            }
        }
        const h = hitAt(e), d = pairData();
        if (!h || !d) { tip.classList.add('hidden'); cv.style.cursor = 'grab'; return; }
        cv.style.cursor = 'pointer';
        tip.innerHTML = pointTip(h.key, d);
        tip.classList.remove('hidden');
        const box = cv.parentElement.getBoundingClientRect();
        tip.style.left = `${Math.min(e.clientX - box.left + 14, box.width - tip.offsetWidth - 4)}px`;
        tip.style.top = `${e.clientY - box.top + 14}px`;
    });
    const end = e => {
        if (!pview.drag) return;
        const click = pview.drag.moved <= 3;
        pview.drag = null;
        if (click) { const h = hitAt(e); setPairFocus(h ? h.key : null); }
        kickSphere();
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', () => { pview.drag = null; kickSphere(); });
    cv.addEventListener('pointerleave', () => tip.classList.add('hidden'));
    window.addEventListener('resize', () => { if (state.view === 'pair') drawSphere(); });
}

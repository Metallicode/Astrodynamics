// Aspects view: the Aspect Lab (one pair taken apart), the pair's cycle, separation over time, the aspect grid,
// patterns, an aspect calendar, and transits to saved birth charts.
// Depends on app.js (state, current, aspect helpers), aspect-lore.js (ASPECT_LORE) and moon.js (f1).
// Points are keyed 'Sun' for the moving sky and 'n:Sun' / 'n:ASC' for a saved chart's fixed points.

const ASP_KEY = 'astrodynamics.aspects.v1';
const aview = {
    a: 'Sun', b: 'Moon', span: 'auto', calDays: 90, calMoon: false,
    charts: [], chartId: null, harmonic: 4, pattern: null, anim: null, deleteArmed: false
};
const POINT_INFO = { ASC: { name: 'Ascendant', symbol: 'AC', color: '#f59e0b' }, MC: { name: 'Midheaven', symbol: 'MC', color: '#22d3ee' } };
// Mean geocentric motion (°/day): orders the pair (faster planet first) and sizes search steps.
const MEAN_MOTION = { Moon: 13.176, Mercury: 0.9856, Venus: 0.9856, Sun: 0.9856, Mars: 0.524, Jupiter: 0.0831, Saturn: 0.0335, Uranus: 0.0117, Neptune: 0.006, Pluto: 0.004 };
const SPEED_ORDER = ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
// Sun, Mercury and Venus never separate far: they oscillate instead of lapping one another.
const BOUND = { 'Mercury|Sun': 28, 'Sun|Venus': 47, 'Mercury|Venus': 76 };
const COMBUST = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
const ASPECT_WEIGHT = { conjunction: 1, opposition: 0.95, square: 0.9, trine: 0.85, sextile: 0.65, quincunx: 0.5, semisquare: 0.4, sesquiquadrate: 0.4, semisextile: 0.3, quintile: 0.3, biquintile: 0.3 };
const SIGN_ASPECT = ['conjunction', 'semisextile', 'sextile', 'square', 'trine', 'quincunx', 'opposition'];

function loadAspects() {
    try {
        const saved = JSON.parse(localStorage.getItem(ASP_KEY) || '{}');
        for (const k of ['a', 'b', 'span', 'calDays', 'calMoon', 'charts', 'chartId', 'harmonic']) if (saved[k] !== undefined) aview[k] = saved[k];
    } catch (e) {
        console.warn('Could not read aspects settings', e);
    }
    if (!activeChart()) aview.chartId = null;
    if (!validKey(aview.a) || !validKey(aview.b) || aview.a === aview.b) { aview.a = 'Sun'; aview.b = 'Moon'; }
}

function saveAspects() {
    const { a, b, span, calDays, calMoon, charts, chartId, harmonic } = aview;
    localStorage.setItem(ASP_KEY, JSON.stringify({ a, b, span, calDays, calMoon, charts, chartId, harmonic }));
}

// ---------------------------------------------------------------------------
// Points: the moving sky and a saved chart's fixed points

const isNatal = k => k.startsWith('n:');
const idOf = k => isNatal(k) ? k.slice(2) : k;
const activeChart = () => aview.charts.find(c => c.id === aview.chartId) || null;

function natalIds(chart) {
    return chart.lat != null ? [...PLANET_IDS, 'ASC', 'MC'] : PLANET_IDS;
}

function validKey(k) {
    if (!isNatal(k)) return PLANET_IDS.includes(k);
    const chart = activeChart();
    return !!chart && natalIds(chart).includes(idOf(k));
}

function info(k) {
    const id = idOf(k), b = BODY[id] || POINT_INFO[id];
    const chart = isNatal(k) && activeChart();
    return { id, natal: isNatal(k), name: b.name, symbol: b.symbol, color: b.color, label: chart ? `${esc(chart.name)}'s ${b.name}` : b.name };
}

function sym(k) {
    const i = info(k);
    return `<span style="color:${i.color}">${i.symbol}</span>${i.natal ? '<sup class="text-[9px] text-slate-500">n</sup>' : ''}`;
}

const natalCache = new Map();
function natal(chart) {
    const key = `${chart.id}|${chart.date}|${chart.lat}|${chart.lon}|${state.mode}|${state.nodeType}|${state.houseSystem}`;
    if (natalCache.has(key)) return natalCache.get(key);
    const date = new Date(chart.date);
    const pos = computePositions(date);
    const loc = chart.lat != null ? { lat: chart.lat, lon: chart.lon } : null;
    const points = {};
    for (const id of PLANET_IDS) points[id] = { trop: pos[id].trop, lon: pos[id].lon, sid: pos[id].sid, speed: 0, natalSpeed: pos[id].speed };
    if (loc) {
        const f = localFrame(date, loc), ayan = ayanamsa(date);
        for (const [id, trop] of [['ASC', f.asc], ['MC', f.mc]]) points[id] = { trop, lon: toMode(trop, date), sid: norm360(trop - ayan), speed: 0 };
    }
    const n = { date, pos, points, houses: computeHouses(date, loc, pos) };
    if (natalCache.size > 20) natalCache.clear();
    natalCache.set(key, n);
    return n;
}

// Tropical longitude of a point at a time (fixed for natal points).
function tropAt(k, date) {
    if (isNatal(k)) return natal(activeChart()).points[idOf(k)].trop;
    return tropicalLongitude(k, date);
}

// Full state of a point at a time: tropical and display longitudes, sidereal, speed.
function pointAt(k, date) {
    if (isNatal(k)) return natal(activeChart()).points[idOf(k)];
    if (date === state.date && current.pos) return current.pos[k];
    const trop = tropicalLongitude(k, date), ayan = ayanamsa(date);
    return { trop, lon: toMode(trop, date), sid: norm360(trop - ayan), speed: speedOf(k, date) };
}

const meanMotion = k => isNatal(k) ? 0 : MEAN_MOTION[k];
// Faster point first: natal points are fixed, so the moving planet always leads.
function ordered(a, b) {
    const rank = k => isNatal(k) ? 99 : SPEED_ORDER.indexOf(k);
    return rank(a) <= rank(b) ? [a, b] : [b, a];
}

function boundLimit(a, b) {
    if (isNatal(a) !== isNatal(b)) return null;
    return BOUND[[idOf(a), idOf(b)].sort().join('|')] || null;
}

// Mean days between conjunctions.
function synodicDays(a, b) {
    const rel = Math.abs(meanMotion(a) - meanMotion(b));
    return rel > 1e-6 ? 360 / rel : null;
}

// The faster point's lead over the slower one, 0–360°.
function phaseAt(a, b, date) {
    const [fast, slow] = ordered(a, b);
    return norm360(tropAt(fast, date) - tropAt(slow, date));
}

// The next (dir = +1) or previous (dir = −1) moment the phase equals any of `targets`, scanning once.
function findPhase(a, b, from, targets, dir, maxDays) {
    const rel = Math.abs(meanMotion(a) - meanMotion(b));
    const step = [a, b].includes('Moon') ? 0.25 : [a, b].some(k => ['Mercury', 'Venus', 'Sun'].includes(k)) ? 1 : rel < 0.01 ? 90 : Math.min(30, Math.max(1, 3 / rel));
    let t0 = from, ph0 = phaseAt(a, b, t0);
    for (let d = step; d <= maxDays; d += step) {
        const t1 = addDays(from, dir * d), ph1 = phaseAt(a, b, t1);
        for (const target of targets) {
            const g0 = wrap180(ph0 - target), g1 = wrap180(ph1 - target);
            if (Math.sign(g1) !== Math.sign(g0) && Math.abs(g0) < 90 && Math.abs(g1) < 90) {
                const [lo, hi] = dir > 0 ? [t0, t1] : [t1, t0];
                const sHi = Math.sign(wrap180(phaseAt(a, b, hi) - target));
                return { time: bisect(lo, hi, x => Math.sign(wrap180(phaseAt(a, b, x) - target)) === sHi), waxing: target < 180 };
            }
        }
        t0 = t1; ph0 = ph1;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Pair analysis

function pairState(a, b, date) {
    const pa = pointAt(a, date), pb = pointAt(b, date);
    const [fast, slow] = ordered(a, b);
    const phase = norm360((fast === a ? pa : pb).trop - (fast === a ? pb : pa).trop);
    const sep = phase > 180 ? 360 - phase : phase;
    const dPhase = (fast === a ? pa : pb).speed - (fast === a ? pb : pa).speed;
    const sepRate = phase > 180 ? -dPhase : dPhase;
    const types = activeAspectTypes();
    let nearest = null;
    for (const type of types) {
        const allowed = aspectOrb(type, idOf(a), idOf(b));
        const orb = Math.abs(sep - LORE.aspects[type].angle);
        if (!nearest || orb < nearest.orb) nearest = { type, orb, allowed };
    }
    const inOrb = nearest.orb <= nearest.allowed;
    const angle = LORE.aspects[nearest.type].angle;
    // Applying when the separation is moving towards the aspect's angle.
    const applying = Math.sign(angle - sep) === Math.sign(sepRate) && nearest.orb > 0.001;
    return { a, b, pa, pb, fast, slow, phase, sep, sepRate, nearest, inOrb, applying, waxing: phase < 180 };
}

// Next and previous exact moments of an aspect type for the pair (both the waxing and the waning angle).
const exactCache = new Map();
function exactTimes(a, b, type, date) {
    const angle = LORE.aspects[type].angle;
    const targets = angle === 0 || angle === 180 ? [angle] : [angle, 360 - angle];
    const bound = boundLimit(a, b);
    if (bound && angle > bound) return { next: null, prev: null, impossible: true };
    const P = synodicDays(a, b);
    const maxDays = Math.min(bound ? 800 : 1.15 * P, 365 * 600);
    const key = `${a}|${b}|${type}|${aview.chartId}`;
    const hit = exactCache.get(key);
    // Reuse while the date stays between the cached previous and next exact moments.
    if (hit && (!hit.prev || hit.prev.time <= date) && (!hit.next || hit.next.time > date) && Math.abs(hit.from - date) < maxDays * DAY_MS / 2) return hit;
    const res = { next: findPhase(a, b, date, targets, 1, maxDays), prev: findPhase(a, b, date, targets, -1, maxDays), from: date };
    if (exactCache.size > 200) exactCache.clear();
    exactCache.set(key, res);
    return res;
}

// The pair's cycle anchors: previous and next conjunction.
function cycleAnchors(a, b, date) {
    return exactTimes(a, b, 'conjunction', date);
}

function signRelation(lonA, lonB) {
    const sa = signIndex(lonA), sb = signIndex(lonB);
    const fwd = (sb - sa + 12) % 12;
    const dist = Math.min(fwd, 12 - fwd);
    const A = LORE.zodiac[ZODIAC[sa]], B = LORE.zodiac[ZODIAC[sb]];
    return { sa, sb, dist, wholeSign: SIGN_ASPECT[dist], A, B, signA: ZODIAC[sa], signB: ZODIAC[sb],
        element: A.element === B.element, modality: A.modality === B.modality, polarity: A.polarity === B.polarity };
}

function strengthOf(ps) {
    if (!ps.inOrb) return null;
    const tight = Math.max(0, 1 - ps.nearest.orb / ps.nearest.allowed);
    const weight = ASPECT_WEIGHT[ps.nearest.type];
    const motion = ps.nearest.orb < 0.1 ? 1 : ps.applying ? 1 : 0.4;
    const bodies = (ASPECT_LORE.natures[idOf(ps.a)].weight + ASPECT_LORE.natures[idOf(ps.b)].weight) / 2;
    const parts = [
        ['Orb tightness', tight, 0.45, `${Math.round(tight * 100)}% of the way from the edge of the orb to exact`],
        ['Aspect', weight, 0.25, `${LORE.aspects[ps.nearest.type].name}: ${weight >= 0.85 ? 'a major hard or flowing aspect' : weight >= 0.6 ? 'a softer major aspect' : 'a weaker or minor aspect'}`],
        ['Motion', motion, 0.15, ps.nearest.orb < 0.1 ? 'exact' : ps.applying ? 'applying, still building' : 'separating, fading'],
        ['Planets', bodies, 0.15, 'luminaries and angles weigh most, then personal, social and outer planets']
    ];
    return { total: parts.reduce((s, p) => s + p[1] * p[2], 0), parts };
}

// ---------------------------------------------------------------------------
// Small drawing helpers

const svgBox = (w, h, extra = '') => `<svg viewBox="0 0 ${w} ${h}" class="w-full h-auto block" ${extra}>`;
const polarXY = (cx, cy, r, lon) => { const p = polar(r, lon); return [cx + p.x, cy + p.y]; };
const t2 = (x, y, s, attrs = '') => `<text x="${f1(x)}" y="${f1(y)}" ${attrs}>${s}</text>`;

function arcPath(cx, cy, r, from, to) {
    // Counter-clockwise on screen, matching increasing longitude on the wheel.
    const span = norm360(to - from);
    const [x0, y0] = polarXY(cx, cy, r, from), [x1, y1] = polarXY(cx, cy, r, to);
    return `M${f1(x0)},${f1(y0)} A${r},${r} 0 ${span > 180 ? 1 : 0} 0 ${f1(x1)},${f1(y1)}`;
}

function signRing(cx, cy, r0, r1) {
    let s = '';
    for (let i = 0; i < 12; i++) {
        const [x0, y0] = polarXY(cx, cy, r0, i * 30), [x1, y1] = polarXY(cx, cy, r1, i * 30);
        s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="#334155" stroke-width="0.8"/>`;
        const [gx, gy] = polarXY(cx, cy, (r0 + r1) / 2, i * 30 + 15);
        const z = LORE.zodiac[ZODIAC[i]];
        s += t2(gx, gy, z.symbol, `fill="${ELEMENT_COLORS[z.element]}" fill-opacity="0.75" font-size="${((r1 - r0) * 0.62).toFixed(1)}" text-anchor="middle" dominant-baseline="central" class="zodiac-glyph"`);
    }
    return s + `<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="#334155"/><circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="#334155"/>`;
}

// Spread glyphs that would overlap: returns a radius offset level per item, in longitude order.
function spread(items, minGap) {
    const sorted = [...items].sort((x, y) => x.lon - y.lon);
    let prev = null, level = 0;
    for (const it of sorted) {
        level = prev !== null && norm360(it.lon - prev) < minGap ? level + 1 : 0;
        it.level = level % 3;
        prev = it.lon;
    }
    return items;
}

function bar(frac, color) {
    return `<div class="asp-bar"><div style="width:${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%;background:${color}"></div></div>`;
}

const when = d => d ? `${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}${Math.abs(d - state.date) < 60 * DAY_MS ? ', ' + fmtTime(d) : ''}` : '—';
const relDays = d => {
    const days = (d - state.date) / DAY_MS;
    const a = Math.abs(days);
    const s = a < 2 ? `${Math.round(a * 24)} h` : a < 120 ? `${Math.round(a)} days` : a < 730 ? `${(a / 30.44).toFixed(0)} months` : `${(a / 365.25).toFixed(1)} years`;
    return days >= 0 ? `in ${s}` : `${s} ago`;
};
const jumpBtn = (d, label) => d ? `<button class="text-sky-300 hover:text-white underline decoration-dotted" data-asp-jump="${d.getTime()}">${label || when(d)}</button>` : '—';

// ---------------------------------------------------------------------------
// The Aspect Lab: dial, gauge and pair pickers

function pairPicker(id, value) {
    const chart = activeChart();
    const opt = k => `<option value="${k}" ${k === value ? 'selected' : ''}>${info(k).symbol} ${info(k).name}${isNatal(k) ? ' (natal)' : ''}</option>`;
    return `<select id="${id}" class="asp-input">
        <optgroup label="Sky at the selected time">${PLANET_IDS.map(opt).join('')}</optgroup>
        ${chart ? `<optgroup label="${esc(chart.name)} (birth chart)">${natalIds(chart).map(i => opt('n:' + i)).join('')}</optgroup>` : ''}
    </select>`;
}

function renderLab(ps) {
    const W = 360, cx = 180, cy = 180, R = 168;
    const types = activeAspectTypes();
    const la = ps.pa.lon, lb = ps.pb.lon;
    let s = svgBox(W, W) + signRing(cx, cy, R - 24, R);
    // Orb bands around A: where B would have to be for each aspect.
    for (const type of types) {
        const ang = LORE.aspects[type].angle, allowed = aspectOrb(type, idOf(ps.a), idOf(ps.b));
        const targets = ang === 0 || ang === 180 ? [ang] : [ang, -ang];
        for (const t of targets) {
            const c = la + t;
            const active = ps.inOrb && ps.nearest.type === type;
            s += `<path d="${arcPath(cx, cy, R - 33, c - allowed, c + allowed)}" stroke="${ASPECT_COLORS[type]}" stroke-width="${active ? 9 : 6}" stroke-opacity="${active ? 0.55 : 0.22}" fill="none"/>`;
            const [tx, ty] = polarXY(cx, cy, R - 46, c);
            s += t2(tx, ty, LORE.aspects[type].symbol, `fill="${ASPECT_COLORS[type]}" fill-opacity="${active ? 1 : 0.6}" font-size="${LORE.aspects[type].minor ? 8 : 10}" text-anchor="middle" dominant-baseline="central"`);
        }
    }
    // The angle between them, drawn along the shorter arc.
    const color = ps.inOrb ? ASPECT_COLORS[ps.nearest.type] : '#64748b';
    const fromLon = norm360(lb - la) <= 180 ? la : lb, toLon = fromLon === la ? lb : la;
    s += `<path d="${arcPath(cx, cy, 62, fromLon, toLon)}" stroke="${color}" stroke-width="2.5" fill="none"/>`;
    for (const [k, lon] of [[ps.a, la], [ps.b, lb]]) {
        const [x0, y0] = polarXY(cx, cy, 62, lon), [x1, y1] = polarXY(cx, cy, R - 58, lon), [gx, gy] = polarXY(cx, cy, R - 72, lon);
        const i = info(k);
        s += `<line x1="${cx}" y1="${cy}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${i.color}" stroke-opacity="0.5" stroke-dasharray="${i.natal ? '3,3' : ''}"/>`;
        s += `<circle cx="${f1(x0)}" cy="${f1(y0)}" r="3" fill="${i.color}"/>`;
        s += `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="12" fill="#0f172a" stroke="${i.color}" stroke-width="1.2"/>` + t2(gx, gy, i.symbol, `fill="${i.color}" font-size="${i.symbol.length > 1 ? 9 : 14}" text-anchor="middle" dominant-baseline="central"`);
    }
    s += t2(cx, cy - 8, fmtOrb(ps.sep).replace("'", '′'), `fill="${color}" font-size="17" font-weight="700" text-anchor="middle"`);
    s += t2(cx, cy + 12, ps.inOrb ? LORE.aspects[ps.nearest.type].name : 'no aspect', `fill="#94a3b8" font-size="10" text-anchor="middle"`);
    s += '</svg>';

    // Gauge: 0–180° with each aspect's orb band and a needle at the separation.
    const GW = 560, GH = 64, gx0 = 14, gx1 = GW - 14, X = v => gx0 + (gx1 - gx0) * v / 180;
    let g = svgBox(GW, GH) + `<line x1="${gx0}" y1="38" x2="${gx1}" y2="38" stroke="#334155" stroke-width="2"/>`;
    for (let v = 0; v <= 180; v += 30) g += `<line x1="${X(v)}" y1="36" x2="${X(v)}" y2="44" stroke="#475569"/>` + t2(X(v), 58, v + '°', 'fill="#64748b" font-size="9" text-anchor="middle"');
    for (const type of types) {
        const ang = LORE.aspects[type].angle, allowed = aspectOrb(type, idOf(ps.a), idOf(ps.b));
        g += `<rect x="${f1(X(Math.max(0, ang - allowed)))}" y="31" width="${f1(X(Math.min(180, ang + allowed)) - X(Math.max(0, ang - allowed)))}" height="14" rx="3" fill="${ASPECT_COLORS[type]}" fill-opacity="${ps.inOrb && ps.nearest.type === type ? 0.5 : 0.18}"/>`;
        g += t2(X(ang), 22, LORE.aspects[type].symbol, `fill="${ASPECT_COLORS[type]}" font-size="${LORE.aspects[type].minor ? 9 : 12}" text-anchor="middle"`);
    }
    const nx = X(ps.sep), dir = Math.sign(ps.sepRate);
    g += `<line x1="${f1(nx)}" y1="27" x2="${f1(nx)}" y2="49" stroke="#fff" stroke-width="2"/>`;
    if (Math.abs(ps.sepRate) > 1e-4) g += `<path d="M${f1(nx + dir * 4)},34 l${dir * 7},4 l${-dir * 7},4 z" fill="#fff"/>`;
    g += '</svg>';

    const rate = Math.abs(ps.sepRate);
    document.getElementById('asp-lab').innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 class="moon-h text-sky-300">△ Aspect Lab</h3>
            <div class="flex items-center gap-1 text-sm">${pairPicker('asp-pick-a', ps.a)}<button class="seg-btn px-2" data-asp-action="swap" title="Swap">⇄</button>${pairPicker('asp-pick-b', ps.b)}</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-[minmax(0,360px),1fr] gap-4 items-center">
            <div class="max-w-[360px] w-full mx-auto">${s}</div>
            <div class="text-sm text-slate-300 flex flex-col gap-2">
                <p>The coloured bands around ${sym(ps.a)} show where ${sym(ps.b)} would have to be to form each aspect. The width of each band is its orb (${state.orbSystem === 'moiety' ? 'traditional moieties' : 'modern orbs'}).</p>
                <p>Right now ${info(ps.b).label} is <b>${fmtOrb(ps.sep)}</b> from ${info(ps.a).label}${ps.inOrb ? `, inside the <b style="color:${ASPECT_COLORS[ps.nearest.type]}">${LORE.aspects[ps.nearest.type].name.toLowerCase()}</b> band` : `, between aspects (nearest: ${LORE.aspects[ps.nearest.type].name.toLowerCase()}, ${fmtOrb(ps.nearest.orb)} away)`}.</p>
                <p class="text-slate-400">The separation is ${rate < 1e-4 ? 'fixed (both points are in the birth chart)' : `${ps.sepRate > 0 ? 'widening' : 'closing'} by ${rate < 0.1 ? (rate * 60).toFixed(1) + '′' : rate.toFixed(2) + '°'} a day`}.</p>
            </div>
        </div>
        <div class="mt-2">${g}</div>`;
}

// ---------------------------------------------------------------------------
// What defines the aspect: the factor breakdown and the reading

function factor(title, body, tone = 'text-slate-400') {
    return `<div class="border-t border-slate-800 pt-2"><div class="text-[11px] uppercase tracking-wider ${tone} mb-1">${title}</div><div class="text-sm text-slate-300 leading-relaxed">${body}</div></div>`;
}

function harmonicIcon(n, color, size = 26) {
    const r = size / 2 - 2, c = size / 2;
    if (n === 1) return `<svg width="${size}" height="${size}" class="inline-block align-middle"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#475569"/><circle cx="${c - r}" cy="${c}" r="2.5" fill="${color}"/></svg>`;
    const pts = Array.from({ length: n }, (_, i) => { const a = Math.PI - i * 2 * Math.PI / n; return `${f1(c + r * Math.cos(a))},${f1(c - r * Math.sin(a))}`; });
    return `<svg width="${size}" height="${size}" class="inline-block align-middle"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#475569"/><polygon points="${pts.join(' ')}" fill="${color}" fill-opacity="0.15" stroke="${color}"/></svg>`;
}

function renderFactors(ps) {
    const el = document.getElementById('asp-factors');
    const A = info(ps.a), B = info(ps.b);
    const type = ps.nearest.type, L = LORE.aspects[type], X = ASPECT_LORE.aspects[type];
    const color = ASPECT_COLORS[type];
    const rel = signRelation(ps.pa.lon, ps.pb.lon);
    const st = strengthOf(ps);
    const ex = exactTimes(ps.a, ps.b, type, state.date);
    const phaseInfo = ASPECT_LORE.phases.find(p => ps.phase >= p.from && ps.phase < p.to);
    const bound = boundLimit(ps.a, ps.b);
    const partile = Math.floor(norm360(ps.pa.lon) % 30) === Math.floor(norm360(ps.pb.lon) % 30);
    const parts = [];

    const header = ps.inOrb
        ? `<span style="color:${A.color}">${A.symbol}</span> <span style="color:${color}">${L.symbol}</span> <span style="color:${B.color}">${B.symbol}</span> ${A.label} ${L.name.toLowerCase()} ${B.label}`
        : `${A.label} and ${B.label}: no aspect`;

    // 1. Geometry
    parts.push(factor('Geometry', `${harmonicIcon(X.harmonic, color)} The ${L.name.toLowerCase()} is ${L.angle}°, the circle divided by ${X.harmonic}${L.angle === 150 ? ' (five twelfths)' : L.angle === 144 ? ' (two fifths)' : L.angle === 135 ? ' (three eighths)' : ''}. ${ASPECT_LORE.harmonics[X.harmonic]}`, 'text-sky-400'));

    // 2. Orb
    parts.push(factor('Orb', `${ps.inOrb ? `${fmtOrb(ps.nearest.orb)} from exact, inside an allowed ${fmtOrb(ps.nearest.allowed)}` : `${fmtOrb(ps.nearest.orb)} from the nearest aspect, outside its ${fmtOrb(ps.nearest.allowed)} orb`}.
        ${ps.nearest.orb < 1 ? ' <b class="text-amber-300">Within 1°: at full strength.</b>' : ''}${partile && ps.inOrb && X.signs === rel.dist ? ' Partile: both in the same degree number.' : ''}
        <div class="mt-1">${bar(ps.inOrb ? 1 - ps.nearest.orb / ps.nearest.allowed : 0, color)}</div>
        <div class="text-xs text-slate-500 mt-1">${state.orbSystem === 'moiety' ? `Moieties: ${A.name} ${ASPECT_LORE.natures[A.id].moiety}° + ${B.name} ${ASPECT_LORE.natures[B.id].moiety}°${PTOLEMAIC.includes(type) ? '' : ', a third for non-Ptolemaic aspects'}.` : `Modern orb for the ${L.name.toLowerCase()}: ${L.orb}°${['Sun', 'Moon'].includes(A.id) || ['Sun', 'Moon'].includes(B.id) ? ' plus the luminary allowance' : ''}.`}</div>`, 'text-amber-400'));

    // 3. Motion
    const faster = info(ps.fast);
    const retro = [ps.a, ps.b].filter(k => !isNatal(k) && pointAt(k, state.date).speed < 0).map(k => info(k).name);
    parts.push(factor('Motion', `${Math.abs(ps.sepRate) < 1e-4 ? 'Both points are fixed in the birth chart.' : `${faster.name} is the faster ${isNatal(ps.slow) ? 'mover' : 'planet'}, so it makes the aspect. ${ps.inOrb ? (ps.nearest.orb < 0.1 ? '<b>Exact now.</b>' : ps.applying ? '<b class="text-amber-300">Applying</b>: building towards exact.' : '<b>Separating</b>: past exact and fading.') : ''}`}
        ${retro.length ? ` <span class="text-rose-300">${retro.join(' and ')} ${retro.length > 1 ? 'are' : 'is'} retrograde</span>, so the aspect can repeat.` : ''}
        <div class="text-xs text-slate-400 mt-1">${ex.impossible ? `${A.name} and ${B.name} never get ${L.angle}° apart.` : `Exact ${L.name.toLowerCase()}: last ${jumpBtn(ex.prev?.time)}${ex.prev ? ` (${relDays(ex.prev.time)})` : ''} · next ${jumpBtn(ex.next?.time)}${ex.next ? ` (${relDays(ex.next.time)})` : ''}`}</div>`, 'text-emerald-400'));

    // 4. Signs
    const same = [rel.element && 'element', rel.modality && 'modality', rel.polarity && 'polarity'].filter(Boolean);
    const dissociate = ps.inOrb && Number.isInteger(X.signs) && X.signs !== rel.dist;
    parts.push(factor('Signs', `${A.name} in ${signSymbol(rel.signA)} ${rel.signA} (${rel.A.element}, ${rel.A.modality}), ${B.name} in ${signSymbol(rel.signB)} ${rel.signB} (${rel.B.element}, ${rel.B.modality}): ${rel.dist} sign${rel.dist === 1 ? '' : 's'} apart, which by whole sign is a <b>${LORE.aspects[rel.wholeSign].name.toLowerCase()}</b>.
        They share ${same.length ? same.join(', ') : 'nothing: no element, modality or polarity in common'}.
        ${dissociate ? `<div class="text-amber-300 mt-1">Out of sign (dissociate): the degrees make a ${L.name.toLowerCase()} but the signs make a ${LORE.aspects[rel.wholeSign].name.toLowerCase()}, so the ${L.name.toLowerCase()}'s usual sign qualities are missing.</div>` : ''}
        <div class="text-xs text-slate-500 mt-1">A ${L.name.toLowerCase()} normally joins: ${X.relation}</div>`, 'text-violet-300'));

    // 5. Phase
    if (Math.abs(ps.sepRate) > 1e-4 && !bound) {
        parts.push(factor('Phase', `${faster.name} is ${Math.round(ps.phase)}° ahead of ${info(ps.slow).name}: <b>${ps.waxing ? 'waxing' : 'waning'}</b>, in the <b>${phaseInfo.name.toLowerCase()}</b> phase (${phaseInfo.key.toLowerCase()}) of their cycle.
            ${X[ps.waxing ? 'waxing' : 'waning'] ? `<div class="text-xs text-slate-400 mt-1">${X[ps.waxing ? 'waxing' : 'waning']}</div>` : ''}`, 'text-pink-300'));
    } else if (bound) {
        parts.push(factor('Phase', `${[A.name, B.name].filter(n => n !== 'Sun').join(' and ')} ${[A.id, B.id].includes('Sun') ? `never strays more than about ${bound}° from the Sun` : `never get more than about ${bound}° apart`}, so the pair has no full waxing–waning cycle.`, 'text-pink-300'));
    }

    // 6. The planets
    const planetLine = (k, p) => {
        const i = info(k), N = ASPECT_LORE.natures[i.id];
        const dig = LORE.planets[i.id] ? dignitiesOf(i.id, signName(p.lon)) : [];
        return `<div>${i.symbol} <b style="color:${i.color}">${i.label}</b>: ${N.word}${dig.length ? `, <span class="text-amber-300">${dig.join(', ').toLowerCase()}</span>` : ''}${!i.natal && p.speed < 0 ? ', <span class="text-rose-300">retrograde</span>' : ''}${LORE.planets[i.id] ? `. <span class="text-slate-400">${LORE.planets[i.id].theme}</span>` : ''}</div>`;
    };
    const chart = activeChart();
    const houseNote = chart && natal(chart).houses && isNatal(ps.a) !== isNatal(ps.b)
        ? (() => { const tk = isNatal(ps.a) ? ps.b : ps.a; return `<div class="text-xs text-slate-400 mt-1">Transiting ${info(tk).name} is in ${esc(chart.name)}'s ${ordinal(houseOf(pointAt(tk, state.date).lon, natal(chart).houses))} house (${houseSystemName()}).</div>`; })() : '';
    parts.push(factor('The planets', planetLine(ps.a, ps.pa) + planetLine(ps.b, ps.pb) + houseNote, 'text-orange-300'));

    // 7. The Vedic view
    parts.push(factor('Vedic view', vedicView(ps), 'text-orange-400'));

    el.innerHTML = `
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h3 class="moon-h text-emerald-300">What defines this aspect</h3>
            <button class="text-xs text-blue-400 hover:text-white" data-type="aspect" data-key="${type}">About the ${L.name.toLowerCase()} →</button>
        </div>
        <div class="text-base font-semibold mb-2">${header}</div>
        ${st ? `<div class="mb-3">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1"><span>Strength (one convention)</span><span class="font-mono text-slate-200">${Math.round(st.total * 100)} / 100</span></div>
            ${bar(st.total, color)}
            <div class="grid grid-cols-[6.5rem,1fr,2.5rem] gap-x-2 gap-y-1 items-center mt-2 text-xs">${st.parts.map(([name, v, w, why]) =>
                `<span class="text-slate-400" title="${why}">${name}</span>${bar(v, color + 'aa')}<span class="text-slate-500 font-mono text-right">×${w}</span>`).join('')}</div>
            <p class="text-[11px] text-slate-500 mt-1">${ASPECT_LORE.strengthNote}</p>
        </div>` : ''}
        <div class="bg-slate-900/60 rounded-lg p-3 mb-3 text-sm text-slate-200 leading-relaxed">${reading(ps, rel, ex, dissociate, phaseInfo)}</div>
        <div class="flex flex-col gap-2">${parts.join('')}</div>`;
}

function vedicView(ps) {
    const A = info(ps.a), B = info(ps.b);
    const grahas = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const sa = signIndex(ps.pa.sid), sb = signIndex(ps.pb.sid);
    const out = [];
    const casts = (from, to, fromSign, toSign) => {
        const house = (toSign - fromSign + 12) % 12 + 1;
        return grahas.includes(from.id) && (DRISHTI[from.id] || [7]).includes(house) ? house : null;
    };
    const ab = casts(A, B, sa, sb), ba = casts(B, A, sb, sa);
    out.push(`Sidereal ${A.name} in ${ZODIAC[sa]}, ${B.name} in ${ZODIAC[sb]}: the ${ordinal((sb - sa + 12) % 12 + 1)} sign from ${A.name}.`);
    if (ab && ba) out.push(`<b>Mutual drishti</b>: ${A.name} casts its ${ordinal(ab)} aspect on ${B.name} and ${B.name} its ${ordinal(ba)} on ${A.name}.`);
    else if (ab) out.push(`<b>${A.name} aspects ${B.name}</b> (${ordinal(ab)}-sign drishti) but not the other way round.`);
    else if (ba) out.push(`<b>${B.name} aspects ${A.name}</b> (${ordinal(ba)}-sign drishti) but not the other way round.`);
    else if ([A, B].every(i => grahas.includes(i.id))) out.push('No drishti between them: neither looks at the other\'s sign.');
    if ([A, B].some(i => ['Uranus', 'Neptune', 'Pluto'].includes(i.id))) out.push('<span class="text-slate-500">Uranus, Neptune and Pluto are not grahas in classical Jyotish, so they cast no drishti.</span>');
    if (sa === sb && A.natal === B.natal) out.push('Same sign: a yuti (conjunction).');
    if (A.natal === B.natal) {
        const sun = [A, B].find(i => i.id === 'Sun'), other = [A, B].find(i => i.id !== 'Sun');
        if (sun && COMBUST[other.id] && ps.sep < COMBUST[other.id]) out.push(`<span class="text-amber-300">${other.name} is combust (asta)</span>: within ${COMBUST[other.id]}° of the Sun, its significations are weakened.`);
        const war = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        if (war.includes(A.id) && war.includes(B.id) && ps.sep < 1) out.push('<span class="text-amber-300">Graha yuddha (planetary war)</span>: two true planets within 1°.');
    }
    return out.join(' ');
}

function reading(ps, rel, ex, dissociate, phaseInfo) {
    const A = info(ps.a), B = info(ps.b);
    const LA = LORE.planets[A.id], LB = LORE.planets[B.id];
    const themeA = LA ? LA.theme : ASPECT_LORE.natures[A.id].word, themeB = LB ? LB.theme : ASPECT_LORE.natures[B.id].word;
    // A planet transiting its own birth position: name the theme once.
    const meet = A.id === B.id ? `${A.name}'s <b>${themeA}</b> meets its own birth position` : null;
    const type = ps.nearest.type, L = LORE.aspects[type], X = ASPECT_LORE.aspects[type];
    const transit = A.natal !== B.natal;
    const who = transit ? `Transiting ${(A.natal ? B : A).name} to ${esc(activeChart().name)}'s ${(A.natal ? A : B).name}` : `${A.name} and ${B.name}`;
    if (!ps.inOrb) {
        const nxt = ex.next ? ` The next exact ${L.name.toLowerCase()} is ${relDays(ex.next.time)}.` : '';
        return `${who}: no aspect right now. They are ${fmtOrb(ps.sep)} apart, ${fmtOrb(ps.nearest.orb)} from a ${L.name.toLowerCase()}${meet ? '' : `, so ${A.name}'s ${themeA} and ${B.name}'s ${themeB} work independently`}.${nxt}`;
    }
    const s = [];
    s.push(`${who}: ${meet || `${A.name}'s <b>${themeA}</b> and ${B.name}'s <b>${themeB}</b> meet`} in a ${PTOLEMAIC.includes(type) || type === 'quincunx' ? '' : 'minor '}<b style="color:${ASPECT_COLORS[type]}">${L.name.toLowerCase()}</b>, which feels ${X.feel}. ${X.practice}`);
    const kinds = [A, B].map(i => ASPECT_LORE.natures[i.id].kind);
    const hard = ['square', 'opposition', 'semisquare', 'sesquiquadrate', 'quincunx'].includes(type);
    const soft = ['trine', 'sextile', 'quintile', 'biquintile'].includes(type);
    const malefic = [A, B].find(i => ASPECT_LORE.natures[i.id].kind === 'malefic');
    const benefic = [A, B].find(i => ASPECT_LORE.natures[i.id].kind === 'benefic');
    if (kinds.every(k => k === 'benefic')) s.push('Two benefics: even a hard angle between them is gentle.');
    else if (hard && malefic && !benefic) s.push(`With ${malefic.name} involved, the friction is felt more sharply: ${malefic.id === 'Saturn' ? 'delays, limits and hard lessons' : 'heat, haste and conflict'}.`);
    else if (hard && benefic) s.push(`${benefic.name}, a benefic, softens the tension.`);
    else if (soft && malefic) s.push(`A soft aspect lets ${malefic.name}'s ${malefic.id === 'Saturn' ? 'discipline and patience' : 'courage and drive'} work constructively.`);
    if (type === 'conjunction') s.push(benefic && !malefic ? 'With a benefic in the mix, the blend is welcome.' : malefic ? `${malefic.name} colours the blend with ${malefic.id === 'Saturn' ? 'seriousness' : 'urgency'}.` : '');
    s.push(ps.nearest.orb < 0.1 ? 'It is exact now, at its peak.' : ps.applying ? `It is applying and builds to exact ${ex.next ? relDays(ex.next.time) : 'soon'}.` : `It is separating: it peaked ${ex.prev ? relDays(ex.prev.time) : 'recently'} and is fading.`);
    if (dissociate) s.push('It is out of sign, so the tradition reads it as weaker or mixed.');
    else if (rel.element && type === 'trine') s.push(`Both are in ${rel.A.element.toLowerCase()} signs, the classic trine.`);
    else if (rel.modality && ['square', 'opposition'].includes(type)) s.push(`Both are in ${rel.A.modality.toLowerCase()} signs, so the ${L.name.toLowerCase()} works the ${rel.A.modality.toLowerCase()} way: ${{ Cardinal: 'by initiating', Fixed: 'by digging in', Mutable: 'by shifting and adapting' }[rel.A.modality]}.`);
    if (!boundLimit(ps.a, ps.b) && Math.abs(ps.sepRate) > 1e-4 && type !== 'conjunction' && type !== 'opposition') s.push(`As a ${ps.waxing ? 'waxing' : 'waning'} aspect it belongs to the ${phaseInfo.name.toLowerCase()} phase: ${phaseInfo.key.toLowerCase()}.`);
    return s.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// The pair's cycle

function renderCycle(ps) {
    const el = document.getElementById('asp-cycle');
    const A = info(ps.a), B = info(ps.b), F = info(ps.fast), S = info(ps.slow);
    const bound = boundLimit(ps.a, ps.b);
    const head = `<h3 class="moon-h text-pink-300 mb-2">The ${A.name}–${B.name} cycle</h3>`;
    if (Math.abs(ps.sepRate) < 1e-4 && isNatal(ps.a) && isNatal(ps.b)) {
        el.innerHTML = head + '<p class="text-sm text-slate-400">Both points belong to the birth chart, so their angle never changes. Pick a planet from the sky to see a cycle.</p>';
        return;
    }
    if (bound) {
        const possible = activeAspectTypes().filter(t => LORE.aspects[t].angle <= bound).map(t => `<span style="color:${ASPECT_COLORS[t]}">${LORE.aspects[t].symbol} ${LORE.aspects[t].name.toLowerCase()}</span>`);
        const ex = exactTimes(ps.a, ps.b, 'conjunction', state.date);
        el.innerHTML = head + `<p class="text-sm text-slate-300 leading-relaxed">Seen from Earth, ${[A, B].some(i => i.id === 'Sun') ? `${[A, B].find(i => i.id !== 'Sun').name} orbits inside Earth's orbit, so it never strays more than about <b>${bound}°</b> from the Sun` : `Mercury and Venus both stay close to the Sun, so they never get more than about <b>${bound}°</b> apart`}.
            The pair swings back and forth instead of running a full waxing–waning cycle, and the only aspects it can ever make are: ${possible.join(', ')}.</p>
            <p class="text-sm text-slate-400 mt-2">Right now they are ${fmtOrb(ps.sep)} apart. Conjunctions: last ${jumpBtn(ex.prev?.time)}, next ${jumpBtn(ex.next?.time)}. The separation graph shows the swing.</p>`;
        return;
    }
    const anchors = cycleAnchors(ps.a, ps.b, state.date);
    const W = 300, cx = 150, cy = 150, R = 118;
    let s = svgBox(W, W);
    ASPECT_LORE.phases.forEach((p, i) => {
        const [x0, y0] = polarXY(cx, cy, R, p.from), [x1, y1] = polarXY(cx, cy, R, p.to);
        const on = ps.phase >= p.from && ps.phase < p.to;
        s += `<path d="M${cx},${cy} L${f1(x0)},${f1(y0)} A${R},${R} 0 0 0 ${f1(x1)},${f1(y1)} Z" fill="${on ? '#ec4899' : i % 2 ? '#1e293b' : '#0f172a'}" fill-opacity="${on ? 0.25 : 0.8}" stroke="#334155"/>`;
        const [lx, ly] = polarXY(cx, cy, R * 0.68, (p.from + p.to) / 2);
        s += t2(lx, ly, p.name.replace(' phase', '').replace('First quarter', '1st qtr').replace('Last quarter', 'Last qtr').replace('Disseminating', 'Dissem.'), `fill="${on ? '#fbcfe8' : '#64748b'}" font-size="9" text-anchor="middle" dominant-baseline="central"`);
    });
    for (const t of activeAspectTypes()) {
        const ang = LORE.aspects[t].angle;
        for (const v of ang === 0 || ang === 180 ? [ang] : [ang, 360 - ang]) {
            const [x0, y0] = polarXY(cx, cy, R, v), [x1, y1] = polarXY(cx, cy, R + 7, v), [gx, gy] = polarXY(cx, cy, R + 16, v);
            s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${ASPECT_COLORS[t]}" stroke-width="1.5"/>` + t2(gx, gy, LORE.aspects[t].symbol, `fill="${ASPECT_COLORS[t]}" font-size="${LORE.aspects[t].minor ? 7 : 10}" text-anchor="middle" dominant-baseline="central"`);
        }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="${S.color}"/>`;
    const [fx, fy] = polarXY(cx, cy, R - 12, ps.phase);
    s += `<line x1="${cx}" y1="${cy}" x2="${f1(fx)}" y2="${f1(fy)}" stroke="${F.color}" stroke-width="1.5"/>`;
    s += `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="10" fill="#0f172a" stroke="${F.color}"/>` + t2(fx, fy, F.symbol, `fill="${F.color}" font-size="${F.symbol.length > 1 ? 8 : 12}" text-anchor="middle" dominant-baseline="central"`);
    const [ox, oy] = polarXY(cx, cy, R - 12, 0);
    s += `<circle cx="${f1(ox)}" cy="${f1(oy)}" r="10" fill="#0f172a" stroke="${S.color}" stroke-dasharray="${S.natal ? '2,2' : ''}"/>` + t2(ox, oy, S.symbol, `fill="${S.color}" font-size="${S.symbol.length > 1 ? 8 : 12}" text-anchor="middle" dominant-baseline="central"`);
    s += '</svg>';

    const phase = ASPECT_LORE.phases.find(p => ps.phase >= p.from && ps.phase < p.to);
    const prev = anchors.prev?.time, next = anchors.next?.time;
    const len = prev && next ? (next - prev) / DAY_MS : synodicDays(ps.a, ps.b);
    const progress = prev && next ? (state.date - prev) / (next - prev) : ps.phase / 360;
    const fmtLen = d => d < 60 ? `${d.toFixed(1)} days` : d < 730 ? `${(d / 30.44).toFixed(1)} months` : `${(d / 365.25).toFixed(1)} years`;
    const seed = prev ? fmtPos(toMode(tropAt(ps.slow, prev), prev)) : null;
    const isLunation = [ps.a, ps.b].sort().join() === 'Moon,Sun';
    const natalName = S.natal ? `${S.name} in ${esc(activeChart().name)}'s chart` : null;
    el.innerHTML = head + `<div class="grid grid-cols-1 sm:grid-cols-[minmax(0,300px),1fr] gap-3 items-center">
        <div class="max-w-[300px] w-full mx-auto">${s}</div>
        <div class="text-sm text-slate-300 flex flex-col gap-2 leading-relaxed">
            <p>${natalName ? `Transiting ${F.name} laps ${natalName} once every <b>${fmtLen(len)}</b>${F.id === S.id ? `: this is the ${F.name} return cycle` : ''}.` : `${F.name} laps ${S.name} once every <b>${fmtLen(len)}</b>${isLunation ? ', which is the lunar month: this cycle <em>is</em> the Moon\'s phases' : ''}.`}
                ${S.name}${S.natal ? '' : ' (slower)'} sits at the left. ${F.name} moves anticlockwise around it, as on the wheel.</p>
            <p><b class="text-pink-300">${phase.name}</b> · ${phase.key}<br><span class="text-slate-400">${phase.text}</span></p>
            <div>${bar(progress, '#ec4899')}<div class="text-xs text-slate-500 mt-1">${Math.round(progress * 100)}% through the cycle · ${F.name} ${Math.round(ps.phase)}° ahead</div></div>
            <p class="text-xs text-slate-400">Cycle began: ${jumpBtn(prev)}${seed ? ` at ${seed}` : ''}${prev ? ` (${relDays(prev)})` : ''}<br>Next conjunction: ${jumpBtn(next)}${next ? ` (${relDays(next)})` : ''}</p>
            ${seed ? '<p class="text-[11px] text-slate-500">Tradition reads the sign and degree of the conjunction, the seed, as the theme of the whole cycle.</p>' : ''}
        </div></div>`;
}

// ---------------------------------------------------------------------------
// Separation over time

const SPANS = { auto: null, '30': 30, '365': 365, '1826': 1826, '10957': 10957 };
const graphCache = { key: null };

function autoSpan(a, b) {
    if (boundLimit(a, b)) return 400;
    const P = synodicDays(a, b);
    return Math.max(30, Math.min(10957, (P || 365) * 1.2));
}

function renderGraph(ps) {
    const el = document.getElementById('asp-graph');
    const both = isNatal(ps.a) && isNatal(ps.b);
    const span = SPANS[aview.span] || autoSpan(ps.a, ps.b);
    const N = 480, dt = span * DAY_MS / N;
    const t0 = Math.floor((state.date.getTime() - span * DAY_MS * 0.35) / dt) * dt;
    const key = `${ps.a}|${ps.b}|${span}|${t0}|${aview.chartId}|${state.orbSystem}|${state.minorAspects}`;
    if (graphCache.key !== key && !both) {
        const pts = [];
        for (let i = 0; i <= N; i++) {
            const t = new Date(t0 + i * dt);
            const ph = phaseAt(ps.a, ps.b, t);
            pts.push({ t, ph, sep: ph > 180 ? 360 - ph : ph });
        }
        // Exact moments: each aspect angle on the way out (waxing) and back (waning).
        const exacts = [];
        for (const type of activeAspectTypes()) {
            const ang = LORE.aspects[type].angle;
            for (const target of ang === 0 || ang === 180 ? [ang] : [ang, 360 - ang]) {
                const g = ph => wrap180(ph - target);
                for (let i = 1; i <= N; i++) {
                    const g0 = g(pts[i - 1].ph), g1 = g(pts[i].ph);
                    if (Math.sign(g0) !== Math.sign(g1) && Math.abs(g0) < 90 && Math.abs(g1) < 90) {
                        const s1 = Math.sign(g1);
                        const time = bisect(pts[i - 1].t, pts[i].t, x => Math.sign(wrap180(phaseAt(ps.a, ps.b, x) - target)) === s1);
                        exacts.push({ time, type, waxing: target < 180 });
                    }
                }
            }
        }
        exacts.sort((x, y) => x.time - y.time);
        Object.assign(graphCache, { key, pts, exacts });
    }
    const spanBtns = Object.keys(SPANS).map(k => `<button class="seg-btn ${aview.span === k ? 'seg-active' : ''}" data-asp-span="${k}">${{ auto: 'Auto', '30': '1M', '365': '1Y', '1826': '5Y', '10957': '30Y' }[k]}</button>`).join('');
    const head = `<div class="flex flex-wrap items-center justify-between gap-2 mb-2"><h3 class="moon-h text-amber-300">Separation over time</h3><div class="flex gap-1 bg-slate-800 p-1 rounded-lg seg-sm">${spanBtns}</div></div>`;
    if (both) { el.innerHTML = head + '<p class="text-sm text-slate-400">Both points are fixed in the birth chart.</p>'; return; }
    const { pts, exacts } = graphCache;
    const W = 620, H = 250, x0 = 34, x1 = W - 8, y0 = 12, y1 = H - 28;
    const tA = pts[0].t.getTime(), tB = pts[N].t.getTime();
    const X = t => x0 + (x1 - x0) * (t - tA) / (tB - tA), Y = v => y1 - (y1 - y0) * v / 180;
    let s = svgBox(W, H);
    for (const type of activeAspectTypes()) {
        const ang = LORE.aspects[type].angle, allowed = aspectOrb(type, idOf(ps.a), idOf(ps.b));
        s += `<rect x="${x0}" y="${f1(Y(Math.min(180, ang + allowed)))}" width="${x1 - x0}" height="${f1(Y(Math.max(0, ang - allowed)) - Y(Math.min(180, ang + allowed)))}" fill="${ASPECT_COLORS[type]}" fill-opacity="0.1"/>`;
        s += `<line x1="${x0}" y1="${f1(Y(ang))}" x2="${x1}" y2="${f1(Y(ang))}" stroke="${ASPECT_COLORS[type]}" stroke-opacity="0.45" stroke-dasharray="${LORE.aspects[type].minor ? '2,3' : ''}"/>`;
        s += t2(x0 - 5, Y(ang), LORE.aspects[type].symbol, `fill="${ASPECT_COLORS[type]}" font-size="${LORE.aspects[type].minor ? 8 : 11}" text-anchor="end" dominant-baseline="central"`);
    }
    // Time axis: months, years or decades depending on the span.
    const unit = span <= 70 ? 'week' : span <= 800 ? 'month' : span <= 4000 ? 'year' : 'decade';
    const d = new Date(tA); d.setHours(0, 0, 0, 0);
    if (unit === 'month' || unit === 'year' || unit === 'decade') d.setDate(1);
    if (unit === 'year' || unit === 'decade') d.setMonth(0);
    if (unit === 'decade') d.setFullYear(Math.ceil(d.getFullYear() / 10) * 10);
    for (let guard = 0; guard < 80 && d.getTime() <= tB; guard++) {
        if (d.getTime() >= tA) {
            const x = X(d.getTime());
            s += `<line x1="${f1(x)}" y1="${y0}" x2="${f1(x)}" y2="${y1}" stroke="#1e293b"/>`;
            const label = unit === 'week' ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : unit === 'month' ? d.toLocaleDateString(undefined, { month: 'short' }) + (d.getMonth() === 0 ? ` ${d.getFullYear()}` : '') : d.getFullYear();
            s += t2(x, H - 12, label, 'fill="#64748b" font-size="9" text-anchor="middle"');
        }
        if (unit === 'week') d.setDate(d.getDate() + 7);
        else if (unit === 'month') d.setMonth(d.getMonth() + (span > 400 ? 3 : 1));
        else if (unit === 'year') d.setFullYear(d.getFullYear() + 1);
        else d.setFullYear(d.getFullYear() + (span > 8000 ? 5 : 2));
    }
    // The curve, coloured where an aspect is in orb.
    let path = '';
    pts.forEach((p, i) => { path += `${i ? 'L' : 'M'}${f1(X(p.t.getTime()))},${f1(Y(p.sep))}`; });
    s += `<path d="${path}" fill="none" stroke="#cbd5e1" stroke-width="1.4"/>`;
    for (const type of activeAspectTypes()) {
        const ang = LORE.aspects[type].angle, allowed = aspectOrb(type, idOf(ps.a), idOf(ps.b));
        let seg = '';
        pts.forEach((p, i) => {
            const on = Math.abs(p.sep - ang) <= allowed;
            if (on) seg += `${seg && Math.abs(pts[i - 1]?.sep - ang) <= allowed ? 'L' : 'M'}${f1(X(p.t.getTime()))},${f1(Y(p.sep))}`;
        });
        if (seg) s += `<path d="${seg}" fill="none" stroke="${ASPECT_COLORS[type]}" stroke-width="3" stroke-linecap="round"/>`;
    }
    for (const e of exacts) s += `<circle cx="${f1(X(e.time.getTime()))}" cy="${f1(Y(LORE.aspects[e.type].angle))}" r="3" fill="#fff" stroke="${ASPECT_COLORS[e.type]}" stroke-width="1.5" class="cursor-pointer" data-asp-jump="${e.time.getTime()}"><title>Exact ${LORE.aspects[e.type].name.toLowerCase()} ${when(e.time)}</title></circle>`;
    const nx = X(state.date.getTime());
    s += `<line x1="${f1(nx)}" y1="${y0}" x2="${f1(nx)}" y2="${y1}" stroke="#38bdf8" stroke-width="1.2"/><circle cx="${f1(nx)}" cy="${f1(Y(ps.sep))}" r="4" fill="#38bdf8"/>`;
    s += `<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#334155"/></svg>`;
    const upcoming = exacts.filter(e => e.time > state.date).slice(0, 6), past = exacts.filter(e => e.time <= state.date).slice(-3);
    const row = e => `<li class="flex justify-between gap-2"><span><span style="color:${ASPECT_COLORS[e.type]}">${LORE.aspects[e.type].symbol}</span> ${e.type === 'conjunction' || e.type === 'opposition' ? '' : e.waxing ? 'waxing ' : 'waning '}${LORE.aspects[e.type].name.toLowerCase()}</span>${jumpBtn(e.time)}</li>`;
    const triple = (() => {
        // Retrograde loops make the same aspect repeat within a few months.
        for (let i = 2; i < exacts.length; i++) if (exacts[i].type === exacts[i - 2].type && exacts[i].type === exacts[i - 1].type && exacts[i].time - exacts[i - 2].time < 300 * DAY_MS) return exacts[i].type;
        return null;
    })();
    el.innerHTML = head + s + `<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-xs mt-2">
        <div><div class="text-slate-500 uppercase tracking-wider mb-1">Coming up</div><ul class="flex flex-col gap-0.5">${upcoming.map(row).join('') || '<li class="text-slate-500">None in this window.</li>'}</ul></div>
        <div><div class="text-slate-500 uppercase tracking-wider mb-1">Recent</div><ul class="flex flex-col gap-0.5">${past.map(row).join('') || '<li class="text-slate-500">None in this window.</li>'}</ul></div></div>
        <p class="text-[11px] text-slate-500 mt-2">The curve is the angle between the two (0–180°). Coloured stretches are in orb, dots mark the exact moments (click to jump).${triple ? ` <span class="text-amber-300">The repeated ${LORE.aspects[triple].name.toLowerCase()} is a retrograde loop: the faster planet backs up and makes the aspect again.</span>` : ''}</p>`;
}

// ---------------------------------------------------------------------------
// Aspect grid

function crossAspect(ka, kb, date) {
    const pa = pointAt(ka, date), pb = pointAt(kb, date);
    return aspectBetween(idOf(ka), pa.trop, pa.speed, idOf(kb), pb.trop, pb.speed);
}

function gridCell(ka, kb, date) {
    const a = crossAspect(ka, kb, date);
    const sel = (aview.a === ka && aview.b === kb) || (aview.a === kb && aview.b === ka);
    if (!a) return `<td class="asp-cell ${sel ? 'asp-cell-sel' : ''}" data-asp-pair="${ka}|${kb}" title="${info(ka).label} – ${info(kb).label}: no aspect"></td>`;
    const L = LORE.aspects[a.type], tight = 1 - a.orb / a.allowed;
    return `<td class="asp-cell ${sel ? 'asp-cell-sel' : ''}" data-asp-pair="${ka}|${kb}" style="background:${ASPECT_COLORS[a.type]}${Math.round(10 + tight * 40).toString(16).padStart(2, '0')}"
        title="${info(ka).label} ${L.name.toLowerCase()} ${info(kb).label}, orb ${fmtOrb(a.orb)} ${a.applying ? 'applying' : 'separating'}">
        <span style="color:${ASPECT_COLORS[a.type]};opacity:${(0.45 + tight * 0.55).toFixed(2)}">${L.symbol}</span><span class="block text-[8px] leading-none text-slate-400">${Math.floor(a.orb)}${a.applying ? 'a' : 's'}</span></td>`;
}

function renderGrid() {
    const el = document.getElementById('asp-grid');
    const date = state.date, chart = activeChart();
    const head = k => `<th class="asp-head" title="${info(k).label}">${sym(k)}</th>`;
    let table;
    if (chart) {
        const cols = natalIds(chart).map(i => 'n:' + i);
        table = `<table class="border-collapse"><tr><th class="text-[10px] text-slate-500 font-normal pr-1 text-right">sky ↓ · chart →</th>${cols.map(head).join('')}</tr>
            ${PLANET_IDS.map(r => `<tr>${head(r)}${cols.map(c => gridCell(r, c, date)).join('')}</tr>`).join('')}</table>`;
    } else {
        table = `<table class="border-collapse">${PLANET_IDS.map((r, i) => `<tr>${PLANET_IDS.slice(0, i).map(c => gridCell(r, c, date)).join('')}${head(r)}</tr>`).join('')}</table>`;
    }
    el.innerHTML = `<h3 class="moon-h text-sky-300 mb-2">Aspect grid${chart ? `: transits to ${esc(chart.name)}` : ''}</h3>
        <div class="flex flex-wrap gap-4 items-start">${table}
        <div class="text-xs text-slate-400 max-w-[14rem] leading-relaxed">Every pair at a glance: glyph = aspect, brighter = tighter, number = orb in whole degrees, <b>a</b>pplying or <b>s</b>eparating. Click a cell to open that pair in the Lab.
        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2">${activeAspectTypes().map(t => `<span><span style="color:${ASPECT_COLORS[t]}">${LORE.aspects[t].symbol}</span> ${LORE.aspects[t].name}</span>`).join('')}</div></div></div>`;
}

// ---------------------------------------------------------------------------
// Patterns

function detectPatterns(keys, date) {
    const P = keys.map(k => ({ k, ...pointAt(k, date) }));
    const has = (i, j, type) => {
        const sep = Math.abs(wrap180(P[i].trop - P[j].trop));
        return Math.abs(sep - LORE.aspects[type].angle) <= aspectOrb(type, idOf(P[i].k), idOf(P[j].k));
    };
    const n = P.length, out = [];
    const add = (kind, idx, extra = '') => out.push({ kind, keys: idx.map(i => P[i].k), extra });
    // Stellium: 3+ in one sign
    const bySign = {};
    P.forEach((p, i) => { if (!['ASC', 'MC'].includes(idOf(p.k))) (bySign[signIndex(p.lon)] ||= []).push(i); });
    for (const [sgn, idx] of Object.entries(bySign)) if (idx.length >= 3) add('stellium', idx, `in ${ZODIAC[sgn]}`);
    const trines = [], crosses = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
        if (has(i, j, 'trine') && has(j, k, 'trine') && has(i, k, 'trine')) {
            const els = new Set([i, j, k].map(x => LORE.zodiac[signName(P[x].lon)].element));
            trines.push([i, j, k]);
            add('grandTrine', [i, j, k], els.size === 1 ? `in ${[...els][0]}` : 'out of element');
        }
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if (!has(i, j, 'opposition')) continue;
        for (let k = 0; k < n; k++) if (k !== i && k !== j && has(i, k, 'square') && has(j, k, 'square')) {
            for (let l = k + 1; l < n; l++) if (l !== i && l !== j && has(k, l, 'opposition') && has(i, l, 'square') && has(j, l, 'square') && k < l) crosses.push([i, j, k, l].sort((x, y) => x - y).join());
        }
    }
    const crossSets = [...new Set(crosses)].map(s => s.split(',').map(Number));
    crossSets.forEach(c => add('grandCross', c, `in ${LORE.zodiac[signName(P[c[0]].lon)].modality} signs`));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        if (has(i, j, 'opposition')) {
            for (let k = 0; k < n; k++) if (k !== i && k !== j && has(i, k, 'square') && has(j, k, 'square') && !crossSets.some(c => [i, j, k].every(x => c.includes(x)))) add('tSquare', [i, j, k], `apex ${info(P[k].k).label}`);
        }
        if (has(i, j, 'sextile')) {
            for (let k = 0; k < n; k++) if (k !== i && k !== j && has(i, k, 'quincunx') && has(j, k, 'quincunx')) add('yod', [i, j, k], `apex ${info(P[k].k).label}`);
        }
    }
    for (const t of trines) for (let d = 0; d < n; d++) {
        if (t.includes(d)) continue;
        for (const c of t) { const others = t.filter(x => x !== c); if (has(c, d, 'opposition') && others.every(o => has(o, d, 'sextile'))) add('kite', [...t, d], `tail ${info(P[d].k).label}`); }
    }
    for (let a = 0; a < n; a++) for (let c = a + 1; c < n; c++) {
        if (!has(a, c, 'opposition')) continue;
        for (let b = a + 1; b < n; b++) for (let d = b + 1; d < n; d++) {
            if ([b, d].some(x => x === a || x === c) || !has(b, d, 'opposition') || b < a) continue;
            if ((has(a, b, 'sextile') && has(c, d, 'sextile') && has(b, c, 'trine') && has(d, a, 'trine')) || (has(a, b, 'trine') && has(c, d, 'trine') && has(b, c, 'sextile') && has(d, a, 'sextile'))) add('mysticRectangle', [a, b, c, d]);
        }
    }
    return out;
}

function renderPatterns() {
    const el = document.getElementById('asp-patterns');
    const chart = activeChart(), date = state.date;
    const sky = detectPatterns(PLANET_IDS, date).map(p => ({ ...p, src: 'sky' }));
    const nat = chart ? detectPatterns(natalIds(chart).map(i => 'n:' + i), date).map(p => ({ ...p, src: 'natal' })) : [];
    const all = [...sky, ...nat];
    const selected = all.find(p => `${p.src}|${p.kind}|${p.keys.join()}` === aview.pattern) || null;

    // Mini wheel: the sky on the outer ring, the chart (if any) on the inner one.
    const W = 340, cx = 170, cy = 170, R = 160;
    const rSky = chart ? R - 44 : R - 50, rNat = R - 86, rLine = chart ? R - 100 : R - 80;
    let s = svgBox(W, W) + signRing(cx, cy, R - 26, R);
    const skyPts = spread(PLANET_IDS.map(k => ({ k, lon: pointAt(k, date).lon })), 7);
    const natPts = chart ? spread(natalIds(chart).map(i => ({ k: 'n:' + i, lon: pointAt('n:' + i, date).lon })), 7) : [];
    // Aspect lines: among the sky planets, or transits to the chart.
    const lines = [];
    if (chart) { for (const t of PLANET_IDS) for (const nk of natPts) { const a = crossAspect(t, nk.k, date); if (a && !LORE.aspects[a.type].minor && a.type !== 'conjunction') lines.push([t, nk.k, a]); } }
    else for (const a of current.aspects) if (a.type !== 'conjunction' && !LORE.aspects[a.type].minor) lines.push([a.a, a.b, a]);
    // With a pattern selected, everything else fades and the pattern is drawn on top.
    for (const [ka, kb, a] of lines) {
        const [x0, y0] = polarXY(cx, cy, rLine, pointAt(ka, date).lon), [x1, y1] = polarXY(cx, cy, rLine, pointAt(kb, date).lon);
        s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${ASPECT_COLORS[a.type]}" stroke-opacity="${selected ? 0.06 : 0.25 + 0.5 * (1 - a.orb / a.allowed)}" stroke-width="${selected ? 0.6 : 1}"/>`;
    }
    if (selected?.kind === 'stellium') {
        const sign = signIndex(pointAt(selected.keys[0], date).lon);
        s += `<path transform="translate(${cx},${cy})" d="${bandPath(R - 26, R, sign * 30, sign * 30 + 30)}" fill="#facc15" fill-opacity="0.3" stroke="#facc15" stroke-width="1.5"/>`;
    } else if (selected) {
        const at = k => polarXY(cx, cy, rLine, pointAt(k, date).lon);
        const order = [...selected.keys].sort((x, y) => pointAt(x, date).lon - pointAt(y, date).lon).map(at);
        s += `<polygon points="${order.map(p => p.map(f1).join(',')).join(' ')}" fill="#facc15" fill-opacity="0.1"/>`;
        // The aspects that make up the pattern, in their own colours.
        const shapeTypes = [...PTOLEMAIC, 'quincunx'];
        for (let i = 0; i < selected.keys.length; i++) for (let j = i + 1; j < selected.keys.length; j++) {
            const ka = selected.keys[i], kb = selected.keys[j];
            const sep = Math.abs(wrap180(pointAt(ka, date).trop - pointAt(kb, date).trop));
            const type = shapeTypes.find(t => t !== 'conjunction' && Math.abs(sep - LORE.aspects[t].angle) <= aspectOrb(t, idOf(ka), idOf(kb)));
            if (!type) continue;
            const [x0, y0] = at(ka), [x1, y1] = at(kb);
            s += `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="${ASPECT_COLORS[type]}" stroke-width="3" stroke-linecap="round"/>`;
        }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${rLine}" fill="none" stroke="#1e293b"/>`;
    const glyph = (it, r) => {
        const i = info(it.k), [x, y] = polarXY(cx, cy, r - it.level * 13, it.lon), [tx, ty] = polarXY(cx, cy, rLine, it.lon);
        const hot = selected?.keys.includes(it.k), faded = selected && !hot;
        return `<g opacity="${faded ? 0.25 : 1}"><line x1="${f1(tx)}" y1="${f1(ty)}" x2="${f1(x)}" y2="${f1(y)}" stroke="${hot ? '#facc15' : i.color}" stroke-opacity="${hot ? 0.8 : 0.3}"/>`
            + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${hot ? 9.5 : 8}" fill="#0f172a" stroke="${hot ? '#facc15' : i.color}" stroke-width="${hot ? 2.5 : 0.8}" stroke-dasharray="${i.natal && !hot ? '2,2' : ''}" class="cursor-pointer" data-asp-point="${it.k}"/>`
            + t2(x, y, i.symbol, `fill="${i.color}" font-size="${i.symbol.length > 1 ? 7 : 10}" text-anchor="middle" dominant-baseline="central" style="pointer-events:none"`) + '</g>';
    };
    for (const it of skyPts) s += glyph(it, rSky);
    for (const it of natPts) s += glyph(it, rNat);
    s += '</svg>';

    const item = p => {
        const P = ASPECT_LORE.patterns[p.kind], id = `${p.src}|${p.kind}|${p.keys.join()}`;
        const on = aview.pattern === id;
        return `<li><button class="w-full text-left rounded px-2 py-1 hover:bg-slate-900/60 ${on ? 'bg-amber-400/10 ring-1 ring-amber-400/70' : ''}" data-asp-pattern="${id}">
            <span class="text-amber-300">${P.icon} ${P.name}</span> <span class="text-slate-400 text-xs">${p.extra}</span><br><span class="text-sm">${p.keys.map(sym).join(' ')}</span>
            ${on ? `<span class="block mt-1 text-xs text-slate-300 leading-relaxed">${P.shape}</span><span class="block mt-1 text-xs text-slate-400 leading-relaxed">${P.meaning}</span><span class="block mt-1 text-[11px] text-slate-500">Click again to clear.</span>` : ''}</button></li>`;
    };
    const listFor = (list, label) => `<div class="text-[11px] uppercase tracking-wider text-slate-500 mt-1">${label}</div>` + (list.length
        ? `<ul class="flex flex-col gap-1 max-h-[22rem] overflow-y-auto">${list.map(item).join('')}</ul>${list.length > 6 ? `<p class="text-[11px] text-slate-500 px-2">${list.length} patterns. Tight clusters of planets make overlapping versions of the same shape.</p>` : ''}`
        : '<p class="text-xs text-slate-500 px-2">No major patterns.</p>');
    el.innerHTML = `<h3 class="moon-h text-amber-300 mb-2">Patterns${chart ? ' · sky outside, chart inside' : ''}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,340px),1fr] gap-3">
            <div class="max-w-[340px] w-full mx-auto">${s}</div>
            <div class="text-sm">
                ${listFor(sky, 'In the sky now')}
                ${chart ? listFor(nat, `In ${esc(chart.name)}'s chart`) : ''}
                ${selected ? '' : `<p class="text-xs text-slate-500 mt-3">${all.length ? 'Click a pattern to highlight it on the wheel. ' : ''}Known patterns: ${Object.values(ASPECT_LORE.patterns).map(p => p.name).join(', ')}.</p>`}
            </div>
        </div>`;
}

// ---------------------------------------------------------------------------
// Aspect calendar

const calCache = { key: null, rows: null };

function calendarRows(start, days) {
    const chart = activeChart();
    const moving = PLANET_IDS.filter(id => id !== 'Moon' || (aview.calMoon && days <= 30));
    const pairs = [];
    if (chart) for (const t of moving) for (const nid of natalIds(chart)) pairs.push([t, 'n:' + nid]);
    else for (let i = 0; i < moving.length; i++) for (let j = i + 1; j < moving.length; j++) pairs.push([moving[i], moving[j]]);
    const stepH = moving.includes('Moon') ? 2 : days <= 30 ? 6 : days <= 90 ? 12 : 24;
    const N = Math.ceil(days * 24 / stepH);
    const times = Array.from({ length: N + 1 }, (_, i) => addHours(start, i * stepH));
    const lon = {};
    for (const k of new Set(pairs.flat())) lon[k] = isNatal(k) ? null : times.map(t => tropicalLongitude(k, t));
    const at = (k, i) => isNatal(k) ? tropAt(k) : lon[k][i];
    const rows = [];
    for (const [a, b] of pairs) {
        const spans = [];
        for (const type of activeAspectTypes()) {
            const ang = LORE.aspects[type].angle, allowed = aspectOrb(type, idOf(a), idOf(b));
            let run = null;
            for (let i = 0; i <= N; i++) {
                const orb = Math.abs(Math.abs(wrap180(at(a, i) - at(b, i))) - ang);
                if (orb <= allowed) {
                    if (!run) run = { type, i0: i, min: orb, iMin: i };
                    if (orb < run.min) { run.min = orb; run.iMin = i; }
                }
                if (run && (orb > allowed || i === N)) {
                    run.i1 = orb > allowed ? i - 1 : i;
                    spans.push(run);
                    run = null;
                }
            }
        }
        if (!spans.length) continue;
        for (const sp of spans) {
            // Refine the closest approach. The signed distance from exact is nearly linear between samples:
            // where it changes sign, interpolate and polish with two secant steps; otherwise take the parabola's vertex.
            const ang = LORE.aspects[sp.type].angle;
            // The separation never goes below 0° or above 180°, so conjunctions and oppositions use the signed angle instead.
            const signed = d => ang === 0 ? wrap180(d) : ang === 180 ? wrap180(d - 180) : Math.abs(wrap180(d)) - ang;
            const g = t => signed(tropAt(a, t) - tropAt(b, t));
            const gi = i => signed(at(a, i) - at(b, i));
            const i = sp.iMin, iL = Math.max(0, i - 1), iR = Math.min(N, i + 1);
            const side = [[iL, i], [i, iR]].find(([p, q]) => p !== q && Math.sign(gi(p)) !== Math.sign(gi(q)));
            let peak;
            if (side) {
                let [ta, tb] = side.map(k => times[k].getTime()), [ga, gb] = side.map(gi);
                for (let it = 0; it < 3; it++) {
                    const tc = tb - gb * (tb - ta) / (gb - ga);
                    if (!isFinite(tc)) break;
                    ta = tb; ga = gb; tb = tc; gb = g(new Date(tc));
                }
                peak = tb;
            } else {
                const [o0, o1, o2] = [iL, i, iR].map(k => Math.abs(gi(k)));
                const den = o0 - 2 * o1 + o2;
                peak = times[i].getTime() + (den > 1e-9 && iL !== i && iR !== i ? 0.5 * (o0 - o2) / den : 0) * stepH * HOUR_MS;
            }
            sp.peak = new Date(peak);
            sp.peakOrb = Math.abs(g(sp.peak));
            sp.start = times[sp.i0]; sp.end = times[sp.i1];
            sp.openStart = sp.i0 === 0; sp.openEnd = sp.i1 === N;
        }
        rows.push({ a, b, spans: spans.sort((x, y) => x.start - y.start) });
    }
    return rows.sort((x, y) => Math.min(...x.spans.map(s => s.peak)) - Math.min(...y.spans.map(s => s.peak)));
}

function renderCalendar() {
    const el = document.getElementById('asp-calendar');
    const days = aview.calDays;
    const start = new Date(state.date); start.setHours(0, 0, 0, 0);
    const key = `${start.getTime()}|${days}|${aview.calMoon}|${aview.chartId}|${state.orbSystem}|${state.minorAspects}|${state.nodeType}`;
    const chart = activeChart();
    const btns = [30, 90, 365].map(d => `<button class="seg-btn ${days === d ? 'seg-active' : ''}" data-asp-cal="${d}">${d === 365 ? '1 year' : d + ' days'}</button>`).join('');
    const head = `<div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 class="moon-h text-emerald-300">Aspect calendar${chart ? `: transits to ${esc(chart.name)}` : ''}</h3>
        <div class="flex items-center gap-3"><label class="atlas-toggle ${days > 30 ? 'opacity-40' : ''}" title="The Moon makes dozens of aspects a month; available for the 30-day view"><input type="checkbox" id="asp-cal-moon" ${aview.calMoon ? 'checked' : ''} ${days > 30 ? 'disabled' : ''}>Include the Moon</label>
        <div class="flex gap-1 bg-slate-800 p-1 rounded-lg seg-sm">${btns}</div></div></div>`;
    if (aview.anim) { if (!calCache.rows) el.innerHTML = head + '<p class="text-sm text-slate-500">Paused while animating.</p>'; return; }
    if (calCache.key !== key) { calCache.rows = calendarRows(start, days); calCache.key = key; }
    const rows = calCache.rows;
    const W = 1000, labW = 92, rowH = 17, top = 22, H = top + rows.length * rowH + 6;
    const t0 = start.getTime(), t1 = addDays(start, days).getTime();
    const X = t => labW + (W - labW - 6) * (t - t0) / (t1 - t0);
    let s = svgBox(W, H);
    const d = new Date(start);
    for (let guard = 0; guard < 60 && d.getTime() <= t1; guard++) {
        const x = X(d.getTime());
        s += `<line x1="${f1(x)}" y1="${top - 4}" x2="${f1(x)}" y2="${H}" stroke="#1e293b"/>` + t2(x + 2, 12, d.toLocaleDateString(undefined, days > 90 ? { month: 'short' } : { day: 'numeric', month: 'short' }), 'fill="#64748b" font-size="10"');
        if (days > 90) { d.setDate(1); d.setMonth(d.getMonth() + 1); } else d.setDate(d.getDate() + (days > 30 ? 7 : 2));
    }
    rows.forEach((r, i) => {
        const y = top + i * rowH;
        const sel = (aview.a === r.a && aview.b === r.b) || (aview.a === r.b && aview.b === r.a);
        if (sel) s += `<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="#0ea5e9" fill-opacity="0.08"/>`;
        s += `<text x="4" y="${y + 12}" font-size="12" class="cursor-pointer" data-asp-pair="${r.a}|${r.b}"><tspan fill="${info(r.a).color}">${info(r.a).symbol}</tspan><tspan fill="#475569"> – </tspan><tspan fill="${info(r.b).color}">${info(r.b).symbol}</tspan>${isNatal(r.b) ? '<tspan fill="#64748b" font-size="8"> n</tspan>' : ''}</text>`;
        for (const sp of r.spans) {
            const c = ASPECT_COLORS[sp.type], L = LORE.aspects[sp.type];
            const xa = X(sp.start.getTime()), xb = Math.max(X(sp.end.getTime()), xa + 2);
            const exact = sp.peakOrb < 0.05;
            // A span cut by the window edge with its closest point on that edge peaks outside the window: no marker or jump.
            const edgePeak = (sp.openStart && sp.iMin === sp.i0) || (sp.openEnd && sp.iMin === sp.i1);
            s += `<g class="cursor-pointer" data-asp-pair="${r.a}|${r.b}" ${edgePeak ? '' : `data-asp-jump="${sp.peak.getTime()}"`}><title>${info(r.a).label} ${L.name.toLowerCase()} ${info(r.b).label}\nIn orb ${when(sp.start)}${sp.openStart ? ' (or earlier)' : ''} → ${when(sp.end)}${sp.openEnd ? ' (or later)' : ''}\n${edgePeak ? 'Peaks outside this window' : `${exact ? 'Exact' : `Closest (orb ${fmtOrb(sp.peakOrb)})`} ${when(sp.peak)}`}</title>
                <rect x="${f1(xa)}" y="${y + 3}" width="${f1(xb - xa)}" height="${rowH - 6}" rx="3" fill="${c}" fill-opacity="0.28" stroke="${c}" stroke-opacity="0.6" stroke-width="0.6"/>`;
            if (!edgePeak && sp.peak >= start && sp.peak.getTime() <= t1) {
                const px = X(sp.peak.getTime());
                s += exact ? `<line x1="${f1(px)}" y1="${y + 1}" x2="${f1(px)}" y2="${y + rowH - 1}" stroke="${c}" stroke-width="2"/>` : `<circle cx="${f1(px)}" cy="${y + rowH / 2}" r="2" fill="none" stroke="${c}"/>`;
                if (xb - xa > 22) s += t2(px + 3, y + 12, L.symbol, `fill="${c}" font-size="10"`);
            }
            s += '</g>';
        }
    });
    const nx = X(state.date.getTime());
    s += `<line x1="${f1(nx)}" y1="${top - 4}" x2="${f1(nx)}" y2="${H}" stroke="#38bdf8" stroke-width="1.2"/></svg>`;
    el.innerHTML = head + (rows.length ? `<div class="max-h-[34rem] overflow-y-auto">${s}</div>` : '<p class="text-sm text-slate-500">No aspects in this window.</p>')
        + `<p class="text-[11px] text-slate-500 mt-2">Each bar is the time an aspect spends in orb. A solid tick marks the exact moment, a ring a near miss (a station turned it back first). Click a bar to open the pair and jump to its peak. Retrograde planets often make the same aspect two or three times.</p>`;
}

// ---------------------------------------------------------------------------
// Harmonics explorer and Learn

function renderHarmonics() {
    const n = aview.harmonic;
    const W = 240, c = 120, R = 100;
    let s = svgBox(W, W) + `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#334155"/>`;
    const pts = Array.from({ length: n }, (_, i) => polarXY(c, c, R, i * 360 / n));
    // Connect every point to every other: each chord is one of the harmonic's aspects.
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const steps = Math.min(j - i, n - (j - i));
        const ang = steps * 360 / n;
        const t = [...ASPECT_TYPES, ...MINOR_ASPECTS].find(k => Math.abs(LORE.aspects[k].angle - ang) < 0.01);
        s += `<line x1="${f1(pts[i][0])}" y1="${f1(pts[i][1])}" x2="${f1(pts[j][0])}" y2="${f1(pts[j][1])}" stroke="${t ? ASPECT_COLORS[t] : '#475569'}" stroke-opacity="${steps === 1 ? 0.9 : 0.35}" stroke-width="${steps === 1 ? 1.6 : 0.8}"/>`;
    }
    pts.forEach(([x, y], i) => { s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i ? 3.5 : 5}" fill="${i ? '#94a3b8' : '#fcd34d'}"/>`; });
    s += '</svg>';
    const angles = [];
    for (let k = 1; k <= Math.floor(n / 2); k++) {
        const ang = k * 360 / n;
        const t = [...ASPECT_TYPES, ...MINOR_ASPECTS].find(x => Math.abs(LORE.aspects[x].angle - ang) < 0.01);
        angles.push(`<li><span class="font-mono">${Number.isInteger(ang) ? ang : ang.toFixed(1)}°</span> ${t ? `<button class="hover:underline" style="color:${ASPECT_COLORS[t]}" data-type="aspect" data-key="${t}">${LORE.aspects[t].symbol} ${LORE.aspects[t].name}</button>` : '<span class="text-slate-500">not a standard aspect</span>'}</li>`);
    }
    if (n === 1) angles.push(`<li><span class="font-mono">0°</span> <button class="hover:underline" style="color:${ASPECT_COLORS.conjunction}" data-type="aspect" data-key="conjunction">☌ Conjunction</button></li>`);
    document.getElementById('asp-harmonics').innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 class="moon-h text-violet-300">Dividing the circle</h3>
            <div class="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-lg seg-sm">${Array.from({ length: 12 }, (_, i) => `<button class="seg-btn ${n === i + 1 ? 'seg-active' : ''}" data-asp-harmonic="${i + 1}">÷${i + 1}</button>`).join('')}</div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-[240px,1fr] gap-4 items-center">
            <div class="max-w-[240px] w-full mx-auto">${s}</div>
            <div class="text-sm text-slate-300 leading-relaxed">
                <p class="text-base"><b>Harmonic ${n}</b>: ${ASPECT_LORE.harmonics[n]}</p>
                <p class="text-slate-400 mt-2">Divide the circle into ${n} equal part${n > 1 ? 's' : ''}: every chord between two points is an aspect of this family.</p>
                <ul class="mt-2 flex flex-col gap-0.5">${angles.join('')}</ul>
                <p class="text-xs text-slate-500 mt-3">The major aspects come from dividing by 1, 2, 3, 4 and 6. The rest of the family is the minor and harmonic aspects.</p>
            </div>
        </div>`;
}

function renderLearn() {
    document.getElementById('asp-learn').innerHTML = ASPECT_LORE.learn.map(l => `
        <section class="moon-card"><div class="text-[11px] uppercase tracking-wider text-slate-500">${l.tag}</div>
        <h3 class="font-semibold text-slate-100 mt-0.5 mb-1">${l.title}</h3>
        <p class="text-sm text-slate-300 leading-relaxed">${l.text}</p></section>`).join('')
        + `<section class="moon-card lg:col-span-2"><h3 class="moon-h text-slate-400 mb-2">All aspects</h3><div class="flex flex-wrap gap-2">${[...ASPECT_TYPES, ...MINOR_ASPECTS].sort((x, y) => LORE.aspects[x].angle - LORE.aspects[y].angle).map(t => `<button class="lib-pill" data-type="aspect" data-key="${t}">${harmonicIcon(ASPECT_LORE.aspects[t].harmonic, ASPECT_COLORS[t], 18)} <span style="color:${ASPECT_COLORS[t]}">${LORE.aspects[t].symbol}</span> ${LORE.aspects[t].name} <span class="text-slate-500">${LORE.aspects[t].angle}°</span></button>`).join('')}</div>
        <p class="text-xs text-slate-500 mt-2">${ASPECT_LORE.orbNotes.modern}</p><p class="text-xs text-slate-500 mt-1">${ASPECT_LORE.orbNotes.moiety}</p></section>`;
}

// ---------------------------------------------------------------------------
// Charts: the "compare with" picker and the add/edit form

function syncAspectControls() {
    document.querySelectorAll('[data-asp-orbs]').forEach(b => b.classList.toggle('seg-active', b.dataset.aspOrbs === state.orbSystem));
    document.getElementById('asp-minor').checked = state.minorAspects;
    document.querySelectorAll('[data-asp-anim]').forEach(b => {
        const on = aview.anim?.kind === b.dataset.aspAnim;
        b.classList.toggle('seg-active', on);
        b.textContent = `${on ? '❚❚' : '▶'} ${b.dataset.label}`;
    });
    const chart = activeChart();
    document.getElementById('asp-chart').innerHTML = `<option value="">The sky only</option>`
        + aview.charts.map(c => `<option value="${c.id}" ${c.id === aview.chartId ? 'selected' : ''}>${esc(c.name)}'s chart</option>`).join('')
        + `<option value="__new">+ Add a birth chart…</option>${chart ? '<option value="__edit">✎ Edit or delete this chart…</option>' : ''}`;
}

function tzOffsetFor(localValue) {
    // The browser's own UTC offset at that local time, as a starting guess.
    const d = localValue ? new Date(localValue) : new Date();
    return -d.getTimezoneOffset() / 60;
}

function openChartForm(chart) {
    const el = document.getElementById('asp-chart-form');
    aview.deleteArmed = false;
    let local = '', offset = tzOffsetFor(), lat = state.location?.lat ?? '', lon = state.location?.lon ?? '';
    if (chart) {
        offset = chart.offset;
        const shifted = new Date(new Date(chart.date).getTime() + chart.offset * HOUR_MS);
        local = shifted.toISOString().slice(0, 16);
        lat = chart.lat ?? ''; lon = chart.lon ?? '';
    } else {
        local = toLocalInputValue(state.date);
    }
    el.innerHTML = `<div class="flex flex-wrap items-end gap-3 text-sm">
        <h3 class="moon-h text-sky-300 w-full">${chart ? 'Edit chart' : 'Add a birth chart'}</h3>
        <label class="flex flex-col gap-1 text-xs text-slate-400">Name<input id="cf-name" class="asp-input" value="${esc(chart?.name || '')}" placeholder="e.g. Me"></label>
        <label class="flex flex-col gap-1 text-xs text-slate-400">Local date &amp; time of birth<input id="cf-date" type="datetime-local" class="asp-input" value="${local}"></label>
        <label class="flex flex-col gap-1 text-xs text-slate-400" title="Hours ahead of UTC at the birthplace on that date, including daylight saving (e.g. 1 for London in summer, −5 for New York in winter)">UTC offset (h)<input id="cf-offset" type="number" step="0.25" class="asp-input w-20" value="${offset}"></label>
        <label class="flex flex-col gap-1 text-xs text-slate-400">Latitude<input id="cf-lat" type="number" step="any" class="asp-input w-24" value="${lat}" placeholder="optional"></label>
        <label class="flex flex-col gap-1 text-xs text-slate-400">Longitude<input id="cf-lon" type="number" step="any" class="asp-input w-24" value="${lon}" placeholder="optional"></label>
        <div class="flex gap-2">
            <button class="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1" data-asp-action="chart-save" data-id="${chart?.id || ''}">Save</button>
            <button class="bg-slate-700 hover:bg-slate-600 rounded px-3 py-1" data-asp-action="chart-cancel">Cancel</button>
            ${chart ? `<button class="bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded px-3 py-1" data-asp-action="chart-delete" data-id="${chart.id}">Delete</button>` : ''}
        </div>
        <p id="cf-msg" class="text-xs text-slate-500 w-full">Without a birthplace the chart has planets only (no Ascendant, Midheaven or houses). The chart is stored only in this browser.</p>
    </div>`;
    el.classList.remove('hidden');
    el.querySelector('#cf-date').addEventListener('change', e => { if (!chart) el.querySelector('#cf-offset').value = tzOffsetFor(e.target.value); });
}

function saveChartForm(id) {
    const el = document.getElementById('asp-chart-form');
    const v = sel => el.querySelector(sel).value.trim();
    const msg = t => { el.querySelector('#cf-msg').textContent = t; el.querySelector('#cf-msg').className = 'text-xs text-rose-400 w-full'; };
    const name = v('#cf-name') || 'Chart', local = v('#cf-date'), offset = parseFloat(v('#cf-offset'));
    if (!local || isNaN(offset)) return msg('Enter the date, time and UTC offset.');
    const lat = v('#cf-lat') === '' ? null : parseFloat(v('#cf-lat')), lon = v('#cf-lon') === '' ? null : parseFloat(v('#cf-lon'));
    if ((lat === null) !== (lon === null) || (lat !== null && (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 89.9 || Math.abs(lon) > 180))) return msg('Enter both latitude (−89.9…89.9) and longitude (−180…180), or neither.');
    // The local wall-clock time minus the offset gives UTC.
    const date = new Date(Date.parse(local + ':00Z') - offset * HOUR_MS);
    if (isNaN(date)) return msg('That date is not valid.');
    const chart = { id: id || `c${Date.now().toString(36)}`, name, date: date.toISOString(), offset, lat, lon };
    const i = aview.charts.findIndex(c => c.id === chart.id);
    if (i >= 0) aview.charts[i] = chart; else aview.charts.push(chart);
    setChart(chart.id);
    el.classList.add('hidden');
}

function setChart(id) {
    aview.chartId = id || null;
    exactCache.clear();
    graphCache.key = calCache.key = null;
    aview.pattern = null;
    if (!validKey(aview.a)) aview.a = 'Sun';
    if (!validKey(aview.b) || aview.b === aview.a) aview.b = aview.a === 'Moon' ? 'Sun' : 'Moon';
    // Picking a chart starts the Lab on a transit to it.
    if (id && !isNatal(aview.a) && !isNatal(aview.b)) aview.b = 'n:' + (aview.b === aview.a ? 'Sun' : aview.b);
    saveAspects();
    syncAspectControls();
    renderAspects();
}

// ---------------------------------------------------------------------------
// View plumbing

function renderAspects() {
    if (state.view !== 'aspects' || !current.pos) return;
    document.getElementById('asp-clock').textContent = fmtDate(state.date, { weekday: 'short', year: 'numeric' });
    if (!validKey(aview.a) || !validKey(aview.b) || aview.a === aview.b) { aview.a = 'Sun'; aview.b = 'Moon'; }
    const ps = pairState(aview.a, aview.b, state.date);
    renderLab(ps);
    renderFactors(ps);
    renderCycle(ps);
    renderGraph(ps);
    renderGrid();
    renderPatterns();
    renderCalendar();
}

function openAspectLab(a, b, type) {
    aview.a = a; aview.b = b;
    saveAspects();
    if (state.view !== 'aspects') setView('aspects');
    else renderAspects();
    if (type && !isNatal(a) && !isNatal(b)) openDetail('aspectPair', `${a}|${b}|${type}`);
    document.getElementById('asp-lab').scrollIntoView({ block: 'nearest' });
}

function selectPair(a, b) {
    if (a === b) return;
    aview.a = a; aview.b = b;
    saveAspects();
    renderAspects();
}

function stopAspectAnim() {
    if (!aview.anim) return;
    clearInterval(aview.anim.timer);
    aview.anim = null;
    syncAspectControls();
    renderAspects();
    renderPanel();
}

function startAspectAnim(kind) {
    if (aview.anim) { const same = aview.anim.kind === kind; stopAspectAnim(); if (same) return; }
    const stepH = { hour: 2, day: 24, week: 24 * 7 }[kind];
    aview.anim = { kind, timer: setInterval(() => setDate(addHours(state.date, stepH)), 90) };
    syncAspectControls();
}

function bindAspects() {
    loadAspects();
    renderLearn();
    renderHarmonics();
    const root = document.getElementById('aspects-view');
    root.addEventListener('click', e => {
        const t = e.target.closest('[data-asp-time],[data-asp-anim],[data-asp-orbs],[data-asp-span],[data-asp-cal],[data-asp-harmonic],[data-asp-pattern],[data-asp-action],[data-asp-jump],[data-asp-pair],[data-asp-point],[data-type]');
        if (!t) return;
        const d = t.dataset;
        if (d.aspTime) {
            stopAspectAnim();
            if (d.aspTime === 'now') resetToNow();
            else changeTime(Number(d.aspTime.slice(0, -1)), { h: 'hour', d: 'day', w: 'week', M: 'month' }[d.aspTime.slice(-1)]);
        }
        else if (d.aspAnim) startAspectAnim(d.aspAnim);
        else if (d.aspOrbs) { state.orbSystem = d.aspOrbs; saveSettings(); syncAspectControls(); updateApp(); }
        else if (d.aspSpan) { aview.span = d.aspSpan; saveAspects(); renderAspects(); }
        else if (d.aspCal) { aview.calDays = Number(d.aspCal); saveAspects(); renderAspects(); }
        else if (d.aspHarmonic) { aview.harmonic = Number(d.aspHarmonic); saveAspects(); renderHarmonics(); }
        else if (d.aspPattern) { aview.pattern = aview.pattern === d.aspPattern ? null : d.aspPattern; renderPatterns(); }
        else if (d.aspAction === 'swap') selectPair(aview.b, aview.a);
        else if (d.aspAction === 'chart-save') saveChartForm(d.id);
        else if (d.aspAction === 'chart-cancel') { document.getElementById('asp-chart-form').classList.add('hidden'); syncAspectControls(); }
        else if (d.aspAction === 'chart-delete') {
            if (!aview.deleteArmed) { aview.deleteArmed = true; t.textContent = 'Click again to delete'; return; }
            aview.charts = aview.charts.filter(c => c.id !== d.id);
            document.getElementById('asp-chart-form').classList.add('hidden');
            setChart(null);
        }
        else if (d.aspPair) {
            const [a, b] = d.aspPair.split('|');
            if (d.aspJump) { stopAspectAnim(); setDate(new Date(Number(d.aspJump))); }
            selectPair(a, b);
        }
        else if (d.aspJump) { stopAspectAnim(); setDate(new Date(Number(d.aspJump))); }
        else if (d.aspPoint) { if (d.aspPoint !== aview.a) selectPair(aview.a, d.aspPoint); }
        else if (d.type) openDetail(d.type, d.key);
    });
    root.addEventListener('change', e => {
        if (e.target.id === 'asp-pick-a' || e.target.id === 'asp-pick-b') {
            const a = e.target.id === 'asp-pick-a' ? e.target.value : aview.a, b = e.target.id === 'asp-pick-b' ? e.target.value : aview.b;
            if (a === b) selectPair(b === aview.a ? aview.b : aview.a, b === aview.a ? aview.a : b);
            else selectPair(a, b);
        }
        else if (e.target.id === 'asp-minor') { state.minorAspects = e.target.checked; saveSettings(); graphCache.key = calCache.key = null; exactCache.clear(); updateApp(); }
        else if (e.target.id === 'asp-cal-moon') { aview.calMoon = e.target.checked; saveAspects(); renderCalendar(); }
        else if (e.target.id === 'asp-chart') {
            const v = e.target.value;
            if (v === '__new') openChartForm(null);
            else if (v === '__edit') openChartForm(activeChart());
            else setChart(v);
            if (v.startsWith('__')) syncAspectControls();
        }
    });
    document.getElementById('info-sidebar').addEventListener('click', e => {
        const t = e.target.closest('[data-aspect-lab]');
        if (t) { const [a, b] = t.dataset.aspectLab.split('|'); openAspectLab(a, b); }
    });
    syncAspectControls();
}

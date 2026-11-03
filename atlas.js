// Sky Atlas: real star charts of the zodiac constellations, with their lore.
// Star data comes from sky-data.js (SKY), deep lore from sky-lore.js (SKY_LORE).
// Charts use a stereographic projection centred on the constellation, seen from below (east on the left).

const ZODIAC_CONS = ['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Oph', 'Sgr', 'Cap', 'Aqr', 'Psc'];
const ATLAS_KEY = 'astrodynamics.atlas.v1';
const ATLAS_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const OBLIQUITY_J2000 = 23.4393;

const STAR = new Map(SKY.stars.map(([hip, ra, dec, mag, bv]) => [hip, { hip, ra, dec, mag, bv, v: radec(ra, dec) }]));
const ABBR_BY_NAME = Object.fromEntries(Object.entries(SKY.conNames).map(([abbr, name]) => [name, abbr]));
const DSOS = SKY.dsos.map(([id, name, type, mag, ra, dec, size]) => ({ id, name, type, mag, v: radec(ra, dec) }));

const atlas = {
    con: 'Tau',
    figure: 'rey',
    orient: 'north',            // 'north' (north up) or 'sky' (as it stands in your sky now)
    layers: { lines: true, names: true, greek: true, anatomy: true, bounds: true, neighbours: true, planets: true, dsos: true, ecliptic: true },
    zoom: 1, panX: 0, panY: 0,
    selected: null,
    askedLocation: false
};

// ---------------------------------------------------------------------------
// Vector helpers (unit vectors in J2000 equatorial coordinates)

function radec(ra, dec) {
    const a = ra * DEG, d = dec * DEG;
    return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const unit = a => scale3(a, 1 / Math.hypot(...a));

function starName(hip) {
    const n = SKY.names[hip];
    return n ? { name: n[0], desig: n[1], flam: n[2], con: n[3] } : { name: '', desig: '', flam: '', con: '' };
}

function starLabel(hip) {
    const n = starName(hip);
    const greek = n.desig && n.con ? `${n.desig} ${n.con}` : `HIP ${hip}`;
    return n.name ? `${n.name} (${greek})` : greek;
}

// Lore names stars either by Hipparcos number or by Bayer letter within the constellation ('α', 'γ1').
const BAYER = {};
for (const [hip, n] of Object.entries(SKY.names)) {
    const key = `${n[3]}|${n[1]}`;
    if (n[1] && STAR.has(+hip) && (!BAYER[key] || STAR.get(+hip).mag < STAR.get(BAYER[key]).mag)) BAYER[key] = +hip;
}
const loreHip = (abbr, ref) => typeof ref === 'number' ? ref : BAYER[`${abbr}|${ref}`];

function loreAnatomy(abbr) {
    return (SKY_LORE[abbr]?.anatomy || []).map(a => ({ ...a, hip: loreHip(abbr, a.hip ?? a.star) })).filter(a => STAR.has(a.hip));
}

function loreStar(hip) {
    const n = starName(hip), stars = SKY_LORE[n.con]?.stars;
    return stars && (stars[hip] || stars[n.desig]);
}

// Tropical ecliptic longitude of date for a star (J2000 position plus precession).
function starTropicalLon(s, date) {
    const e = OBLIQUITY_J2000 * DEG;
    const lon2000 = norm360(Math.atan2(s.v[1] * Math.cos(e) + s.v[2] * Math.sin(e), s.v[0]) / DEG);
    const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY_MS);
    return norm360(lon2000 + years * 0.0139694);
}

function figureLines(abbr, style = atlas.figure) {
    return SKY.figures[style][abbr] || [];
}

function figureStars(abbr, style = atlas.figure) {
    return [...new Set(figureLines(abbr, style).flat())];
}

const centreCache = {};
function conCentre(abbr) {
    if (centreCache[abbr]) return centreCache[abbr];
    let hips = [...new Set([...figureStars(abbr, 'rey'), ...figureStars(abbr, 'traditional')])];
    let sum = [0, 0, 0];
    if (hips.length) hips.forEach(h => { sum = add3(sum, STAR.get(h).v); });
    else (SKY.bounds[abbr] || []).flat().forEach(([ra, dec]) => { sum = add3(sum, radec(ra, dec)); });
    return (centreCache[abbr] = unit(sum));
}

// ---------------------------------------------------------------------------
// Observer helpers

function observerFrame(date) {
    const loc = state.location;
    if (!loc) return null;
    const lst = norm360(Astronomy.SiderealTime(date) * 15 + loc.lon);
    const zenith = radec(lst, loc.lat);
    const northH = unit(add3([0, 0, 1], scale3(zenith, -zenith[2])));
    const eastH = cross(northH, zenith);
    return { zenith, northH, eastH, lst, lat: loc.lat };
}

function altAz(v, frame) {
    const alt = Math.asin(Math.max(-1, Math.min(1, dot(v, frame.zenith)))) / DEG;
    const az = norm360(Math.atan2(dot(v, frame.eastH), dot(v, frame.northH)) / DEG);
    return { alt, az };
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = az => COMPASS[Math.round(az / 22.5) % 16];

function planetRaDec(id, date) {
    const obs = state.location ? new Astronomy.Observer(state.location.lat, state.location.lon, 0) : new Astronomy.Observer(0, 0, 0);
    const eq = Astronomy.Equator(id, date, obs, false, true);
    return radec(eq.ra * 15, eq.dec);
}

// Rise, transit and set of a fixed direction for the current location (simple spherical astronomy).
function visibility(v, date) {
    const frame = observerFrame(date);
    if (!frame) return null;
    const ra = norm360(Math.atan2(v[1], v[0]) / DEG), dec = Math.asin(v[2]) / DEG;
    const now = altAz(v, frame);
    const ha = wrap180(frame.lst - ra);                          // hour angle in degrees
    const toTransit = norm360(-ha) / 15 / 1.00273791;              // sidereal → solar hours
    const transit = addHours(date, toTransit);
    const maxAlt = 90 - Math.abs(frame.lat - dec);
    const cosH0 = -Math.tan(frame.lat * DEG) * Math.tan(dec * DEG);
    const sun = altAz(planetRaDec('Sun', date), frame).alt;
    return {
        ...now, transit, maxAlt, sun,
        circumpolar: cosH0 < -1, neverRises: cosH0 > 1,
        rising: ha < 0
    };
}

// ---------------------------------------------------------------------------
// Projection

function makeProjection(abbr, W, H) {
    const c = conCentre(abbr);
    const east = unit(cross([0, 0, 1], c)), north = cross(c, east);
    const raw = v => {
        const cosc = dot(v, c);
        if (cosc < -0.3) return null;
        const k = 2 / (1 + cosc);
        return [-k * dot(v, east), -k * dot(v, north)];   // east to the left, north up
    };
    let angle = 0;
    if (atlas.orient === 'sky') {
        const frame = observerFrame(state.date);
        if (frame) {
            // Turn the chart so the direction toward your zenith points up.
            const t = add3(frame.zenith, scale3(c, -dot(frame.zenith, c)));
            const tip = raw(unit(add3(c, scale3(unit(t), 0.05))));
            angle += -90 - Math.atan2(tip[1], tip[0]) / DEG;
        }
    }
    const ca = Math.cos(angle * DEG), sa = Math.sin(angle * DEG);
    const turned = v => {
        const p = raw(v);
        return p && [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca];
    };
    // Fit the constellation's IAU boundary (or figure) into the chart.
    let extent = 0.15;
    const fitPts = (SKY.bounds[abbr] || []).flat().map(([ra, dec]) => radec(ra, dec));
    for (const v of fitPts.length ? fitPts : figureStars(abbr).map(h => STAR.get(h).v)) {
        const p = turned(v);
        if (p) extent = Math.max(extent, Math.abs(p[0]) / W * H, Math.abs(p[1]));
    }
    const s = (H / 2) * 0.86 / extent * atlas.zoom;
    const cx = W / 2 + atlas.panX, cy = H / 2 + atlas.panY;
    return {
        s, angle,
        project(v) {
            const p = turned(v);
            return p && [cx + p[0] * s, cy + p[1] * s];
        }
    };
}

// ---------------------------------------------------------------------------
// Rendering

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
}

function bvColour(bv) {
    if (bv === null || bv === undefined) return '#f8fafc';
    if (bv < -0.05) return '#a5c0ff';
    if (bv < 0.25) return '#d4e0ff';
    if (bv < 0.55) return '#f8f7ff';
    if (bv < 0.85) return '#fff1d6';
    if (bv < 1.25) return '#ffd29c';
    return '#ffb36b';
}

function bvWords(bv) {
    if (bv === null || bv === undefined) return 'white';
    if (bv < -0.05) return 'blue-white (very hot, B-type)';
    if (bv < 0.25) return 'white (A-type)';
    if (bv < 0.55) return 'yellow-white (F-type)';
    if (bv < 0.85) return 'yellow (G-type, like the Sun)';
    if (bv < 1.25) return 'orange (K-type)';
    return 'orange-red (cool, M/late K-type)';
}

function renderAtlas() {
    if (state.view !== 'atlas') return;
    const box = document.getElementById('atlas-chart');
    const W = box.clientWidth, H = box.clientHeight;
    if (!W || !H) return;
    const svg = document.getElementById('atlas-svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';

    const abbr = atlas.con;
    const proj = makeProjection(abbr, W, H);
    const L = atlas.layers;
    const frame = observerFrame(state.date);
    const showHorizon = atlas.orient === 'sky' && frame;
    const inView = p => p && p[0] > -40 && p[0] < W + 40 && p[1] > -40 && p[1] < H + 40;
    const unitPx = Math.max(0.75, Math.min(1.3, Math.min(W, H) / 700)) * atlas.zoom ** 0.3;
    const g = name => el('g', { class: name }, svg);
    // Labels are collected and placed at the end, brightest/most important first, without overlapping.
    const labels = [], blocked = [];
    const label = (p, r, text, size, attrs, prio, centred = false) => labels.push({ x: p[0], y: p[1], r, text, size, attrs, prio, centred });
    const layers = { bounds: g('a-bounds'), ecl: g('a-ecl'), horizon: g('a-horizon'), figN: g('a-fig-n'), fig: g('a-fig'), dso: g('a-dso'), stars: g('a-stars'), labels: g('a-labels'), planets: g('a-planets'), ui: g('a-ui') };

    // Polyline through many sky points, broken where the projection leaves the chart.
    const path = (vs, attrs, parent) => {
        let d = '', pen = false;
        for (const v of vs) {
            const p = proj.project(v);
            if (!p || Math.abs(p[0]) > 5 * W || Math.abs(p[1]) > 5 * H) { pen = false; continue; }
            d += `${pen ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
            pen = true;
        }
        if (d) el('path', { d, fill: 'none', ...attrs }, parent);
    };
    // Constellation borders run along lines of RA/Dec, so densify them before projecting.
    const densify = poly => {
        const out = [];
        for (let i = 0; i < poly.length; i++) {
            const [ra1, d1] = poly[i], [ra2, d2] = poly[(i + 1) % poly.length];
            const dra = wrap180(ra2 - ra1);
            const n = Math.max(1, Math.ceil(Math.max(Math.abs(dra), Math.abs(d2 - d1))));
            for (let k = 0; k < n; k++) out.push(radec(ra1 + dra * k / n, d1 + (d2 - d1) * k / n));
        }
        out.push(out[0]);
        return out;
    };

    // Borders
    if (L.bounds) {
        for (const [a, polys] of Object.entries(SKY.bounds)) {
            const mine = a === abbr;
            if (!mine && !L.neighbours) continue;
            if (!mine && dot(conCentre(a), conCentre(abbr)) < 0.3) continue;
            for (const poly of polys) path(densify(poly), { stroke: mine ? '#38bdf8' : '#1e3a5f', 'stroke-width': mine ? 1.1 : 0.7, 'stroke-dasharray': mine ? '5 4' : '3 4', 'stroke-opacity': mine ? 0.55 : 0.6 }, layers.bounds);
        }
    }

    // Ecliptic (the Sun's path)
    if (L.ecliptic) {
        const e = OBLIQUITY_J2000 * DEG, pts = [];
        for (let l = 0; l <= 360; l += 1) pts.push([Math.cos(l * DEG), Math.sin(l * DEG) * Math.cos(e), Math.sin(l * DEG) * Math.sin(e)]);
        path(pts, { stroke: '#fbbf24', 'stroke-width': 1, 'stroke-opacity': 0.4, 'stroke-dasharray': '1 5', 'stroke-linecap': 'round' }, layers.ecl);
        // Label it near the chart edge
        for (let l = 0; l < 360; l += 2) {
            const v = [Math.cos(l * DEG), Math.sin(l * DEG) * Math.cos(e), Math.sin(l * DEG) * Math.sin(e)];
            const p = proj.project(v);
            if (p && p[0] > 30 && p[0] < 140 && p[1] > 20 && p[1] < H - 20) {
                el('text', { x: p[0], y: p[1] - 6, fill: '#fbbf24', 'fill-opacity': 0.55, 'font-size': 10 * unitPx }, layers.ecl, 'ecliptic');
                break;
            }
        }
    }

    // Horizon and compass points when the chart is turned to your sky
    if (showHorizon) {
        const pts = [];
        for (let a = 0; a <= 360; a += 1) pts.push(add3(scale3(frame.northH, Math.cos(a * DEG)), scale3(frame.eastH, Math.sin(a * DEG))));
        path(pts, { stroke: '#34d399', 'stroke-width': 1.4, 'stroke-opacity': 0.7 }, layers.horizon);
        for (let a = 0; a < 360; a += 45) {
            const p = proj.project(add3(scale3(frame.northH, Math.cos(a * DEG)), scale3(frame.eastH, Math.sin(a * DEG))));
            if (inView(p)) el('text', { x: p[0], y: p[1] + 14 * unitPx, fill: '#34d399', 'font-size': 11 * unitPx, 'font-weight': 700, 'text-anchor': 'middle' }, layers.horizon, compass(a));
        }
    }
    const below = v => showHorizon && dot(v, frame.zenith) < 0;

    // Neighbouring figures, faint
    if (L.neighbours) {
        for (const a of Object.keys(SKY.figures[atlas.figure])) {
            if (a === abbr || dot(conCentre(a), conCentre(abbr)) < 0.4) continue;
            for (const line of figureLines(a)) path(line.map(h => STAR.get(h).v), { stroke: '#334155', 'stroke-width': 1, 'stroke-opacity': 0.8 }, layers.figN);
            const p = proj.project(conCentre(a));
            if (inView(p)) label(p, 0, SKY.conNames[a].toUpperCase(), 11 * unitPx, { fill: '#475569', 'letter-spacing': 2, class: 'a-con-label', 'data-con': a }, 30, true);
        }
    }

    // The figure itself
    if (L.lines) {
        for (const line of figureLines(abbr)) path(line.map(h => STAR.get(h).v), { stroke: '#7dd3fc', 'stroke-width': 1.6 * unitPx, 'stroke-opacity': 0.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, layers.fig);
    }

    // Deep-sky objects
    if (L.dsos) {
        for (const o of DSOS) {
            const p = proj.project(o.v);
            if (!inView(p)) continue;
            const r = 6 * unitPx;
            const style = { fill: 'none', stroke: '#a78bfa', 'stroke-width': 1, 'stroke-opacity': 0.75 };
            // Open clusters dotted, globulars solid, galaxies (s/e/i) as ellipses, nebulae as squares.
            if (o.type === 'oc') el('circle', { cx: p[0], cy: p[1], r, ...style, 'stroke-dasharray': '2 2' }, layers.dso);
            else if (o.type === 'gc') el('circle', { cx: p[0], cy: p[1], r, ...style }, layers.dso);
            else if (['s', 'e', 'i'].includes(o.type)) el('ellipse', { cx: p[0], cy: p[1], rx: r * 1.3, ry: r * 0.6, ...style }, layers.dso);
            else el('rect', { x: p[0] - r, y: p[1] - r, width: 2 * r, height: 2 * r, rx: 2, ...style }, layers.dso);
            label(p, r, o.name ? `${o.id} ${o.name}` : o.id, 9.5 * unitPx, { fill: '#a78bfa', 'fill-opacity': 0.8 }, 40 - (o.mag || 9));
        }
    }

    // Stars
    const mine = new Set(figureStars(abbr));
    const centre = conCentre(abbr);
    const anatomyFor = SKY_LORE[abbr]?.anatomy ? loreAnatomy(abbr) : null;
    for (const s of STAR.values()) {
        if (s.mag > 5.8 && !mine.has(s.hip)) continue;
        if (dot(s.v, centre) < 0.5) continue;
        const p = proj.project(s.v);
        if (!inView(p)) continue;
        const r = Math.max(0.6, 1.25 * (6 - s.mag)) * unitPx;
        const dim = below(s.v) ? 0.3 : 1;
        const n = starName(s.hip);
        const isMine = mine.has(s.hip) || n.con === abbr;
        el('circle', { cx: p[0], cy: p[1], r, fill: bvColour(s.bv), 'fill-opacity': dim * (isMine || !L.neighbours ? 1 : 0.75) }, layers.stars);
        if (s.mag < 3 && dim === 1) el('circle', { cx: p[0], cy: p[1], r: r * 2.4, fill: bvColour(s.bv), 'fill-opacity': 0.08 }, layers.stars);
        if (isMine || n.name || s.mag < 4.5) {
            el('circle', { cx: p[0], cy: p[1], r: Math.max(r + 3, 8), fill: 'transparent', class: 'a-star', 'data-hip': s.hip, style: 'cursor:pointer' }, layers.ui);
        }
        if (s.mag < 5) blocked.push([p[0] - r, p[1] - r, 2 * r, 2 * r]);
        if (L.names && n.name && (isMine ? s.mag < 5 : s.mag < 2.6)) {
            label(p, r, n.name, (isMine ? 11.5 : 10) * unitPx, { fill: isMine ? '#e2e8f0' : '#64748b', 'font-weight': isMine && s.mag < 2 ? 600 : 400 }, (isMine ? 100 : 20) - s.mag * 2);
        }
        if (L.greek && isMine && n.desig && n.con === abbr && n.desig.length <= 3 && s.mag < 5.2 && (!L.names || !n.name || s.mag < 4)) {
            label(p, r, n.desig, (n.name && L.names ? 9 : 10) * unitPx, { fill: n.name && L.names ? '#64748b' : '#94a3b8' }, 50 - s.mag);
        }
    }

    // Anatomy: the showcase lore names body parts per star; otherwise use Rey's label anchors.
    if (L.anatomy) {
        if (anatomyFor) {
            for (const a of anatomyFor) {
                const s = STAR.get(a.hip), p = s && proj.project(s.v);
                if (!inView(p)) continue;
                label(p, Math.max(0.6, 1.25 * (6 - s.mag)) * unitPx, a.part, 10 * unitPx, { fill: '#fbbf24', 'fill-opacity': 0.9, 'font-style': 'italic' }, 80 - s.mag);
            }
        } else {
            for (const [hip, part] of SKY.figureLabels[abbr] || []) {
                const s = STAR.get(hip), p = s && proj.project(s.v);
                if (!inView(p)) continue;
                label(p, 0, part, 11 * unitPx, { fill: '#fbbf24', 'fill-opacity': 0.85, 'font-style': 'italic' }, 70, true);
            }
        }
    }

    // Planets tonight
    if (L.planets) {
        for (const id of ATLAS_PLANETS) {
            const v = planetRaDec(id, state.date);
            const p = proj.project(v);
            if (!inView(p)) continue;
            const b = BODY[id];
            if (id === 'Sun') el('circle', { cx: p[0], cy: p[1], r: 16 * unitPx, fill: '#fcd34d', 'fill-opacity': 0.15 }, layers.planets);
            el('text', { x: p[0], y: p[1], fill: b.color, 'font-size': 18 * unitPx, 'text-anchor': 'middle', 'dominant-baseline': 'central', style: 'cursor:pointer', class: 'a-planet', 'data-id': id }, layers.planets, b.symbol);
            el('text', { x: p[0], y: p[1] + 16 * unitPx, fill: b.color, 'fill-opacity': 0.9, 'font-size': 9.5 * unitPx, 'text-anchor': 'middle', 'letter-spacing': 1 }, layers.planets, b.name.toUpperCase());
            blocked.push([p[0] - 10 * unitPx, p[1] - 10 * unitPx, 20 * unitPx, 32 * unitPx]);
        }
    }
    placeLabels(labels, blocked, layers.labels);

    // Selected star
    if (atlas.selected) {
        const st = STAR.get(atlas.selected), p = st && proj.project(st.v);
        if (p) el('circle', { cx: p[0], cy: p[1], r: 12 * unitPx, fill: 'none', stroke: '#93c5fd', 'stroke-width': 2 }, layers.planets);
    }

    renderAtlasStatus();
}

// Greedy label placement: try spots around the star and keep the first that collides with nothing.
function placeLabels(labels, blocked, parent) {
    const boxes = [...blocked];
    const hits = b => boxes.some(o => b[0] < o[0] + o[2] && b[0] + b[2] > o[0] && b[1] < o[1] + o[3] && b[1] + b[3] > o[1]);
    labels.sort((a, b) => b.prio - a.prio);
    for (const l of labels) {
        const w = l.text.length * l.size * 0.56 + (l.attrs['letter-spacing'] || 0) * l.text.length, h = l.size;
        const gap = l.r + 3;
        const spots = l.centred ? [[-w / 2, -h / 2], [-w / 2, -h * 1.6], [-w / 2, h * 0.6]] : [
            [gap, -h / 2], [gap * 0.7, -gap - h * 0.7], [gap * 0.7, gap * 0.6], [-gap - w, -h / 2],
            [-gap * 0.7 - w, -gap - h * 0.7], [-gap * 0.7 - w, gap * 0.6], [-w / 2, -gap - h], [-w / 2, gap]
        ];
        for (const [dx, dy] of spots) {
            const b = [l.x + dx, l.y + dy, w, h];
            if (hits(b)) continue;
            boxes.push(b);
            el('text', { x: b[0], y: b[1] + h * 0.82, 'font-size': l.size, ...l.attrs }, parent, l.text);
            break;
        }
    }
}

// ---------------------------------------------------------------------------
// Status line

function renderAtlasStatus() {
    document.getElementById('atlas-clock').textContent = fmtDate(state.date, { weekday: 'short', year: 'numeric' });
    const box = document.getElementById('atlas-status');
    const abbr = atlas.con, name = SKY.conNames[abbr];
    if (!state.location) {
        box.innerHTML = `<span class="text-slate-400">Set your location to see where ${name} is in your sky.</span> <button class="underline text-sky-300" data-atlas-action="locate">📍 Use my location</button>`;
        return;
    }
    const vis = visibility(conCentre(abbr), state.date);
    let where;
    if (vis.neverRises) where = `${name} never rises at your latitude.`;
    else if (vis.alt > 0) where = `<b class="text-emerald-300">${name} is up</b>: ${Math.round(vis.alt)}° above the ${compass(vis.az)} horizon, ${vis.rising ? 'rising' : 'setting'}.`;
    else where = `<b class="text-slate-300">${name} is below the horizon</b> (${compass(vis.az)}).`;
    const sky = vis.sun > -6 ? (vis.sun > 0 ? ' The Sun is up, so the stars are hidden.' : ' It is twilight, so only the brightest stars show.') : ' It is dark.';
    // It culminates due south when it lies south of your zenith, due north otherwise.
    const dec = Math.asin(conCentre(abbr)[2]) / DEG;
    const side = dec < state.location.lat ? 'south' : 'north';
    box.innerHTML = `${where}${vis.alt > 0 ? sky : ''} ${vis.neverRises ? '' : `Highest (${Math.round(vis.maxAlt)}° up, due ${side}) at ${fmtDate(vis.transit)}.`}`;
}

function handleStarClick(hip) {
    atlas.selected = hip;
    renderAtlas();
    openDetail('skystar', String(hip));
}

// ---------------------------------------------------------------------------
// Side panel content (called from app.js renderDetail)

function abbrOf(name) { return ABBR_BY_NAME[name]; }

function constellationAtlasCards(name) {
    const abbr = abbrOf(name);
    if (!abbr) return '';
    const lore = SKY_LORE[abbr];
    const cards = [];
    const openBtn = `<button class="text-xs text-sky-300 hover:text-white" data-atlas-open="${abbr}">🔭 Open ${name} in the Sky Atlas</button>`;

    const vis = state.location && visibility(conCentre(abbr), state.date);
    const visLine = vis
        ? (vis.neverRises ? 'Never rises at your latitude.' : `${vis.alt > 0 ? `<b class="text-emerald-300">Up now</b>, ${Math.round(vis.alt)}° high in the ${compass(vis.az)}` : `Below the horizon now (${compass(vis.az)})`}. Highest at ${fmtDate(vis.transit)} (${Math.round(vis.maxAlt)}° up)${vis.sun > -6 && vis.alt > 0 ? '. The sky is not dark yet.' : '.'}`)
        : 'Set your location for rise/transit times.';
    cards.push(card('In your sky', `<p class="text-sm text-slate-300">${visLine}</p>
        <div class="mt-3">${openBtn}</div>`, 'text-emerald-400'));

    if (lore) {
        cards.push(card(`Learn the shape: ${lore.title}`, `<p class="text-sm text-slate-300 italic mb-2">${lore.tagline}</p>
            <ol class="list-decimal ml-4 flex flex-col gap-1.5 text-sm text-slate-300">${lore.shape.map(s => `<li>${s}</li>`).join('')}</ol>
            <p class="text-sm text-amber-200 mt-3">${lore.memory}</p>`, 'text-sky-400'));
        cards.push(card('How to find it', `<ul class="flex flex-col gap-2 text-sm text-slate-300">${lore.find.map(f => `<li><span class="text-slate-400">From ${f.from}:</span> ${f.text}</li>`).join('')}</ul>
            <p class="text-sm text-slate-400 mt-3">${lore.season}</p>
            <p class="text-xs text-slate-500 mt-2">${lore.southern}</p>`, 'text-teal-400'));
        cards.push(card('Anatomy', `<ul class="flex flex-col gap-1 text-sm">${loreAnatomy(abbr).map(a => `<li class="flex justify-between gap-2"><span class="text-amber-200 italic">${a.part}</span>${link('skystar', String(a.hip), starLabel(a.hip))}</li>`).join('')}</ul>`, 'text-amber-400'));
    }

    // Star list from the data (works for every constellation)
    const hips = [...new Set([...figureStars(abbr, 'rey'), ...figureStars(abbr, 'traditional')])]
        .filter(h => STAR.get(h).mag < 5.5).sort((a, b) => STAR.get(a).mag - STAR.get(b).mag);
    cards.push(card('Stars of the figure', `<table class="w-full text-sm"><thead><tr class="text-[11px] text-slate-500 uppercase"><th class="text-left font-normal">Star</th><th class="text-right font-normal">Mag</th></tr></thead><tbody>
        ${hips.map(h => `<tr class="border-t border-slate-800"><td class="py-1"><span class="inline-block w-2 h-2 rounded-full mr-2" style="background:${bvColour(STAR.get(h).bv)}"></span>${link('skystar', String(h), starLabel(h))}</td><td class="py-1 text-right font-mono text-xs text-slate-400">${STAR.get(h).mag.toFixed(2)}</td></tr>`).join('')}
        </tbody></table><p class="text-[11px] text-slate-500 mt-2">Magnitude: lower is brighter. 0 is very bright, 6 is the naked-eye limit under dark skies.</p>`));

    if (lore) {
        cards.push(card('Myths & cultures', lore.myths.map(m => `<div class="mb-3"><div class="text-xs text-purple-300 uppercase tracking-wider">${m.culture}</div><div class="text-sm font-semibold text-slate-200">${m.title}</div><p class="text-sm text-slate-300 leading-relaxed mt-1">${m.text}</p></div>`).join(''), 'text-purple-400'));
        const A = lore.astrology;
        const fixed = A.fixedStars.map(f => ({ ...f, hip: loreHip(abbr, f.hip ?? f.star) })).filter(f => STAR.has(f.hip));
        cards.push(card('Energy & meaning', `<p class="text-sm text-slate-300 leading-relaxed">${A.energy}</p>
            ${A.sign ? `<p class="text-sm text-slate-400 leading-relaxed mt-3"><span class="text-slate-500">Constellation vs sign:</span> ${A.sign}</p>` : ''}`, 'text-rose-400'));
        cards.push(card('Fixed-star astrology', `<p class="text-sm text-slate-400 leading-relaxed">${A.ptolemy}</p>
            <ul class="flex flex-col gap-2 text-sm text-slate-300 mt-3">${fixed.map(f => `<li>${f.text} ${link('skystar', String(f.hip), '→', 'text-sky-300')}</li>`).join('')}</ul>
            ${fixedStarContacts(fixed)}`, 'text-rose-400'));
        if (A.nakshatras?.length) cards.push(card('Nakshatras (Vedic lunar mansions)', `<ul class="flex flex-col gap-2 text-sm text-slate-300">${A.nakshatras.map(k => {
            const i = LORE.nakshatras.findIndex(x => x.name === k.name);
            return `<li>${i >= 0 ? link('nakshatra', String(i), `<b>${k.name}</b>`) : `<b>${k.name}</b>`} <span class="text-slate-500">· ${k.stars}</span><br>${k.text}</li>`;
        }).join('')}</ul>`, 'text-orange-400'));
        cards.push(card('Deep-sky treasures', `<ul class="flex flex-col gap-2 text-sm text-slate-300">${lore.dsos.map(d => `<li>${d.text}</li>`).join('')}</ul>
            <p class="text-sm text-slate-400 mt-3">${lore.ecliptic}</p>`, 'text-violet-400'));
        cards.push(card('Did you know?', `<ul class="list-disc ml-4 flex flex-col gap-1 text-sm text-slate-300">${lore.facts.map(f => `<li>${f}</li>`).join('')}</ul>`));
    } else {
        const labels = SKY.figureLabels[abbr];
        if (labels?.length) cards.push(card('Anatomy (H.A. Rey)', `<p class="text-sm text-slate-300">Rey's figure marks: ${[...new Set(labels.map(l => l[1]))].join(', ')}. Turn on the Anatomy layer in the Atlas to see where.</p>`, 'text-amber-400'));
    }
    return cards.join('');
}

// Which planets sit on a constellation's key stars right now (fixed-star conjunctions, by longitude).
function fixedStarContacts(fixed, orb = 2) {
    const hits = [];
    for (const f of fixed) {
        const lon = starTropicalLon(STAR.get(f.hip), state.date);
        for (const b of bodies) {
            if (b.node) continue;
            const d = Math.abs(wrap180(current.pos[b.id].trop - lon));
            if (d <= orb) hits.push(`<li>${planetLink(b.id)} on ${link('skystar', String(f.hip), starName(f.hip).name || starLabel(f.hip))} <span class="text-slate-500">(${fmtOrb(d)} away${d < 0.5 ? ', exact' : ''})</span></li>`);
        }
    }
    return `<div class="mt-3 pt-3 border-t border-slate-700/60"><div class="text-xs text-amber-300 uppercase tracking-wider mb-1">Active now</div>${hits.length
        ? `<ul class="flex flex-col gap-1 text-sm">${hits.join('')}</ul>`
        : `<p class="text-sm text-slate-500">No planet within ${orb}° of these stars right now.</p>`}</div>`;
}

function skyStarTooltip(hip) {
    const s = STAR.get(Number(hip)), n = starName(Number(hip));
    if (!s) return '';
    return `<div class="font-semibold" style="color:${bvColour(s.bv)}">${starLabel(Number(hip))}</div>
        <div class="text-xs text-slate-400">mag ${s.mag.toFixed(2)} · ${bvWords(s.bv).split(' (')[0]}${n.con ? ` · ${SKY.conNames[n.con] || n.con}` : ''}</div>`;
}

function renderSkyStar(key) {
    const hip = Number(key), s = STAR.get(hip);
    if (!s) return '';
    const n = starName(hip);
    const lore = loreStar(hip);
    const part = loreAnatomy(n.con).find(a => a.hip === hip)?.part;
    const ra = norm360(Math.atan2(s.v[1], s.v[0]) / DEG), dec = Math.asin(s.v[2]) / DEG;
    const lon = toMode(starTropicalLon(s, state.date), state.date);   // in the active zodiac
    const near = bodies.filter(b => Math.abs(wrap180(current.pos[b.id].lon - lon)) <= 2);
    const vis = state.location && visibility(s.v, state.date);
    const conName = SKY.conNames[n.con] || n.con;
    return [
        detailHeader('✦', n.name || starLabel(hip), `${n.desig ? `${n.desig} ${n.con}` : ''}${part ? ` · ${part}` : ''}`, bvColour(s.bv)),
        `<button class="text-xs text-slate-400 hover:text-white -mt-2 text-left" data-atlas-star="${hip}" data-atlas-con="${n.con}">🔭 Show in the Sky Atlas</button>`,
        card('The star', factTable([
            ['Constellation', n.con ? link('constellation', conName, conName) : '–'],
            ['Brightness', `magnitude ${s.mag.toFixed(2)}${s.mag < 1.5 ? ' (one of the brightest stars in the sky)' : s.mag < 3 ? ' (easy to see, even from towns)' : s.mag < 4.5 ? ' (visible away from bright lights)' : ' (needs a dark sky)'}`],
            ['Colour', `<span style="color:${bvColour(s.bv)}">●</span> ${bvWords(s.bv)}`],
            lore?.type ? ['Type', lore.type] : null,
            lore?.dist ? ['Distance', `~${lore.dist} light years (the light you see left it ${lore.dist} years ago)`] : null,
            ['Position', `RA ${(ra / 15).toFixed(2)}h · Dec ${dec >= 0 ? '+' : ''}${dec.toFixed(1)}°`],
            ['On the zodiac', `${fmtPos(lon)}${near.length ? ` · near ${near.map(b => planetLink(b.id)).join(', ')}` : ''}`],
            vis ? ['From your location', vis.neverRises ? 'Never rises' : `${vis.alt > 0 ? `Up, ${Math.round(vis.alt)}° in the ${compass(vis.az)}` : 'Below the horizon'} · highest ${fmtDate(vis.transit)}`] : null,
            ['Catalogue', `HIP ${hip}${n.flam ? ` · ${n.flam} ${n.con}` : ''}`]
        ].filter(Boolean))),
        lore ? card('Lore', `
            ${lore.meaning ? `<p class="text-sm text-slate-300"><span class="text-slate-500">Name:</span> ${lore.meaning}</p>` : ''}
            ${lore.ptolemy ? `<p class="text-sm text-slate-300 mt-2"><span class="text-slate-500">Ptolemy's catalogue:</span> <i>${lore.ptolemy}</i></p>` : ''}
            ${lore.nature ? `<p class="text-sm text-slate-300 mt-2"><span class="text-slate-500">Astrological nature (Ptolemy):</span> like ${lore.nature}</p>` : ''}
            ${lore.story ? `<p class="text-sm text-slate-300 mt-2 leading-relaxed">${lore.story}</p>` : ''}
            ${lore.astro ? `<p class="text-sm text-rose-200 mt-2 leading-relaxed"><span class="text-slate-500">In astrology:</span> ${lore.astro}</p>` : ''}`, 'text-amber-400') : ''
    ].join('');
}

// ---------------------------------------------------------------------------
// View switching, controls, zoom/pan

function loadAtlas() {
    try {
        const saved = JSON.parse(localStorage.getItem(ATLAS_KEY) || '{}');
        for (const k of ['con', 'figure', 'orient']) if (saved[k]) atlas[k] = saved[k];
        if (saved.layers) Object.assign(atlas.layers, saved.layers);
    } catch (e) {
        console.warn('Could not read atlas settings', e);
    }
}

function saveAtlas() {
    const { con, figure, orient, layers } = atlas;
    localStorage.setItem(ATLAS_KEY, JSON.stringify({ con, figure, orient, layers }));
}

function setView(view) {
    state.view = view;
    saveSettings();
    document.getElementById('wheel-view').classList.toggle('hidden', view !== 'wheel');
    document.getElementById('atlas-view').classList.toggle('hidden', view !== 'atlas');
    document.getElementById('moon-view').classList.toggle('hidden', view !== 'moon');
    // The atlas and moon views want all the room they can get: the left control pane hides, and a compact clock takes over.
    document.getElementById('control-pane').classList.toggle('hidden', view !== 'wheel');
    document.body.classList.toggle('atlas-open', view !== 'wheel');
    document.body.classList.toggle('moon-open', view === 'moon');
    if (view !== 'moon') stopMoonAnim();
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('seg-active', b.dataset.view === view));
    if (view === 'atlas') {
        // The atlas is all about your own sky: ask for the location once, if we don't have it.
        if (!state.location && !atlas.askedLocation) { atlas.askedLocation = true; useGeolocation(); }
        syncAtlasControls();
        renderAtlas();
    }
    if (view === 'moon') {
        if (!state.location && !atlas.askedLocation) { atlas.askedLocation = true; useGeolocation(); }
        renderMoon();
    }
    if (current.pos) renderPanel();
}

function selectConstellation(abbr, openPanel = true) {
    atlas.con = abbr;
    atlas.zoom = 1; atlas.panX = atlas.panY = 0;
    atlas.selected = null;
    saveAtlas();
    syncAtlasControls();
    renderAtlas();
    if (openPanel) openDetail('constellation', SKY.conNames[abbr]);
}

function syncAtlasControls() {
    document.getElementById('atlas-picker').innerHTML = ZODIAC_CONS.map(a => {
        const c = LORE.constellations[SKY.conNames[a]];
        return `<button class="atlas-chip ${a === atlas.con ? 'atlas-chip-active' : ''}" data-con="${a}" title="${SKY_LORE[a]?.title || SKY.conNames[a]}">
            <span>${c?.symbol || '✧'}</span> ${SKY.conNames[a]}</button>`;
    }).join('');
    document.querySelectorAll('[data-figure]').forEach(b => b.classList.toggle('seg-active', b.dataset.figure === atlas.figure));
    document.querySelectorAll('[data-orient]').forEach(b => b.classList.toggle('seg-active', b.dataset.orient === atlas.orient));
    document.querySelectorAll('[data-atlas-layer]').forEach(cb => { cb.checked = atlas.layers[cb.dataset.atlasLayer]; });
}

function atlasZoomBy(factor, clientX, clientY) {
    const chart = document.getElementById('atlas-chart');
    const rect = chart.getBoundingClientRect();
    const target = Math.max(0.5, Math.min(12, atlas.zoom * factor));
    const k = target / atlas.zoom;
    if (clientX !== undefined) {
        // Keep the point under the cursor fixed: screen = centre + pan + s·p
        const qx = clientX - rect.left - rect.width / 2, qy = clientY - rect.top - rect.height / 2;
        atlas.panX = qx - (qx - atlas.panX) * k;
        atlas.panY = qy - (qy - atlas.panY) * k;
    } else {
        atlas.panX *= k; atlas.panY *= k;
    }
    atlas.zoom = target;
    renderAtlas();
}

function bindAtlas() {
    loadAtlas();
    document.getElementById('view-switch').addEventListener('click', e => {
        const b = e.target.closest('[data-view]');
        if (b) setView(b.dataset.view);
    });

    const view = document.getElementById('atlas-view');
    view.addEventListener('click', e => {
        const t = e.target.closest('[data-con],[data-figure],[data-orient],[data-atlas-zoom],[data-atlas-action],[data-atlas-time]');
        if (!t) return;
        const d = t.dataset;
        if (d.con) selectConstellation(d.con);
        else if (d.figure) { atlas.figure = d.figure; saveAtlas(); syncAtlasControls(); renderAtlas(); }
        else if (d.orient) {
            atlas.orient = d.orient;
            if (d.orient === 'sky' && !state.location) useGeolocation();
            atlas.panX = atlas.panY = 0;
            saveAtlas(); syncAtlasControls(); renderAtlas();
        }
        else if (d.atlasZoom) { if (d.atlasZoom === 'reset') { atlas.zoom = 1; atlas.panX = atlas.panY = 0; renderAtlas(); } else atlasZoomBy(d.atlasZoom === 'in' ? 1.5 : 1 / 1.5); }
        else if (d.atlasAction === 'locate') useGeolocation();
        else if (d.atlasTime === 'now') resetToNow();
        else if (d.atlasTime) changeTime(Number(d.atlasTime.slice(0, -1)), { h: 'hour', d: 'day', M: 'month' }[d.atlasTime.slice(-1)]);
    });
    view.addEventListener('change', e => {
        const k = e.target.dataset.atlasLayer;
        if (k) { atlas.layers[k] = e.target.checked; saveAtlas(); renderAtlas(); }
    });

    // Chart interaction: click stars, hover tooltips, wheel zoom, drag pan.
    const chart = document.getElementById('atlas-chart');
    chart.addEventListener('wheel', e => { e.preventDefault(); atlasZoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY); }, { passive: false });
    chart.addEventListener('dblclick', e => { e.preventDefault(); atlasZoomBy(2, e.clientX, e.clientY); });
    let drag = null;
    chart.addEventListener('pointerdown', e => { if (!e.target.closest('button')) drag = { x: e.clientX, y: e.clientY, moved: false }; });
    chart.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        if (!drag.moved) { drag.moved = true; chart.setPointerCapture(e.pointerId); chart.classList.add('panning'); hideTooltip(); }
        atlas.panX += dx; atlas.panY += dy;
        drag.x = e.clientX; drag.y = e.clientY;
        renderAtlas();
    });
    const endDrag = () => { if (drag?.moved) chart.dataset.dragged = '1'; drag = null; chart.classList.remove('panning'); };
    chart.addEventListener('pointerup', endDrag);
    chart.addEventListener('pointercancel', endDrag);
    chart.addEventListener('click', e => {
        if (chart.dataset.dragged) { delete chart.dataset.dragged; return; }
        const star = e.target.closest('.a-star');
        if (star) return handleStarClick(Number(star.dataset.hip));
        const planet = e.target.closest('.a-planet');
        if (planet) return openDetail('planets', planet.dataset.id);
        const con = e.target.closest('.a-con-label');
        if (con) return selectConstellation(con.dataset.con);
    });
    const svg = document.getElementById('atlas-svg');
    svg.addEventListener('mouseover', e => {
        const star = e.target.closest('.a-star');
        if (star) showTooltip(e, 'skystar', star.dataset.hip);
    });
    svg.addEventListener('mousemove', e => { if (e.target.closest('.a-star')) moveTooltip(e); });
    svg.addEventListener('mouseout', e => { if (e.target.closest('.a-star')) hideTooltip(); });

    // Links from the info panel into the atlas
    document.getElementById('info-sidebar').addEventListener('click', e => {
        const open = e.target.closest('[data-atlas-open]');
        if (open) { setView('atlas'); selectConstellation(open.dataset.atlasOpen, false); return; }
        const star = e.target.closest('[data-atlas-star]');
        if (star && star.dataset.atlasCon && SKY.figures.rey[star.dataset.atlasCon] !== undefined) {
            setView('atlas');
            if (atlas.con !== star.dataset.atlasCon) selectConstellation(star.dataset.atlasCon, false);
            atlas.selected = Number(star.dataset.atlasStar);
            renderAtlas();
        }
    });

    new ResizeObserver(() => renderAtlas()).observe(chart);
    setView(['atlas', 'moon'].includes(state.view) ? state.view : 'wheel');
}

// North Indian chart: a second style for the Wheel view. Rashi (D1) and Navamsa (D9) diamonds,
// always sidereal (Lahiri) with whole-sign houses, whatever the zodiac mode of the rest of the app.
// Depends on app.js (state, current, ayanamsa, localFrame, nakshatraOf, GRAHAS, DRISHTI, BODY, LORE, openDetail,
// moveTooltip, hideTooltip) and aspects.js (COMBUST).

const KUNDLI_KEY = 'astrodynamics.kundli.v1';
const kundli = { outer: false, sel: null, hover: null }; // sel = { chart, house } clicked; hover = { chart, id } planet under the pointer

const KUNDLI_ABBR = {
    Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa',
    NorthNode: 'Ra', SouthNode: 'Ke', Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl'
};
// Lords of the twelve signs (traditional, no outer planets).
const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
// Vedic dignities by sign index. mt = [sign, from°, to°] moolatrikona range. Rahu/Ketu exaltation follows one common convention.
const VEDIC_DIGNITY = {
    Sun: { exalt: 0, own: [4], mt: [4, 0, 20] },
    Moon: { exalt: 1, own: [3], mt: [1, 3, 30] },
    Mars: { exalt: 9, own: [0, 7], mt: [0, 0, 12] },
    Mercury: { exalt: 5, own: [2, 5], mt: [5, 15, 20] },
    Jupiter: { exalt: 3, own: [8, 11], mt: [8, 0, 10] },
    Venus: { exalt: 11, own: [1, 6], mt: [6, 0, 15] },
    Saturn: { exalt: 6, own: [9, 10], mt: [10, 0, 20] },
    NorthNode: { exalt: 1, own: [] },
    SouthNode: { exalt: 7, own: [] }
};

// The twelve houses on a unit square (-1..1, y down): polygon and the inner corner where the sign number sits.
// House 1 is the top diamond; houses run anticlockwise (2 is the top-left triangle).
const KUNDLI_HOUSES = [
    [[0, 0], [-.5, -.5], [0, -1], [.5, -.5]],
    [[-1, -1], [0, -1], [-.5, -.5]],
    [[-1, -1], [-.5, -.5], [-1, 0]],
    [[0, 0], [-.5, -.5], [-1, 0], [-.5, .5]],
    [[-1, 0], [-.5, .5], [-1, 1]],
    [[-1, 1], [-.5, .5], [0, 1]],
    [[0, 0], [-.5, .5], [0, 1], [.5, .5]],
    [[0, 1], [.5, .5], [1, 1]],
    [[1, 1], [.5, .5], [1, 0]],
    [[0, 0], [.5, .5], [1, 0], [.5, -.5]],
    [[1, 0], [.5, -.5], [1, -1]],
    [[1, -1], [.5, -.5], [0, -1]]
].map(poly => {
    const c = [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
    const diamond = poly.length === 4, side = !diamond && Math.abs(c[0]) > Math.abs(c[1]); // side = tall narrow triangle (3, 5, 9, 11)
    const inner = diamond ? [0, 0] : poly.find(p => Math.abs(p[0]) === .5);
    const lerp = (t) => [c[0] + (inner[0] - c[0]) * t, c[1] + (inner[1] - c[1]) * t];
    return {
        poly, diamond, side, centre: c,
        label: lerp(diamond ? .66 : side ? .92 : .78),
        content: lerp(diamond ? -.08 : side ? .18 : -.1),
        rows: diamond || side ? 5 : 3, height: diamond ? 46 : side ? 44 : 30
    };
});
const KS = 100; // chart half-size in SVG units

function loadKundli() {
    try {
        const saved = JSON.parse(localStorage.getItem(KUNDLI_KEY) || '{}');
        if (typeof saved.outer === 'boolean') kundli.outer = saved.outer;
    } catch (e) { /* defaults */ }
}
const saveKundli = () => localStorage.setItem(KUNDLI_KEY, JSON.stringify({ outer: kundli.outer }));

const navamsaSign = lon => Math.floor(norm360(lon) / (30 / 9)) % 12;

// Dignity of a graha in a sign; deg (degrees into the sign) is null for divisional charts, where only sign dignities apply.
function vedicDignity(id, sign, deg) {
    const d = VEDIC_DIGNITY[id];
    if (!d) return null;
    if (d.mt && deg !== null && d.mt[0] === sign && deg >= d.mt[1] && deg < d.mt[2]) return 'Moolatrikona';
    if (d.exalt === sign) return 'Exalted';
    if ((d.exalt + 6) % 12 === sign) return 'Debilitated';
    if (d.own.includes(sign)) return 'Own sign';
    return null;
}

function combustLimit(id, retro) {
    if (id === 'Mercury' && retro) return 12;
    if (id === 'Venus' && retro) return 8;
    return COMBUST[id] || 0;
}

function kundliData() {
    const date = state.date, pos = current.pos, ayan = ayanamsa(date);
    const lagna = state.location ? norm360(localFrame(date, state.location).asc - ayan) : null;
    const ref = lagna ?? pos.Moon.sid;
    const ids = [...GRAHAS, ...(kundli.outer ? ['Uranus', 'Neptune', 'Pluto'] : [])];
    const grahas = ids.map(id => {
        const p = pos[id], lon = p.sid, sign = signIndex(lon), deg = lon % 30, nav = navamsaSign(lon);
        const retro = p.retro && !BODY[id].node;
        const sep = Math.abs(wrap180(lon - pos.Sun.sid)), limit = combustLimit(id, retro);
        return {
            id, lon, sign, deg, nav, retro, sep,
            combust: limit > 0 && sep < limit, limit,
            dignity: vedicDignity(id, sign, deg), navDignity: vedicDignity(id, nav, null),
            vargottama: sign === nav, nak: nakshatraOf(lon)
        };
    });
    return { lagna, ayan, chandra: lagna === null, d1: signIndex(ref), d9: navamsaSign(ref), grahas };
}

// House (1..12) that a sign occupies when the ascendant sign is asc.
const houseFromAsc = (sign, asc) => ((sign - asc + 12) % 12) + 1;
const signOfHouse = (house, asc) => (asc + house - 1) % 12;

// Houses a graha aspects (graha drishti), counted from its own house.
function kundliAspects(id, house) {
    if (!GRAHAS.includes(id)) return [];
    return (DRISHTI[id] || [7]).map(n => ({ n, house: ((house + n - 2) % 12) + 1 }));
}

const kpt = ([x, y]) => [x * KS, y * KS];
const kfmt = n => n.toFixed(1);

function kundliSvg(chart, d) {
    const asc = d[chart], d1 = chart === 'd1';
    const signOf = g => d1 ? g.sign : g.nav;
    const items = Array.from({ length: 12 }, () => []);
    if (!d.chandra) items[0].push({ asc: true });
    for (const g of d.grahas) items[houseFromAsc(signOf(g), asc) - 1].push(g);

    // Which houses and planets light up: a selected house shows who aspects it; a hovered planet shows what it aspects.
    const lit = new Set(), casters = new Set(), arrows = [];
    const sel = kundli.sel?.chart === chart ? kundli.sel.house : null;
    if (sel) {
        lit.add(sel);
        for (const g of d.grahas) {
            const h = houseFromAsc(signOf(g), asc);
            for (const a of kundliAspects(g.id, h)) if (a.house === sel) { casters.add(g.id); arrows.push({ from: h, to: sel, id: g.id, n: a.n }); }
        }
    }
    const hov = kundli.hover?.chart === chart ? d.grahas.find(g => g.id === kundli.hover.id) : null;
    if (hov) {
        const h = houseFromAsc(signOf(hov), asc);
        for (const a of kundliAspects(hov.id, h)) { lit.add(a.house); arrows.push({ from: h, to: a.house, id: hov.id, n: a.n }); }
    }

    const out = [];
    out.push(`<defs><marker id="k-arrow-${chart}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>`);
    out.push(`<rect x="${-KS}" y="${-KS}" width="${2 * KS}" height="${2 * KS}" fill="#0f172a" stroke="#f59e0b" stroke-width="1.4" rx="1"/>`);
    KUNDLI_HOUSES.forEach((h, i) => {
        const house = i + 1, on = lit.has(house), picked = sel === house;
        const pts = h.poly.map(p => kpt(p).map(kfmt).join(',')).join(' ');
        out.push(`<polygon points="${pts}" data-k-house="${chart}:${house}" fill="${picked ? 'rgba(245,158,11,0.22)' : on ? 'rgba(56,189,248,0.13)' : house === 1 ? 'rgba(245,158,11,0.06)' : 'transparent'}" stroke="#b45309" stroke-width="0.9" style="cursor:pointer"/>`);
    });
    // Sign numbers (1 = Aries … 12 = Pisces), the way the chart is traditionally written.
    KUNDLI_HOUSES.forEach((h, i) => {
        const [x, y] = kpt(h.label), sign = signOfHouse(i + 1, asc);
        out.push(`<text x="${kfmt(x)}" y="${kfmt(y)}" text-anchor="middle" dominant-baseline="central" font-size="7.5" fill="${i === 0 ? '#fbbf24' : '#64748b'}" font-weight="${i === 0 ? 700 : 500}" style="pointer-events:none">${sign + 1}</text>`);
    });
    for (const a of arrows) {
        const [x1, y1] = kpt(KUNDLI_HOUSES[a.from - 1].content), [x2, y2] = kpt(KUNDLI_HOUSES[a.to - 1].content);
        if (a.from === a.to) continue;
        const sx = x1 + (x2 - x1) * .12, sy = y1 + (y2 - y1) * .12, ex = x1 + (x2 - x1) * .86, ey = y1 + (y2 - y1) * .86;
        out.push(`<line x1="${kfmt(sx)}" y1="${kfmt(sy)}" x2="${kfmt(ex)}" y2="${kfmt(ey)}" stroke="${BODY[a.id].color}" stroke-width="1.1" stroke-opacity="0.85" ${a.n !== 7 ? 'stroke-dasharray="3,2"' : ''} marker-end="url(#k-arrow-${chart})" style="pointer-events:none"/>`);
    }
    items.forEach((list, i) => {
        if (!list.length) return;
        const h = KUNDLI_HOUSES[i];
        // Side triangles are too narrow for two columns: they stack and shrink instead.
        const cols = list.length > h.rows && !h.side ? 2 : 1, rows = Math.ceil(list.length / cols);
        const fs = Math.min(8, h.height / rows), lh = fs * 1.18, colW = d1 ? 27 : 17;
        const [cx, cy] = kpt(h.content);
        list.forEach((g, k) => {
            const col = cols === 2 ? k % 2 : 0, row = cols === 2 ? Math.floor(k / 2) : k;
            const x = cx + (cols === 2 ? (col - .5) * colW : 0), y = cy + (row - (rows - 1) / 2) * lh;
            out.push(kundliLabel(g, chart, x, y, fs, casters));
        });
    });
    return out.join('');
}

function kundliLabel(g, chart, x, y, fs, casters) {
    const d1 = chart === 'd1', sup = `font-size="${kfmt(fs * .62)}" dy="${kfmt(-fs * .32)}"`;
    if (g.asc) {
        const deg = d1 && kundli.data.lagna !== null ? ` ${Math.floor(kundli.data.lagna % 30)}°` : '';
        return `<text x="${kfmt(x)}" y="${kfmt(y)}" text-anchor="middle" dominant-baseline="central" font-size="${kfmt(fs)}" fill="#fbbf24" font-weight="700" style="pointer-events:none">La${deg}</text>`;
    }
    const dig = d1 ? g.dignity : g.navDignity;
    const marks = [];
    if (dig === 'Exalted') marks.push('<tspan fill="#4ade80">↑</tspan>');
    if (dig === 'Debilitated') marks.push('<tspan fill="#f87171">↓</tspan>');
    const tags = [g.retro ? 'R' : '', d1 && g.combust ? 'c' : ''].filter(Boolean).join('');
    const strong = casters.has(g.id) || (kundli.hover?.chart === chart && kundli.hover.id === g.id);
    return `<text x="${kfmt(x)}" y="${kfmt(y)}" text-anchor="middle" dominant-baseline="central" font-size="${kfmt(fs)}" fill="${BODY[g.id].color}" font-weight="${strong ? 800 : 600}" ${strong ? 'text-decoration="underline"' : ''} data-k-planet="${chart}:${g.id}" style="cursor:pointer">${KUNDLI_ABBR[g.id]}${d1 ? `<tspan fill="#94a3b8" font-weight="400"> ${Math.floor(g.deg)}°</tspan>` : ''}${marks.join('')}${tags ? `<tspan ${sup} fill="#fcd34d">${tags}</tspan>` : ''}</text>`;
}

function kundliTip(chart, id) {
    const d = kundli.data, g = d.grahas.find(x => x.id === id), b = BODY[id];
    const d1 = chart === 'd1', asc = d[chart], sign = d1 ? g.sign : g.nav;
    const dig = d1 ? g.dignity : g.navDignity;
    const asp = kundliAspects(id, houseFromAsc(sign, asc));
    return `<div class="font-semibold" style="color:${b.color}">${b.symbol} ${b.name} <span class="text-slate-400 font-normal">${LORE.planets[id].sanskrit || ''}</span></div>
        <div>${d1 ? `${Math.floor(g.deg)}°${String(Math.floor((g.deg % 1) * 60)).padStart(2, '0')}′ ` : 'Navamsa: '}${ZODIAC[sign]} · ${ordinal(houseFromAsc(sign, asc))} house</div>
        ${d1 ? `<div class="text-xs text-slate-400">${g.nak.name} pada ${g.nak.pada}</div>` : ''}
        ${dig ? `<div class="text-xs ${dig === 'Debilitated' ? 'text-rose-300' : 'text-emerald-300'}">${dig}</div>` : ''}
        ${g.vargottama ? '<div class="text-xs text-amber-300">Vargottama (same sign in D1 and D9)</div>' : ''}
        ${g.retro ? '<div class="text-xs text-amber-300">Retrograde (vakri)</div>' : ''}
        ${d1 && g.combust ? `<div class="text-xs text-amber-300">Combust (asta): ${g.sep.toFixed(1)}° from the Sun, limit ${g.limit}°</div>` : ''}
        ${asp.length ? `<div class="text-xs text-sky-300">Aspects houses ${asp.map(a => a.house).join(', ')}</div>` : ''}`;
}

// The card under the charts for a clicked house: sign, lord, occupants and who aspects it.
function kundliHouseInfo(d) {
    const box = document.getElementById('kundli-info');
    if (!kundli.sel) {
        box.innerHTML = `<p class="text-xs text-slate-500">Click a house to see its sign, its lord and which grahas aspect it. Hover a graha to see the houses it aspects.</p>`;
        return;
    }
    const { chart, house } = kundli.sel, asc = d[chart], d1 = chart === 'd1';
    const signOf = g => d1 ? g.sign : g.nav;
    const sign = signOfHouse(house, asc), name = ZODIAC[sign], lore = LORE.houses[house];
    const lord = SIGN_LORD[sign], lordG = d.grahas.find(g => g.id === lord);
    const inside = d.grahas.filter(g => signOf(g) === sign);
    const aspecting = [];
    for (const g of d.grahas) for (const a of kundliAspects(g.id, houseFromAsc(signOf(g), asc))) if (a.house === house) aspecting.push({ g, n: a.n });
    const pl = id => `<button class="font-semibold hover:underline" style="color:${BODY[id].color}" data-k-open="${id}">${BODY[id].symbol} ${BODY[id].name}</button>`;
    box.innerHTML = `
        <div class="flex items-baseline justify-between gap-2">
            <div class="text-sm font-semibold text-amber-300">${ordinal(house)} house · ${lore.sanskrit} <span class="text-slate-500 font-normal text-xs">${d1 ? 'Rashi' : 'Navamsa'}</span></div>
            <button class="text-xs text-slate-500 hover:text-white" data-k-clear>✕</button>
        </div>
        <div class="text-xs text-slate-400 mt-0.5">${signSymbol(name)} ${name} (${LORE.zodiac[name].sanskrit}, sign ${sign + 1}) · ${lore.vedicGroup}</div>
        <ul class="text-sm text-slate-300 mt-2 flex flex-col gap-1">
            <li><span class="text-slate-500">Lord:</span> ${pl(lord)} sits in the ${ordinal(houseFromAsc(signOf(lordG), asc))} house (${ZODIAC[signOf(lordG)]})${lordG && signOf(lordG) === sign ? ', in its own house' : ''}</li>
            <li><span class="text-slate-500">In it:</span> ${inside.length ? inside.map(g => pl(g.id)).join(', ') : 'no grahas'}</li>
            <li><span class="text-slate-500">Aspected by:</span> ${aspecting.length ? aspecting.map(a => `${pl(a.g.id)} <span class="text-slate-500 text-xs">(${ordinal(a.n)} aspect${a.n !== 7 ? ', special' : ''})</span>`).join(', ') : 'no graha drishti'}</li>
        </ul>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed">${lore.vedic}</p>`;
}

function kundliTable(d) {
    const dig = x => x ? `<span class="${x === 'Debilitated' ? 'text-rose-300' : 'text-emerald-300'}">${x}</span>` : '<span class="text-slate-600">–</span>';
    const rows = d.grahas.map(g => {
        const notes = [g.retro ? 'Retrograde' : '', g.combust ? `Combust (${g.sep.toFixed(1)}°)` : '', g.vargottama ? 'Vargottama' : ''].filter(Boolean).join(' · ');
        return `<tr class="border-t border-slate-800">
            <td class="py-1 pr-2 whitespace-nowrap"><button class="hover:underline" style="color:${BODY[g.id].color}" data-k-open="${g.id}">${BODY[g.id].symbol} ${BODY[g.id].name}</button></td>
            <td class="pr-2 whitespace-nowrap">${signSymbol(ZODIAC[g.sign])} ${Math.floor(g.deg)}°${String(Math.floor((g.deg % 1) * 60)).padStart(2, '0')}′</td>
            <td class="pr-2 whitespace-nowrap text-slate-400">${g.nak.name} ${g.nak.pada}</td>
            <td class="pr-2 text-center">${houseFromAsc(g.sign, d.d1)}</td>
            <td class="pr-2 whitespace-nowrap">${signSymbol(ZODIAC[g.nav])} ${ZODIAC[g.nav]}</td>
            <td class="pr-2 whitespace-nowrap">${dig(g.dignity)}</td>
            <td class="text-xs text-amber-300/90">${notes}</td>
        </tr>`;
    }).join('');
    const lagnaRow = d.chandra ? '' : `<tr class="border-t border-slate-800">
            <td class="py-1 pr-2 text-amber-300 font-semibold">Lagna</td>
            <td class="pr-2 whitespace-nowrap">${signSymbol(ZODIAC[d.d1])} ${Math.floor(d.lagna % 30)}°${String(Math.floor((d.lagna % 1) * 60)).padStart(2, '0')}′</td>
            <td class="pr-2 text-slate-400">${nakshatraOf(d.lagna).name} ${nakshatraOf(d.lagna).pada}</td>
            <td class="pr-2 text-center">1</td>
            <td class="pr-2">${signSymbol(ZODIAC[d.d9])} ${ZODIAC[d.d9]}</td><td></td><td></td></tr>`;
    document.getElementById('kundli-table').innerHTML = `
        <table class="w-full text-sm">
            <thead><tr class="text-[11px] uppercase tracking-wide text-slate-500 text-left">
                <th class="pb-1 font-medium">Graha</th><th class="font-medium">Rashi</th><th class="font-medium">Nakshatra</th>
                <th class="font-medium text-center">Bhava</th><th class="font-medium">Navamsa</th><th class="font-medium">Dignity</th><th class="font-medium">Notes</th>
            </tr></thead>
            <tbody>${lagnaRow}${rows}</tbody>
        </table>`;
}

function renderKundli() {
    if (state.view !== 'wheel' || state.chartStyle !== 'north' || !current.pos) return;
    const d = kundli.data = kundliData();
    document.getElementById('kundli-d1').innerHTML = kundliSvg('d1', d);
    document.getElementById('kundli-d9').innerHTML = kundliSvg('d9', d);
    const lagnaText = d.chandra
        ? `<span class="text-amber-300">Chandra Lagna</span>: no birthplace set, so the Moon's sign is used as the 1st house. <button class="text-sky-300 hover:text-white" data-k-locate>Set a location</button> for the real Lagna.`
        : `Lagna ${signSymbol(ZODIAC[d.d1])} ${ZODIAC[d.d1]} ${Math.floor(d.lagna % 30)}° · Navamsa Lagna ${ZODIAC[d.d9]}`;
    document.getElementById('kundli-meta').innerHTML = `Sidereal · Lahiri ayanamsa ${fmtOrb(d.ayan)} · whole-sign houses · ${lagnaText}
        ${state.mode !== 'sidereal' ? `<div class="mt-1 text-slate-500">The side panel is in ${state.mode} mode. <button class="text-sky-300 hover:text-white" data-k-sidereal>Switch it to sidereal</button> to match this chart.</div>` : ''}`;
    document.getElementById('kundli-outer').checked = kundli.outer;
    kundliHouseInfo(d);
    kundliTable(d);
}

function setChartStyle(style) {
    state.chartStyle = style;
    saveSettings();
    const north = style === 'north';
    document.getElementById('wheel-style').classList.toggle('hidden', north);
    document.getElementById('kundli-view').classList.toggle('hidden', !north);
    document.getElementById('zoom-controls').classList.toggle('hidden', north);
    document.body.classList.toggle('kundli-open', north && state.view === 'wheel');
    document.querySelectorAll('[data-chart-style]').forEach(b => b.classList.toggle('seg-active', b.dataset.chartStyle === style));
    hideTooltip();
    renderKundli();
}

function bindKundli() {
    loadKundli();
    document.querySelectorAll('[data-chart-style]').forEach(b => b.addEventListener('click', () => setChartStyle(b.dataset.chartStyle)));
    const box = document.getElementById('kundli-view');
    box.addEventListener('click', e => {
        const t = e.target;
        const planet = t.closest('[data-k-planet]'), house = t.closest('[data-k-house]'), open = t.closest('[data-k-open]');
        if (planet) openDetail('planets', planet.dataset.kPlanet.split(':')[1]);
        else if (house) {
            const [chart, h] = house.dataset.kHouse.split(':');
            kundli.sel = kundli.sel?.chart === chart && kundli.sel.house === Number(h) ? null : { chart, house: Number(h) };
            renderKundli();
        } else if (open) openDetail('planets', open.dataset.kOpen);
        else if (t.closest('[data-k-clear]')) { kundli.sel = null; renderKundli(); }
        else if (t.closest('[data-k-sidereal]')) setMode('sidereal');
        else if (t.closest('[data-k-locate]')) useGeolocation();
    });
    box.addEventListener('mouseover', e => {
        const planet = e.target.closest('[data-k-planet]');
        const key = planet?.dataset.kPlanet || null;
        if (key === (kundli.hover ? `${kundli.hover.chart}:${kundli.hover.id}` : null)) return;
        if (!key) { kundli.hover = null; hideTooltip(); renderKundli(); return; }
        const [chart, id] = key.split(':');
        kundli.hover = { chart, id };
        renderKundli();
        const tip = document.getElementById('tooltip');
        tip.innerHTML = kundliTip(chart, id);
        tip.classList.remove('hidden');
        moveTooltip(e);
    });
    box.addEventListener('mousemove', e => { if (kundli.hover) moveTooltip(e); });
    box.addEventListener('mouseleave', () => { kundli.hover = null; hideTooltip(); renderKundli(); });
    document.getElementById('kundli-outer').addEventListener('change', e => { kundli.outer = e.target.checked; saveKundli(); renderKundli(); });
    setChartStyle(state.chartStyle);
}

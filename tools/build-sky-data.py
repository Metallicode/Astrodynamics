#!/usr/bin/env python3
"""Bake open star data into a single offline sky-data.js for the Atlas view.

Usage: put the source files below in this folder, then run  python3 build-sky-data.py ../sky-data.js
(rey.json = western_rey/index.json, western.json = western/index.json from github.com/Stellarium/stellarium-skycultures;
 the rest from github.com/ofrohn/d3-celestial/tree/master/data)

Sources (downloaded once):
  d3-celestial (Olaf Frohn, BSD-3): stars.8.json, starnames.json, constellations.bounds.json,
      messier.json, dsos.bright.json
  Stellarium sky cultures (CC BY-SA): western_rey/index.json (H.A. Rey figures, Mike Richards & Georg Zotti),
      western/index.json (traditional figures)
"""
import json, sys, os

src = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]
load = lambda f: json.load(open(os.path.join(src, f)))

stars8 = {f['id']: f for f in load('stars.8.json')['features']}
names = load('starnames.json')
rey = load('rey.json')['constellations']
trad = load('western.json')['constellations']
bounds = load('constellations.bounds.json')['features']
messier = load('messier.json')['features']
bright = load('dsos.bright.json')['features']

MAG_LIMIT = 5.8
ra360 = lambda ra: round(ra % 360, 3)


def figures(culture, prefix):
    figs, labels = {}, {}
    for c in culture:
        abbr = c['id'].replace(prefix, '').strip()
        lines = [[h for h in l if isinstance(h, int)] for l in c['lines']]
        if len(abbr) > 3:  # Rey's body-part label anchors, e.g. "Tauc1" = horn
            name = c['common_name'].get('english')
            labels.setdefault(abbr[:3], []).append([lines[0][0], name])
            continue
        # keep only segments whose stars we have
        clean = []
        for l in lines:
            run = []
            for h in l:
                if h in stars8:
                    run.append(h)
                else:
                    if len(run) > 1: clean.append(run)
                    run = []
            if len(run) > 1: clean.append(run)
        figs[abbr] = clean
    return figs, labels


rey_figs, rey_labels = figures(rey, 'CON western_rey')
trad_figs, _ = figures(trad, 'CON western')
con_names = {c['iau']: c['common_name'].get('native') or c['common_name']['english'] for c in trad if c.get('iau')}
con_names.setdefault('TrA', 'Triangulum Australe')
# The cultures spell a few ids differently ('Uma', 'Tra') and Rey adds asterisms (Big Dipper, Great Square):
# map ids onto the 88 IAU abbreviations case-insensitively and drop the rest.
iau = {f['id'].lower(): f['id'] for f in bounds}
rey_figs = {iau[k.lower()]: v for k, v in rey_figs.items() if k.lower() in iau}
trad_figs = {iau[k.lower()]: v for k, v in trad_figs.items() if k.lower() in iau}

needed = set()
for figs in (rey_figs, trad_figs):
    for lines in figs.values():
        for l in lines: needed.update(l)
for labs in rey_labels.values():
    for hip, _ in labs: needed.add(hip)

star_rows, star_names = [], {}
for hip, f in stars8.items():
    mag = f['properties']['mag']
    if mag > MAG_LIMIT and hip not in needed:
        continue
    ra, dec = f['geometry']['coordinates']
    bv = f['properties'].get('bv')
    try: bv = round(float(bv), 2)
    except (TypeError, ValueError): bv = None
    star_rows.append([hip, ra360(ra), round(dec, 3), round(mag, 2), bv])
    n = names.get(str(hip))
    if n and (n.get('name') or n.get('desig')):
        star_names[hip] = [n.get('name', ''), n.get('desig', ''), n.get('flam', ''), n.get('c', '')]
star_rows.sort(key=lambda r: r[3])

con_bounds = {}
for f in bounds:  # Serpens comes in two pieces (Caput and Cauda), so each entry is a list of polygons
    con_bounds.setdefault(f['id'], []).append([[ra360(p[0]), round(p[1], 3)] for p in f['geometry']['coordinates'][0]])

dsos = []
for f in messier:
    p = f['properties']
    ra, dec = f['geometry']['coordinates']
    dsos.append([p['name'], p.get('alt') or '', p['type'], p['mag'], ra360(ra), round(dec, 3), p.get('dim', '')])
for f in bright:  # Hyades & co. aren't Messier objects
    p = f['properties']
    if p['desig'] in ('Mel 25', 'Mel 111', 'Cr 399', 'GalCtr'):
        ra, dec = f['geometry']['coordinates']
        alt = {'Mel 25': 'Hyades', 'Mel 111': 'Coma Star Cluster', 'Cr 399': 'Coathanger', 'GalCtr': 'Galactic Centre'}[p['desig']]
        dsos.append([p['desig'], alt, p['type'], p['mag'] if p['mag'] != 999 else None, ra360(ra), round(dec, 3), p.get('dim', '')])

data = {
    'stars': star_rows,          # [hip, ra°, dec°, mag, b-v] J2000, brightest first
    'names': star_names,         # hip -> [proper name, bayer/designation, flamsteed, constellation]
    'figures': {'rey': rey_figs, 'traditional': trad_figs},  # abbr -> [[hip, hip, ...], ...] polylines
    'figureLabels': rey_labels,  # abbr -> [[hip, body part]] from H.A. Rey's figures
    'bounds': con_bounds,        # abbr -> [[[ra°, dec°], ...], ...] IAU boundary polygon(s)
    'conNames': con_names,       # abbr -> Latin name
    'dsos': dsos                 # [id, name, type, mag, ra°, dec°, size']
}

with open(out, 'w') as fh:
    fh.write('// Generated by build.py from open data. Do not edit by hand.\n')
    fh.write('// Stars, names, IAU boundaries, Messier objects: d3-celestial (c) Olaf Frohn, BSD-3-Clause\n')
    fh.write('//   (Hipparcos / Yale Bright Star catalogues, IAU WGSN names).\n')
    fh.write('// Constellation figures: Stellarium sky cultures, CC BY-SA. H.A. Rey figures by Mike Richards & Georg Zotti,\n')
    fh.write('//   after H.A. Rey, "The Stars: A New Way to See Them" (1952).\n')
    fh.write('const SKY = ')
    json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
print(len(star_rows), 'stars,', len(star_names), 'names,', len(dsos), 'dsos,', os.path.getsize(out), 'bytes')

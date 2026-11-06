// Aspects view lore: minor aspects, the deeper reading of each aspect, cycle phases, patterns and the Learn articles.
// Depends on lore.js (LORE.aspects). Framed as astrological tradition, not prediction.

// Minor aspects join LORE.aspects so the detail pages, tooltips and wheel lines treat them like the majors.
Object.assign(LORE.aspects, {
    semisextile: {
        name: "Semi-sextile", symbol: "⚺", angle: 30, orb: 2, nature: "Adjusting", minor: true,
        keywords: ["Neighbours", "Mild friction", "Small growth"],
        classic: "Planets 30° apart, in neighbouring signs that share neither element nor modality. Faint but real: a nagging sense that two parts of life don't quite talk to each other, which rewards small, steady adjustments.",
        vedic: "The 2nd/12th sign relationship (dvirdvadasha) is considered uneasy in compatibility matching, but Jyotish casts no drishti on adjacent signs."
    },
    semisquare: {
        name: "Semi-square", symbol: "∠", angle: 45, orb: 2, nature: "Challenging", minor: true,
        keywords: ["Irritation", "Friction", "Prodding"],
        classic: "Half a square: 45° apart. It works like a pebble in the shoe, a minor but persistent irritation that prods you into action before things build into a crisis.",
        vedic: "No equivalent. Jyotish counts whole signs, and 45° is not a whole number of signs."
    },
    sesquiquadrate: {
        name: "Sesquiquadrate", symbol: "⚼", angle: 135, orb: 2, nature: "Challenging", minor: true,
        keywords: ["Agitation", "Pressure", "Overreach"],
        classic: "A square and a half: 135° apart. Restless and agitated, it tends to show as overdoing, pushing too hard or a pressure that releases suddenly.",
        vedic: "No equivalent. 135° falls in the middle of a sign relationship, so drishti ignores it."
    },
    quintile: {
        name: "Quintile", symbol: "Q", angle: 72, orb: 2, nature: "Creative", minor: true,
        keywords: ["Talent", "Style", "Craft"],
        classic: "One fifth of the circle, introduced by Kepler. The fifth harmonic is linked with creativity, skill and personal style: a gift that shows when it is practised.",
        vedic: "No equivalent. The fifth harmonic is a Renaissance European addition."
    },
    biquintile: {
        name: "Bi-quintile", symbol: "bQ", angle: 144, orb: 2, nature: "Creative", minor: true,
        keywords: ["Refined skill", "Insight", "Mastery"],
        classic: "Two fifths of the circle. Like the quintile it marks talent, often a more inward, intellectual or unusual one that matures with time.",
        vedic: "No equivalent. Like the quintile, it comes from Kepler."
    }
});

const ASPECT_LORE = {
    // Per aspect: harmonic (circle ÷ N), the sign relationship it normally joins, and how it plays out.
    aspects: {
        conjunction: {
            harmonic: 1, ptolemaic: true, signs: 0,
            relation: "Same sign: same element, modality and polarity.",
            feel: "fused, intense and hard to tell apart",
            practice: "The two planets act as one. Whatever one does, the other is involved. As a transit it starts something.",
            gift: "Concentrated power and a fresh start between the two principles.",
            shadow: "Too close to see clearly: the planets can blur, and the stronger one can swamp the weaker.",
            waxing: "", waning: ""
        },
        semisextile: {
            harmonic: 12, signs: 1,
            relation: "Neighbouring signs: nothing in common (different element, modality and polarity).",
            feel: "slightly out of step",
            practice: "Small, practical adjustments between the two planets' areas of life.",
            gift: "Gradual growth through attention to detail.",
            shadow: "Easy to ignore until it becomes a habit of friction.",
            waxing: "Waxing (30°): the first sprout. The new cycle has to separate from the past.",
            waning: "Waning (330°): the last step before a new cycle. Something must be let go."
        },
        semisquare: {
            harmonic: 8, signs: 1.5,
            relation: "One and a half signs: no consistent sign relationship.",
            feel: "irritated and prodded",
            practice: "A minor obstacle or irritation that asks for a small effort.",
            gift: "Early warning: deal with it now, before it becomes a square.",
            shadow: "Chronic low-level stress.",
            waxing: "Waxing (45°): the crescent push. Momentum has to be found against old habits.",
            waning: "Waning (315°): the balsamic release. Clear away what is finished."
        },
        sextile: {
            harmonic: 6, ptolemaic: true, signs: 2,
            relation: "Two signs apart: compatible elements (fire–air or earth–water), same polarity, different modality.",
            feel: "friendly and stimulating",
            practice: "Opportunities that open when you act on them. Cooperation, useful contacts, good ideas.",
            gift: "Easy cooperation between the two principles, if you take the initiative.",
            shadow: "Opportunities that go unused, because nothing forces the issue.",
            waxing: "Waxing (60°): the opportunity to build. The cycle finds its first allies and tools.",
            waning: "Waning (300°): the opportunity to share. What was learnt is passed on or reorganised."
        },
        quintile: {
            harmonic: 5, signs: 2.4,
            relation: "About two and a half signs: no consistent sign relationship.",
            feel: "creative and individual",
            practice: "A talent or knack that combines the two planets in an original way.",
            gift: "Craft, style and inventiveness.",
            shadow: "Obsessive perfectionism around the gift.",
            waxing: "Waxing (72°): the talent emerges.",
            waning: "Waning (288°): the talent is refined and taught."
        },
        square: {
            harmonic: 4, ptolemaic: true, signs: 3,
            relation: "Three signs apart: same modality (cardinal, fixed or mutable), clashing elements and opposite polarity.",
            feel: "tense, frustrated and driven",
            practice: "Friction and obstacles that force decisions and action. Squares make things happen.",
            gift: "Strength, achievement and growth built through effort.",
            shadow: "Conflict, stress and repeating the same struggle.",
            waxing: "Waxing square (90°), crisis in action: the new cycle meets resistance from outside and must push through and commit.",
            waning: "Waning square (270°), crisis in consciousness: what was built is challenged from inside. Beliefs and structures must be reorganised or released."
        },
        trine: {
            harmonic: 3, ptolemaic: true, signs: 4,
            relation: "Four signs apart: same element (fire, earth, air or water) and same polarity.",
            feel: "easy and flowing",
            practice: "Things go smoothly between the two planets. Talent, ease and support.",
            gift: "Natural ability, grace and good timing.",
            shadow: "Complacency: with no friction, the talent may never be developed.",
            waxing: "Waxing trine (120°): the plan flows. Growth comes naturally and the cycle expands.",
            waning: "Waning trine (240°): the harvest is shared. Understanding flows into teaching and wisdom."
        },
        sesquiquadrate: {
            harmonic: 8, signs: 4.5,
            relation: "Four and a half signs: no consistent sign relationship.",
            feel: "agitated and over-pressured",
            practice: "Pressure that tempts you to overdo it, or sudden disruptions.",
            gift: "The push to rebalance before things tip over.",
            shadow: "Overreach and burnout.",
            waxing: "Waxing (135°), gibbous: the cycle must be analysed and perfected before it can culminate.",
            waning: "Waning (225°), disseminating: what was gained must be shared, even when that is uncomfortable."
        },
        biquintile: {
            harmonic: 5, signs: 4.8,
            relation: "Almost five signs: no consistent sign relationship.",
            feel: "inventive and unusual",
            practice: "A subtle or unusual talent that matures with practice.",
            gift: "Mastery and creative insight.",
            shadow: "A talent that stays hidden or eccentric.",
            waxing: "Waxing (144°): creativity serves the cycle's growth.",
            waning: "Waning (216°): creativity reinterprets what has been achieved."
        },
        quincunx: {
            harmonic: 12, signs: 5,
            relation: "Five signs apart: different element, modality and polarity, with nothing in common.",
            feel: "awkward and out of sync",
            practice: "Two needs that don't fit together and can't be fought or merged: they ask for constant adjustment. Often linked with health, work and routines.",
            gift: "Adaptability and creative compromise.",
            shadow: "Chronic discomfort and the sense that something never quite works.",
            waxing: "Waxing (150°): adjustment before the peak. The plan is tweaked to meet reality.",
            waning: "Waning (210°): adjustment after the peak. Results are reworked into something usable."
        },
        opposition: {
            harmonic: 2, ptolemaic: true, signs: 6,
            relation: "Six signs apart: complementary elements (fire–air or earth–water) and the same modality and polarity.",
            feel: "polarised, seesawing and aware",
            practice: "A tug of war, often played out through other people. It brings awareness, negotiation or culmination.",
            gift: "Perspective and balance: seeing yourself in the mirror of the other.",
            shadow: "Projection, stalemate or swinging between extremes.",
            waxing: "", waning: ""
        }
    },

    // Rudhyar's eight phases of any two-planet cycle, by the faster planet's lead over the slower.
    phases: [
        { name: "New phase", from: 0, to: 45, key: "Seed", text: "The cycle has just begun at the conjunction. Action is instinctive and the purpose is still unclear: a time to start, not to analyse." },
        { name: "Crescent", from: 45, to: 90, key: "Struggle forward", text: "The new impulse must break free of the old patterns. Effort, determination and the first resources are needed." },
        { name: "First quarter", from: 90, to: 135, key: "Crisis in action", text: "The waxing square: the cycle meets the outside world and resistance. Decisions are made and structures built." },
        { name: "Gibbous", from: 135, to: 180, key: "Refinement", text: "Close to the peak, the work is analysed and improved. A phase of preparation and perfection." },
        { name: "Full phase", from: 180, to: 225, key: "Culmination", text: "The opposition: the cycle's meaning becomes visible. Results, relationships and awareness, for good or ill." },
        { name: "Disseminating", from: 225, to: 270, key: "Sharing", text: "What the cycle produced is distributed: teaching, spreading ideas, making it useful to others." },
        { name: "Last quarter", from: 270, to: 315, key: "Crisis in consciousness", text: "The waning square: the old structures no longer fit. Beliefs are reoriented and things are dismantled." },
        { name: "Balsamic", from: 315, to: 360, key: "Release", text: "The end of the cycle and the seed of the next. Letting go, distilling and preparing for the coming conjunction." }
    ],

    // Natures used by the factor breakdown and the reading.
    natures: {
        Sun:     { kind: "luminary", class: "personal", weight: 1.0,  moiety: 7.5,  word: "a luminary" },
        Moon:    { kind: "luminary", class: "personal", weight: 1.0,  moiety: 6,    word: "a luminary" },
        Mercury: { kind: "neutral",  class: "personal", weight: 0.8,  moiety: 3.5,  word: "neutral, taking on the colour of what it touches" },
        Venus:   { kind: "benefic",  class: "personal", weight: 0.8,  moiety: 3.5,  word: "the lesser benefic" },
        Mars:    { kind: "malefic",  class: "personal", weight: 0.8,  moiety: 4,    word: "the lesser malefic" },
        Jupiter: { kind: "benefic",  class: "social",   weight: 0.7,  moiety: 4.5,  word: "the greater benefic" },
        Saturn:  { kind: "malefic",  class: "social",   weight: 0.7,  moiety: 4.5,  word: "the greater malefic" },
        Uranus:  { kind: "outer",    class: "outer",    weight: 0.5,  moiety: 2.5,  word: "an outer planet, disruptive" },
        Neptune: { kind: "outer",    class: "outer",    weight: 0.5,  moiety: 2.5,  word: "an outer planet, dissolving" },
        Pluto:   { kind: "outer",    class: "outer",    weight: 0.5,  moiety: 2.5,  word: "an outer planet, transforming" },
        ASC:     { kind: "angle",    class: "angle",    weight: 0.9,  moiety: 5,    word: "the Ascendant, the self and body" },
        MC:      { kind: "angle",    class: "angle",    weight: 0.9,  moiety: 5,    word: "the Midheaven, career and direction" }
    },

    classes: {
        personal: "personal planets (Sun to Mars) move fast and describe everyday character and events",
        social: "the social planets (Jupiter, Saturn) describe growth, duty and one's place in society",
        outer: "the outer planets (Uranus, Neptune, Pluto) move slowly and are read generationally, or through the planets they touch",
        angle: "the angles of a birth chart are among its most sensitive points"
    },

    patterns: {
        stellium: {
            name: "Stellium", icon: "✸",
            shape: "Three or more planets in one sign (some astrologers require four).",
            meaning: "A concentration of energy: the sign, and the house it occupies, become a dominant theme. Strong focus, at the risk of imbalance."
        },
        grandTrine: {
            name: "Grand Trine", icon: "△",
            shape: "Three planets each 120° apart, usually all in one element: an equilateral triangle.",
            meaning: "A closed circuit of ease and talent in that element. Protective and gifted, but self-contained: it needs a challenging aspect to put it to work."
        },
        tSquare: {
            name: "T-Square", icon: "⊤",
            shape: "Two planets in opposition, both square a third (the apex).",
            meaning: "The most dynamic pattern: tension from the opposition is discharged through the apex planet. The empty point opposite the apex shows the balancing quality to develop."
        },
        grandCross: {
            name: "Grand Cross", icon: "✚",
            shape: "Four planets in two oppositions, all square one another, usually in one modality.",
            meaning: "Pressure from every direction. Exhausting but enormously strong: a life or a moment of constant challenges that builds resilience."
        },
        yod: {
            name: "Yod", icon: "Y",
            shape: "Two planets in sextile, both quincunx a third (the apex): the 'Finger of God'.",
            meaning: "A pointing, fated-feeling configuration: the apex planet carries a special task that demands constant adjustment."
        },
        kite: {
            name: "Kite", icon: "◇",
            shape: "A Grand Trine with a fourth planet opposite one corner and sextile the other two.",
            meaning: "The opposition gives the easy Grand Trine a tail and a direction, turning talent into achievement."
        },
        mysticRectangle: {
            name: "Mystic Rectangle", icon: "▭",
            shape: "Two oppositions joined by two sextiles and two trines: a rectangle.",
            meaning: "Tension held in a practical, workable balance. The oppositions are eased by the harmonious sides."
        }
    },

    // The "divide the circle" explorer.
    harmonics: {
        1: "Unity. The conjunction: two principles fused into one.",
        2: "Polarity. The opposition: awareness through contrast and the other.",
        3: "Flow. The trine: ease, enjoyment and natural talent.",
        4: "Tension. The square: effort, conflict and building things in the world.",
        5: "Creativity. The quintile family, added by Kepler: talent, style, skill.",
        6: "Cooperation. The sextile: opportunities that come through effort and contact.",
        7: "Inspiration. The septile (51.4°), used in harmonic astrology: fate, vision and the irrational.",
        8: "Friction. Semi-square and sesquiquadrate: the square's restless smaller cousins.",
        9: "Fulfilment. The novile (40°), used in harmonic and Vedic navamsha thinking: completion and joy.",
        10: "Skill. The decile (36°): half-quintiles, talent put to practical use.",
        11: "Excess. The undecile (32.7°): rarely used, linked with going beyond limits.",
        12: "Adjustment. Semi-sextile and quincunx: unrelated signs that must find a way to work together."
    },

    strengthNote: "One common convention, not a law: orb tightness counts most, then how important the aspect is, whether it is applying, and the planets involved. Astrologers weight these differently, which is why every factor is shown separately.",

    orbNotes: {
        modern: "Modern orbs belong to the aspect: 8° for conjunctions and oppositions, 7° for squares and trines, 5° for sextiles, 3° for the quincunx and 2° for the minor aspects. The Sun or Moon adds 2° (1° for the quincunx and the minors).",
        moiety: "Traditional moieties belong to the planet: each has a half-orb, its 'light', and two planets are in aspect when their lights touch, so the orb is the sum of the two moieties. Values follow the common medieval set (Abu Ma'shar, al-Biruni; Lilly's differ a little): Sun 7½°, Moon 6°, Jupiter and Saturn 4½°, Mars 4°, Venus and Mercury 3½°. The outer planets, unknown then, get 2½°. The quincunx and the minor aspects, which came later, get a third of the sum."
    },

    learn: [
        {
            title: "Dividing the circle", tag: "Geometry",
            text: "Every aspect is the circle divided by a whole number, a harmonic. Divide by 1 and you get the conjunction, by 2 the opposition, by 3 the trine, by 4 the square, by 6 the sextile. Kepler added the fifths (quintile 72°, bi-quintile 144°) and the eighths (45° and 135°), and the twelfths give 30° and 150°. Astrologers read the number itself: 2 is awareness through polarity, 3 is ease and flow, 4 is tension and building, 5 is creative talent. Use the explorer below to see each division."
        },
        {
            title: "Why the signs matter", tag: "Elements & modalities",
            text: "Classical aspects connect signs as well as degrees. A trine joins signs of the same element (Aries, Leo, Sagittarius are all fire), which is why it flows. A square joins signs of the same modality but clashing elements, for example cardinal Aries and cardinal Cancer, fire against water, which is why it grinds. Sextiles join compatible elements (fire–air, earth–water). Oppositions join complementary signs of the same modality and polarity. The quincunx and semi-sextile join signs with nothing in common. An aspect that crosses a sign boundary, for example a trine from 29° Aries to 1° Virgo, is out of sign (dissociate) and is thought to be weaker or mixed."
        },
        {
            title: "Orbs: how close is close?", tag: "Orbs",
            text: "Planets rarely sit exactly 90° apart, so each aspect has an orb: how far from exact it still counts. The tighter the orb, the stronger the aspect, and within 1° (or in the same degree number, the traditional partile) it is at full strength. Modern astrology assigns orbs to aspects, while traditional astrology gave each planet its own sphere of light (moiety). Switch between them in the toolbar and watch aspects appear and disappear."
        },
        {
            title: "Applying, exact, separating", tag: "Motion",
            text: "An aspect is applying while the faster planet moves towards exactness and separating once it has passed. Applying aspects are building and point to coming events; separating aspects are fading and describe what has already happened. Retrograde motion can turn one aspect into a triple pass: exact, separating, applying again, exact again, which is common with the outer planets over a year."
        },
        {
            title: "Waxing and waning", tag: "Cycles",
            text: "The same angle means different things on the way out and on the way back. Every pair of planets runs a cycle from conjunction to conjunction, just like the Sun and Moon, whose cycle is the lunar phase. The first-quarter Moon is a waxing Sun–Moon square and the last-quarter Moon a waning one. Dane Rudhyar named eight phases for any such cycle: new, crescent, first quarter, gibbous, full, disseminating, last quarter and balsamic."
        },
        {
            title: "Ptolemy, Kepler and the minors", tag: "History",
            text: "Hellenistic astrology, codified by Ptolemy in the 2nd century, used five aspects: conjunction, sextile, square, trine and opposition, justified by musical ratios and sign geometry. In the early 1600s Johannes Kepler, astronomer and astrologer, added the quintile, bi-quintile and sesquiquadrate on harmonic grounds. The semi-sextile, semi-square and quincunx became standard later. Modern harmonic astrology extends the idea to any division of the circle."
        },
        {
            title: "Western aspects vs Vedic drishti", tag: "Jyotish",
            text: "Western aspects are angles measured in degrees and mostly symmetrical. Vedic drishti (sight) is cast from sign to sign and is not always mutual: every graha looks at the 7th sign from itself, while Mars also aspects the 4th and 8th, Jupiter the 5th and 9th, and Saturn the 3rd and 10th. So Saturn can aspect Venus without Venus aspecting Saturn. Switch to sidereal mode to see both side by side in the factor breakdown."
        },
        {
            title: "Transits to a birth chart", tag: "Timing",
            text: "A transit is a moving planet making an aspect to a fixed point in a birth chart. The slow planets matter most: Saturn's square to its own birth position (around ages 7, 21, 36 and 50) and its return (around 29 and 58) are classic life markers. Add a chart in the toolbar to see transits to it in the grid, the calendar and the Lab."
        }
    ]
};

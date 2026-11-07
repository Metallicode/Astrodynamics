// Lore for the Pair view (pair.js): how two charts meet, the relationship profile, and the harmonic spectrum.
// Synastry readings follow common modern practice; the spectrum and echoes are this app's own experiment.

const PAIR_LORE = {
    // What each point brings into a relationship.
    themes: {
        Sun: "sense of self", Moon: "emotional needs", Mercury: "way of thinking and talking", Venus: "way of loving",
        Mars: "drive and desire", Jupiter: "faith and generosity", Saturn: "sense of duty and limits",
        Uranus: "need for freedom", Neptune: "dreams and ideals", Pluto: "depth and power",
        ASC: "presence and body", MC: "path in life"
    },

    verbs: {
        conjunction: "merges with", sextile: "encourages", square: "rubs against", trine: "flows easily with",
        opposition: "faces and mirrors", quincunx: "has to keep adjusting to", semisextile: "nudges",
        semisquare: "irritates", sesquiquadrate: "unsettles", quintile: "sparks creatively with",
        biquintile: "plays creatively with", parallel: "echoes", contraparallel: "counterbalances"
    },

    // Notes for well-known contacts, keyed by the two point ids sorted alphabetically.
    pairs: {
        "Moon|Sun": "The classic marriage signature: one person's conscious self meets the other's emotional needs. It is the oldest compatibility test in the books.",
        "Mars|Venus": "The attraction signature: desire meets receptivity. Even the hard aspects usually register as chemistry.",
        "Moon|Moon": "Emotional rhythm: how alike your moods, habits and needs for comfort are.",
        "Sun|Sun": "Two identities. Harmony means similar aims; tension means different temperaments that can still respect each other.",
        "Moon|Venus": "Tenderness: affection and emotional care come naturally between you.",
        "Sun|Venus": "Liking and admiration: one person's self is easy for the other to appreciate.",
        "Mercury|Mercury": "How you talk: similar or clashing ways of thinking and speaking.",
        "Mars|Mars": "Two drives: shared energy and projects, or competition.",
        "Mars|Moon": "Feelings meet drive: protective warmth, or quick, touchy reactions.",
        "Mars|Sun": "Energy meets identity: motivation or friction, often both.",
        "Mercury|Moon": "Understanding: words that land on feelings, for better or worse.",
        "Mercury|Sun": "Mental rapport: one person's ideas suit the other's sense of purpose.",
        "Moon|Saturn": "Security and duty: steady, loyal care, or one person feeling held back or judged.",
        "Saturn|Venus": "Love made serious: lasting commitment, or affection that feels rationed.",
        "Saturn|Sun": "Respect and responsibility: a mentor-like bond, or pressure and control.",
        "ASC|Sun": "One person's self shines straight onto the other's presence: noticed at once.",
        "ASC|Moon": "Instant familiarity: one feels at home with the way the other comes across.",
        "ASC|Venus": "Physical liking: one finds the other's looks and manner attractive.",
        "ASC|Mars": "Physical spark, or bristling on first contact.",
        "ASC|ASC": "The two of you meet the world in related styles."
    },
    planets: {
        Jupiter: "Jupiter contacts bring generosity, encouragement and growth, sometimes excess.",
        Saturn: "Saturn contacts are the glue and the weight of a relationship: commitment, duty and time, and sometimes restriction or criticism.",
        Uranus: "Uranus contacts bring excitement and surprise, and the need for space.",
        Neptune: "Neptune contacts bring romance, compassion and idealism, and sometimes illusion.",
        Pluto: "Pluto contacts bring intensity, fascination and transformation, and sometimes power struggles.",
        MC: "Contacts to the Midheaven touch each other's direction and public life."
    },

    profile: {
        harmony: { name: "Harmony", color: "#4ade80", types: "trines, sextiles, quintiles, bi-quintiles and semi-sextiles",
            text: "Ease: what comes naturally, where you support each other without trying." },
        friction: { name: "Friction", color: "#f87171", types: "squares, oppositions, quincunxes, semi-squares and sesquiquadrates",
            text: "Tension: where you push each other. It is the source of growth as much as of conflict; a relationship with none is often a pleasant but sleepy one." },
        intensity: { name: "Intensity", color: "#fbbf24", types: "conjunctions, parallels and contraparallels, and half of every opposition",
            text: "Fusion: how strongly you are bound together, whether it feels easy or hard." },
        note: "Each contact counts by its strength (how tight the orb is, which aspect it is, and which points it joins: luminaries and angles most, outer planets least), weighted again by tightness, so the many wide contacts any two charts share count little. Each bar compares this pair with 300 random pairs of births; the tick marks a typical pair. It measures how much of each quality there is, not how compatible you are."
    },

    // The overtone series: the k/n moment is a node of the n-th harmonic of a string stretched between the births.
    harmonics: {
        1: { interval: "unison", aspect: "conjunction" },
        2: { interval: "octave", aspect: "opposition" },
        3: { interval: "fifth (a twelfth)", aspect: "trine" },
        4: { interval: "two octaves", aspect: "square" },
        5: { interval: "major third", aspect: "quintile" },
        6: { interval: "fifth", aspect: "sextile" },
        7: { interval: "harmonic seventh", aspect: "septile" },
        8: { interval: "three octaves", aspect: "semi-square" },
        9: { interval: "major second", aspect: "novile" },
        10: { interval: "major third", aspect: "decile" },
        11: { interval: "eleventh harmonic (between a fourth and a tritone)", aspect: "undecile" },
        12: { interval: "fifth", aspect: "semi-sextile" }
    },

    sphere: "Each person's planets sit at their true positions in the sky: around the ecliptic (the equator here) and slightly above or below it by their ecliptic latitude. A is the inner shell, B the outer and \"Us\" the middle. Because direction is the sky position, the angle a thread makes at the centre is the aspect angle: a conjunction runs straight outward, an opposition passes through the centre.",
    spectrum: "Stretch a string from the earlier birth to the later one and let it vibrate. Its n-th overtone has still points (nodes) at 1/n, 2/n, … of its length. Each node is a moment in time and, between the birthplaces, a place: a real sky. Dividing by 2 to 12 gives 66 nodes, but only 45 different moments, because ½ = 2/4 = 3/6 = …. A moment shared by many divisions is a strong node, like a consonant interval in music.",
    echoes: "The same spacing continued past the later birth: the first echo is when the younger person is as old as the gap between you, and the others fall at simple fractions of the gap after that. Unlike the moments between the births, these are dates you can live through.",
    resonance: "How strongly a moment's sky aspects both birth charts at once: the geometric mean of its contacts to A and to B, so a sky that touches only one of you scores low.",
    experimental: "The ½ moment is the Davison relationship chart (Ronald Davison, 1977). The other divisions and the echoes are an experiment of this app, not a tradition: treat them as a way to explore the sky between two lives, not as established technique.",

    learn: [
        { title: "Why a sphere", text: "A chart wheel keeps only longitude. The planets also sit above or below the ecliptic (the Moon by up to 5°, Pluto by up to 17°), and they have a declination north or south of the celestial equator. The sphere keeps both. Use <b>Flatten</b> to watch it collapse into the familiar bi-wheel and see what the wheel throws away." },
        { title: "Reading the threads", text: "A thread joins a planet of A to a planet of B when they form an aspect. Its colour is the aspect, its thickness the strength. Click a point or a matrix cell to isolate its threads: the spokes from the centre show the aspect angle itself." },
        { title: "Parallels in declination", text: "Two planets at the same declination (both 12° north, say) are <b>parallel</b>, read like a conjunction. At opposite declinations (12° north and 12° south) they are <b>contraparallel</b>, read like an opposition. Turn on the celestial equator to see the bands. These contacts don't exist on a flat wheel." },
        { title: "Davison or composite", text: "The <b>Davison</b> chart is the sky at the midpoint in time between the births, seen from the midpoint between the birthplaces: a real moment, with real latitudes. The <b>composite</b> takes the midpoint of each pair of planets (Sun with Sun, Moon with Moon). It is popular and readable, but no sky ever looked like it, so on the sphere its points sit flat on the ecliptic." },
        { title: "The harmonic spectrum", text: "The Davison chart is the first term, ½, of a series: the moments that divide the time between your births by 2, 3, 4, … 12. They are the overtones of the string between two lives, and their numbers match the aspect harmonics: ½ is the opposition's harmonic, ⅓ the trine's, ¼ the square's. Strong nodes (shared by many divisions) are drawn bigger; bright ones resonate with both charts." },
        { title: "Echoes", text: "Continue the spacing past the later birth and the series keeps sounding: at one whole gap (the younger is as old as the gap), at 1½ gaps, two gaps, and so on. These are real future (or past) dates, and the sky at each can be compared with both charts like any transit." },
        { title: "A profile, not a score", text: "Compatibility percentages add up unlike things (an easy Moon trine and a fiery Mars square) into one false number. The profile keeps three separate measures: harmony, friction and intensity. Most long relationships show plenty of all three." },
        { title: "Birth times matter", text: "The Moon moves about 13° a day and the Ascendant about 1° every 4 minutes. Without accurate times and places, contacts to the Moon are uncertain by several degrees and the angles, horizons and houses can't be used at all." },
        { title: "Ashtakoot (Guna Milan)", text: "The Indian matching system compares the two <b>Moons</b> only: their nakshatras and sidereal signs, in eight tests worth 1 to 8 points, 36 in all. It is a test of temperament and fortune between two minds, not of the whole charts. Families traditionally read it with the Mangal Dosha check and an astrologer's view of both charts." },
        { title: "House overlays", text: "Put one person's planets into the other's houses and you see which part of their life you light up. Your Venus in their 7th makes you feel like a partner to them; your Saturn in their 1st can feel like judgment of who they are. The overlays are not symmetric: each direction is its own story." },
        { title: "Shared weather", text: "Two people under the same sky live through the same transits, but each chart catches them differently. When one slow planet touches both charts at once, you live the same theme at the same time: a common season, for better or worse. The Davison chart can be transited too, as the chart of the relationship itself." }
    ],

    ashtakoot: {
        // Per nakshatra (Ashwini … Revati): gana D(eva) / M(anushya) / R(akshasa), nadi A(di) / M(adhya) / N (Antya).
        gana: "DMRMDMDDRRMMDRDRDRRMMDRRMMD",
        nadi: "AMNNMAAMNNMAAMNNMAAMNNMAAMN",
        ganaNames: { D: "Deva (divine)", M: "Manushya (human)", R: "Rakshasa (fierce)" },
        nadiNames: { A: "Adi (vata)", M: "Madhya (pitta)", N: "Antya (kapha)" },
        animals: ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"],
        // Yoni animal (index into animals) and sex per nakshatra.
        yoni: [[0, "m"], [1, "m"], [2, "f"], [3, "m"], [3, "f"], [4, "f"], [5, "f"], [2, "m"], [5, "m"], [6, "m"], [6, "f"], [7, "m"], [8, "f"], [9, "f"],
               [8, "m"], [9, "m"], [10, "f"], [10, "m"], [4, "m"], [11, "m"], [12, "m"], [11, "f"], [13, "f"], [0, "f"], [13, "m"], [7, "f"], [1, "f"]],
        yoniTable: [
            [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
            [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
            [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
            [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
            [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
            [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
            [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
            [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
            [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
            [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
            [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
            [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
            [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
            [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4]
        ],
        // Varna rank of each sidereal Moon sign (Aries … Pisces): 4 Brahmin (water), 3 Kshatriya (fire), 2 Vaishya (earth), 1 Shudra (air).
        varna: [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4],
        varnaNames: { 4: "Brahmin", 3: "Kshatriya", 2: "Vaishya", 1: "Shudra" },
        // Vashya groups: C(hatushpada, four-footed), M(anava, human), J(alachara, water), V(anachara, wild), K(eeta, insect).
        vashyaNames: { C: "four-footed", M: "human", J: "water", V: "wild", K: "insect" },
        vashyaTable: {
            C: { C: 2, M: 1, J: 1, V: 0.5, K: 1 }, M: { C: 1, M: 2, J: 0.5, V: 0, K: 1 }, J: { C: 1, M: 0.5, J: 2, V: 1, K: 1 },
            V: { C: 0.5, M: 0, J: 1, V: 2, K: 0 }, K: { C: 1, M: 1, J: 1, V: 0, K: 2 }
        },
        // Natural friendships (naisargika maitri) of the sign lords.
        friends: {
            Sun: { f: ["Moon", "Mars", "Jupiter"], e: ["Venus", "Saturn"] },
            Moon: { f: ["Sun", "Mercury"], e: [] },
            Mars: { f: ["Sun", "Moon", "Jupiter"], e: ["Mercury"] },
            Mercury: { f: ["Sun", "Venus"], e: ["Moon"] },
            Jupiter: { f: ["Sun", "Moon", "Mars"], e: ["Mercury", "Venus"] },
            Venus: { f: ["Mercury", "Saturn"], e: ["Sun", "Moon"] },
            Saturn: { f: ["Mercury", "Venus"], e: ["Sun", "Moon", "Mars"] }
        },
        kootas: {
            varna: { name: "Varna", max: 1, about: "spiritual temperament: the class of the Moon sign" },
            vashya: { name: "Vashya", max: 2, about: "mutual influence: who draws whom" },
            tara: { name: "Tara", max: 3, about: "destiny: the count of nakshatras from one Moon to the other" },
            yoni: { name: "Yoni", max: 4, about: "instinct and intimacy: the nakshatras' animals" },
            maitri: { name: "Graha Maitri", max: 5, about: "mental friendship: whether the Moon signs' lords are friends" },
            gana: { name: "Gana", max: 6, about: "temperament: divine, human or fierce" },
            bhakoot: { name: "Bhakoot", max: 7, about: "welfare and family: the distance between the Moon signs" },
            nadi: { name: "Nadi", max: 8, about: "constitution and health: the nakshatras' dosha" }
        },
        bands: [
            [33, "excellent", "#4ade80"], [25, "good", "#a3e635"], [18, "acceptable", "#facc15"], [0, "traditionally not recommended", "#f87171"]
        ],
        note: "Scoring tables differ between schools (Vashya, Gana and Yoni especially) and many exceptions can cancel a dosha; this is one common reckoning, using the sidereal (Lahiri) Moon. Varna is the only test counted one way: traditionally from the groom's Moon to the bride's.",
        mangal: "Mangal (Kuja) Dosha: Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house counted from the Lagna or from the Moon. Tradition says the dosha is balanced when both partners have it. Many exceptions (Mars in its own or exaltation sign, for example) are not applied here."
    },

    // What a planet in someone's house lights up for them.
    overlays: {
        1: "their self-image and body: you are noticed at once, and you affect how they see themselves",
        2: "their money, values and sense of security",
        3: "their conversation, everyday ideas and short trips",
        4: "their home, family and roots: you can feel like family",
        5: "their romance, play, creativity and children: a classic attraction overlay",
        6: "their routines, work and health: practical help, or nagging",
        7: "their partnerships: the classic marriage house, where you feel like \"the other\"",
        8: "their intimacy, shared resources and deep change: intense",
        9: "their beliefs, travel and learning: you widen their world",
        10: "their career and public life: you touch their standing and direction",
        11: "their friendships, groups and hopes",
        12: "their hidden life, the unconscious and the spiritual: strong but hard to name"
    },
    overlayKeyHouses: [1, 4, 5, 7, 8],

    elements: {
        Fire: "enthusiasm, courage and drive", Earth: "practical sense, patience and stability",
        Air: "ideas, talk and perspective", Water: "feeling, intuition and intimacy",
        Cardinal: "starting things", Fixed: "sustaining things", Mutable: "adapting and letting go"
    },

    weather: {
        Mars: "a shared burst of energy: projects, desire, and quicker tempers",
        Jupiter: "a shared season of growth, luck and generosity",
        Saturn: "a shared test: commitments, responsibilities and reality checks",
        Uranus: "shake-ups, surprises and a need for more freedom, for both of you",
        Neptune: "dreams and ideals, and possible confusion or disillusion",
        Pluto: "deep change and questions of power and control",
        eclipse: "an eclipse on points in both charts: a turning point that marks you both"
    },

    // Cycle lengths (years) for the age-gap table.
    cycles: { Sun: 1, Mars: 1.881, Jupiter: 11.862, Saturn: 29.457, NorthNode: 18.613, Uranus: 84.02, Neptune: 164.8, Pluto: 248.0 }
};

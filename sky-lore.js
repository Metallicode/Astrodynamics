// Deep-dive lore for the Sky Atlas, keyed by IAU abbreviation.
//
// Stars are referred to by Hipparcos number (hip) or by Bayer letter within the constellation (star: 'α', 'γ1').
// anatomy:    where each star sits in the classical figure.
// astrology:  ptolemy = planetary natures from Ptolemy's Tetrabiblos I.9 (c. 150 AD), paraphrased;
//             fixedStars = traditional & modern fixed-star meanings; sign = constellation vs the sign of the
//             same name; nakshatras = Vedic lunar mansions on these stars.
// stars:      per-star notes. dist in light years; nature = Ptolemy's planetary nature; astro = astrological meaning.

const SKY_LORE = {
    Ari: {
        title: "The Ram",
        tagline: "A small, bent line of three stars: the head and curling horn of the ram with the golden fleece.",
        shape: [
            "Aries is mostly a short, crooked line of three stars about 4° long: <b>Hamal</b> (α, the brightest, orange), <b>Sheratan</b> (β) and little <b>Mesarthim</b> (γ).",
            "<b>Hamal is the head</b>. Sheratan and Mesarthim curl away from it as the <b>horn</b>, like a hockey stick.",
            "The rest of the ram is faint: <b>41 Arietis (Bharani)</b>, northeast of the line, marks the back, and <b>δ (Botein, 'the little belly')</b>, further east, the belly.",
            "The ram lies with its body toward Taurus and its head toward Pisces, looking back over its shoulder. Compare the Rey and Traditional figures: Rey links the faint stars into a full animal."
        ],
        memory: "Mnemonic: <b>\"A bent stick between the Pleiades and the Great Square: Hamal heads it.\"</b>",
        find: [
            { from: "The Pleiades", text: "Look about 20° west of the Pleiades for a lone orange 2nd-magnitude star: that's <b>Hamal</b>. The bent line runs from it toward the southwest." },
            { from: "Andromeda", text: "Below Andromeda's chain of stars (Alpheratz, Mirach, Almach) sits the small, narrow triangle of Triangulum. Just south of that is the bent line of Aries." },
            { from: "The Great Square of Pegasus", text: "Follow the Square's eastern side southward and veer east. Aries lies east of the Square, between it and the Pleiades." }
        ],
        season: "An autumn constellation in the north (spring in the south): best on evenings from October to January, and highest at midnight in late October. The Sun is in front of it from about 19 April to 14 May.",
        southern: "From the southern hemisphere Aries sits low in the northern sky, upside down: Hamal appears below and to the left of Sheratan.",
        ecliptic: "The ecliptic runs through the faint southern half of Aries, below the ram's head, so planets in Aries appear south of the bright line. About 2,000 years ago the March equinox point lay here. That is why tropical 0° is still called the 'First Point of Aries', even though the equinox has since drifted into Pisces.",
        myths: [
            { culture: "Greek", title: "The Ram with the Golden Fleece", text: "Phrixus and Helle were children threatened by their stepmother Ino. Their mother Nephele sent a flying golden ram to carry them away. Helle slipped off over the strait that took her name, the Hellespont. Phrixus reached Colchis, sacrificed the ram to Zeus and hung its fleece in a sacred grove, guarded by a dragon. Jason and the Argonauts later sailed to steal it." },
            { culture: "Babylonian", title: "The Hired Man (LÚ.ḪUN.GÁ)", text: "In the Babylonian star lists these stars were 'the Hired Man', the farm labourer, perhaps marking the start of the agricultural year at the spring equinox. The ram is a later reinterpretation, possibly from a mistranslation (Akkadian <i>agru</i> 'hired man' and <i>immeru</i> 'sheep')." },
            { culture: "Egyptian", title: "The ram of Amun", text: "The ram was sacred to Amun, king of the gods, often shown ram-headed. Many writers link the rise of Aries as the equinox constellation with the avenues of ram-sphinxes at Karnak." },
            { culture: "Vedic", title: "Ashwini and Bharani", text: "The ram's horn (β and γ) is <b>Ashwini</b>, the horse's head, ruled by the Ashvins, the twin divine physicians. The faint triangle at its back (35, 39 and 41 Arietis) is <b>Bharani</b>, the womb or 'bearer', ruled by Yama, lord of death and dharma. Ashwini starts the nakshatra cycle." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the ram's head are like Mars and Saturn; those in the mouth like Mercury and moderately Saturn; those in the hind foot like Mars; and those in the tail like Venus.",
            energy: "The energy of beginnings: the ram that charges first, the flock's leader and the sacrifice that starts a great quest. Its fixed stars are Martial-Saturnine, harsh and headstrong. They add drive, but also stubbornness and a tendency to force things. This is the raw, impatient fire of the zodiac's starting point.",
            sign: "Tropical Aries (21 March–20 April) now lies almost entirely over the stars of <b>Pisces</b>. Sidereal Aries covers these stars, the ram's head and the Pleiades' western edge. The sign is ruled by Mars, the Sun is exalted at 19°, and Saturn falls there.",
            fixedStars: [
                { star: "α", text: "<b>Hamal</b> (Mars–Saturn): independence, drive, the will to lead. Traditional texts warn of brutality and recklessness when its force has no outlet." },
                { star: "β", text: "<b>Sheratan</b> (Mars–Saturn): courage that meets resistance. Tradition links it with physical injury and defeat, modern readings with persistence through setbacks." },
                { star: "γ1", text: "<b>Mesarthim</b> (Mars–Saturn): one of the ram's horn stars: impulsive, quick action." }
            ],
            nakshatras: [
                { name: "Ashwini", stars: "β and γ Arietis", text: "The horse's head of the Ashvins: speed, healing, fresh starts. 0°–13°20′ sidereal Aries." },
                { name: "Bharani", stars: "35, 39 and 41 Arietis", text: "The bearer, ruled by Yama: restraint, carrying burdens, birth and death. 13°20′–26°40′ sidereal Aries." }
            ]
        },
        anatomy: [
            { star: "α", part: "Head" },
            { star: "β", part: "Horn" },
            { star: "γ1", part: "Tip of the horn" },
            { star: "c", part: "Back" },
            { star: "δ", part: "Belly" },
            { star: "ε", part: "Rump" }
        ],
        dsos: [
            { text: "<b>Mesarthim (γ Ari)</b>: one of the first double stars discovered with a telescope (Robert Hooke, 1664). Two equal white stars, easy in a small telescope." },
            { text: "Aries has no bright nebulae or clusters. It's a quiet patch away from the Milky Way, and its faint galaxies need large telescopes." }
        ],
        facts: [
            "Hamal is an orange giant about 66 light years away with a giant planet, discovered in 2011.",
            "Teegarden's Star, a red dwarf only 12.5 light years away with Earth-mass planets, lies in Aries.",
            "Hipparchus (2nd century BC) placed the March equinox in Aries. That's why the zodiac still 'starts' with the Ram."
        ],
        stars: {
            "α": { meaning: "Arabic al-ḥamal, 'the (full-grown) lamb'. The name of the whole constellation, given to its brightest star.", nature: "Mars and Saturn", dist: 66, type: "K2 III: orange giant", story: "The ram's head. It lies close to the ecliptic's north and was used for navigation.", astro: "Independence and drive; in traditional sources a forceful, sometimes violent star." },
            "β": { meaning: "Arabic al-sharaṭān, 'the two signs': β and γ together, which marked the equinox in antiquity.", nature: "Mars and Saturn", dist: 59, type: "A5 V: white main-sequence star", astro: "Courage tested by obstacles." },
            "γ1": { meaning: "Origin uncertain, possibly a corruption of an Arabic word for 'servant'.", nature: "Mars and Saturn", dist: 164, type: "Twin white stars (a fine telescopic double)" },
            "δ": { meaning: "Arabic al-buṭain, 'the little belly'.", nature: "Mars", dist: 170, type: "K2 III: orange giant" },
            "c": { meaning: "IAU name Bharani, from the nakshatra it marks.", dist: 160, type: "B8 V: blue-white star" }
        }
    },

    Tau: {
        title: "The Bull",
        tagline: "A charging bull of heaven: a V-shaped face, a fiery red eye and two long horns, with the Pleiades on its shoulder.",
        shape: [
            "Start with the <b>V of the Hyades</b>: a small, tight V of stars. That V is the bull's <b>face</b>, and its point (γ, the nose) faces west.",
            "The brightest star on the V, orange <b>Aldebaran</b>, is the bull's <b>angry red eye</b>. It sits on the V's southern arm, and ε (Ain) on the northern arm is the other eye.",
            "From the open end of the V, two <b>long horns</b> sweep east toward Orion and Auriga: the northern one ends at <b>Elnath (β)</b>, the southern one at <b>ζ (Tianguan)</b>. They are much longer than the face, and that's the giveaway.",
            "Northwest of the face, on the bull's <b>shoulder</b>, is the misty little dipper of the <b>Pleiades</b>.",
            "The Greeks drew only the <b>front half</b> of the bull, plunging out of the sea. The fainter stars west of the face (λ, ξ, ο) are its chest and folded forelegs. H.A. Rey's figure adds the full body."
        ],
        memory: "Mnemonic: <b>\"V for face, red for rage, two long horns, seven sisters on the shoulder.\"</b>",
        find: [
            { from: "Orion's Belt", text: "Follow the three belt stars to the upper right (lower left from the southern hemisphere). About 20° on, you reach orange <b>Aldebaran</b>. Keep going the same distance again and you land on the <b>Pleiades</b>." },
            { from: "Capella (Auriga)", text: "Bright yellow Capella sits high in winter skies. <b>Elnath</b>, the tip of the bull's northern horn, is the bottom corner of Auriga's pentagon. Older star maps shared it between both figures." },
            { from: "The Pleiades", text: "If you can spot the Pleiades (a tiny, hazy dipper), look about 14° southeast for the V of the Hyades and Aldebaran." }
        ],
        season: "Taurus is an autumn and winter constellation in the north (summer in the south). It rises in the east at dusk in late October and stands highest around midnight in late November and early December. It's an evening sight through March and lost in the Sun's glare from late April to June. The Sun passes in front of it from mid-May to late June.",
        southern: "From the southern hemisphere the bull is upside down: the V opens downward, the horns point down toward Orion (who is also upside down), and the Pleiades are below and to the left of Aldebaran.",
        ecliptic: "The ecliptic runs between the Pleiades and the Hyades. Old star lore calls this gap the <b>'Golden Gate of the Ecliptic'</b>, and the Moon and planets pass through it. The Moon regularly hides (occults) the Pleiades and Aldebaran, in multi-year series. A Pleiades series runs from 2023 to 2029.",
        myths: [
            { culture: "Babylonian", title: "The Bull of Heaven (GU₄.AN.NA)", text: "One of the oldest constellations, already in the Babylonian MUL.APIN star catalogue (c. 1000 BC, with older roots). In the <i>Epic of Gilgamesh</i>, the goddess Ishtar, spurned by Gilgamesh, persuades her father Anu to send the Bull of Heaven against him. Gilgamesh and Enkidu kill it, and Enkidu tears off its hindquarter and hurls it at the goddess. That's one reading of why the sky-bull has no back half." },
            { culture: "Greek", title: "Zeus and Europa", text: "Zeus fell for Europa, a Phoenician princess. He turned himself into a dazzling white bull and lay down gently among her father's herds. When Europa climbed onto his back he plunged into the sea and swam to Crete, where she bore Minos, the future king. Only the bull's front half shows in the sky because the rest is still under the waves." },
            { culture: "Age of Taurus", title: "The bull of the spring equinox", text: "From roughly 4000 to 1700 BC the Sun stood in Taurus at the March equinox, so the bull 'opened' the year. It is often linked with the bull cults of that era: the Apis bull of Memphis in Egypt, the Minoan bull-leapers of Crete, and the bull of heaven of Mesopotamia. A later theory reads the Roman Mithras slaying the bull as an image of precession ending the Age of Taurus." },
            { culture: "The Pleiades", title: "The Seven Sisters", text: "The seven daughters of Atlas and Pleione were pursued by Orion and turned into doves, then stars. He still chases them across the sky. Usually only six are easy to see, which gave rise to tales of a 'lost Pleiad'. Hesiod's <i>Works and Days</i> (c. 700 BC) tells farmers to harvest when the Pleiades rise at dawn and plough when they set. They are <b>Subaru</b> in Japan (the car logo shows them), and <b>Matariki</b> to the Māori, whose new year begins when they reappear before dawn in midwinter." },
            { culture: "The Hyades", title: "The Rainy Ones", text: "Half-sisters of the Pleiades. They wept so much for their brother Hyas, killed while hunting, that Zeus put them in the sky, and their name came to mean 'the rainy ones'. Their dawn and dusk risings and settings were said to bring the rainy seasons." },
            { culture: "Vedic", title: "Krittika and Rohini", text: "Two of the most important nakshatras lie here. <b>Krittika</b> (the Pleiades, 'the cutters') is ruled by Agni, god of fire: the six sisters who nursed the war god Kartikeya. <b>Rohini</b> ('the red one', Aldebaran) was the Moon's favourite of his 27 wives, the nakshatras. His preference angered her sisters' father Daksha, whose curse is one story behind the Moon's waxing and waning. The Moon is exalted in Taurus in both Vedic and Western astrology." }
        ],
        astrology: {
            ptolemy: "Ptolemy (<i>Tetrabiblos</i> I.9) gives Taurus' stars these planetary natures: the stars at the cut-off part are like the Moon and Saturn; the Pleiades like the Moon and Mars; Aldebaran, 'the bright reddish one of the Hyades called the Torch', like Mars; the other Hyades like Saturn and slightly like Mercury; and the horn tips like Mars.",
            energy: "The constellation's energy is the bull at its rawest: the fertile, earthy power of spring ploughing, but also the destructive Bull of Heaven that only heroes can face. Fixed-star astrology treats Taurus' bright stars as <b>Martial</b>: fierce, courageous, ambitious. That is far from the calm, Venusian sign of Taurus. The Pleiades add a lunar note of vision, grief and longing ('the weeping sisters').",
            sign: "Tropical Taurus (20 April–20 May) now lies mostly over the stars of <b>Aries</b>. Sidereal Taurus runs from the Pleiades through the Hyades to the base of the horns. The sign is ruled by Venus, and the Moon is exalted at 3°, which in the star-based zodiac falls close to the Pleiades. Aldebaran and the Pleiades are both among the 15 <b>Behenian stars</b> of medieval magic, each with its own gem and herb.",
            fixedStars: [
                { hip: 21421, text: "<b>Aldebaran</b>: honour, courage, eloquence and leadership, with success that can be lost through dishonesty or violence. In later lore it is one of the four 'Royal Stars' (with Regulus, Antares and Fomalhaut), the 'Watcher of the East'." },
                { hip: 17702, text: "<b>The Pleiades</b>: ambition and far-sight, but traditionally also sorrow, 'something to weep about' and, in classical medical astrology, trouble with the eyes when they rise with the Moon." },
                { hip: 25428, text: "<b>Elnath</b>, 'the butting one': drive and forcefulness, success through pushing ahead." },
                { hip: 26451, text: "<b>Tianguan (ζ)</b>, the southern horn: Mars-like force and risk. It's the 'celestial gate' where the 1054 supernova appeared." }
            ],
            nakshatras: [
                { name: "Krittika", stars: "the Pleiades", text: "The cutters, ruled by Agni (fire): sharp, purifying, protective. 26°40′ sidereal Aries–10° Taurus." },
                { name: "Rohini", stars: "Aldebaran and the Hyades", text: "The red one, the Moon's favourite: growth, beauty, fertility, abundance. 10°–23°20′ sidereal Taurus." },
                { name: "Mrigashira", stars: "λ and φ Orionis, near the horn tips", text: "The deer's head, ruled by Soma: searching, curiosity, gentleness. 23°20′ Taurus–6°40′ Gemini." }
            ]
        },
        anatomy: [
            { hip: 21421, part: "Eye (the fiery one)" },
            { hip: 20889, part: "Other eye" },
            { hip: 20205, part: "Nose / snout" },
            { hip: 20455, part: "Brow" },
            { hip: 20894, part: "Cheek" },
            { hip: 25428, part: "Tip of northern horn" },
            { hip: 26451, part: "Tip of southern horn" },
            { hip: 21881, part: "Northern horn" },
            { hip: 17702, part: "Shoulder (Pleiades)" },
            { hip: 18724, part: "Chest" },
            { hip: 18907, part: "Foreleg" },
            { hip: 19860, part: "Knee" },
            { hip: 15900, part: "Where the body is cut off" }
        ],
        dsos: [
            { text: "<b>M45, the Pleiades.</b> A young cluster (~100 million years) about 440 ly away. You can see 6–7 stars with the naked eye, and binoculars show dozens of blue-white stars. Long-exposure photos show a blue reflection nebula, a dust cloud the cluster is drifting through." },
            { text: "<b>The Hyades.</b> At ~150 ly it's the nearest open cluster to the Sun, about 625 million years old, and the V you see is its core. Aldebaran is <i>not</i> a member: it lies at less than half the distance, in the foreground." },
            { text: "<b>M1, the Crab Nebula.</b> About 1° northwest of ζ, the southern horn tip. It's the debris of a star that exploded in 1054 AD, recorded by Chinese astronomers as a 'guest star' visible in daylight for weeks. A pulsar spinning 30 times a second sits at its heart. It needs a telescope (magnitude 8.4)." }
        ],
        facts: [
            "Taurus is the 17th largest constellation and one of the earliest recorded: the bull figure is at least 3,000 years old.",
            "Aldebaran is a red giant about 44 times the Sun's diameter. NASA's Pioneer 10 probe is drifting in its general direction and would reach it in about two million years.",
            "θ¹ and θ² Tauri form a naked-eye double in the V, a good test for your eyesight.",
            "λ Tauri, on the bull's chest, is an eclipsing binary that dims noticeably every 3.95 days."
        ],
        stars: {
            21421: { meaning: "Arabic al-dabarān, 'the follower', because it follows the Pleiades across the sky. Greek Lampadias, 'the torch'. Vedic Rohini, 'the red one'.", ptolemy: "The bright, reddish star of the Hyades, on the southern eye.", nature: "Mars", dist: 65, type: "K5 III: orange giant, ~44× the Sun's diameter", story: "The bull's blazing eye. It looks like part of the Hyades but lies in front of them, at less than half their distance.", astro: "A Royal Star: honour, courage, eloquence, leadership; success that lasts only with integrity. A Behenian star (gem: ruby; plant: milk thistle)." },
            25428: { meaning: "Arabic al-naṭḥ, 'the butting (one)', the horn that butts.", ptolemy: "The star at the tip of the northern horn (shared with the charioteer's foot).", nature: "Mars", dist: 134, type: "B7 III: blue-white giant", story: "Older maps counted it in both Taurus and Auriga (as γ Aurigae). In 1930 the IAU gave it to Taurus.", astro: "Pushing forward, forcefulness, eminence through drive." },
            26451: { meaning: "IAU name Tianguan (天關), Chinese for 'Celestial Gate'.", ptolemy: "The star at the tip of the southern horn.", nature: "Mars", dist: 440, type: "B2 IV: hot blue star with a spinning gas disk (Be shell star)", story: "Chinese astronomers placed the 1054 supernova 'a few inches' from Tianguan. Its remnant is the Crab Nebula.", astro: "Martial force and the risk that comes with it." },
            20889: { meaning: "Arabic ʿayn, 'the eye'.", ptolemy: "The star on the northern eye.", nature: "Saturn, slightly Mercury", dist: 147, type: "K0 III: orange giant", story: "In 2007 a giant planet was found orbiting it, the first planet discovered in an open star cluster." },
            20205: { meaning: "Latin Prima Hyadum, 'first of the Hyades'.", ptolemy: "The star at the nostrils, the point of the V.", nature: "Saturn, slightly Mercury", dist: 154, type: "K0 III: orange giant", astro: "The Hyades: traditionally 'rainy' and turbulent stars, linked with upheaval and tears." },
            20455: { meaning: "Latin Secunda Hyadum, 'second of the Hyades'.", nature: "Saturn, slightly Mercury", dist: 153, type: "K0 III: orange giant" },
            20894: { meaning: "IAU name Chamukuy, a small bird in the Yucatec Maya language.", nature: "Saturn, slightly Mercury", dist: 150, type: "A7 III: white giant", story: "The brightest true member of the Hyades. With θ¹ it forms a naked-eye double on the bull's cheek." },
            17702: { meaning: "Greek Alcyone, one of the seven sisters (the Pleiades).", nature: "Moon and Mars", dist: 440, type: "B7 III: blue-white giant", story: "The brightest Pleiad, at the centre of the little dipper. In the 1800s it was briefly proposed as the 'central sun' of the universe.", astro: "The Pleiades: ambition and vision, but also grief and 'something to weep about'. A Behenian star group (gem: rock crystal; plant: fennel)." },
            18724: { meaning: "No proper name.", nature: "Moon and Saturn", dist: 480, type: "B3 V: eclipsing binary", story: "Two stars orbiting each other every 3.95 days, partly eclipsing and dimming the light from magnitude 3.4 to 3.9." }
        }
    },

    Gem: {
        title: "The Twins",
        tagline: "Two long stick figures side by side, holding hands, their heads the bright pair Castor and Pollux.",
        shape: [
            "Start with the two bright stars about 4.5° apart: white <b>Castor</b> and slightly brighter, orange <b>Pollux</b>. They are the <b>heads</b> of the twins.",
            "From each head a line of stars runs about 15° southwest toward Orion: the two <b>bodies</b>, standing side by side like a pair of stick figures.",
            "Castor's line passes his knee (ε, <b>Mebsuta</b>) and ends at his feet, <b>Tejat (μ)</b> and <b>Propus (η)</b>. Pollux's line passes his waist (<b>Wasat, δ</b>) and knee (<b>Mekbuda, ζ</b>) and ends at his foot, bright <b>Alhena (γ)</b>.",
            "The twins' feet stand on the Milky Way, right next to Orion's raised club and the tip of the bull's horn."
        ],
        memory: "Mnemonic: <b>\"Castor is Cool (white), Pollux is Punchy (orange and brighter): two heads toward Leo, feet in the Milky Way.\"</b>",
        find: [
            { from: "Orion", text: "Draw a line from Rigel up through Betelgeuse and keep going about the same distance: you reach the twins' heads, <b>Castor and Pollux</b>." },
            { from: "The Big Dipper", text: "A line from Megrez diagonally across the bowl through Merak points a long way southwest to Castor and Pollux." },
            { from: "Procyon", text: "Bright Procyon (Canis Minor) is south of the twins. Castor, Pollux and Procyon make a long, thin triangle." }
        ],
        season: "A winter constellation in the north (summer in the south): best on evenings from December to April, highest at midnight in early January. The Sun is in front of it from about 21 June to 20 July.",
        southern: "From the southern hemisphere the twins stand on their heads, low in the northern sky, with Castor and Pollux nearest the horizon.",
        ecliptic: "The ecliptic crosses the twins' feet, close to δ Geminorum (Wasat). The June solstice point, the Sun's most northerly position, now lies just west of Gemini, on its border with Taurus. It moved out of Gemini in 1990. Both Uranus (1781) and Pluto (1930) were discovered while passing through Gemini.",
        myths: [
            { culture: "Greek", title: "The Dioscuri: Castor and Pollux", text: "Twin sons of Leda, brothers of Helen of Troy. Castor, the horse tamer, was mortal (son of King Tyndareus). Pollux (Polydeuces), the boxer, was immortal, a son of Zeus. They sailed with the Argonauts. When Castor was killed, Pollux begged to share his immortality, so they alternate days between Olympus and the underworld. They became protectors of sailors, and the electrical glow on ship masts (St Elmo's fire) was taken as their sign." },
            { culture: "Babylonian", title: "The Great Twins (MAŠ.TAB.BA.GAL.GAL)", text: "The Babylonians already saw twins here: the gods Lugal-irra and Meslamta-ea, guardians of the gate of the underworld." },
            { culture: "Roman", title: "Gods of the Forum", text: "Rome credited the twins with a miraculous victory at Lake Regillus (5th century BC) and built them a temple in the Forum. Three of its columns still stand." },
            { culture: "Vedic", title: "Punarvasu", text: "Castor and Pollux are <b>Punarvasu</b>, 'the return of the light' or 'good again', ruled by Aditi, mother of the gods. It's the nakshatra of renewal and homecoming. Just west, Betelgeuse in Orion marks <b>Ardra</b>, the storm god Rudra's tear." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the twins' feet are like Mercury and moderately Venus; the bright stars in the thighs like Saturn; the bright star in the head of the leading twin (Castor) like Mercury; and the one in the head of the following twin (Pollux) like Mars.",
            energy: "Duality and connection: the mortal and the immortal sharing one life. Castor carries Mercury's wit, teaching and words, while Pollux carries Mars' strength and fighting spirit. The constellation speaks of siblings, partnerships, travel and the exchange between two halves of a self.",
            sign: "Tropical Gemini (21 May–20 June) now covers mostly the stars of <b>Taurus</b>: the Pleiades, Aldebaran and the horns. Sidereal Gemini reaches from Orion's club to Castor and Pollux. The sign is ruled by Mercury.",
            fixedStars: [
                { star: "α", text: "<b>Castor</b> (Mercury): intellect, writing, teaching, sudden fame, and also sudden loss. A 'twin' star with a gift for words." },
                { star: "β", text: "<b>Pollux</b> (Mars): boldness, a fighting spirit, a sharp tongue. The boxer: courage that can turn cruel." },
                { star: "γ", text: "<b>Alhena</b> (Mercury–Venus): an artistic or spiritual mission. Traditionally linked with the feet, it's the 'Achilles heel' star of modern fixed-star books." }
            ],
            nakshatras: [
                { name: "Ardra", stars: "Betelgeuse (in Orion, beside the twins' feet)", text: "The moist one, Rudra's storm: upheaval that clears the air. 6°40′–20° sidereal Gemini." },
                { name: "Punarvasu", stars: "Castor and Pollux", text: "Return of the light, ruled by Aditi: renewal, restoration, homecoming. 20° Gemini–3°20′ Cancer." }
            ]
        },
        anatomy: [
            { star: "α", part: "Head of Castor" },
            { star: "β", part: "Head of Pollux" },
            { star: "ε", part: "Castor's knee" },
            { star: "μ", part: "Castor's foot" },
            { star: "η", part: "Castor's forward foot" },
            { star: "δ", part: "Pollux's waist" },
            { star: "ζ", part: "Pollux's knee" },
            { star: "γ", part: "Pollux's foot" },
            { star: "ξ", part: "Pollux's other foot" },
            { star: "τ", part: "Castor's arm" },
            { star: "κ", part: "Pollux's arm" }
        ],
        dsos: [
            { text: "<b>M35</b>: a big open cluster near Castor's feet (η and μ), visible to the naked eye in a dark sky as a faint smudge. Binoculars show dozens of stars, and a small telescope shows a second, more distant cluster (NGC 2158) right next to it." },
            { text: "<b>Eskimo Nebula (NGC 2392)</b>: a planetary nebula near Wasat (δ) that looks like a face in a fur hood in a telescope." }
        ],
        facts: [
            "Castor is a sextuple star: three pairs of stars all orbiting each other.",
            "Pollux, at 34 light years, is the closest giant star to the Sun and has a planet, named Thestias.",
            "The Geminid meteor shower (13–14 December), one of the year's best, radiates from near Castor. Its parent body is the asteroid 3200 Phaethon."
        ],
        stars: {
            "α": { meaning: "Latin Castor, the mortal twin, a horse tamer.", nature: "Mercury", dist: 51, type: "A1 V: white; a six-star system", story: "Through a small telescope Castor splits into two white stars, and each of those (and a faint red companion) is itself double.", astro: "Intellect, eloquence, sudden fame and sudden loss." },
            "β": { meaning: "Latin Pollux (Greek Polydeuces), the immortal twin, a boxer.", nature: "Mars", dist: 34, type: "K0 III: orange giant with a planet", story: "Brighter than Castor even though it's labelled β. Bayer's letters don't always follow brightness.", astro: "Boldness, combat and a sharp, sometimes cruel tongue." },
            "γ": { meaning: "Arabic al-hanʿa, 'the brand' (a mark on a camel's neck).", nature: "Mercury and Venus", dist: 109, type: "A1 IV: white subgiant", story: "Pollux's foot, and the third-brightest star of the twins.", astro: "Purposeful, artistic or spiritual mission; vulnerable feet." },
            "ε": { meaning: "Arabic, 'the outstretched (paw)'.", nature: "Saturn", dist: 840, type: "G8 Ib: yellow supergiant" },
            "μ": { meaning: "Tejat Posterior, 'the back foot'.", nature: "Mercury and Venus", dist: 230, type: "M3 III: red giant" },
            "η": { meaning: "Greek Propus, 'the forward foot'.", nature: "Mercury and Venus", type: "M3 III: red giant, variable and eclipsing" },
            "δ": { meaning: "Arabic Wasat, 'the middle'.", nature: "Saturn", dist: 60, type: "F0 IV: white", story: "Pluto was found in 1930 on photographs taken near this star." },
            "ζ": { meaning: "Arabic Mekbuda, 'the folded (paw)'.", type: "G-type Cepheid variable", story: "A Cepheid: it swells and shrinks with a 10.15-day rhythm, changing brightness from magnitude 3.6 to 4.2." }
        }
    },

    Cnc: {
        title: "The Crab",
        tagline: "A faint upside-down Y between Gemini and Leo, with a glowing star cluster, the Beehive, at its heart.",
        shape: [
            "Cancer is the faintest zodiac constellation: no star is brighter than magnitude 3.5. Look for a dim <b>upside-down Y</b> between Pollux and Regulus.",
            "At its heart is the <b>Beehive (Praesepe, M44)</b>, a misty patch to the naked eye under a dark sky, flanked by two stars: the <b>Northern and Southern Donkeys</b>, γ and δ (Asellus Borealis and Australis).",
            "From δ two legs of the Y spread south: to <b>Acubens (α, 'the claw')</b> in the southeast and <b>Tarf (β)</b>, the brightest star, in the southwest.",
            "The stem of the Y runs north from γ to <b>ι Cancri</b>, the northern claw. Rey's figure turns all this into a crab with spread legs."
        ],
        memory: "Mnemonic: <b>\"Halfway from Pollux to Regulus, two donkeys feed at the Beehive.\"</b>",
        find: [
            { from: "Gemini and Leo", text: "Draw a line from Pollux to Regulus. The Beehive lies almost exactly halfway. It's a small hazy cloud to the eye, and dozens of stars in binoculars." },
            { from: "Procyon", text: "Procyon, Pollux and Regulus surround Cancer. It sits in the 'empty' area northeast of Procyon." }
        ],
        season: "A late-winter and spring constellation in the north: best on evenings from January to May, highest at midnight in late January to early February. The Sun is in front of it from about 20 July to 10 August.",
        southern: "From the southern hemisphere Cancer is low in the north on late-summer and autumn evenings, upside down. The Beehive is still easy in binoculars.",
        ecliptic: "The ecliptic passes just south of the Beehive, almost through δ Cancri (the Southern Donkey), so the Moon regularly occults δ and sometimes crosses the cluster itself. Planets pass right by the Beehive, a lovely sight in binoculars. About 2,000 years ago the Sun stood here at the June solstice, which is why the northern tropic is called the Tropic of Cancer.",
        myths: [
            { culture: "Greek", title: "Karkinos, Hera's crab", text: "While Heracles fought the many-headed Hydra, Hera sent a giant crab to distract him. It nipped his foot, and he crushed it under his heel. Hera rewarded its loyalty with a place in the sky, but a faint one, because it achieved so little." },
            { culture: "Greek", title: "The Donkeys and the Manger", text: "The two stars beside the Beehive are the Aselli, the donkeys ridden by Dionysus and Silenus into the war against the Giants. Their braying terrified the Giants into fleeing. The donkeys were set in the sky beside a manger (Praesepe, the Beehive)." },
            { culture: "Babylonian & Egyptian", title: "A crab, a turtle, a scarab", text: "The Babylonian AL.LUL was a crab or crayfish. Some Egyptian zodiacs show a scarab beetle here, the creature that rolls the Sun across the sky." },
            { culture: "Neoplatonic", title: "The Gate of Men", text: "Late-antique philosophers (Macrobius, after Porphyry) taught that souls descend into birth through Cancer, the 'Gate of Men', and return through Capricorn, the 'Gate of the Gods'. The Beehive was the cloud of waiting souls." },
            { culture: "Chinese", title: "The ghost's breath", text: "In Chinese astronomy the Beehive is 積尸氣, the 'exhalation of piled-up corpses', a ghostly vapour in the Ghost mansion (鬼宿)." },
            { culture: "Vedic", title: "Pushya", text: "γ, δ and θ Cancri (the Donkeys and the cluster) form <b>Pushya</b>, 'the nourisher', ruled by Brihaspati, teacher of the gods. It's widely considered the most auspicious of all nakshatras." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the two stars in the eyes are like Mercury and moderately Mars; those in the claws like Saturn and Mercury; the cloudy cluster in the breast (Praesepe) like Mars and the Moon; and the two on either side of it, the Donkeys, like Mars and the Sun.",
            energy: "The shell and the soft interior: home, protection, belonging, memory, nourishment. As the 'Gate of Men' it's the doorway into incarnation. The cluster at its heart adds something misty and mysterious. Its stars are sideways-moving and tenacious, holding on with both claws.",
            sign: "Tropical Cancer (21 June–22 July) now lies over the stars of <b>Gemini</b>, Castor and Pollux. Sidereal Cancer covers the Beehive and the Donkeys. The sign is ruled by the Moon, Jupiter is exalted there at 15°, and Mars falls there.",
            fixedStars: [
                { star: "δ", text: "<b>Asellus Australis</b> and <b>Borealis</b> (γ), the Donkeys (Mars–Sun): endurance, stubbornness and courage, a caring nature that can turn fierce." },
                { star: "α", text: "<b>Acubens</b>, 'the claw' (Saturn–Mercury): tenacity, holding on, a mind that grasps and won't let go." },
                { star: "β", text: "<b>Tarf</b> (Saturn–Mercury): the crab's leg; persistence along a sideways path." }
            ],
            nakshatras: [
                { name: "Pushya", stars: "γ, δ and θ Cancri", text: "The nourisher, ruled by Brihaspati (Jupiter): care, growth, spiritual teaching. 3°20′–16°40′ sidereal Cancer." },
                { name: "Ashlesha", stars: "the head of Hydra (just south)", text: "The entwiner, ruled by the Nagas (serpents): hypnotic, penetrating, protective. 16°40′–30° sidereal Cancer." }
            ]
        },
        anatomy: [
            { star: "δ", part: "Body (Southern Donkey)" },
            { star: "γ", part: "Body (Northern Donkey)" },
            { star: "ζ1", part: "Shell" },
            { star: "α", part: "Southern claw" },
            { star: "ι", part: "Northern claw" },
            { star: "β", part: "Tip of the leg" }
        ],
        dsos: [
            { text: "<b>M44, the Beehive (Praesepe)</b>: about 600 light years away and some 600–700 million years old. It's visible to the naked eye under dark skies and superb in binoculars. Galileo was the first to see it as stars, about 40 of them." },
            { text: "<b>M67</b>: near Acubens (α), one of the oldest known open clusters, about 4 billion years old, almost as old as the Sun. It looks like a fainter, richer Beehive in binoculars." }
        ],
        facts: [
            "Cancer is the faintest of the 13 zodiac constellations.",
            "55 Cancri, just visible to the naked eye, has five known planets. One, 55 Cancri e, is a scorching 'super-Earth' once proposed to be rich in carbon.",
            "ι Cancri is a lovely gold-and-blue double star in small telescopes, a fainter cousin of Albireo."
        ],
        stars: {
            "β": { meaning: "Arabic al-ṭarf, 'the end' or 'the glance'.", nature: "Saturn and Mercury", dist: 290, type: "K4 III: orange giant", story: "The brightest star in Cancer, at the tip of the crab's leg." },
            "α": { meaning: "Arabic al-zubānā, 'the claw'.", nature: "Saturn and Mercury", dist: 190, type: "A5: white, a multiple star", astro: "Tenacity; a grasping, holding nature." },
            "δ": { meaning: "Latin Asellus Australis, 'the southern donkey'.", nature: "Mars and the Sun", dist: 131, type: "K0 III: orange giant", story: "Lies almost on the ecliptic and is regularly occulted by the Moon.", astro: "Endurance, stubborn courage, a protective nature." },
            "γ": { meaning: "Latin Asellus Borealis, 'the northern donkey'.", nature: "Mars and the Sun", dist: 181, type: "A1 IV: white subgiant" },
            "ζ1": { meaning: "Latin Tegmine, 'the shell'.", dist: 83, type: "A multiple star of at least four suns" },
            "ι": { meaning: "Arabic, 'the claw' (northern).", nature: "Saturn and Mercury", dist: 330, type: "G8 II: yellow giant with a blue companion" }
        }
    },

    Leo: {
        title: "The Lion",
        tagline: "A crouching lion like the Sphinx: a backwards question mark for head and mane, a triangle for the hindquarters.",
        shape: [
            "Find the <b>Sickle</b>, a backwards question mark of six stars. The dot at its bottom is <b>Regulus</b>, the lion's <b>heart</b>.",
            "The curve of the Sickle is the <b>head and mane</b>: <b>Algieba (γ)</b>, <b>Adhafera (ζ)</b> and <b>Rasalas (μ)</b>, with ε at the mouth.",
            "East of the Sickle is a right triangle: <b>Denebola (β)</b>, the end of the <b>tail</b>; <b>Zosma (δ)</b>, the back; and <b>Chertan (θ)</b>, the hip.",
            "The lion lies facing west, toward Cancer, head raised like the Sphinx, with its forepaws stretched out below the Sickle."
        ],
        memory: "Mnemonic: <b>\"A backwards question mark and a triangle: the Sphinx. Regulus is the heart, Denebola the tail.\"</b>",
        find: [
            { from: "The Big Dipper", text: "Use the pointer stars the 'wrong' way: from Dubhe through Merak and on, away from Polaris, about 45°, and you land in Leo. Old saying: if the Dipper's bowl leaked, it would drip onto the Lion's back." },
            { from: "Gemini and Cancer", text: "Continue the line from Castor and Pollux eastward past the Beehive to reach Regulus." }
        ],
        season: "The constellation of spring in the north (autumn in the south): best on evenings from February to June, highest at midnight in late February to early March. The Sun is in front of it from about 10 August to 16 September.",
        southern: "From the southern hemisphere Leo is upside down in the northern sky, so the Sickle looks like a normal question mark.",
        ecliptic: "Regulus is the brightest star closest to the ecliptic, just 0.5° away. The Moon occults it in multi-year series, and planets regularly pass right beside it. Jupiter's triple meeting with Regulus in 3–2 BC is one of the theories behind the Star of Bethlehem.",
        myths: [
            { culture: "Greek", title: "The Nemean Lion", text: "The first labour of Heracles: a lion whose golden hide no weapon could pierce. Heracles cornered it in its cave and strangled it with his bare hands. He then skinned it with its own claws and wore the pelt as armour. Zeus set the lion among the stars." },
            { culture: "Babylonian", title: "The Great Lion and the King", text: "The Babylonian UR.GU.LA, 'the great lion', is one of the oldest constellations. Regulus was LUGAL, 'the King', a name that passed through Greek <i>Basiliskos</i> to Copernicus' Latin <i>Regulus</i>, 'little king'." },
            { culture: "Egyptian", title: "The lion at the flood", text: "The Sun entered Leo at the height of summer, when the Nile flooded and lions came down from the desert to drink. Classical writers explained the lion-headed waterspouts on temples this way." },
            { culture: "Persian (later lore)", title: "A Royal Star", text: "Regulus is one of the four Royal Stars or 'Watchers of the Heavens' (with Aldebaran, Antares and Fomalhaut). Many modern books call it the 'Watcher of the North'." },
            { culture: "Vedic", title: "Magha and the Phalgunis", text: "The Sickle with Regulus is <b>Magha</b>, 'the mighty', ruled by the Pitris (ancestors): royalty, lineage, tradition. The hindquarters are the two <b>Phalgunis</b>, a pair of nakshatras about pleasure and partnership: δ and θ Leonis form Purva Phalguni, and Denebola forms Uttara Phalguni." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the two stars in the head are like Saturn and moderately Mars; the three in the neck like Saturn and moderately Mercury; Regulus, the bright star on the heart, like Mars and Jupiter; those in the hip and the bright star in the tail (Denebola) like Saturn and Venus; and those in the thighs like Venus and moderately Mercury.",
            energy: "Kingship and the heart: courage, generosity, pride, creative self-expression, the urge to shine and to rule. Regulus is among the most important fixed stars of all, and royal success is its promise. The lion's rump (Zosma, Denebola) adds the Saturn–Venus note of the outsider who goes against the crowd.",
            sign: "Tropical Leo (23 July–22 August) now covers the stars of <b>Cancer</b> and the Sickle's western edge. Sidereal Leo covers the Sickle, Regulus and most of the body. The sign is ruled by the Sun. Regulus crossed from tropical Leo into tropical Virgo in 2011–2012, an event many astrologers saw as symbolic.",
            fixedStars: [
                { star: "α", text: "<b>Regulus</b> (Mars–Jupiter), the Royal Star: success, fame, leadership and high office. The often-quoted warning is that it holds only <i>if revenge is avoided</i>. A Behenian star." },
                { star: "β", text: "<b>Denebola</b> (Saturn–Venus), the tail: going against society, the outsider, swift judgment. Traditionally misfortune through public opinion, but also noble independence." },
                { star: "δ", text: "<b>Zosma</b> (Saturn–Venus), the back: the 'victim' or servant star in modern books, about suffering for others, or learning to stop." },
                { star: "γ1", text: "<b>Algieba</b> (Saturn–Mercury), the mane: dignity and a commanding voice." }
            ],
            nakshatras: [
                { name: "Magha", stars: "Regulus and the Sickle", text: "The mighty, ruled by the ancestors (Pitris): royalty, lineage, honour. 0°–13°20′ sidereal Leo." },
                { name: "Purva Phalguni", stars: "δ and θ Leonis", text: "The front leg of the bed, ruled by Bhaga: pleasure, rest, love, creativity. 13°20′–26°40′ sidereal Leo." },
                { name: "Uttara Phalguni", stars: "Denebola and 93 Leonis", text: "The back leg of the bed, ruled by Aryaman: contracts, loyalty, patronage. 26°40′ Leo–10° Virgo." }
            ]
        },
        anatomy: [
            { star: "α", part: "Heart" },
            { star: "η", part: "Neck / chest" },
            { star: "γ1", part: "Mane" },
            { star: "ζ", part: "Mane" },
            { star: "μ", part: "Head" },
            { star: "ε", part: "Mouth" },
            { star: "κ", part: "Nose" },
            { star: "λ", part: "Jaw" },
            { star: "ο", part: "Forepaw" },
            { star: "δ", part: "Back" },
            { star: "θ", part: "Hip" },
            { star: "β", part: "Tail" }
        ],
        dsos: [
            { text: "<b>The Leo Triplet</b>: M65, M66 and NGC 3628, three spiral galaxies about 35 million light years away, together in one telescope field below Chertan (θ)." },
            { text: "<b>M95, M96 and M105</b>: a second group of galaxies between Regulus and Chertan." },
            { text: "<b>Algieba (γ Leo)</b>: one of the finest double stars in the sky, two golden-orange giants. A small telescope splits them." }
        ],
        facts: [
            "Regulus spins once every ~16 hours, so fast that it bulges at the equator and is noticeably flattened.",
            "Wolf 359, one of the Sun's nearest neighbours (7.9 light years), lies in Leo.",
            "The Leonid meteors (mid-November), debris of comet Tempel–Tuttle, produced great meteor storms in 1833 and 1966."
        ],
        stars: {
            "α": { meaning: "Latin 'little king', Copernicus' rendering of Ptolemy's Basiliskos. Babylonian LUGAL, 'the King'. Arabic Qalb al-Asad, 'the lion's heart'.", ptolemy: "The bright star on the heart, called the 'Little King'.", nature: "Mars and Jupiter", dist: 79, type: "B8 IV: blue-white, rapidly spinning", astro: "A Royal Star: success, glory, leadership, if revenge is avoided. A Behenian star." },
            "β": { meaning: "Arabic Dhanab al-Asad, 'the lion's tail'.", ptolemy: "The bright star on the tip of the tail.", nature: "Saturn and Venus", dist: 36, type: "A3 V: white, with a dust disk", astro: "The non-conformist; going against the grain; swift reversals." },
            "γ1": { meaning: "Arabic al-jabha, 'the forehead'.", nature: "Saturn and Mercury", dist: 130, type: "K0 III: a pair of golden giants", astro: "Dignity, a commanding presence." },
            "δ": { meaning: "Greek zōsma, 'the girdle'.", nature: "Saturn and Venus", dist: 58, type: "A4 V: white", astro: "Selfless service, the burdens of the outsider." },
            "θ": { meaning: "Arabic, 'the two small ribs'.", nature: "Saturn and Venus", dist: 165, type: "A2: white" },
            "ζ": { meaning: "Arabic al-ḍafīra, 'the curl' (of the mane).", nature: "Saturn and Mercury", dist: 260, type: "F0 III: white giant" },
            "μ": { meaning: "Arabic raʾs al-asad, 'the lion's head'.", nature: "Saturn and Mars", dist: 133, type: "K2 III: orange giant" },
            "ε": { meaning: "Arabic, 'the southern (star) of the head'.", nature: "Saturn and Mars", dist: 250, type: "G1 II: yellow bright giant" }
        }
    },

    Vir: {
        title: "The Maiden",
        tagline: "The largest zodiac constellation: a reclining winged maiden holding an ear of wheat, the blue-white star Spica.",
        shape: [
            "Start with <b>Spica</b>, the bright blue-white star: the <b>ear of wheat</b> in the maiden's left hand.",
            "Above Spica is a lopsided <b>Y</b> or cup. <b>Porrima (γ)</b> sits at the fork, her waist. One arm runs up to <b>Vindemiatrix (ε)</b>, her right wing, and the other west toward β and η, her shoulders and head.",
            "She lies on her back along the ecliptic, with her <b>head toward Leo</b> (near Denebola) and her <b>feet toward Libra</b>. The robe's hem is ι (Syrma) and her feet are near μ.",
            "Virgo is huge (44° of the ecliptic) but, apart from Spica, faint. Learn Spica first and the Y second."
        ],
        memory: "The classic sky rhyme: <b>\"Arc to Arcturus, speed on to Spica.\"</b>",
        find: [
            { from: "The Big Dipper", text: "Follow the curve of the Dipper's handle away from the bowl to orange <b>Arcturus</b>, then continue the same curve to blue-white <b>Spica</b>." },
            { from: "Leo", text: "From Denebola (the lion's tail) head southeast. The faint stars of Virgo's head and shoulders begin just past it." }
        ],
        season: "A spring constellation in the north (autumn in the south): best on evenings from March to July, highest at midnight in early April. The Sun spends about 45 days here, from about 16 September to 31 October, longer than in any other constellation.",
        southern: "From the southern hemisphere Virgo is upside down and high in the north on autumn evenings (March–June).",
        ecliptic: "The September equinox point now lies in Virgo, near β Virginis. Spica sits 2° south of the ecliptic, close enough for the Moon to occult it in multi-year series. Planets sweep past it every few years.",
        myths: [
            { culture: "Greek", title: "Demeter and Persephone", text: "The maiden with the wheat is often Demeter, goddess of the harvest, or her daughter Persephone. Hades took Persephone to the underworld, and Demeter's grief caused winter. Persephone's return each spring brings the harvest back." },
            { culture: "Greek", title: "Astraea, the star maiden", text: "Astraea, goddess of justice, lived among humans in the Golden Age. As people grew corrupt, she was the last of the immortals to leave the Earth and became Virgo. Her scales of justice hang beside her as Libra." },
            { culture: "Babylonian", title: "The Furrow (AB.SIN)", text: "The Babylonians saw the furrow of a ploughed field, with the goddess Shala holding an ear of barley: Spica. The agricultural meaning has followed the constellation ever since." },
            { culture: "Medieval", title: "The Virgin", text: "In Christian Europe the figure became the Virgin Mary, and the wheat became a symbol of the bread of life." },
            { culture: "Vedic", title: "Chitra", text: "Spica is <b>Chitra</b>, 'the brilliant', ruled by Tvashtar (Vishvakarma), architect and craftsman of the gods. The bright pearl of the sky, it anchors the Lahiri ayanamsa: sidereal 0° Libra is set opposite it." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the head and the one at the tip of the southern wing are like Mercury and moderately Mars; the other bright stars of the wing and those on the girdle like Mercury and moderately Venus; the bright star in the northern wing, Vindemiatrix, like Saturn and Mercury; Spica like Venus and moderately Mars; and those at the feet and the hem of the robe like Mercury and moderately Mars.",
            energy: "Harvest and discernment: the work of sifting wheat from chaff, practical skill, healing and service, purity and justice (Astraea). Spica is one of the most fortunate stars in the sky, the 'gift' of talent. Vindemiatrix, the grape-gatherer, carries a Saturnine warning about timing and loss.",
            sign: "Tropical Virgo (23 August–22 September) now covers mostly the stars of <b>Leo</b>, including Regulus since 2012. Sidereal Virgo covers the maiden's head to just before Spica, which sits at sidereal 0° Libra (that's the definition of the Lahiri zodiac). The sign is ruled by Mercury, which is also exalted there; Venus falls there.",
            fixedStars: [
                { star: "α", text: "<b>Spica</b> (Venus–Mars): brilliance, gifts, talent, protection. Good fortune that comes as if 'from above'. A Behenian star." },
                { star: "ε", text: "<b>Vindemiatrix</b> (Saturn–Mercury), the grape-gatherer: harvest timing. Traditionally 'the widow-maker': falsity, loss, regret, but also sober wisdom." },
                { star: "γ", text: "<b>Porrima</b> (Mercury–Venus), named after a Roman goddess of prophecy: foresight, balance, courtesy." },
                { star: "β", text: "<b>Zavijava</b> (Mercury–Mars), 'the corner': a forceful, combative intellect; attention to detail." }
            ],
            nakshatras: [
                { name: "Hasta", stars: "the four stars of Corvus (just south)", text: "The hand, ruled by Savitar: skill, craft, dexterity. 10°–23°20′ sidereal Virgo." },
                { name: "Chitra", stars: "Spica", text: "The brilliant one, ruled by Tvashtar: beauty, design, creation. 23°20′ Virgo–6°40′ Libra." },
                { name: "Swati", stars: "Arcturus (in Boötes, north of Virgo)", text: "The sword or independent one, ruled by Vayu (wind): freedom, trade, flexibility. 6°40′–20° sidereal Libra." }
            ]
        },
        anatomy: [
            { star: "α", part: "Ear of wheat (left hand)" },
            { star: "ε", part: "Right wing" },
            { star: "γ", part: "Waist" },
            { star: "δ", part: "Girdle" },
            { star: "ζ", part: "Hip" },
            { star: "β", part: "Head" },
            { star: "η", part: "Shoulder" },
            { star: "ι", part: "Hem of the robe" },
            { star: "μ", part: "Foot" }
        ],
        dsos: [
            { text: "<b>The Virgo Cluster</b>: more than a thousand galaxies about 54 million light years away, filling the 'bowl' between Denebola and Vindemiatrix. Many Messier galaxies (M49, M58, M59, M60, M61, M84, M86) show in small telescopes." },
            { text: "<b>M87</b>: the cluster's giant elliptical galaxy. Its central black hole, 6.5 billion times the Sun's mass, was the first ever imaged (Event Horizon Telescope, 2019)." },
            { text: "<b>M104, the Sombrero Galaxy</b>: an edge-on spiral with a dark dust lane, on the border with Corvus." }
        ],
        facts: [
            "Around 130 BC Hipparchus compared Spica's position with records 150 years older, found it had shifted, and so discovered precession, the drift behind the tropical/sidereal difference.",
            "Virgo is the second-largest constellation in the sky after Hydra.",
            "The first quasar ever identified, 3C 273 (1963), lies in Virgo, 2.4 billion light years away."
        ],
        stars: {
            "α": { meaning: "Latin spica, 'ear of grain'. Babylonian 'the furrow'. Vedic Chitra, 'the brilliant'.", ptolemy: "The star on the left hand, called the Ear of Wheat.", nature: "Venus and Mars", dist: 250, type: "B1 V: two hot blue stars orbiting every 4 days", astro: "Brilliance, talent, protection, gifts. A Behenian star (gem: emerald; plant: sage)." },
            "ε": { meaning: "Latin, 'the grape-gatherer'. Its dawn rising once marked the start of the grape harvest.", ptolemy: "The bright star on the northern wing, called the Grape-gatherer.", nature: "Saturn and Mercury", dist: 110, type: "G8 III: yellow giant", astro: "Harvest timing; traditionally falsity, loss, 'the widow-maker'." },
            "γ": { meaning: "Porrima, a Roman goddess of prophecy (one of the Carmentae).", nature: "Mercury and Venus", dist: 38, type: "Two matching F0 stars orbiting every 169 years", story: "The pair was easy to split in a small telescope; around 2005 they swung close together, and they're slowly opening again." },
            "β": { meaning: "Arabic zāwiyat al-ʿawwāʾ, 'the corner of the barker'.", nature: "Mercury and Mars", dist: 36, type: "F9 V: yellow-white, Sun-like" },
            "δ": { meaning: "Minelauva, from Arabic, 'the place where the barker turns'.", nature: "Mercury and Venus", dist: 200, type: "M3 III: red giant" },
            "ζ": { meaning: "Heze: origin uncertain.", nature: "Mercury and Venus", dist: 74, type: "A3 V: white" },
            "ι": { meaning: "Greek syrma, 'the train (of the robe)'.", nature: "Mercury and Mars", dist: 70, type: "F7: yellow-white" }
        }
    },

    Lib: {
        title: "The Scales",
        tagline: "A faint lopsided diamond between Virgo and Scorpius: once the Scorpion's claws, now the scales of justice.",
        shape: [
            "Halfway between Spica and Antares, look for a dim <b>quadrilateral</b>, a tilted diamond.",
            "Its two brightest corners are the pans or claws: <b>Zubeneschamali (β)</b> to the north, the 'northern claw', and <b>Zubenelgenubi (α)</b> to the south, the 'southern claw', a wide double star.",
            "<b>Zubenelhakrabi (γ)</b> completes the beam, and fainter stars hang down to <b>σ (Brachium)</b>, υ and τ: the strings of the pans.",
            "Turn it in your mind and you'll see the original picture: two claws reaching west from the Scorpion's head. The names still say so: <i>zuban</i> means 'claw'."
        ],
        memory: "Mnemonic: <b>\"Between the maiden's wheat (Spica) and the scorpion's heart (Antares) hang the scales.\"</b>",
        find: [
            { from: "Spica and Antares", text: "Draw a line from Spica to Antares. Libra's two brightest stars sit near its middle, a little north of the line." },
            { from: "Scorpius", text: "Follow the three head stars of Scorpius (β, δ, π) about 10° northwest to reach Zubenelgenubi and Zubeneschamali." }
        ],
        season: "A late-spring and summer constellation in the north: best on evenings from April to July, highest at midnight in early May. The Sun is in front of it from about 31 October to 23 November.",
        southern: "From the southern hemisphere Libra passes high overhead on autumn and winter evenings.",
        ecliptic: "Zubenelgenubi lies only 0.3° from the ecliptic, so the Moon often hides it. Around 2,000 years ago the September equinox fell here, when day and night are balanced. That's one explanation for the scales.",
        myths: [
            { culture: "Greek", title: "The Claws (Chelae)", text: "For the Greeks these stars were Chelae, the claws of the Scorpion, and the zodiac had only 11 figures. The Romans of Julius Caesar's time made the scales a constellation of their own." },
            { culture: "Babylonian", title: "The Scales (ZI.BA.AN.NA)", text: "The Babylonians already called these stars 'the scales' (zibānītu), so the balance is older than the Greek claws." },
            { culture: "Greek & Roman", title: "The scales of Astraea", text: "The scales belong to Astraea, the maiden of justice next door in Virgo, weighing the deeds of humans." },
            { culture: "Vedic", title: "Vishakha", text: "α and β Librae form <b>Vishakha</b>, 'the forked branch', ruled jointly by Indra and Agni: goal-driven, ambitious, often linked with a triumphal gateway." }
        ],
        astrology: {
            ptolemy: "Ptolemy (for the Claws): the stars at the tips of the claws are like Jupiter and Mercury; those in the middle parts like Saturn and moderately Mars.",
            energy: "Balance, justice, partnership, weighing and choosing, with the scorpion's claws hidden inside. Tradition splits it neatly: the <b>northern scale</b> is fortunate (Jupiter–Mercury), the <b>southern scale</b> unfortunate (Saturn–Mars). Two sides of justice: reward and retribution.",
            sign: "Tropical Libra (23 September–22 October) now covers the stars of <b>Virgo</b>, including Spica. Sidereal Libra starts at Spica and runs through these scales. The sign is ruled by Venus, Saturn is exalted there at 21°, and the Sun falls there.",
            fixedStars: [
                { star: "β", text: "<b>Zubeneschamali</b>, the northern claw (Jupiter–Mercury): good fortune, high ambition, honour, wealth: the 'positive' side of the scales." },
                { star: "α2", text: "<b>Zubenelgenubi</b>, the southern claw (Saturn–Mars): obstruction, hardship and unforgiving justice. Modern books call it the star of social reform: change through confrontation." },
                { star: "γ", text: "<b>Zubenelhakrabi</b>, 'the scorpion's claw' (Saturn–Mars): a hard edge to justice." }
            ],
            nakshatras: [
                { name: "Vishakha", stars: "α and β Librae", text: "The forked branch, ruled by Indra and Agni: ambition, determination, triumph after effort. 20° sidereal Libra–3°20′ Scorpio." }
            ]
        },
        anatomy: [
            { star: "β", part: "Northern pan (northern claw)" },
            { star: "α2", part: "Southern pan (southern claw)" },
            { star: "γ", part: "Beam (the scorpion's claw)" },
            { star: "σ", part: "Arm (pan string)" },
            { star: "υ", part: "Pan string" },
            { star: "τ", part: "Pan string" }
        ],
        dsos: [
            { text: "<b>Zubenelgenubi (α Lib)</b>: a wide double, α¹ and α² (one white, one yellowish), split by sharp eyes or any binoculars." },
            { text: "Libra has no Messier objects. Its best telescope target is the faint globular cluster NGC 5897." }
        ],
        facts: [
            "Zubeneschamali is often described as the only naked-eye star that looks greenish. Not everyone sees it, so try it yourself.",
            "Gliese 581, a red dwarf 20 light years away with several planets, lies in Libra.",
            "Libra is the only zodiac constellation that represents an object rather than a living being."
        ],
        stars: {
            "β": { meaning: "Arabic al-zubān al-shamālī, 'the northern claw'.", ptolemy: "The bright star at the tip of the northern claw.", nature: "Jupiter and Mercury", dist: 185, type: "B8 V: hot blue-white star", astro: "Fortune, honour, high ambition; the 'good' scale." },
            "α2": { meaning: "Arabic al-zubān al-janūbī, 'the southern claw'.", ptolemy: "The bright star at the tip of the southern claw.", nature: "Saturn and Mars (traditional)", dist: 77, type: "A3: white, double with α¹", astro: "Hardship, obstruction, social reform; the 'hard' scale." },
            "γ": { meaning: "Arabic, 'the claw of the scorpion'.", nature: "Saturn and Mars", dist: 152, type: "K0 III: orange giant with planets" },
            "σ": { meaning: "Latin brachium, 'the arm'.", nature: "Saturn and Mars", dist: 290, type: "M3 III: red giant, slightly variable" }
        }
    },

    Sco: {
        title: "The Scorpion",
        tagline: "One of the few constellations that looks like its name: a fishhook of stars with red Antares at the heart and a curled sting.",
        shape: [
            "Find red <b>Antares</b>, flanked by two fainter stars (σ and τ, the 'arteries'): the scorpion's <b>heart</b>.",
            "West of Antares, a short, curved, nearly vertical line of three stars: <b>Acrab (β)</b>, <b>Dschubba (δ)</b> and <b>Fang (π)</b>: the <b>head and claws</b>.",
            "From Antares the body runs south through ε (Larawag) and μ, then curls east into a <b>J-shaped tail</b>: ζ, η, <b>Sargas (θ)</b>, ι and κ.",
            "The tail ends in the bright <b>sting</b>: <b>Shaula (λ)</b> and <b>Lesath (υ)</b>, a close pair Rey called the 'cat's eyes'. The whole hook dips into the brightest part of the Milky Way."
        ],
        memory: "Mnemonic: <b>\"A fishhook in the summer sky: a red heart, a curling tail, two cat's eyes at the sting.\"</b>",
        find: [
            { from: "The southern horizon", text: "On summer evenings from mid-northern latitudes, look low in the south for a <b>red star</b> with a curved line of stars to its right: Antares, 'the rival of Mars', is often mistaken for the red planet." },
            { from: "Sagittarius", text: "The Teapot is just east (left) of the scorpion's tail. The sting points at the Teapot's spout." },
            { from: "Arcturus and Spica", text: "Continue the Big Dipper's 'arc to Arcturus, speed to Spica' line onward and down: it leads toward Scorpius' head." }
        ],
        season: "The summer constellation of the north (winter in the south): best on evenings from May to August, highest at midnight in late May to early June. From the northern US or Europe the sting barely clears the horizon. The Sun passes through in only about a week, 23–29 November.",
        southern: "From the southern hemisphere Scorpius passes high overhead in winter, a magnificent sight, with the tail curling upward.",
        ecliptic: "The ecliptic crosses the scorpion's head between β and δ, so the Moon and planets often pass the claws and Antares. The Moon is occulting Antares in a series running roughly 2023–2028. Mars passes Antares every two years or so, the classic 'two red rivals' meeting.",
        myths: [
            { culture: "Greek", title: "The Scorpion and Orion", text: "Orion the hunter boasted he would kill every animal on Earth. Gaia (in other versions Artemis or Apollo) sent a scorpion that stung him to death. The gods placed them on opposite sides of the sky: Orion sets in the west as the Scorpion rises in the east, still fleeing." },
            { culture: "Greek", title: "Phaethon's ride", text: "When Phaethon drove the Sun's chariot, the sight of the giant scorpion made him panic and lose control of the horses, scorching the Earth until Zeus struck him down." },
            { culture: "Babylonian", title: "The Scorpion (GIR.TAB)", text: "Among the oldest constellations. In the <i>Epic of Gilgamesh</i>, scorpion-men guard the mountain gate where the Sun rises and sets." },
            { culture: "Egyptian", title: "Serket", text: "The scorpion goddess Serket protected against venom and guarded the dead." },
            { culture: "Polynesian & Māori", title: "Maui's fishhook", text: "Across Polynesia the curve is <b>Te Matau a Māui</b>, the magic fishhook with which the hero Maui pulled islands from the sea, including New Zealand's North Island." },
            { culture: "Vedic", title: "Anuradha, Jyeshtha, Mula", text: "The head is <b>Anuradha</b> (Mitra, friendship), Antares is <b>Jyeshtha</b> ('the eldest', Indra) and the sting is <b>Mula</b> ('the root', Nirriti, goddess of destruction). Mula points to the centre of the Milky Way." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the bright stars in the forehead are like Mars and moderately Saturn; the three in the body, the middle one tawny and rather bright and called Antares, like Mars and moderately Jupiter; those in the joints like Saturn and moderately Venus; those in the sting like Mercury and Mars; and the cloud-like cluster after the sting (M7) like Mars and the Moon.",
            energy: "Intensity and transformation: depth, passion, power, death and rebirth, the sting that defends and the venom that heals. Antares is a Royal Star, the 'Watcher of the West', and the archetype of the warrior heart, all or nothing. The sting stars are among the most feared in tradition: crisis, danger, sudden turns.",
            sign: "Tropical Scorpio (23 October–21 November) now covers the stars of <b>Libra</b>. Sidereal Scorpio covers the head and Antares; the tail lies in sidereal Sagittarius. The constellation's own ecliptic stretch is only ~7° wide. The sign is ruled by Mars (Pluto in modern astrology), and the Moon falls there.",
            fixedStars: [
                { star: "α", text: "<b>Antares</b> (Mars–Jupiter), a Royal Star: courage, intensity, obsession, success through battle; also rashness and self-destruction when unchecked. A Behenian star." },
                { star: "β1", text: "<b>Acrab</b> and <b>Dschubba (δ)</b>, the forehead (Mars–Saturn): mental force, tenacity, a cutting, sometimes malicious edge." },
                { star: "λ", text: "<b>Shaula</b> and <b>Lesath (υ)</b>, the sting (Mercury–Mars): danger, desperation, sharp words, sudden crises; in modern readings, decisive action." }
            ],
            nakshatras: [
                { name: "Anuradha", stars: "β, δ and π Scorpii", text: "Following Radha, ruled by Mitra: friendship, devotion, cooperation. 3°20′–16°40′ sidereal Scorpio." },
                { name: "Jyeshtha", stars: "Antares, σ and τ Scorpii", text: "The eldest, ruled by Indra: seniority, protection, power, jealousy. 16°40′–30° sidereal Scorpio." },
                { name: "Mula", stars: "the sting (λ, υ and the tail)", text: "The root, ruled by Nirriti: uprooting, getting to the bottom of things, radical change. 0°–13°20′ sidereal Sagittarius." }
            ]
        },
        anatomy: [
            { star: "α", part: "Heart" },
            { star: "σ", part: "Artery (beside the heart)" },
            { star: "τ", part: "Artery (beside the heart)" },
            { star: "β1", part: "Head / claw" },
            { star: "δ", part: "Forehead" },
            { star: "π", part: "Claw" },
            { star: "ε", part: "Body" },
            { star: "μ1", part: "Body joint" },
            { star: "ζ1", part: "Tail" },
            { star: "η", part: "Tail" },
            { star: "θ", part: "Tail curl" },
            { star: "κ", part: "Tail" },
            { star: "λ", part: "Sting" },
            { star: "υ", part: "Sting" }
        ],
        dsos: [
            { text: "<b>M4</b>: a globular cluster just 1.3° west of Antares, one of the nearest to us (~7,200 light years). It's easy in binoculars as a round glow." },
            { text: "<b>M6, the Butterfly Cluster</b>, and <b>M7, Ptolemy's Cluster</b>: two big open clusters above the sting, both visible to the naked eye from dark sites. Ptolemy described M7 around 130 AD as a 'nebula following the sting'." },
            { text: "<b>The Rho Ophiuchi clouds</b>: the colourful dust and gas around Antares and ρ Oph, famous in astrophotography." }
        ],
        facts: [
            "Antares is a red supergiant roughly 700 times the Sun's diameter. Placed in our solar system, it would reach beyond the orbit of Mars.",
            "Scorpius X-1, the first X-ray source found beyond the Sun (1962), is a neutron star feeding on a companion.",
            "Scorpius is one of the few constellations that really looks like its namesake, and many cultures independently saw a hook or a scorpion in it."
        ],
        stars: {
            "α": { meaning: "Greek Ant-Ares, 'rival of Mars' (or 'like Mars'), for its red colour. Vedic Jyeshtha, 'the eldest'.", ptolemy: "The middle of the three in the body, tawny and rather bright, called Antares.", nature: "Mars and Jupiter", dist: 550, type: "M1.5 Iab: red supergiant with a blue companion", astro: "A Royal Star: intensity, courage, obsession, success through struggle. A Behenian star (gem: sardonyx/amethyst; plant: birthwort)." },
            "λ": { meaning: "Arabic al-shawla, 'the raised (tail)'.", ptolemy: "In the sting.", nature: "Mercury and Mars", dist: 570, type: "B2 IV: hot blue, a triple star", astro: "The sting: danger, desperation, sudden crisis; decisive action." },
            "υ": { meaning: "Arabic al-lasʿa, 'the sting'.", nature: "Mercury and Mars", dist: 580, type: "B2 IV: hot blue subgiant", astro: "Danger and immorality in tradition; a sharp, sudden force." },
            "θ": { meaning: "Sargas, from a Sumerian name for the constellation.", nature: "Saturn and Venus", dist: 300, type: "F1 II: yellow-white bright giant" },
            "δ": { meaning: "Arabic al-jabha, 'the forehead'.", nature: "Mars and Saturn", dist: 400, type: "B0.3 IV: hot blue star with a gas disk", story: "In 2000 Dschubba unexpectedly brightened by about half a magnitude, and it has varied since, changing the scorpion's look." },
            "β1": { meaning: "Arabic al-ʿaqrab, 'the scorpion'.", nature: "Mars and Saturn", dist: 400, type: "B1 V: hot blue; a fine telescopic double" },
            "ε": { meaning: "Larawag, from an Aboriginal Australian (Wardaman) name.", nature: "Saturn and Venus", dist: 64, type: "K1 III: orange giant" }
        }
    },

    Oph: {
        title: "The Serpent Bearer",
        tagline: "A huge, faint figure of a man wrestling a great snake, standing over the scorpion: the 13th constellation of the ecliptic.",
        shape: [
            "Ophiuchus is large and dim. Picture a big <b>coffin or house shape</b> north of Scorpius, wider at the bottom.",
            "The roof's peak is <b>Rasalhague (α)</b>, his <b>head</b>, close to the head of Hercules (Rasalgethi).",
            "His shoulders are <b>Cebalrai (β)</b> and κ. Out to the sides his hands grip the serpent (Serpens), split into a head (Caput) and a tail (Cauda): <b>Yed Prior and Yed Posterior</b> (δ, ε), a close pair of stars, are one hand.",
            "Down the body are his knees, <b>Sabik (η)</b> and ζ. His foot (θ) rests on the scorpion's back, right where the ecliptic crosses."
        ],
        memory: "Mnemonic: <b>\"A big house standing on the scorpion: Rasalhague is the roof, Yed is the hand.\"</b>",
        find: [
            { from: "Vega and Antares", text: "Halfway between bright Vega and red Antares are two similar stars a few degrees apart: Rasalhague (the brighter, east) and Rasalgethi (Hercules' head). Rasalhague is the serpent bearer's head." },
            { from: "Antares", text: "The hand pair Yed Prior and Yed Posterior lies about 15° north of Antares: two stars close together, one orange, one yellow." }
        ],
        season: "A summer constellation in the north (winter in the south): best on evenings from June to August, highest at midnight in mid-June. The Sun is in front of it from about 29 November to 18 December, longer than in Scorpius.",
        southern: "From the southern hemisphere Ophiuchus stands high in the north on winter evenings, upside down.",
        ecliptic: "Only the serpent bearer's foot touches the ecliptic, between Antares and the Teapot, so planets and the Moon pass through it regularly. This is the source of the 'Ophiuchus, the 13th sign' headlines that appear every few years.",
        myths: [
            { culture: "Greek", title: "Asclepius, the healer", text: "Asclepius, son of Apollo, was taught medicine by the centaur Chiron and learned secret healing from a snake. He became so skilled that he raised the dead. Hades complained that his realm was emptying, so Zeus struck Asclepius with a thunderbolt. He then placed him among the stars, holding the serpent. The Rod of Asclepius, a staff with one snake, is still the symbol of medicine." },
            { culture: "Greek (other tales)", title: "Phorbas and Laocoön", text: "Some writers saw instead Phorbas, who freed Rhodes from serpents, or Laocoön of Troy, strangled by sea serpents for warning against the wooden horse." },
            { culture: "Modern", title: "The 13th sign", text: "Ophiuchus was ignored by the astrological zodiac because the 12 signs were fixed as equal 30° divisions in Babylonian times. A few modern sidereal systems use 13 (or more) signs; Steven Schmidt's 1970 proposal is the best known." },
            { culture: "Astronomy", title: "Kepler's star", text: "In October 1604 a new star blazed up in Ophiuchus, near a conjunction of Jupiter, Saturn and Mars. Kepler studied it intensely. It's the last supernova in our galaxy seen with the naked eye." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars of Ophiuchus are like Saturn and to some extent Venus; those of the serpent (Serpens) like Saturn and Mars.",
            energy: "The healer and the keeper of secrets: medicine, life and death, the snake's knowledge of renewal (shedding skin), and the power to cross the boundary that should not be crossed. It sits on the scorpion: the healer who masters the venom. Its fixed stars mix Saturn's discipline with Venus' sweetness, which tradition reads as healing power with the temptation to misuse it.",
            sign: "Ophiuchus has no sign of its own. Its ecliptic stretch (18.6°) falls in late sidereal Scorpio and early Sagittarius, and in tropical Sagittarius (about 8°–26°). Planets 'in Ophiuchus' are, astrologically, in Scorpio or Sagittarius.",
            fixedStars: [
                { star: "α", text: "<b>Rasalhague</b> (Saturn–Venus), the head: healing, medical or esoteric knowledge, a taste for the unusual. Tradition warns of misfortune through excess or perversion." },
                { star: "δ", text: "<b>Yed Prior</b> (Saturn–Venus), the hand: practical, skilled, but the grip that holds too tight; old books mention shamelessness." },
                { star: "η", text: "<b>Sabik</b> (Saturn–Venus), the knee: sincerity and moral courage tested by circumstances; wasted energy if unfocused." }
            ],
            nakshatras: [
                { name: "Jyeshtha", stars: "Antares (south of his feet)", text: "Ophiuchus' ecliptic foot stands over the end of Jyeshtha and the beginning of Mula: the eldest and the root." }
            ]
        },
        anatomy: [
            { star: "α", part: "Head" },
            { star: "β", part: "Right shoulder" },
            { star: "κ", part: "Left shoulder" },
            { star: "δ", part: "Hand (holding the serpent)" },
            { star: "ε", part: "Hand" },
            { star: "λ", part: "Elbow" },
            { star: "η", part: "Knee" },
            { star: "ζ", part: "Knee" },
            { star: "θ", part: "Foot (on the scorpion)" }
        ],
        dsos: [
            { text: "<b>M10 and M12</b>: two globular clusters near the middle of the figure, a few degrees apart. Both are visible in binoculars, and they make a good starting pair." },
            { text: "Ophiuchus holds <b>seven Messier globular clusters</b> (M9, M10, M12, M14, M19, M62, M107), because it lies toward the crowded centre of the galaxy." },
            { text: "<b>The Rho Ophiuchi cloud</b>: the closest star-forming region to us (~460 light years), full of coloured nebulae, on the border with Scorpius." }
        ],
        facts: [
            "Barnard's Star, the fastest-moving star across our sky and the fourth-nearest star to the Sun (6 light years), is in Ophiuchus.",
            "Ophiuchus is the 11th largest constellation, bigger than any zodiac constellation except Virgo and Aquarius.",
            "ζ Ophiuchi is a 'runaway star', flung across space when its companion exploded as a supernova."
        ],
        stars: {
            "α": { meaning: "Arabic raʾs al-ḥawwāʾ, 'the head of the serpent charmer'.", ptolemy: "The star on the head.", nature: "Saturn and Venus", dist: 49, type: "A5 III: white giant, spinning rapidly", astro: "Healing, knowledge of medicine and mysteries; misuse of gifts." },
            "η": { meaning: "Arabic Sabik, 'the preceding (one)'.", nature: "Saturn and Venus", dist: 88, type: "A2: a pair of white stars", astro: "Moral courage, sincerity under test." },
            "δ": { meaning: "Arabic yad, 'hand': Yed Prior, the leading star of the hand.", nature: "Saturn and Venus", dist: 170, type: "M0.5 III: red giant", astro: "The grasping hand: skill, and holding too tightly." },
            "ε": { meaning: "Yed Posterior, the following star of the hand.", nature: "Saturn and Venus", dist: 108, type: "G9.5 III: yellow giant" },
            "β": { meaning: "Arabic kalb al-rāʿī, 'the shepherd's dog'.", nature: "Saturn and Venus", dist: 82, type: "K2 III: orange giant" },
            "λ": { meaning: "Arabic, 'the elbow'.", nature: "Saturn and Venus", dist: 170, type: "A1: white, a multiple star" },
            "ζ": { meaning: "IAU name Saik.", nature: "Saturn and Venus", dist: 370, type: "O9.5 V: a very hot blue runaway star" }
        }
    },

    Sgr: {
        title: "The Archer",
        tagline: "A centaur drawing his bow at the Scorpion's heart. Its brightest stars form the Teapot, steaming with the Milky Way.",
        shape: [
            "Find the <b>Teapot</b>, eight stars low in the summer south. <b>Kaus Borealis (λ)</b> is the lid's top; the spout is <b>Alnasl (γ)</b> with <b>Kaus Media (δ)</b> and <b>Kaus Australis (ε)</b>, the brightest; the handle is <b>Nunki (σ)</b>, τ, <b>Ascella (ζ)</b> and φ.",
            "Now see the archer: λ–δ–ε is the <b>bow</b>, and Alnasl, 'the arrowhead', is the tip of the arrow, aimed west at Antares.",
            "The handle stars are his shoulder and back (Nunki) and his armpit (Ascella). Fainter stars to the east and south are his horse body and legs: <b>Rukbat</b> ('knee') and <b>Arkab</b> ('tendon').",
            "The Milky Way's brightest clouds rise like steam from the spout, toward the centre of our galaxy."
        ],
        memory: "Mnemonic: <b>\"The Teapot pours on the Scorpion's tail; its spout is the arrowhead aimed at Antares.\"</b>",
        find: [
            { from: "Scorpius", text: "Just east (left) of the scorpion's curled tail. The sting points at the Teapot's spout." },
            { from: "The Milky Way", text: "From a dark site, follow the Milky Way down from the Summer Triangle (Vega, Deneb, Altair) to where it is brightest and widest: that's Sagittarius." },
            { from: "Altair", text: "Go south from Altair about 35° to reach the handle of the Teapot." }
        ],
        season: "A summer constellation in the north (winter in the south): best on evenings from July to September, highest at midnight in early July. The Sun is in front of it from about 18 December to 20 January, and the December solstice point lies here.",
        southern: "From the southern hemisphere the archer passes high overhead in winter, the Teapot upside down. It's the best view of the galactic centre.",
        ecliptic: "The ecliptic runs across the top of the Teapot. Planets in Sagittarius shine just above the lid. The centre of our galaxy (Sagittarius A*) is about 5.5° south of the ecliptic, just west of the spout, at about 27° tropical Sagittarius.",
        myths: [
            { culture: "Greek", title: "Crotus or Chiron", text: "The Greeks disagreed. Many saw the wise centaur Chiron, teacher of Achilles, Jason and Asclepius, but Chiron is usually the southern constellation Centaurus. Eratosthenes said the archer was Crotus, a satyr and son of Pan, who invented archery and lived among the Muses. Either way, the archer aims at the Scorpion to protect the sky." },
            { culture: "Babylonian", title: "Pabilsag", text: "The Babylonian archer Pabilsag was a winged centaur with a scorpion's tail and two heads, a human and a lion, drawing a bow: the fierce ancestor of the Greek figure." },
            { culture: "Astronomy", title: "The heart of the galaxy", text: "In the 1930s Karl Jansky detected radio noise from Sagittarius: the galactic centre. Its black hole, Sagittarius A* (4 million solar masses, 26,000 light years away), earned the 2020 Nobel Prize and was first imaged in 2022." },
            { culture: "Vedic", title: "Purva and Uttara Ashadha", text: "The bow and spout (δ, ε) form <b>Purva Ashadha</b>, 'the early invincible', ruled by Apas, the waters. The handle (σ, ζ) forms <b>Uttara Ashadha</b>, 'the later invincible', ruled by the Vishvadevas, the universal gods: final victory." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the star at the point of the arrow is like Mars and the Moon; those on the bow and the grip of the hand like Jupiter and Mars; the cluster in the forehead like the Sun and Mars; those in the cloak and back like Jupiter and moderately Mercury; those in the feet like Jupiter and Saturn; and the quadrangle on the tail like Venus and moderately Saturn.",
            energy: "Aim and vision: the quest for meaning, philosophy, faith, exploration, the arrow shot toward a far goal. It's half animal and half sage, aiming at the galaxy's heart. The arrowhead and the 'face' cluster give a sharp, piercing Mars quality; the bow and body are Jupiterian, generous and expansive.",
            sign: "Tropical Sagittarius (22 November–21 December) now covers the stars of <b>Scorpius and Ophiuchus</b>. Sidereal Sagittarius covers the sting and most of the Teapot. The sign is ruled by Jupiter.",
            fixedStars: [
                { star: "γ2", text: "<b>Alnasl</b>, the arrowhead (Mars–Moon): sharp focus, decisive action, a keen and sometimes violent edge." },
                { star: "ε", text: "<b>Kaus Australis</b>, the bow (Jupiter–Mars): leadership, aim and drive toward goals; sometimes ruthless ambition." },
                { star: "σ", text: "<b>Nunki</b> (Jupiter–Mercury): truthfulness, optimism, religious or philosophical leanings; the messenger of the sea in Babylon." },
                { star: "ζ", text: "<b>Ascella</b> (Jupiter–Mercury), the armpit: good fortune and happiness, a protected position." }
            ],
            nakshatras: [
                { name: "Mula", stars: "the scorpion's sting, near the galactic centre", text: "The root: radical investigation, uprooting. 0°–13°20′ sidereal Sagittarius." },
                { name: "Purva Ashadha", stars: "δ and ε Sagittarii", text: "The early invincible, ruled by the waters: conviction, purification, unstoppable energy. 13°20′–26°40′ sidereal Sagittarius." },
                { name: "Uttara Ashadha", stars: "σ and ζ Sagittarii", text: "The later invincible, ruled by the universal gods: lasting victory, integrity. 26°40′ Sagittarius–10° Capricorn." }
            ]
        },
        anatomy: [
            { star: "γ2", part: "Arrowhead" },
            { star: "δ", part: "Middle of the bow" },
            { star: "ε", part: "Southern end of the bow" },
            { star: "λ", part: "Northern end of the bow" },
            { star: "σ", part: "Shoulder" },
            { star: "ζ", part: "Armpit" },
            { star: "π", part: "Head" },
            { star: "α", part: "Knee" },
            { star: "β1", part: "Heel tendon" }
        ],
        dsos: [
            { text: "<b>M8, the Lagoon Nebula</b>: a glowing gas cloud visible to the naked eye as a brighter knot in the Milky Way above the spout. Next to it is <b>M20, the Trifid Nebula</b>, split by dark dust lanes." },
            { text: "<b>M22</b>: one of the brightest globular clusters in the sky, just northeast of the lid (λ), about 10,600 light years away." },
            { text: "<b>M24, the Sagittarius Star Cloud</b>, and <b>M17, the Omega (Swan) Nebula</b>: superb in binoculars." },
            { text: "<b>M54</b> is not really ours: it belongs to the Sagittarius Dwarf Galaxy, a small galaxy being torn apart by the Milky Way." }
        ],
        facts: [
            "Sagittarius holds 15 Messier objects, more than any other constellation.",
            "The 'Teapot' and the 'Milk Dipper' (the handle plus the lid, which looks like a small dipper scooping the Milky Way) are its two famous asterisms.",
            "The Sun reaches its December solstice point in Sagittarius, so the constellation marks the longest night of the northern year."
        ],
        stars: {
            "ε": { meaning: "Kaus Australis, Arabic qaws 'bow' plus Latin 'southern': the southern part of the bow.", nature: "Jupiter and Mars", dist: 143, type: "B9.5 III: blue-white giant", astro: "Aim, leadership, drive toward goals." },
            "σ": { meaning: "Nunki, from a Babylonian star name associated with the sacred city of Eridu.", nature: "Jupiter and Mercury", dist: 228, type: "B2.5 V: hot blue star", astro: "Truthfulness, optimism, faith." },
            "ζ": { meaning: "Latin ascella, 'armpit'.", nature: "Jupiter and Mercury", dist: 88, type: "A2: a close pair of white stars" },
            "δ": { meaning: "Kaus Media, 'the middle of the bow'.", nature: "Jupiter and Mars", dist: 350, type: "K3: orange giant" },
            "λ": { meaning: "Kaus Borealis, 'the northern part of the bow'.", nature: "Jupiter and Mars", dist: 78, type: "K0 III: orange giant" },
            "γ2": { meaning: "Arabic al-naṣl, 'the arrowhead'.", nature: "Mars and the Moon", dist: 97, type: "K1 III: orange giant", astro: "Sharp focus, decisive and sometimes violent action." },
            "α": { meaning: "Arabic rukbat al-rāmī, 'the archer's knee'.", nature: "Jupiter and Saturn", dist: 182, type: "B8 V: blue-white", story: "Despite being α, it's only the 15th-brightest star in Sagittarius." },
            "β1": { meaning: "Arabic ʿurqūb, 'tendon (heel)': Arkab Prior.", nature: "Jupiter and Saturn", dist: 380, type: "B8 V: blue-white" },
            "π": { meaning: "Arabic al-balda, 'the town'.", nature: "Sun and Mars", dist: 440, type: "F2 II: yellow-white bright giant" }
        }
    },

    Cap: {
        title: "The Sea-Goat",
        tagline: "A large, faint triangle of stars (some see a smile or a boat): a goat with a fish's tail.",
        shape: [
            "Look southeast of Altair for a big, faint <b>triangle</b>, or a lopsided smile, about 20° across.",
            "The western (right-hand) point is the goat's <b>head and horns</b>: <b>Algedi (α)</b> and <b>Dabih (β)</b>, close together. Algedi is a naked-eye double.",
            "The southern curve of the smile is the <b>front legs and belly</b> (ψ and ω).",
            "The eastern point is the <b>fish tail</b>: <b>Deneb Algedi (δ)</b> and <b>Nashira (γ)</b>, the brightest pair in the figure."
        ],
        memory: "Mnemonic: <b>\"A big faint smile southeast of Altair: horns on the right, fishtail on the left.\"</b>",
        find: [
            { from: "Vega and Altair", text: "Draw a line from Vega through Altair and continue about the same distance again: you land on <b>Algedi and Dabih</b>, the horns." },
            { from: "Fomalhaut", text: "Bright, lonely Fomalhaut sits low in the south in autumn. Capricornus is about 20° to its upper right (northwest)." }
        ],
        season: "A late-summer and autumn constellation in the north: best on evenings from August to October, highest at midnight in early August. The Sun is in front of it from about 20 January to 16 February.",
        southern: "From the southern hemisphere Capricornus passes high overhead on spring evenings.",
        ecliptic: "The ecliptic runs along the northern edge of the triangle, past Dabih, Nashira and Deneb Algedi. The Moon often occults these stars, and planets in Capricornus line up just above them. About 2,000 years ago the December solstice lay here, which is why the southern tropic is the Tropic of Capricorn.",
        myths: [
            { culture: "Babylonian", title: "The Goat-Fish of Enki (SUḪUR.MAŠ)", text: "One of the oldest constellation figures, going back to the Bronze Age: the goat-fish emblem of Enki (Ea), god of fresh water, wisdom and magic. He brought culture to humans from the waters." },
            { culture: "Greek", title: "Pan escapes Typhon", text: "When the monster Typhon attacked the gods, they fled in animal disguises. Pan leapt into the Nile and changed in panic: the half underwater became a fish and the half above stayed a goat. Zeus placed the sea-goat in the sky for its cleverness." },
            { culture: "Greek", title: "Amalthea", text: "In another tale this is the goat Amalthea, who nursed the infant Zeus in a cave on Crete. One of her broken horns became the Cornucopia, the horn of plenty." },
            { culture: "Neoplatonic", title: "The Gate of the Gods", text: "In late antiquity, Capricorn was the 'Gate of the Gods' through which souls rise back to the heavens, the counterpart of Cancer, the 'Gate of Men'." },
            { culture: "Vedic", title: "Makara", text: "The sidereal sign is <b>Makara</b>, a mythical sea creature (part crocodile, part fish), the mount of the river goddess Ganga and of Varuna. Its nakshatras are <b>Shravana</b> (Altair in Aquila, ruled by Vishnu: listening, learning) and <b>Dhanishta</b> (Delphinus, ruled by the Vasus: wealth, rhythm)." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the horns are like Venus and moderately Mars; those in the mouth like Saturn and moderately Venus; those in the feet and belly like Mars and Mercury; and those in the tail like Saturn and Jupiter.",
            energy: "Ambition and endurance: the creature that climbs out of the depths of feeling onto the mountain of achievement, combining wisdom from the waters (Enki) with the goat's sure-footed climb. The tail's Saturn–Jupiter stars give lawful authority and the judge's double edge: reward and ruin, life and death.",
            sign: "Tropical Capricorn (22 December–19 January) now covers the stars of <b>Sagittarius</b>. Sidereal Capricorn includes the horns and the western part of the figure; the tail stars fall in sidereal Aquarius. The sign is ruled by Saturn, Mars is exalted there at 28°, and Jupiter falls there.",
            fixedStars: [
                { star: "δ", text: "<b>Deneb Algedi</b>, the tail (Saturn–Jupiter): 'beneficence and destruction, sorrow and happiness, life and death'. The judge, the lawgiver. A Behenian star." },
                { star: "α2", text: "<b>Algedi</b>, the horn (Venus–Mars): sacrifice and offering; a mix of beneficence and harshness." },
                { star: "β", text: "<b>Dabih</b>, 'the lucky star of the slaughterer' (Saturn–Venus): reserve, melancholy, trust that must be earned." },
                { star: "γ", text: "<b>Nashira</b>, 'the bearer of good news' (Saturn–Jupiter): success after difficulty." }
            ],
            nakshatras: [
                { name: "Uttara Ashadha", stars: "σ and ζ Sagittarii (west of the horns)", text: "The later invincible: its last three quarters fall in sidereal Capricorn. 26°40′ Sagittarius–10° Capricorn." },
                { name: "Shravana", stars: "Altair (in Aquila, north of the horns)", text: "Hearing, ruled by Vishnu: listening, learning, connecting. 10°–23°20′ sidereal Capricorn." },
                { name: "Dhanishta", stars: "Delphinus (north of the tail)", text: "The wealthiest, ruled by the Vasus: abundance, music, rhythm. 23°20′ Capricorn–6°40′ Aquarius." }
            ]
        },
        anatomy: [
            { star: "α2", part: "Horn" },
            { star: "β", part: "Horn / head" },
            { star: "ρ", part: "Neck" },
            { star: "ψ", part: "Front leg" },
            { star: "ω", part: "Knee / belly" },
            { star: "θ", part: "Back" },
            { star: "ζ", part: "Belly" },
            { star: "γ", part: "Tail" },
            { star: "δ", part: "Tail fin" }
        ],
        dsos: [
            { text: "<b>Algedi (α Cap)</b>: a naked-eye double, α¹ and α², that is a chance alignment: one star is ~690 light years away, the other ~105. Binoculars show that each is itself double." },
            { text: "<b>M30</b>: a compact globular cluster about 27,000 light years away, below the tail. Small telescopes show it." }
        ],
        facts: [
            "Capricornus is the smallest zodiac constellation by area.",
            "Neptune was discovered in Capricornus in September 1846, close to Deneb Algedi, after being predicted by mathematics.",
            "Deneb Algedi is an eclipsing binary that dims slightly every 1.02 days."
        ],
        stars: {
            "δ": { meaning: "Arabic dhanab al-jady, 'the tail of the goat'.", ptolemy: "In the tail.", nature: "Saturn and Jupiter", dist: 39, type: "A5: white, an eclipsing binary", astro: "Beneficence and destruction, life and death; the judge. A Behenian star (gem: chalcedony; plant: marjoram)." },
            "β": { meaning: "Arabic saʿd al-dhābiḥ, 'the lucky star of the slaughterer'.", nature: "Venus and Mars", dist: 330, type: "K0 II: orange giant, a multiple star", astro: "Reserve, melancholy, hard-won trust." },
            "α2": { meaning: "Arabic al-jady, 'the goat'.", ptolemy: "In the horns.", nature: "Venus and Mars", dist: 105, type: "G9 III: yellow giant", astro: "Sacrifice and offering." },
            "γ": { meaning: "Arabic saʿd nāshira, 'the lucky star of the bearer of good news'.", nature: "Saturn and Jupiter", dist: 139, type: "A7: white", astro: "Success after difficulty." }
        }
    },

    Aqr: {
        title: "The Water Bearer",
        tagline: "A man pouring water from a jar, its stream running south to the mouth of the Southern Fish (Fomalhaut).",
        shape: [
            "Start with the <b>Water Jar</b>: a tiny Y-shaped group of four stars (γ Sadachbia, ζ, η and π), south of the Great Square of Pegasus.",
            "West of the jar are the water bearer's <b>shoulders</b>, the two brightest stars: <b>Sadalmelik (α)</b> and, further southwest, <b>Sadalsuud (β)</b>. His left hand reaches out west to <b>Albali (ε)</b>.",
            "His body and legs run south: <b>Ancha (θ, the hip)</b> and <b>Skat (δ, the shin)</b>.",
            "From the jar the <b>stream of water</b> pours down and east through λ (Hydor, 'water'), φ and the ψ stars, then winds south to Fomalhaut, the mouth of the Southern Fish that drinks it."
        ],
        memory: "Mnemonic: <b>\"Find the little 'Y' jar under the Great Square; the water pours south to lonely Fomalhaut.\"</b>",
        find: [
            { from: "The Great Square of Pegasus", text: "From Markab, the Square's southwest corner, go about 15° southwest to find the little Y of the Water Jar, with Sadalmelik just west of it." },
            { from: "Fomalhaut", text: "The bright, solitary star low in the south in autumn is Fomalhaut. Aquarius' stream and legs fill the faint area above it." }
        ],
        season: "An autumn constellation in the north (spring in the south): best on evenings from August to November, highest at midnight in late August. The Sun is in front of it from about 16 February to 11 March.",
        southern: "From the southern hemisphere Aquarius passes high overhead on spring evenings.",
        ecliptic: "The ecliptic runs through the southern part of Aquarius, through the stream of water, so planets here appear to float in the water. Around 2600 AD the March equinox point will cross into Aquarius by the IAU borders: the astronomical start of the 'Age of Aquarius'.",
        myths: [
            { culture: "Greek", title: "Ganymede", text: "Ganymede, the most beautiful of mortal youths, was carried off by Zeus' eagle (Aquila, right next door) to Olympus to become cupbearer of the gods, pouring their nectar. His jar now pours water across the sky." },
            { culture: "Babylonian", title: "The Great One (GU.LA)", text: "The Babylonians saw 'the Great One', identified with Ea (Enki), god of fresh waters, pouring two streams from a vase, an image as old as the 3rd millennium BC. This region was 'the Sea' of the sky: Capricornus, Aquarius, Pisces, the Southern Fish, the Whale and the river Eridanus all lie here." },
            { culture: "Greek", title: "Deucalion's flood", text: "Some tied the water bearer to Deucalion, the Greek Noah, who survived the great flood sent by Zeus." },
            { culture: "Vedic", title: "Shatabhisha", text: "λ Aquarii and its faint surroundings form <b>Shatabhisha</b>, 'the hundred physicians' or 'hundred stars', ruled by Varuna, god of the cosmic waters: healing, secrets, solitude." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the shoulders are like Saturn and Mercury, as are those in the left arm and the cloak; those in the thighs more like Mercury and less like Saturn; and those in the stream of water like Saturn and moderately Jupiter.",
            energy: "The water bearer gives knowledge and life to all: humanitarian, visionary, collective, the waters of renewal (and of the flood). Its brightest stars all carry 'luck' (saʿd) in their Arabic names: they rose at the end of winter, when the rains came. The Saturn–Mercury shoulders give structured, original thinking.",
            sign: "Tropical Aquarius (20 January–18 February) now covers the stars of <b>Capricornus</b>. Sidereal Aquarius covers most of the water bearer. The sign is ruled by Saturn (Uranus in modern astrology), and the Sun is in detriment there.",
            fixedStars: [
                { star: "β", text: "<b>Sadalsuud</b>, 'luck of lucks' (Saturn–Mercury): good fortune, original thinking; in old books also troubles that turn into luck." },
                { star: "α", text: "<b>Sadalmelik</b>, 'luck of the king' (Saturn–Mercury): fortune through authority, but with legal or public tests along the way." },
                { star: "δ", text: "<b>Skat</b>, the shin (Saturn–Jupiter): good fortune and lasting happiness in traditional texts." },
                { star: "γ", text: "<b>Sadachbia</b>, 'lucky star of hidden things' (Saturn–Mercury): what is concealed comes to light." }
            ],
            nakshatras: [
                { name: "Shatabhisha", stars: "λ Aquarii", text: "The hundred physicians, ruled by Varuna: healing, secrecy, independence. 6°40′–20° sidereal Aquarius." },
                { name: "Purva Bhadrapada", stars: "α and β Pegasi (north of the jar)", text: "The front feet of the funeral cot, ruled by Aja Ekapada: intensity, idealism, transformation. 20° Aquarius–3°20′ Pisces." }
            ]
        },
        anatomy: [
            { star: "α", part: "Right shoulder" },
            { star: "β", part: "Left shoulder" },
            { star: "ε", part: "Left hand" },
            { star: "γ", part: "Water jar" },
            { star: "ζ1", part: "Water jar" },
            { star: "η", part: "Water jar" },
            { star: "π", part: "Water jar" },
            { star: "θ", part: "Hip" },
            { star: "δ", part: "Shin" },
            { star: "λ", part: "Stream of water" },
            { star: "φ", part: "Stream of water" },
            { star: "ψ1", part: "Stream of water" }
        ],
        dsos: [
            { text: "<b>M2</b>: one of the largest and richest globular clusters, about 37,000 light years away, north of Sadalsuud. A fuzzy star in binoculars." },
            { text: "<b>The Helix Nebula (NGC 7293)</b>: one of the closest planetary nebulae (~650 light years), a dying star's shed shell, large but faint, best in photos." },
            { text: "<b>The Saturn Nebula (NGC 7009)</b>: a small planetary nebula with 'ansae' that make it look like a tiny Saturn in telescopes." }
        ],
        facts: [
            "TRAPPIST-1, a red dwarf with seven Earth-sized planets (several in the habitable zone), is in Aquarius, about 40 light years away.",
            "The Eta Aquariid meteors (early May) are debris from Halley's Comet, radiating from the Water Jar.",
            "Aquarius is the 10th largest constellation in the sky."
        ],
        stars: {
            "β": { meaning: "Arabic saʿd al-suʿūd, 'luck of lucks'.", ptolemy: "On the left shoulder.", nature: "Saturn and Mercury", dist: 540, type: "G0 Ib: yellow supergiant", astro: "Good fortune, originality; troubles that turn into luck." },
            "α": { meaning: "Arabic saʿd al-malik, 'luck of the king'.", ptolemy: "On the right shoulder.", nature: "Saturn and Mercury", dist: 520, type: "G2 Ib: yellow supergiant", astro: "Fortune through authority; public tests." },
            "δ": { meaning: "Arabic al-sāq, 'the shin'.", nature: "Saturn and Jupiter", type: "A3: white", astro: "Lasting happiness, good fortune." },
            "γ": { meaning: "Arabic saʿd al-akhbiya, 'lucky star of the tents' (or of hidden things).", nature: "Saturn and Mercury", type: "B9: blue-white", story: "The western corner of the Water Jar." },
            "ε": { meaning: "Arabic al-bāliʿ, 'the swallower'.", nature: "Saturn and Mercury", dist: 210, type: "A1: white" },
            "λ": { meaning: "Greek hydor, 'water'.", nature: "Saturn and Jupiter", dist: 390, type: "M2: red giant", story: "Sits in the stream of water, close to the ecliptic." },
            "θ": { meaning: "Latin ancha, 'hip'.", nature: "Mercury and Saturn", dist: 190, type: "G8: yellow giant" }
        }
    },

    Psc: {
        title: "The Fishes",
        tagline: "Two fish tied together by a long V-shaped cord: one a little ring of stars (the Circlet), the other near Andromeda. The knot is Alrescha.",
        shape: [
            "Find the <b>Circlet</b>: a small ring of five or six faint stars (γ, κ, λ, ι, θ and 7 Psc) just south of the Great Square of Pegasus. It's the body of the <b>western fish</b>.",
            "From the Circlet a long, faint line of stars (ω, δ, ε, ζ, μ, ν) runs east to <b>Alrescha (α)</b>, <b>the knot</b> at the point of a big V.",
            "From the knot the other cord runs north to the <b>northern fish</b>, a small group of stars (τ, υ, φ) just below Andromeda.",
            "The whole V wraps around the southeast corner of the Great Square. Pisces is faint everywhere, so you need a dark sky."
        ],
        memory: "Mnemonic: <b>\"A big faint V hugging the Great Square: a ring on one arm, the knot Alrescha at the point, the other fish by Andromeda.\"</b>",
        find: [
            { from: "The Great Square of Pegasus", text: "Drop a few degrees south from the Square's southern side (Markab–Algenib) to find the Circlet." },
            { from: "Aries", text: "From Hamal go about 20° south, past the faint eastern end of the cord, to reach Alrescha, the knot." }
        ],
        season: "An autumn constellation in the north (spring in the south): best on evenings from September to December, highest at midnight in late September. The Sun is in front of it from about 11 March to 18 April, and crosses the March equinox point here.",
        southern: "From the southern hemisphere Pisces sits low in the northern sky in spring, with the V upside down.",
        ecliptic: "The ecliptic runs along the southern cord, through the faint stars between the Circlet and Alrescha. The March equinox point, tropical 0° Aries, lies in Pisces south of ω Piscium, which is why this era is called the Age of Pisces.",
        myths: [
            { culture: "Greek", title: "Aphrodite and Eros", text: "When the monster Typhon attacked the gods, Aphrodite and her son Eros escaped by turning into fish and diving into the Euphrates. They tied themselves together with a cord so they wouldn't lose each other in the water, and the cord's knot is Alrescha." },
            { culture: "Babylonian", title: "The Tails, the Swallow and Anunitum", text: "The Babylonians saw 'the Tails' (two fish tails tied by a cord), together with a swallow (the western fish) and the goddess Anunitum (the northern fish), associated with the Tigris and Euphrates." },
            { culture: "Christian", title: "The sign of the fish", text: "The fish (ichthys) was an early Christian symbol, and the Christian era coincides roughly with the equinox moving into Pisces. This is the root of the idea of the 'Age of Pisces'." },
            { culture: "Vedic", title: "Revati", text: "The faint star ζ Piscium is <b>Revati</b>, 'the wealthy', ruled by Pushan, protector of travellers and flocks: the last of the 27 nakshatras. In the classical Indian astronomy of the Surya Siddhanta, the zodiac's starting point lay next to this star." }
        ],
        astrology: {
            ptolemy: "Ptolemy: the stars in the head of the southern fish are like Mercury and moderately Saturn; those in the body like Jupiter and Mercury; those in the tail and the southern cord like Saturn and moderately Mercury; those in the body and backbone of the northern fish like Jupiter and moderately Venus; those in the northern cord like Saturn and Jupiter; and the bright star on the knot like Mars and moderately Mercury.",
            energy: "Dissolution and compassion: two fish swimming in opposite directions yet bound together. Spirit and matter, the end of the zodiac's cycle and, at the equinox point, its new beginning. Faith, imagination, sacrifice, the ocean of feeling. The knot (Alrescha) is where opposites are tied together.",
            sign: "Tropical Pisces (19 February–20 March) now covers the stars of <b>Aquarius</b>. Sidereal Pisces covers the Circlet, the cord and Alrescha. The sign is ruled by Jupiter (Neptune in modern astrology), Venus is exalted there at 27°, and Mercury falls there.",
            fixedStars: [
                { star: "α", text: "<b>Alrescha</b>, the knot (Mars–Mercury): binding, uniting opposites, bringing threads together; also entanglement." },
                { star: "β", text: "<b>Fumalsamakah</b>, 'the fish's mouth' (Mercury–Saturn): speech held back, careful words; in old books, trouble through water." },
                { star: "η", text: "<b>Alpherg</b>, on the northern cord (Saturn–Jupiter): determination, steady success." },
                { star: "ζ", text: "<b>Revati (ζ Psc)</b>: the end and beginning of the Vedic zodiac, protector of journeys." }
            ],
            nakshatras: [
                { name: "Uttara Bhadrapada", stars: "γ Pegasi and α Andromedae (north of the fish)", text: "The back feet of the funeral cot, ruled by Ahir Budhnya (the serpent of the deep): wisdom, depth, restraint. 3°20′–16°40′ sidereal Pisces." },
                { name: "Revati", stars: "ζ Piscium", text: "The wealthy, ruled by Pushan: safe journeys, nourishment, completion. 16°40′–30° sidereal Pisces." }
            ]
        },
        anatomy: [
            { star: "α", part: "Knot of the cords" },
            { star: "β", part: "Mouth of the western fish" },
            { star: "γ", part: "Western fish (Circlet)" },
            { star: "ι", part: "Western fish (Circlet)" },
            { star: "θ", part: "Western fish (Circlet)" },
            { star: "λ", part: "Western fish (Circlet)" },
            { star: "ω", part: "Tail of the western fish" },
            { star: "δ", part: "Cord" },
            { star: "ε", part: "Cord" },
            { star: "ζ", part: "Cord (Revati)" },
            { star: "ν", part: "Cord" },
            { star: "ο", part: "Cord" },
            { star: "η", part: "Northern cord" },
            { star: "τ", part: "Northern fish" },
            { star: "υ", part: "Northern fish" },
            { star: "φ", part: "Northern fish" }
        ],
        dsos: [
            { text: "<b>M74, the Phantom Galaxy</b>: a perfect face-on spiral about 32 million light years away, near η Psc. It's faint and diffuse, a challenge in small telescopes but a showpiece in Webb Telescope images." },
            { text: "<b>Alrescha (α Psc)</b>: a close double star of two white stars, needing a telescope at high power." }
        ],
        facts: [
            "Pisces is the 14th largest constellation but has no star brighter than magnitude 3.6.",
            "Van Maanen's Star, one of the nearest white dwarfs (~14 light years), lies in Pisces.",
            "Since about the 1st century BC, the Sun has crossed the celestial equator northward each March while in Pisces."
        ],
        stars: {
            "α": { meaning: "Arabic al-rishāʾ, 'the cord'.", ptolemy: "The bright star on the knot.", nature: "Mars and Mercury", dist: 151, type: "A0: a pair of white stars", astro: "Binding, uniting opposites, entanglement." },
            "η": { meaning: "Arabic al-fargh, 'the spout (of the water bucket)'. Babylonian Kullat Nūnu, 'the cord of the fish'.", nature: "Saturn and Jupiter", dist: 350, type: "G7 III: yellow giant", story: "The brightest star in Pisces, though only magnitude 3.6.", astro: "Determination, steady success." },
            "β": { meaning: "Arabic fum al-samaka, 'the mouth of the fish'.", nature: "Mercury and Saturn", dist: 410, type: "B6 Ve: hot blue star with a gas disk", astro: "Careful speech; restraint." },
            "γ": { meaning: "No proper name; the brightest star of the Circlet.", nature: "Jupiter and Mercury", dist: 135, type: "G9 III: yellow giant", story: "An old star from the galaxy's thick disk, moving fast relative to the Sun." },
            "ζ": { meaning: "IAU name Revati, from the nakshatra it marks.", nature: "Saturn and Mercury", dist: 150, type: "A7 IV: white, a double star", astro: "End and beginning; protection on journeys." },
            "ω": { meaning: "No proper name.", nature: "Saturn and Mercury", dist: 106, type: "F4 IV: yellow-white", story: "The March equinox point lies a little south of this star." }
        }
    }
};


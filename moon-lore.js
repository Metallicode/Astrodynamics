// Lore for the Chandra (Moon) view: nakshatra star groups and myths, the Rahu/Ketu story, panchanga limbs.
// Yogatara (junction star) identifications follow the common modern reading of the Surya Siddhanta list;
// several are disputed and alternatives are mentioned in the text.

const MOON_LORE = {
    chandra: {
        title: 'Chandra, the Moon',
        myth: `Daksha Prajapati gave Chandra twenty-seven of his daughters in marriage: the <b>nakshatras</b>. The Moon spends roughly one night with each as it circles the sky in 27.3 days. But Chandra loved only <b>Rohini</b> (Aldebaran and the Hyades) and lingered with her. The other wives complained to their father, and Daksha cursed Chandra with a wasting disease (<i>kshaya</i>). As the Moon shrank, the plants and the soma it nourishes began to fail, so the gods appealed to Shiva. At Prabhasa (Somnath) Shiva softened the curse: Chandra would waste away for one fortnight and grow back for the next. That is the waxing and waning we see. Shiva wears the crescent in his hair, which is why he is called <i>Chandrashekhara</i>.`,
        soma: `Chandra is also <b>Soma</b>, the cup of the divine drink that the gods sip, emptying it each month until it is refilled. In the Rig Veda Soma is a plant, a drink and a god at once, and later texts identify him with the Moon.`,
        west: `In Greek myth <b>Selene</b> drives a silver chariot across the night. She was later merged with <b>Artemis</b> the huntress, and the Romans called her <b>Luna</b>. Many cultures see a figure on the full Moon: the "Man in the Moon" in Europe and the <b>hare</b> (<i>shasha</i>) in India, China and Mesoamerica. In India the Moon is <i>Shashanka</i>, "marked with the hare".`,
        astrology: `In astrology the Moon is the mind (<i>manas</i>), the mother, memory and the body's rhythms. In Jyotish your <b>Moon sign</b> (rashi) and <b>birth nakshatra</b> count for more than the Sun sign. Your nakshatra sets your Vimshottari dasha timeline, and daily timing (<i>muhurta</i>) is judged from the Moon's tithi and nakshatra.`
    },

    nodes: {
        what: `The Moon's orbit is tilted about <b>5.1°</b> to the ecliptic, the plane of the Earth's orbit and the Sun's yearly path. The two orbits cross at two points on opposite sides of the sky: the <b>nodes</b>. Where the Moon crosses heading north is the <b>ascending node, ☊ Rahu</b>. Where it crosses heading south is the <b>descending node, ☋ Ketu</b>. They are not bodies, just places where two circles intersect. Still, they are the only places where the Sun, Moon and Earth can line up exactly.`,
        eclipses: `Every month the Moon passes between the Earth and the Sun (New Moon) and behind the Earth (Full Moon). Usually it passes a little above or below them, because of the tilt. An eclipse needs a New or Full Moon that falls <b>near a node</b>. That is why the nodes are the "eaters" of the Sun and Moon. Twice a year the Sun itself passes the nodal axis. For about five weeks around each passage any New or Full Moon is close enough to cause an eclipse: these are the <b>eclipse seasons</b>.`,
        regression: `The pull of the Sun twists the Moon's orbit, so the nodes slide <b>backwards</b> through the zodiac, about 19.3° a year. They take <b>18.6 years</b> for a full circle and spend roughly 18 months in each sign. This is why Rahu and Ketu are always retrograde in astrology. Because the nodes move, the Sun meets them again after only 346.6 days (the <i>eclipse year</i>), and eclipse seasons arrive about 19 days earlier each year.`,
        meanTrue: `The <b>mean node</b> moves smoothly backwards. The <b>true node</b> is the crossing point of the Moon's actual orbit at this moment. It wobbles up to about 1.7° either side of the mean, with a main period of about 173 days, and for days at a time it even moves forwards. Vedic astrologers traditionally use the mean node and many Western astrologers the true one. Switch between them in the left pane of the Wheel view.`,
        standstill: `The node cycle also sets how far north and south the Moon can go. When Rahu is near 0° tropical Aries, the Moon's tilt adds to the Earth's axial tilt: its declination swings to <b>±28.6°</b>. The Moon then rises and sets at its most extreme azimuths and rides very high or very low. This is a <b>major lunar standstill</b>, the latest around 2024–25. Nine years later the tilts subtract (±18.3°), giving a <b>minor standstill</b>. Monuments such as Callanish in Scotland and Chimney Rock in Colorado are thought to be aligned to these extremes.`,
        saros: `After <b>223 lunations</b> (18 years, 11 days and 8 hours) the Sun, Moon and nodes return to almost the same arrangement, and a near-identical eclipse repeats. This is the <b>Saros</b> cycle, known to Babylonian astronomers. Each repeat falls about 120° further west on the Earth, because of the extra 8 hours.`,
        myth: `When the gods (devas) and demons (asuras) churned the <b>Ocean of Milk</b> together, with Mount Mandara as the churning rod and the serpent Vasuki as the rope, the <b>amrita</b>, the nectar of immortality, finally rose up. Vishnu took the form of the enchantress <b>Mohini</b> to pour it for the gods alone. The asura <b>Svarbhanu</b> disguised himself and sat in the line of gods between the Sun and the Moon, and he drank. Surya and Chandra recognised him and cried out. Vishnu's discus <b>Sudarshana</b> struck off his head before the nectar could go further than his throat. But the head and body had tasted amrita and could not die. The head became <b>Rahu</b> and the body (or the serpent's tail) <b>Ketu</b>. Ever since, Rahu chases the Sun and the Moon who betrayed him and swallows them at eclipses. Having no body, he cannot hold them, and they slip out of his severed neck.`,
        west: `Medieval European and Arabic astrologers called the nodes <b>Caput Draconis</b> (the Dragon's Head, ☊) and <b>Cauda Draconis</b> (the Dragon's Tail, ☋). The idea of an eclipse dragon that eats the Sun is ancient and widespread, from China (a celestial dog or dragon) to Persia (<i>Gozihr</i>). The month the Moon takes to return to the same node (27.21 days) is still called the <b>draconic month</b>.`,
        rahu: `<b>Rahu</b>, the head, is all appetite and no stomach: it hungers and is never full. It magnifies whatever it touches and stands for obsession, ambition, the foreign and unconventional, sudden rise, illusion and technology. It behaves like Saturn. Many authorities exalt it in Taurus or Gemini. In a chart Rahu shows what you are drawn to and still learning: unfamiliar territory.`,
        ketu: `<b>Ketu</b>, the headless body, is the opposite: it perceives without seeing and has let go. It stands for detachment, past mastery, intuition, spirituality and liberation (<i>moksha</i>), but also confusion and sudden cuts. It behaves like Mars. Many exalt it in Scorpio or Sagittarius. In a chart Ketu shows what comes naturally and must be released.`,
        axis: `Rahu and Ketu are always exactly opposite, so they work as an <b>axis</b>: the pull between where you are going (Rahu) and where you are coming from (Ketu). Eclipses fall along this axis, which is why astrologers watch the signs and houses the nodes are passing through.`,
        rahuKaal: `<b>Rahu Kaal</b> (Rahu Kalam) is a daily period of about 90 minutes ruled by Rahu. Popular panchangas treat it as inauspicious for starting anything new. Split the time from sunrise to sunset into 8 equal parts. Rahu takes the 8th part on Sunday, 2nd on Monday, 7th on Tuesday, 5th on Wednesday, 6th on Thursday, 4th on Friday and 3rd on Saturday.`
    },

    // Months named after the nakshatra where (roughly) their Full Moon falls.
    monthOfNakshatra: ['Ashvina', 'Ashvina', 'Kartika', 'Kartika', 'Margashirsha', 'Margashirsha', 'Pausha', 'Pausha', 'Magha', 'Magha',
        'Phalguna', 'Phalguna', 'Phalguna', 'Chaitra', 'Chaitra', 'Vaishakha', 'Vaishakha', 'Jyeshtha', 'Jyeshtha', 'Ashadha', 'Ashadha',
        'Shravana', 'Shravana', 'Bhadrapada', 'Bhadrapada', 'Bhadrapada', 'Ashvina'],

    // Index 0 = Sunday
    varas: [
        { name: 'Ravivara', lord: 'Sun', note: 'Sun\'s day: authority, health, government, father.' },
        { name: 'Somavara', lord: 'Moon', note: 'Moon\'s day: home, mother, travel by water, the mind. Sacred to Shiva.' },
        { name: 'Mangalavara', lord: 'Mars', note: 'Mars\'s day: courage, surgery, property, competition. Sacred to Hanuman.' },
        { name: 'Budhavara', lord: 'Mercury', note: 'Mercury\'s day: learning, writing, trade, communication.' },
        { name: 'Guruvara', lord: 'Jupiter', note: 'Jupiter\'s day: teachers, religion, finance, blessings.' },
        { name: 'Shukravara', lord: 'Venus', note: 'Venus\'s day: arts, marriage, luxury, beauty.' },
        { name: 'Shanivara', lord: 'Saturn', note: 'Saturn\'s day: discipline, labour, the elderly, endings.' }
    ],

    // The 27 nitya yogas: (sidereal Sun + sidereal Moon) in 13°20' steps.
    yogas: [
        ['Vishkambha', 'the prop (supporting pillar)', false], ['Priti', 'affection', true], ['Ayushman', 'long life', true],
        ['Saubhagya', 'good fortune', true], ['Shobhana', 'splendour', true], ['Atiganda', 'great danger', false],
        ['Sukarma', 'virtuous deeds', true], ['Dhriti', 'steadfastness', true], ['Shula', 'the spear (pain)', false],
        ['Ganda', 'the knot (obstacle)', false], ['Vriddhi', 'growth', true], ['Dhruva', 'the fixed (stable)', true],
        ['Vyaghata', 'the blow', false], ['Harshana', 'joy', true], ['Vajra', 'the thunderbolt', false],
        ['Siddhi', 'accomplishment', true], ['Vyatipata', 'calamity', false], ['Variyana', 'ease, comfort', true],
        ['Parigha', 'the iron bar (obstruction)', false], ['Shiva', 'auspicious (the benevolent)', true], ['Siddha', 'the accomplished', true],
        ['Sadhya', 'the attainable', true], ['Shubha', 'auspicious', true], ['Shukla', 'bright, pure', true],
        ['Brahma', 'the creator (wisdom)', true], ['Indra', 'the chief (power)', true], ['Vaidhriti', 'poor support', false]
    ],
    yogaNote: 'A nitya yoga is one of 27 equal divisions of the sum of the Sun\'s and Moon\'s sidereal longitudes. Nine are traditionally inauspicious for new beginnings: Vishkambha, Atiganda, Shula, Ganda, Vyaghata, Vajra, Vyatipata, Parigha and Vaidhriti.',

    // Karanas are half-tithis (6° of Sun–Moon separation). 7 movable ones cycle 8 times; 4 fixed ones fill the ends.
    karanas: {
        movable: [
            ['Bava', 'Good for things meant to last and for growth.'],
            ['Balava', 'Good for study, religious acts and welfare.'],
            ['Kaulava', 'Good for friendship and partnerships.'],
            ['Taitila', 'Good for home, decoration and the arts.'],
            ['Gara', 'Good for farming, building and starting work.'],
            ['Vanija', 'Good for trade, buying and selling.'],
            ['Vishti', 'Also called <b>Bhadra</b>: traditionally avoided for anything auspicious, though fine for harsh or destructive work.']
        ],
        fixed: {
            0: ['Kimstughna', 'The first half of the first bright tithi. Considered auspicious.'],
            57: ['Shakuni', 'A fixed karana in the dark half: suited to medicine and mantras.'],
            58: ['Chatushpada', 'A fixed karana ("four-footed"): suited to matters of cattle and ancestors.'],
            59: ['Naga', 'A fixed karana ("serpent"): suited to harsh, permanent works.']
        }
    },
    karanaNote: 'A karana is half a tithi: each 6° of separation between the Moon and the Sun, so 60 in a month.',

    panchangaNote: 'The <b>panchanga</b> ("five limbs") describes each moment by five measures: the <b>tithi</b> (lunar day), <b>vara</b> (weekday), <b>nakshatra</b> (the Moon\'s mansion), <b>yoga</b> (Sun + Moon) and <b>karana</b> (half-tithi). It is the basis of the Hindu calendar and of muhurta, the choosing of good times.',

    // Per nakshatra: yogatara [constellation, Bayer letter or Flamsteed number], the star group, how to find it, the myth.
    nakshatras: [
        { yogatara: ['Ari', 'β'], stars: 'β and γ Arietis (Sheratan and Mesarthim), the two horns of the Ram; some include α (Hamal).',
            find: 'The short bright line of Hamal and Sheratan just below the pale triangle of Triangulum, west of the Pleiades.',
            myth: 'The <b>Ashwini Kumaras</b>, twin horse-headed physicians of the gods, were born to the Sun and Saranya when she had taken the form of a mare. They rejuvenated the aged sage Chyavana, and they arrive like the dawn, swift and healing. As the first nakshatra of the sidereal zodiac it begins at 0° Aries.' },
        { yogatara: ['Ari', '41'], stars: '35, 39 and 41 Arietis: a small, faint triangle above the Ram\'s back (once the obsolete constellation Musca Borealis, the Fly).',
            find: 'Halfway between Hamal and the Pleiades, slightly north: a tiny triangle of 4th-magnitude stars that needs a dark sky.',
            myth: 'Ruled by <b>Yama</b>, the first mortal to die, who became lord of death and dharma. Its name means "she who bears": the womb that carries life (its symbol is the <i>yoni</i>) and the burden of karma carried to judgement.' },
        { yogatara: ['Tau', 'η'], stars: 'The Pleiades (M45). Alcyone (η Tau) is the brightest.',
            find: 'The unmistakable misty little dipper of stars west of Aldebaran. Six or seven are visible to the eye.',
            myth: 'The six <b>Krittikas</b> were the wives of six of the Seven Sages (the Big Dipper). Only Arundhati (Alcor, beside Mizar) stayed faithful. The Krittikas nursed the infant war god <b>Skanda</b>, who grew six heads to drink from all of them and is named <i>Kartikeya</i> after them. The deity is <b>Agni</b>, fire, and its symbol is a razor or flame. In the oldest Vedic lists Krittika is the <i>first</i> nakshatra: around 2300 BCE the spring equinox lay here.' },
        { yogatara: ['Tau', 'α'], stars: 'Aldebaran and the V-shaped Hyades: the Bull\'s face, read in India as an ox-cart (<i>shakata</i>).',
            find: 'The bright orange star at one tip of the V of the Hyades, following the Pleiades. Orion\'s Belt points up and to the right towards it (as seen from the north).',
            myth: '<b>Rohini</b>, "the red one", is Chandra\'s favourite wife and the reason for his curse (see Chandra above). The Moon is exalted in her sign, Taurus. Her creator-deity is Prajapati. The Moon regularly passes over the Hyades, and a planet "breaking Rohini\'s cart" (<i>Rohini shakata bheda</i>, Saturn or Mars passing south of Aldebaran) was a dreaded omen of famine.' },
        { yogatara: ['Ori', 'λ'], stars: 'λ, φ¹ and φ² Orionis: the small triangle of Orion\'s head.',
            find: 'The faint knot of stars above and between Betelgeuse and Bellatrix, at the top of Orion.',
            myth: 'In the Aitareya Brahmana, <b>Prajapati</b> took the form of a stag and pursued his daughter Rohini. The gods made Rudra to punish him. Rudra, the Deer-Slayer (<i>Mrigavyadha</i>, Sirius), shot him with a three-jointed arrow (Orion\'s Belt), and the deer\'s head stayed in the sky as <b>Mrigashira</b>. Its deity is Soma, the Moon itself.' },
        { yogatara: ['Ori', 'α'], stars: 'Betelgeuse alone: the red shoulder of Orion.',
            find: 'The orange-red star at Orion\'s upper left (from the north), opposite blue Rigel.',
            myth: '<b>Ardra</b>, "the moist one", belongs to <b>Rudra</b>, the howling storm god, the fierce early form of Shiva. Its symbol is a teardrop: the storm that wrecks and the rain that renews. It falls in Gemini but sits 16° south of the ecliptic, so the Moon never actually reaches Betelgeuse.' },
        { yogatara: ['Gem', 'β'], stars: 'Castor and Pollux, the heads of the Twins.',
            find: 'The two bright stars side by side, high above Orion and to the left of Procyon. Pollux is the brighter, orange one.',
            myth: '<b>Punarvasu</b>, "the return of the light", is the nakshatra of <b>Aditi</b>, the boundless mother of the gods. Its symbol is a quiver of arrows, refilled again and again. Rama was born when the Moon was in Punarvasu.' },
        { yogatara: ['Cnc', 'δ'], stars: 'γ, δ and θ Cancri: the Asses (Aselli) around the Beehive cluster (M44).',
            find: 'The faint middle of Cancer, between Pollux and Regulus. Look for the hazy glow of the Beehive, with the two Aselli beside it.',
            myth: '<b>Pushya</b>, "the nourisher", is ruled by <b>Brihaspati</b>, the guru of the gods (Jupiter). Its symbol is a cow\'s udder or a flower. It is considered the most auspicious of all nakshatras, especially on a Thursday (<i>Guru Pushya</i>) or a Sunday (<i>Ravi Pushya</i>). Weddings are an exception, because of an old curse. δ Cancri sits almost exactly on the ecliptic, so the Moon often covers it.' },
        { yogatara: ['Hya', 'ε'], stars: 'δ, ε, η, ρ and σ Hydrae: the ring of stars forming the Sea Serpent\'s head (some take α Cancri instead).',
            find: 'A faint loop of stars below Cancer and to the right of Regulus: the head of Hydra, the longest constellation.',
            myth: '<b>Ashlesha</b>, "the entwiner" or "the embrace", belongs to the <b>Nagas</b>, the serpent beings. Its symbol is a coiled snake. It holds the serpent\'s power of hypnotic grip, poison and medicine. It ends the "gandanta" knot where water (Cancer) meets fire (Leo).' },
        { yogatara: ['Leo', 'α'], stars: 'Regulus and the Sickle of Leo, the reversed question mark of the Lion\'s head and mane.',
            find: 'The bright blue-white star at the base of the Sickle. Regulus lies almost on the ecliptic, so the Moon and planets pass very close to it.',
            myth: '<b>Magha</b>, "the mighty", is ruled by the <b>Pitris</b>, the ancestors. Its symbol is a royal throne or palanquin. Regulus is the "little king" and one of the four Royal Stars of Persia. Magha carries lineage, inheritance and the honour owed to those who came before.' },
        { yogatara: ['Leo', 'δ'], stars: 'δ and θ Leonis (Zosma and Chertan): the Lion\'s hips, seen as the front legs of a bed.',
            find: 'The triangle of the Lion\'s hindquarters, east of Regulus: Zosma and Chertan form its west side.',
            myth: '<b>Purva Phalguni</b>, "the former reddish one", is ruled by <b>Bhaga</b>, the god of delight, marital happiness and one\'s share of fortune. Its symbol is the front legs of a bed or a hammock: rest, pleasure and love.' },
        { yogatara: ['Leo', 'β'], stars: 'Denebola (β Leo) and 93 Leonis: the Lion\'s tail, the back legs of the bed.',
            find: 'Denebola, the star at the Lion\'s tail, east of Zosma. It is the far tip of the Lion\'s triangle.',
            myth: '<b>Uttara Phalguni</b>, "the latter reddish one", completes the pair. It is ruled by <b>Aryaman</b>, god of contracts, hospitality, patronage and marriage vows: the commitments that follow pleasure. Shiva and Parvati are said to have married under it.' },
        { yogatara: ['Crv', 'δ'], stars: 'The five main stars of Corvus (the Crow) are the five fingers of a hand.',
            find: 'A small, distinct quadrilateral of 3rd-magnitude stars, right and below Spica. Algorab (δ) is its upper left corner.',
            myth: '<b>Hasta</b>, "the hand", is ruled by <b>Savitar</b>, the vivifying power of the Sun who lifts up his golden hands at dawn. It stands for skill, craft, healing touch and dexterity, with an open palm grasping what it wants.' },
        { yogatara: ['Vir', 'α'], stars: 'Spica alone: the ear of grain in the Virgin\'s hand.',
            find: 'Follow the arc of the Big Dipper\'s handle to Arcturus, then "speed on" to Spica, a bright blue-white star low in the south in spring.',
            myth: '<b>Chitra</b>, "the brilliant", is the jewel of <b>Tvashtar</b> (Vishvakarma), the architect and craftsman of the gods. Its symbol is a bright pearl. Spica is the anchor of this app\'s sidereal zodiac: the <b>Lahiri (Chitrapaksha) ayanamsa</b> is defined so that Spica stands at exactly 180°, 0° Libra. The midpoint of Chitra is therefore the zero point of the second half of the zodiac.' },
        { yogatara: ['Boo', 'α'], stars: 'Arcturus alone: the bright orange star of the Herdsman.',
            find: 'The brightest star of the northern spring sky: "arc to Arcturus" from the Big Dipper\'s handle. It lies 31° north of the ecliptic, so the Moon never comes near it.',
            myth: '<b>Swati</b>, "the independent one" or "the sword", belongs to <b>Vayu</b>, the wind. Its symbol is a young shoot swaying in the breeze: flexible, self-reliant and restless. Indian poets say a raindrop falling into an oyster when the Moon is in Swati becomes a pearl.' },
        { yogatara: ['Lib', 'α2'], stars: 'α and β Librae (Zubenelgenubi and Zubeneschamali), the Scales; some add γ and ι.',
            find: 'The two fairly faint stars between Spica and Antares that were once the Scorpion\'s claws (their Arabic names mean "southern claw" and "northern claw").',
            myth: '<b>Vishakha</b>, "forked" or "two-branched", is ruled jointly by <b>Indra and Agni</b>. Its symbol is a triumphal gateway decorated with leaves. It is single-minded ambition that splits into two paths. The Buddha\'s birth, enlightenment and death are all celebrated on the Full Moon of Vaishakha, the month named after it.' },
        { yogatara: ['Sco', 'δ'], stars: 'β, δ and π Scorpii: the arc at the Scorpion\'s head.',
            find: 'The short vertical arc of three stars to the right of Antares. Dschubba (δ) is in the middle.',
            myth: '<b>Anuradha</b>, "following Radha" (the one after Vishakha), is ruled by <b>Mitra</b>, the god of friendship and alliance. Its symbol is a lotus blooming from mud: devotion, loyalty and success through cooperation.' },
        { yogatara: ['Sco', 'α'], stars: 'Antares with σ and τ Scorpii: the Scorpion\'s red heart and its guards.',
            find: 'The red star at the heart of the Scorpion, low in the south on summer evenings, with fainter stars on either side.',
            myth: '<b>Jyeshtha</b>, "the eldest", is ruled by <b>Indra</b>, king of the gods. Its symbol is a talisman or an earring. It carries seniority, protection and the burden of power. Antares, "rival of Mars" (Ares), is another of the four Royal Stars, and the Moon often occults it.' },
        { yogatara: ['Sco', 'λ'], stars: 'The curl of the Scorpion\'s tail, ending in the sting: λ and υ Scorpii (Shaula and Lesath).',
            find: 'The pair of close stars at the tip of the long hooked tail, very low from northern latitudes.',
            myth: '<b>Mula</b>, "the root", is ruled by <b>Nirriti</b>, goddess of dissolution, and its symbol is a bunch of roots tied together. It digs to the bottom of things, destroying in order to find the truth. Modern writers like to note that the centre of our galaxy, the root of the Milky Way, lies in Mula.' },
        { yogatara: ['Sgr', 'δ'], stars: 'δ and ε Sagittarii (Kaus Media and Kaus Australis): the base of the Archer\'s bow, the spout of the Teapot.',
            find: 'The lower right of the "Teapot" asterism of Sagittarius, east of the Scorpion\'s tail.',
            myth: '<b>Purva Ashadha</b>, "the early invincible", belongs to <b>Apas</b>, the cosmic waters. Its symbol is a winnowing fan or an elephant tusk. It brings purification, conviction and the power to declare victory before the battle.' },
        { yogatara: ['Sgr', 'σ'], stars: 'σ and ζ Sagittarii (Nunki and Ascella), the handle of the Teapot; some include τ and φ.',
            find: 'The left (east) side of the Teapot\'s handle. Nunki is its brightest star.',
            myth: '<b>Uttara Ashadha</b>, "the later invincible", is ruled by the <b>Vishvadevas</b>, the ten universal gods of virtue. Its symbol is an elephant tusk or a small bed. Its victory is lasting. Between it and Shravana lies <b>Abhijit</b> (Vega), the 28th nakshatra of the older lists. The victorious midday hour, <i>Abhijit muhurta</i>, is named after it.' },
        { yogatara: ['Aql', 'α'], stars: 'Altair with β and γ Aquilae: three stars in a line, the head of the Eagle.',
            find: 'The southern corner of the Summer Triangle (Vega, Deneb, Altair): a bright star with a fainter one on each side. It lies 29° north of the ecliptic.',
            myth: '<b>Shravana</b>, "hearing", is ruled by <b>Vishnu</b>, and its symbol is an ear or <b>three footprints</b>: the three strides with which Vishnu as Trivikrama crossed earth, sky and heaven. It is the nakshatra of listening and learning, and of oral tradition handed down by ear.' },
        { yogatara: ['Del', 'β'], stars: 'The four-star diamond of Delphinus (the Dolphin), read as a drum.',
            find: 'A small, neat diamond of stars east of Altair, very compact and easy to spot.',
            myth: '<b>Dhanishta</b>, "the wealthiest", is ruled by the <b>eight Vasus</b>, gods of the elements and of abundance. Its symbol is a drum (<i>mridanga</i>): rhythm, music and prosperity.' },
        { yogatara: ['Aqr', 'λ'], stars: 'λ Aquarii and the faint scatter of stars around the Water-Bearer\'s stream.',
            find: 'A dim region south of the Circlet of Pisces. λ Aquarii is a 4th-magnitude star almost on the ecliptic.',
            myth: '<b>Shatabhisha</b>, "a hundred physicians" (or "a hundred stars"), belongs to <b>Varuna</b>, god of the cosmic waters and of truth, who binds wrongdoers and heals the sick. Its symbol is an empty circle. It is secretive, scientific, solitary and healing.' },
        { yogatara: ['Peg', 'α'], stars: 'Markab and Scheat (α and β Pegasi): the west side of the Great Square, the front of a funeral cot.',
            find: 'The two stars on the right-hand side of the Great Square of Pegasus, high in autumn. They lie 19° north of the ecliptic.',
            myth: '<b>Purva Bhadrapada</b>, "the former lucky feet", is ruled by <b>Aja Ekapada</b>, the one-footed goat, a fiery and ascetic form of Rudra. Its symbol is a sword or the front legs of a funeral cot. It brings penance, intensity and the burning away of the old.' },
        { yogatara: ['Peg', 'γ'], stars: 'Algenib (γ Peg) and Alpheratz (α And): the east side of the Great Square, the back of the cot.',
            find: 'The two stars on the left-hand side of the Great Square. Together with the previous pair they complete the Square.',
            myth: '<b>Uttara Bhadrapada</b> is ruled by <b>Ahir Budhnya</b>, the serpent of the depths who lies at the bottom of the cosmic ocean. Its symbol is the back legs of the funeral cot or twins. It is the calm after the fire: depth, wisdom, patience and the kundalini at rest.' },
        { yogatara: ['Psc', 'ζ'], stars: 'ζ Piscium, a faint star on the cord between the two Fishes.',
            find: 'Hard to see: a 5th-magnitude star in the band of Pisces, south of the Great Square and east of the Circlet.',
            myth: '<b>Revati</b>, "the wealthy", belongs to <b>Pushan</b>, the nourisher who guides travellers and herds and leads souls on their final journey. Its symbol is a fish or drum. As the last nakshatra it ends the cycle: the old astronomers put the zodiac\'s end, 360° sidereal, right beside ζ Piscium.' }
    ]
};

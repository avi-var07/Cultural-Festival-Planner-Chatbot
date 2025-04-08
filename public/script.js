let scheduledFestivals = JSON.parse(localStorage.getItem('scheduledFestivals')) || [];
let currentFestivalPlan = null;
let currentQuestionIndex = 0;
let awaitingDescription = false;
let awaitingYearConfirmation = false;
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
let conversationMemory = JSON.parse(localStorage.getItem('conversationMemory')) || {};


function saveToChatHistory(userMessage, botResponse) {
    console.log("Saving to chat history:", { userMessage, botResponse });
    chatHistory.push({ sender: 'user', message: userMessage, timestamp: new Date().toISOString() });
    chatHistory.push({ sender: 'bot', message: botResponse, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    console.log("Chat history saved to localStorage:", chatHistory);
}
function saveConversationMemory() {
    localStorage.setItem('conversationMemory', JSON.stringify(conversationMemory));
    console.log("Conversation memory saved to localStorage:", conversationMemory);
}
function loadConversationMemory() {
    const storedMemory = localStorage.getItem('conversationMemory');
    if (storedMemory) {
        try {
            conversationMemory = JSON.parse(storedMemory);
        } catch (e) {
            console.error("Error parsing conversationMemory:", e);
            conversationMemory = {};
            localStorage.setItem('conversationMemory', JSON.stringify(conversationMemory));
        }
    }
}
const questions = [
    "Great! Let's plan a festival. Please tell me the festival name.",
    "Thanks! Now, please tell me the date of the festival (e.g., DD-MM-YYYY or 19 October 2025).",
    "Got it! Please tell me the budget in rupees (e.g., 50000).",
    "Nice! Please tell me the location.",
    "Great! How many people will attend? (Enter a number)",
    "Awesome! Please tell me the food type (e.g., vegetarian, vegan, non-vegetarian).",
    "Finally, how many days will the festival last? (Enter a number)"
];

const knownFestivals = {
    'holi': {
        fixedDuration: 2,
        activities: ["Light bonfires for Holika Dahan, sing songs, and pray", "Play with eco-friendly colors, water balloons, dance to folk music, and host feasts"],
        decorations: ["Bonfire setup, floral rangoli, and lamps", "Vibrant colored powders, water sprinklers, and colorful decor"],
        food: ["Offer puran poli, pakoras, and thandai", "Gujiya, malpua, dahi bhalla, and chaat"],
        why: "Holi celebrates the victory of good over evil. Day 1 (Holika Dahan) commemorates the burning of Holika, symbolizing the triumph of Prahlad’s devotion over evil. Day 2 celebrates spring, love, and Krishna-Radha’s playful bond.",
        significance: "Symbolizes renewal, forgiveness, and the triumph of devotion",
        dailySignificance: [
            { day: 1, name: "Holika Dahan", significance: "Marks the burning of Holika, symbolizing the victory of faith and good over evil as Prahlad was saved by Lord Vishnu." },
            { day: 2, name: "Holi", significance: "Celebrates spring’s arrival, Krishna’s playful colors with Radha, and the renewal of relationships with love and forgiveness." }
        ],
        places: "Visit Mathura or Vrindavan for Krishna celebrations, Barsana for Lathmar Holi, or local parks",
        performances: ["Folk songs (e.g., 'Phagun Aayo'), bonfire chants", "Raslila dances, Holi geet (e.g., 'Rang Barse')"],
        budgetTips: "Buy colors in bulk, make sweets at home, use local wood for bonfires, and host potlucks.",
        enjoyment: "Day 1: Enjoy bonfire warmth and prayers. Day 2: Play with colors, dance, and share sweets.",
        crowdManagement: "Day 1: Keep safe distance from bonfires. Day 2: Set up color zones and water stations.",
        theme: "Colors and renewal",
        dressCode: "White or light-colored traditional attire",
        songs: ["Phagun Aayo", "Rang Barse"],
        dances: ["Folk dances", "Raslila"]
    },
    'eid al-fitr': {
        activities: ["Attend morning prayers, exchange greetings ('Eid Mubarak'), share feasts, and give charity"],
        decorations: ["Use crescent moon motifs, lanterns, green-white schemes, prayer rugs, and lights"],
        food: ["Serve biryani, sheer khurma, kebabs, haleem, and dates"],
        why: "Eid al-Fitr marks the end of Ramadan, celebrating gratitude to Allah for strength and blessings.",
        significance: "Emphasizes community, charity, and spiritual renewal",
        places: "Visit Jama Masjid in Delhi, mosques, or community centers for prayers and feasts",
        performances: ["Qawwali, Eid Takbir recitations, and children’s dances"],
        budgetTips: "Cook in bulk, share food, and use reusable decor.",
        enjoyment: "Enjoy by dressing in new clothes, visiting relatives, and savoring dishes.",
        crowdManagement: "Organize prayer lines, set up food stalls with queues, and ensure parking.",
        theme: "Gratitude and unity",
        dressCode: "New or festive traditional attire",
        songs: ["Eid Mubarak chants", "Traditional qawwalis"],
        dances: ["Community folk dances"]
    },
    'diwali': {
        activities: ["Light diyas, perform Lakshmi Puja", "Burst eco-friendly fireworks, share sweets"],
        decorations: ["Diyas, rangoli", "String lights, marigold garlands, lanterns"],
        food: ["Offer laddoos, barfi", "Chakli, namak pare, and mathri"],
        why: "Diwali celebrates Lord Rama’s return to Ayodhya after defeating Ravana, symbolizing light over darkness.",
        significance: "Represents light over darkness and good over evil",
        places: "Visit Varanasi for Ganga Aarti, Golden Temple for lights, or markets",
        performances: ["Garba dances, bhajans (e.g., 'Jai Lakshmi Mata')", "Fireworks, Ramlila plays"],
        budgetTips: "Use LED lights, make sweets, buy bulk firecrackers, and reuse decor.",
        enjoyment: "Enjoy by lighting homes, playing cards, watching fireworks, and gifting.",
        crowdManagement: "Designate firework zones, ensure ventilation, and monitor kids near diyas.",
        theme: "Light and prosperity",
        dressCode: "Traditional Indian attire (sarees, kurtas)",
        songs: ["Jai Lakshmi Mata", "Aarti Shri Ramayan Ji Ki"],
        dances: ["Garba", "Dandiya"]
    },
    'lohri': {
        activities: ["Dance bhangra around a bonfire, sing folk songs, toss sesame seeds", "Share sweets and enjoy community bonding"],
        decorations: ["Bonfire setup with kites, Punjabi props", "Vibrant fabrics and harvest decorations"],
        food: ["Sarson da saag, makki di roti", "Rewari, gajak, peanuts"],
        why: "Lohri marks the end of winter and rabi crop harvest, honoring the Sun God for prosperity.",
        significance: "Honors the Sun God and celebrates agricultural abundance",
        places: "Visit Punjab villages or local grounds for bonfire events",
        performances: ["Bhangra, gidda, Lohri songs (e.g., 'Sundar Mundriye')", "Dhol beats and folk performances"],
        budgetTips: "Use local wood, make sweets, and host potlucks.",
        enjoyment: "Enjoy dancing, singing, and eating warm treats by the fire.",
        crowdManagement: "Keep safe distance from bonfire, provide seating, and have water handy.",
        theme: "Warmth and harvest",
        dressCode: "Bright Punjabi attire",
        songs: ["Sundar Mundriye", "Lo Aayi Lohri Ve"],
        dances: ["Bhangra", "Gidda"]
    },
    'baisakhi': {
        activities: ["Perform bhangra, visit gurdwaras", "Serve langar to all and celebrate harvest"],
        decorations: ["Yellow-orange themes, harvest motifs", "Drums, Nishan Sahib flags"],
        food: ["Kadhi, lassi", "Pinnis, chole, jalebi"],
        why: "Baisakhi celebrates the Sikh New Year, Khalsa formation by Guru Gobind Singh, and spring harvest.",
        significance: "Honors community, equality, and agricultural prosperity",
        places: "Visit Anandpur Sahib, Golden Temple, or fields",
        performances: ["Bhangra, gidda", "Kirtan (e.g., 'Satnam Waheguru'), Gatka displays"],
        budgetTips: "Cook langar in bulk, use natural flowers, and involve volunteers.",
        enjoyment: "Enjoy dancing, eating Punjabi food, and praying.",
        crowdManagement: "Set up langar queues, provide shaded seating, and manage parking.",
        theme: "Harvest and unity",
        dressCode: "Colorful Punjabi attire (salwar kameez, turbans)",
        songs: ["Satnam Waheguru", "Baisakhi folk songs"],
        dances: ["Bhangra", "Gidda"]
    },
    'christmas': {
        fixedDate: "25-12",
        activities: ["Sing carols, decorate a tree", "Exchange gifts, attend midnight mass, host dinner"],
        decorations: ["Christmas tree, stars, bells", "Fairy lights, wreaths, red-green-white themes"],
        food: ["Plum cake, roast chicken", "Gingerbread, mulled wine, cookies"],
        why: "Christmas celebrates Jesus Christ’s birth, symbolizing hope, peace, and goodwill.",
        significance: "Symbolizes hope, peace, and the spirit of giving",
        places: "Visit St. Paul’s Cathedral (Kolkata), Goa markets, or Shillong",
        performances: ["Carols (e.g., 'Silent Night')", "Santa appearances, nativity plays"],
        budgetTips: "DIY decor, bake at home, and limit gifts to Secret Santa.",
        enjoyment: "Enjoy caroling, watching movies, and spreading cheer.",
        crowdManagement: "Reserve mass seating, use wristbands, and guide crowds.",
        theme: "Joy and giving",
        dressCode: "Festive red, green, or white attire",
        songs: ["Silent Night", "Jingle Bells"],
        dances: ["Group carol dances"]
    },
    'republic day': {
        fixedDate: "26-01",
        activities: ["Hoist the flag, sing the anthem", "Perform skits, host parades, honor freedom fighters"],
        decorations: ["Tricolor flags, balloons", "Kites, patriotic banners"],
        food: ["Tricolor sweets, samosas", "Tea, sandwiches"],
        why: "Republic Day commemorates the adoption of India’s Constitution on January 26, 1950.",
        significance: "Celebrates national unity and constitutional pride",
        places: "Visit Rajpath in Delhi or local schools",
        performances: ["Songs (e.g., 'Jana Gana Mana'), military bands", "Skits and cultural displays"],
        budgetTips: "Use paper flags, host community events, and keep food simple.",
        enjoyment: "Enjoy saluting the flag and reflecting on India’s journey.",
        crowdManagement: "Set up viewing areas, use loudspeakers, and ensure exits.",
        theme: "Patriotism and unity",
        dressCode: "Tricolor-themed attire",
        songs: ["Jana Gana Mana", "Vande Mataram"],
        dances: ["Patriotic folk dances"]
    },
    'independence day': {
        fixedDate: "15-08",
        activities: ["Hoist the flag, sing the anthem", "Fly kites, host cultural programs"],
        decorations: ["Tricolor flags, balloons", "Kites, freedom-themed posters"],
        food: ["Tricolor sandwiches", "Jalebi, juice, pakoras"],
        why: "Independence Day celebrates India’s freedom from British rule on August 15, 1947.",
        significance: "Marks national pride and the spirit of freedom",
        places: "Visit Red Fort, Wagah Border, or parks",
        performances: ["Songs (e.g., 'Vande Mataram')", "Folk dances, flag drills"],
        budgetTips: "Craft flags, host kite workshops, and use affordable snacks.",
        enjoyment: "Enjoy flying kites and singing patriotically.",
        crowdManagement: "Designate kite zones, provide seating, and monitor density.",
        theme: "Freedom and patriotism",
        dressCode: "Tricolor-themed attire",
        songs: ["Vande Mataram", "Saare Jahan Se Achha"],
        dances: ["Patriotic folk dances"]
    },
    'gandhi jayanti': {
        fixedDate: "02-10",
        activities: ["Hold prayer meetings, sing bhajans", "Organize peace marches, serve community"],
        decorations: ["White khadi banners, Gandhi portraits", "Peace symbols, minimal decor"],
        food: ["Khichdi, fruits", "Tea, sabudana vada"],
        why: "Gandhi Jayanti honors Mahatma Gandhi’s birth on October 2, 1869, for his non-violent freedom struggle.",
        significance: "Commemorates peace, non-violence, and social justice",
        places: "Visit Raj Ghat, Sabarmati Ashram, or schools",
        performances: ["Bhajans (e.g., 'Raghupati Raghav')", "Peace songs, skits"],
        budgetTips: "Keep decor minimal, use community resources, and host free events.",
        enjoyment: "Enjoy reflecting on peace and serving others.",
        crowdManagement: "Set up prayer areas, ensure quiet, and guide marches.",
        theme: "Peace and non-violence",
        dressCode: "White attire to honor Gandhi",
        songs: ["Raghupati Raghav", "Vaishnava Jan To"],
        dances: ["Peaceful group dances"]
    },
    'navaratri': {
        fixedDuration: 9,
        activities: ["Worship Goddess Durga’s nine forms", "Perform garba/dandiya, host feasts"],
        decorations: ["Garlands, clay pots", "Deity idols, lights, pandals"],
        food: ["Sabudana khichdi, kuttu puri", "Falahari sweets, vrat snacks"],
        why: "Navaratri celebrates Goddess Durga’s victory over Mahishasura, symbolizing good over evil across nine nights.",
        significance: "Represents the triumph of righteousness",
        dailySignificance: [
            { day: 1, name: "Shailputri", significance: "Strength and purity" },
            { day: 2, name: "Brahmacharini", significance: "Penance and wisdom" },
            { day: 3, name: "Chandraghanta", significance: "Peace and courage" },
            { day: 4, name: "Kushmanda", significance: "Health and energy" },
            { day: 5, name: "Skandamata", significance: "Fertility and love" },
            { day: 6, name: "Katyayani", significance: "Courage and victory" },
            { day: 7, name: "Kalaratri", significance: "Destruction of ignorance" },
            { day: 8, name: "Mahagauri", significance: "Purity and serenity" },
            { day: 9, name: "Siddhidatri", significance: "Supernatural powers and wisdom" }
        ],
        places: "Visit Gujarat for garba, Mysore for Dussehra, or temples",
        performances: ["Garba, dandiya", "Bhajans (e.g., 'Ambe Maa'), Durga aarti"],
        budgetTips: "Rent dance sticks, use homemade food, and reuse decor.",
        enjoyment: "Enjoy dancing, dressing traditionally, and praying.",
        crowdManagement: "Set up dance circles, provide water, and monitor entry.",
        theme: "Devotion and dance",
        dressCode: "Vibrant traditional attire (chaniya choli, kurta)",
        songs: ["Ambe Maa", "Jai Adhya Shakti"],
        dances: ["Garba", "Dandiya"]
    },
    'basant panchami': {
        activities: ["Worship Saraswati, fly kites", "Recite poetry, pray for wisdom"],
        decorations: ["Yellow flowers, books", "Instruments, kites, idols"],
        food: ["Kesar halwa, boondi laddoo", "Yellow rice, khichdi"],
        why: "Basant Panchami honors Saraswati, deity of knowledge, marking spring’s arrival.",
        significance: "Celebrates knowledge, arts, and the onset of spring",
        places: "Visit Saraswati temples in Pushkar or Allahabad, or schools",
        performances: ["Music (e.g., 'Saraswati Vandana')", "Poetry, kite contests"],
        budgetTips: "Use natural flowers, cook simply, and make kites.",
        enjoyment: "Enjoy flying kites and celebrating learning.",
        crowdManagement: "Designate kite areas, set up prayer zones, and ensure space.",
        theme: "Knowledge and spring",
        dressCode: "Yellow traditional attire",
        songs: ["Saraswati Vandana", "Spring songs"],
        dances: ["Light folk dances"]
    },
    'ramadan': {
        fixedDuration: 30,
        activities: ["Fast daily from dawn to dusk, break with iftar", "Pray Taraweeh, give charity"],
        decorations: ["Lanterns, prayer rugs", "Green-gold themes, crescent moons"],
        food: ["Dates, rooh afza", "Haleem, samosas, fruit chaat"],
        why: "Ramadan commemorates the Quran’s revelation to Prophet Muhammad, fostering discipline and charity.",
        significance: "Strengthens spiritual discipline, with Laylat al-Qadr as a holy night",
        dailySignificance: "Each day strengthens spiritual discipline; the last 10 nights (Laylat al-Qadr) are especially holy.",
        places: "Visit mosques for Taraweeh, old Delhi for iftar markets, or halls",
        performances: ["Quran recitation, Naat", "Iftar storytelling"],
        budgetTips: "Cook iftar in bulk, share with neighbors, and reuse decor.",
        enjoyment: "Enjoy breaking fasts, praying, and reflecting spiritually.",
        crowdManagement: "Set up iftar tables, manage prayer lines, and ensure space.",
        theme: "Discipline and devotion",
        dressCode: "Modest traditional attire",
        songs: ["Quran recitations", "Naat songs"],
        dances: ["Simple community dances"]
    },
    'eid al-adha': {
        activities: ["Perform prayers, conduct Qurbani", "Distribute meat, share feasts"],
        decorations: ["Green flags, prayer mats", "Lights, floral setups"],
        food: ["Mutton biryani, sewaiyan", "Kebabs, nihari, sheer khurma"],
        why: "Eid al-Adha commemorates Ibrahim’s willingness to sacrifice his son, symbolizing faith.",
        significance: "Reflects obedience and sharing with the community",
        places: "Visit mosques or community centers",
        performances: ["Eid Takbir, qawwali", "Children’s shows"],
        budgetTips: "Share Qurbani costs, cook at home, and limit decor.",
        enjoyment: "Enjoy feasting, sharing meat, and celebrating faith.",
        crowdManagement: "Organize slaughter areas, set up distribution lines, and manage prayers.",
        theme: "Sacrifice and generosity",
        dressCode: "Festive traditional attire",
        songs: ["Eid Takbir", "Qawwali tunes"],
        dances: ["Community folk dances"]
    },
    'good friday': {
        fixedDuration: 1,
        activities: ["Hold solemn prayers, reenact Stations of the Cross", "Fast, reflect on Jesus’ sacrifice"],
        decorations: ["Crosses, candles", "Purple-black themes, minimal flowers"],
        food: ["Bread, fish", "Lentil soup, abstain from meat"],
        why: "Good Friday commemorates Jesus Christ’s crucifixion, a day of mourning and reflection.",
        significance: "Honors Jesus’ sacrifice for humanity’s sins",
        dailySignificance: [
            { day: 1, name: "Good Friday", significance: "Marks the crucifixion and death of Jesus" }
        ],
        places: "Visit churches or historical sites like Old Goa",
        performances: ["Hymns (e.g., 'Were You There')", "Silent prayers, Passion plays"],
        budgetTips: "Keep decor simple, host small groups, and avoid lavish food.",
        enjoyment: "Enjoy meditating and honoring the solemnity.",
        crowdManagement: "Reserve church seating, guide processions, and ensure quiet.",
        theme: "Sorrow and redemption",
        dressCode: "Sober attire (black or purple)",
        songs: ["Were You There", "O Sacred Head"],
        dances: ["None, focus on solemnity"]
    },
    'dussehra': {
        activities: ["Burn Ravana effigies, perform Ramlila", "Organize processions, feast"],
        decorations: ["Effigies, bows", "Vibrant stages, lights, pandals"],
        food: ["Jalebi, fafda", "Chivda, puri, sabzi"],
        why: "Dussehra celebrates Rama’s victory over Ravana, marking righteousness over evil.",
        significance: "Symbolizes the triumph of virtue",
        places: "Visit Mysore for parades, Kullu for fairs, or grounds",
        performances: ["Ramlila, Garba", "Ravana effigy burning"],
        budgetTips: "Make effigies communally, cook at home, and reuse decor.",
        enjoyment: "Enjoy watching Ramlila and cheering at effigy burning.",
        crowdManagement: "Set up stands, ensure fire safety, and control routes.",
        theme: "Victory and righteousness",
        dressCode: "Traditional attire",
        songs: ["Raghupati Raghav", "Dussehra folk songs"],
        dances: ["Garba", "Folk dances"]
    },
    'raksha bandhan': {
        activities: ["Tie rakhis, exchange gifts", "Perform aarti, share meals"],
        decorations: ["Rakhis, thalis", "Floral designs, lights"],
        food: ["Kheer, puri", "Halwa, mithai"],
        why: "Raksha Bandhan celebrates sibling bonds, symbolizing protection and love.",
        significance: "Strengthens sibling relationships and mutual care",
        places: "Home, markets for rakhi shopping",
        performances: ["Songs (e.g., 'Bhaiya Mere')", "Sibling skits, aarti"],
        budgetTips: "Make rakhis, cook family recipes, and limit gifts.",
        enjoyment: "Enjoy tying rakhis and eating together.",
        crowdManagement: "Keep it intimate or set up seating for larger groups.",
        theme: "Sibling love",
        dressCode: "Traditional Indian attire",
        songs: ["Bhaiya Mere", "Rakhi Dhagon Ka Tyohar"],
        dances: ["Light festive dances"]
    },
    'janmashtami': {
        activities: ["Perform Krishna Leela, decorate swings", "Break dahi handi, sing songs"],
        decorations: ["Peacock feathers, swings", "Krishna idols, flowers, butter pots"],
        food: ["Makhan mishri, peda", "Panjiri, khichdi"],
        why: "Janmashtami celebrates Krishna’s birth, known for his divine deeds.",
        significance: "Commemorates Krishna’s divine playfulness and teachings",
        places: "Visit Mathura, Vrindavan, or temples",
        performances: ["Bhajans (e.g., 'Nand Ke Anand')", "Dahi handi, skits"],
        budgetTips: "Use homemade butter, decorate with flowers, and host small events.",
        enjoyment: "Enjoy singing, breaking handi, and eating Krishna’s favorites.",
        crowdManagement: "Set up handi zones, ensure ladder safety, and manage queues.",
        theme: "Divine play and devotion",
        dressCode: "Yellow or peacock-themed attire",
        songs: ["Nand Ke Anand", "Hare Krishna"],
        dances: ["Ras Lila", "Group dances"]
    },
    'ganesh chaturthi': {
        fixedDuration: 10,
        activities: ["Worship Ganesha, perform aarti", "Immerse idols, host prayers"],
        decorations: ["Ganesha idols, modak displays", "Floral pandals, lights"],
        food: ["Modaks, laddoos", "Puran poli, vada pav"],
        why: "Ganesh Chaturthi honors Ganesha’s birth, remover of obstacles and god of wisdom.",
        significance: "Celebrates wisdom and the removal of obstacles",
        dailySignificance: "Days 1-9 involve worship; Day 10 (Anant Chaturdashi) marks immersion.",
        places: "Visit Mumbai (Lalbaugcha Raja) or local pandals",
        performances: ["Aarti (e.g., 'Sukhkarta Dukhharta')", "Dhol-tasha, dance processions"],
        budgetTips: "Make clay idols, cook modaks, and use natural flowers.",
        enjoyment: "Enjoy chanting, dancing during immersion, and eating Ganesha’s foods.",
        crowdManagement: "Control pandal entry, set up immersion routes, and monitor noise.",
        theme: "Wisdom and celebration",
        dressCode: "Traditional Marathi attire",
        songs: ["Sukhkarta Dukhharta", "Ganpati Bappa Morya"],
        dances: ["Lavani", "Dhol dances"]
    },
    'onam': {
        fixedDuration: 10,
        activities: ["Create pookalam, perform Kathakali", "Host sadya, play games"],
        decorations: ["Flower carpets, banana leaves", "Lamps, swings"],
        food: ["Onam sadya with rice, avial", "Payasam, thoran, pachadi"],
        why: "Onam celebrates King Mahabali’s homecoming and Kerala’s harvest.",
        significance: "Symbolizes prosperity and cultural unity",
        dailySignificance: "Builds up with pookalam; Day 10 (Thiruvonam) is the grand feast.",
        places: "Visit Kerala for boat races or Malayali communities",
        performances: ["Kathakali, Mohiniyattam", "Songs (e.g., 'Maveli Nadu'), boat races"],
        budgetTips: "Use local flowers, cook sadya in bulk, and host games.",
        enjoyment: "Enjoy making pookalam and eating sadya on leaves.",
        crowdManagement: "Set up sadya tables, manage dance areas, and ensure boat safety.",
        theme: "Harvest and hospitality",
        dressCode: "Kerala saree (set mundu) or traditional attire",
        songs: ["Maveli Nadu", "Onam folk songs"],
        dances: ["Kathakali", "Thiruvathira"]
    },
    'pongal': {
        fixedDuration: 4,
        activities: ["Cook pongal, worship the Sun God", "Honor cattle, celebrate with family"],
        decorations: ["Kolam, sugarcane", "Earthen pots, harvest motifs"],
        food: ["Sweet pongal, vada", "Sambar, payasam"],
        why: "Pongal thanks the Sun God and nature for the harvest in Tamil Nadu.",
        significance: "Celebrates gratitude for agricultural abundance",
        dailySignificance: [
            { day: 1, name: "Bhogi", significance: "Burn old items for renewal" },
            { day: 2, name: "Thai Pongal", significance: "Honor the Sun God" },
            { day: 3, name: "Mattu Pongal", significance: "Honor cattle" },
            { day: 4, name: "Kaanum Pongal", significance: "Community bonding" }
        ],
        places: "Visit rural Tamil Nadu or homes",
        performances: ["Songs (e.g., 'Pongal O Pongal'), Jallikattu", "Kolam contests"],
        budgetTips: "Use homegrown rice, decorate naturally, and cook traditionally.",
        enjoyment: "Enjoy cooking, honoring cattle, and sharing meals.",
        crowdManagement: "Set up cooking zones, manage cattle areas, and ensure space.",
        theme: "Gratitude and harvest",
        dressCode: "Traditional Tamil attire (dhoti, saree)",
        songs: ["Pongal O Pongal", "Tamil harvest songs"],
        dances: ["Kummi", "Kolattam"]
    },
    'makar sankranti': {
        activities: ["Fly kites, pray to the Sun God", "Share tilgul, take holy dips"],
        decorations: ["Kites, sesame seeds", "Rangoli, sugarcane, sun motifs"],
        food: ["Tilgul laddoo, khichdi", "Puran poli, undhiyu"],
        why: "Makar Sankranti marks the Sun’s entry into Capricorn, celebrating harvest and longer days.",
        significance: "Celebrates the transition to longer days and harvest",
        places: "Visit Ahmedabad for kite festivals, Ganga Sagar",
        performances: ["Kite contests", "Songs (e.g., 'Til Gul Ghya'), dances"],
        budgetTips: "Make tilgul, buy kites in bulk, and use natural decor.",
        enjoyment: "Enjoy flying kites and eating sesame sweets.",
        crowdManagement: "Designate kite zones, avoid power lines, and manage terraces.",
        theme: "Harvest and skies",
        dressCode: "Bright traditional attire",
        songs: ["Til Gul Ghya", "Kai Po Che"],
        dances: ["Folk kite dances"]
    },
    'gurpurab': {
        activities: ["Hold kirtan, serve langar", "Organize Nagar Kirtan, celebrate Guru Nanak’s birth"],
        decorations: ["Golden-yellow themes, Nishan Sahib flags", "Floral arches"],
        food: ["Kadha prasad, dal", "Roti, sabzi, kheer"],
        why: "Gurpurab celebrates Guru Nanak’s birth, emphasizing equality and service.",
        significance: "Honors Sikh values of equality and devotion",
        places: "Visit Golden Temple, gurdwaras, or halls",
        performances: ["Kirtan (e.g., 'Ik Onkar'), shabad singing", "Gatka displays"],
        budgetTips: "Cook langar in bulk, use donations, and keep decor simple.",
        enjoyment: "Enjoy singing shabads and serving others.",
        crowdManagement: "Organize langar queues, guide processions, and ensure space.",
        theme: "Faith and service",
        dressCode: "Sikh traditional attire (turban, churidar)",
        songs: ["Ik Onkar", "Waheguru"],
        dances: ["Gatka", "Bhangra"]
    },
    'easter': {
        activities: ["Hold services, hunt Easter eggs", "Celebrate resurrection, host lunches"],
        decorations: ["Easter eggs, lilies", "Pastel colors, crosses"],
        food: ["Hot cross buns, roast lamb", "Chocolate eggs, carrot cake"],
        why: "Easter celebrates Jesus Christ’s resurrection, symbolizing victory over death.",
        significance: "Celebrates renewal and spiritual victory",
        places: "Visit churches or parks for egg hunts",
        performances: ["Hymns (e.g., 'Christ the Lord')", "Choir, egg-rolling contests"],
        budgetTips: "Paint eggs, bake buns, and use natural flowers.",
        enjoyment: "Enjoy attending mass and hunting eggs with kids.",
        crowdManagement: "Set up egg-hunt zones, reserve seats, and manage lunch areas.",
        theme: "Renewal and joy",
        dressCode: "Pastel or festive attire",
        songs: ["Christ the Lord", "Easter hymns"],
        dances: ["Group egg dance"]
    },
    'mahashivratri': {
        activities: ["Pray to Shiva, chant mantras", "Stay awake for vigils, perform Rudra Abhishek"],
        decorations: ["Shiva lingams, bel leaves", "White flowers, lamps, incense"],
        food: ["Sabudana khichdi, fruits", "Thandai, milk sweets"],
        why: "Mahashivratri honors Shiva’s cosmic dance and marriage to Parvati, a night of devotion.",
        significance: "Celebrates spiritual awakening and devotion",
        places: "Visit Kashi Vishwanath Temple or local Shiva temples",
        performances: ["Bhajans (e.g., 'Om Namah Shivaya')", "Dances, mantra chanting"],
        budgetTips: "Use local flowers, cook vrat food, and host small groups.",
        enjoyment: "Enjoy meditating and chanting.",
        crowdManagement: "Set up prayer lines, ensure temple access, and manage vigils.",
        theme: "Devotion and spirituality",
        dressCode: "White or simple attire",
        songs: ["Om Namah Shivaya", "Shiva Tandava"],
        dances: ["Tandava-inspired dances"]
    },
    'karva chauth': {
        activities: ["Fast from sunrise to moonrise, perform puja", "Break fast with spouses, apply henna"],
        decorations: ["Sieves, thalis", "Henna designs, lamps, red-gold themes"],
        food: ["Sargi, feni", "Sweets, puri, aloo sabzi"],
        why: "Karva Chauth is observed by married women for their husbands’ long life and prosperity.",
        significance: "Symbolizes love, devotion, and marital harmony",
        places: "Home, markets for henna and sargi",
        performances: ["Songs (e.g., 'Veero Kudiye')", "Storytelling, prayers"],
        budgetTips: "Make sargi, use reusable thalis, and apply henna yourself.",
        enjoyment: "Enjoy dressing up and breaking the fast together.",
        crowdManagement: "Keep it small or set up puja areas.",
        theme: "Love and devotion",
        dressCode: "Red or bridal attire",
        songs: ["Veero Kudiye", "Karva Chauth songs"],
        dances: ["Light festive dances"]
    },
    'chhath puja': {
        fixedDuration: 4,
        activities: ["Fast, offer arghya to the Sun", "Stand in water, sing folk songs"],
        decorations: ["Bamboo baskets, soops", "Riverbank setups, lamps, sun motifs"],
        food: ["Thekua, rice", "Kheer, puri, fruits"],
        why: "Chhath Puja is dedicated to the Sun God and Chhathi Maiya for health and gratitude.",
        significance: "Honors solar energy and family well-being",
        dailySignificance: [
            { day: 1, name: "Nahay Khay", significance: "Ritual bath and simple meal to purify" },
            { day: 2, name: "Lohanda/Kharna", significance: "Fast until evening, break with kheer" },
            { day: 3, name: "Sandhya Arghya", significance: "Evening arghya to the setting Sun" },
            { day: 4, name: "Usha Arghya", significance: "Morning arghya to the rising Sun" }
        ],
        places: "Visit Ganges in Bihar or local water bodies",
        performances: ["Songs (e.g., 'Uga Ho Suraj Dev')", "Water rituals, prayers"],
        budgetTips: "Use home-cooked food, simple baskets, and local resources.",
        enjoyment: "Enjoy praying at sunrise/sunset and sharing meals.",
        crowdManagement: "Set up water access, ensure safety, and manage prayer crowds.",
        theme: "Gratitude to the Sun",
        dressCode: "Traditional saree or dhoti",
        songs: ["Uga Ho Suraj Dev", "Chhath folk songs"],
        dances: ["Chhath ritual dances"]
    },
    'krishna jayanti': {
        activities: ["Celebrate Krishna’s birth with midnight prayers", "Break dahi handi, decorate swings"],
        decorations: ["Peacock feathers, swings", "Krishna idols, butter pots, flowers"],
        food: ["Makhan mishri, peda", "Panjiri, khichdi"],
        why: "Krishna Jayanti marks Krishna’s birth, celebrating his playful legacy.",
        significance: "Celebrates Krishna’s divine childhood and teachings",
        places: "Visit Gokul, Dwarka, or temples",
        performances: ["Bhajans (e.g., 'Nand Ke Anand')", "Dahi handi, plays"],
        budgetTips: "Make butter, use natural decor, and host small events.",
        enjoyment: "Enjoy singing, breaking handi, and eating Krishna’s favorites.",
        crowdManagement: "Secure handi areas, manage queues, and ensure safety.",
        theme: "Divine play and devotion",
        dressCode: "Yellow or peacock-themed attire",
        songs: ["Nand Ke Anand", "Hare Krishna"],
        dances: ["Ras Lila", "Group dances"]
    },
    'buddha purnima': {
        fixedDate: "15-05",
        activities: ["Meditate, pray at stupas", "Light lamps, perform kindness acts"],
        decorations: ["Buddha statues, lotus flowers", "Incense, white-yellow themes"],
        food: ["Khichdi, fruits", "Kheer, rice dishes"],
        why: "Buddha Purnima celebrates Gautama Buddha’s birth, enlightenment, and death.",
        significance: "Promotes peace, enlightenment, and compassion",
        places: "Visit Bodh Gaya, Sarnath, or monasteries",
        performances: ["Sutra chanting, meditation", "Buddhist hymns"],
        budgetTips: "Use minimal decor, cook simply, and host free events.",
        enjoyment: "Enjoy meditating and lighting lamps.",
        crowdManagement: "Set up meditation zones, ensure silence, and manage prayers.",
        theme: "Peace and enlightenment",
        dressCode: "White or simple attire",
        songs: ["Buddhist chants", "Peace hymns"],
        dances: ["Meditation-inspired movements"]
    },
    'ugadi': {
        activities: ["Prepare pachadi, decorate homes", "Read panchangam, celebrate New Year"],
        decorations: ["Mango leaves, rangoli", "Brass lamps, South Indian motifs"],
        food: ["Ugadi pachadi, pulihora", "Obbattu, coconut rice"],
        why: "Ugadi marks the New Year in Karnataka, Andhra Pradesh, and Telangana.",
        significance: "Symbolizes renewal and new beginnings",
        places: "Visit South Indian temples or homes",
        performances: ["Folk songs, Kuchipudi dances", "Panchangam readings"],
        budgetTips: "Make pachadi, use natural leaves, and keep decor simple.",
        enjoyment: "Enjoy tasting pachadi and starting anew.",
        crowdManagement: "Set up ritual areas, manage temple visitors, and ensure space.",
        theme: "Renewal and prosperity",
        dressCode: "Traditional South Indian attire",
        songs: ["Ugadi folk songs", "Telugu New Year songs"],
        dances: ["Kuchipudi", "Folk dances"]
    },
    'thai pongal': {
        fixedDuration: 4,
        activities: ["Cook pongal, worship the Sun God", "Honor cattle, celebrate with family"],
        decorations: ["Kolam, sugarcane", "Earthen pots, harvest motifs"],
        food: ["Thai pongal, vada", "Payasam, sambar"],
        why: "Thai Pongal thanks the Sun God for the harvest in Tamil Nadu.",
        significance: "Expresses gratitude for agricultural abundance",
        dailySignificance: [
            { day: 1, name: "Bhogi", significance: "Burn old items for renewal" },
            { day: 2, name: "Thai Pongal", significance: "Honor the Sun God" },
            { day: 3, name: "Mattu Pongal", significance: "Honor cattle" },
            { day: 4, name: "Kaanum Pongal", significance: "Community bonding" }
        ],
        places: "Visit Madurai or rural Tamil Nadu",
        performances: ["Songs (e.g., 'Thai Thirunal'), cattle parades", "Kolam contests"],
        budgetTips: "Use local produce, cook in bulk, and decorate naturally.",
        enjoyment: "Enjoy cooking outdoors and honoring cattle.",
        crowdManagement: "Set up cooking zones, manage cattle areas, and ensure space.",
        theme: "Gratitude and harvest",
        dressCode: "Traditional Tamil attire (dhoti, saree)",
        songs: ["Thai Thirunal", "Tamil harvest songs"],
        dances: ["Kummi", "Kolattam"]
    },
    'shahidi diwas': {
        fixedDate: "16-06",
        activities: ["Hold prayers, recite Gurbani", "Serve langar, honor martyrs"],
        decorations: ["Nishan Sahib flags, floral setups", "Gurdwara decor"],
        food: ["Kadha prasad, dal", "Roti, kheer"],
        why: "Shahidi Diwas commemorates the martyrdom of Guru Arjan Dev.",
        significance: "Honors sacrifice for faith and resilience",
        dailySignificance: [
            { day: 1, name: "Shahidi Diwas", significance: "Honors Guru Arjan Dev’s martyrdom" }
        ],
        places: "Visit Tarn Taran Sahib or gurdwaras",
        performances: ["Kirtan (e.g., 'Waheguru'), shabad recitations", "Historical narrations"],
        budgetTips: "Cook langar communally, keep decor minimal, and use donations.",
        enjoyment: "Enjoy reflecting on sacrifice and serving others.",
        crowdManagement: "Organize langar queues, ensure prayer space, and guide visitors.",
        theme: "Sacrifice and faith",
        dressCode: "Sikh traditional attire",
        songs: ["Waheguru", "Shabad Kirtan"],
        dances: ["Gatka"]
    },
    'halloween': {
        fixedDate: "31-10",
        activities: ["Dress in costumes, go trick-or-treating", "Carve pumpkins, host spooky parties"],
        decorations: ["Jack-o'-lanterns, cobwebs", "Skeletons, ghosts, orange-black themes"],
        food: ["Candy, pumpkin pie", "Caramel apples, spooky snacks"],
        why: "Halloween originates from the Celtic festival of Samhain, marking the end of harvest.",
        significance: "Honors the dead and wards off spirits with playful frights",
        dailySignificance: [
            { day: 1, name: "Halloween", significance: "A night to honor the dead and celebrate" }
        ],
        places: "Visit haunted houses, neighborhoods, or community centers",
        performances: ["Ghost stories", "Costume contests, music like 'Thriller'"],
        budgetTips: "Make costumes at home, carve local pumpkins, and buy candy in bulk.",
        enjoyment: "Enjoy dressing up, sharing candy, and embracing the spooky fun.",
        crowdManagement: "Set up trick-or-treat routes, ensure safe lighting, and monitor party areas.",
        theme: "Spooky celebration",
        dressCode: "Costumes (ghosts, witches, etc.)",
        songs: ["Thriller", "Monster Mash"],
        dances: ["Spooky group dances"]
    },
    'shahidi week': {
        fixedDuration: 7,
        activities: ["Hold kirtan, serve langar", "Recite Gurbani, organize processions"],
        decorations: ["Nishan Sahib flags, floral setups", "Portraits, golden-yellow themes, candles"],
        food: ["Kadha prasad, dal", "Roti, sabzi, kheer"],
        why: "Shahidi Week commemorates the martyrdom of Guru Tegh Bahadur.",
        significance: "Celebrates sacrifice, justice, and Sikh resilience",
        dailySignificance: [
            { day: 1, name: "Initiation Day", significance: "Honors Sikh resilience" },
            { day: 2, name: "Gurbani Reflection", significance: "Reflects on Guru Arjan’s martyrdom" },
            { day: 3, name: "Langar Day", significance: "Emphasizes equality and service" },
            { day: 4, name: "Nagar Kirtan", significance: "Spreads awareness of sacrifices" },
            { day: 5, name: "Martyrdom Reflection", significance: "Focuses on Guru Tegh Bahadur’s execution" },
            { day: 6, name: "Gatka Day", significance: "Honors Khalsa bravery" },
            { day: 7, name: "Culmination Day", significance: "Celebrates the spirit of martyrdom" }
        ],
        places: "Visit Gurdwara Sis Ganj Sahib, Golden Temple, or local gurdwaras",
        performances: ["Kirtan (e.g., 'Waheguru Ji Ka Khalsa')", "Shabad recitations, Gatka displays"],
        budgetTips: "Cook langar in bulk, use donations, and involve volunteers.",
        enjoyment: "Enjoy reflecting on Sikh history, kirtan, and serving.",
        crowdManagement: "Organize queues, guide processions, and ensure safety.",
        theme: "Sacrifice and resilience",
        dressCode: "Sikh traditional attire",
        songs: ["Waheguru Ji Ka Khalsa", "Shabad Kirtan"],
        dances: ["Gatka", "Bhangra"]
    },
    'dhanteras': {
        fixedDate: "10-11",
        activities: ["Purchase gold or utensils, light diyas", "Perform Lakshmi Puja"],
        decorations: ["Diyas, rangoli", "Gold-themed decor, flowers"],
        food: ["Sweets, fruits", "Traditional snacks"],
        why: "Dhanteras marks the beginning of Diwali festivities.",
        significance: "Celebrates wealth and prosperity",
        places: "Local markets, temples",
        performances: ["Bhajans", "Cultural dances"],
        budgetTips: "Shop wisely, use LED lights, and cook at home.",
        enjoyment: "Enjoy shopping and praying for prosperity.",
        crowdManagement: "Manage market crowds, ensure safe lighting.",
        theme: "Wealth and auspiciousness",
        dressCode: "Traditional attire",
        songs: ["Lakshmi Aarti", "Dhanteras folk songs"],
        dances: ["Garba", "Folk dances"]
    },
    'bhagoria': {
        activities: ["Participate in tribal fairs", "Dance and exchange coconuts"],
        decorations: ["Tribal motifs, flowers", "Colorful banners"],
        food: ["Local tribal dishes", "Sweet treats"],
        why: "Bhagoria is a tribal festival of love and union.",
        significance: "Celebrates tribal courtship and community bonding",
        places: "Tribal areas in Madhya Pradesh",
        performances: ["Tribal dances", "Music performances"],
        budgetTips: "Use local resources, host community events.",
        enjoyment: "Enjoy dancing and cultural exchange.",
        crowdManagement: "Set up fair zones, ensure safety.",
        theme: "Love and tribal unity",
        dressCode: "Tribal attire",
        songs: ["Tribal folk songs"],
        dances: ["Bhagoria dances"]
    }
};

// Typo variations for festival recognition
const festivalNames = {
    'holi': ['holli', 'huly'],
    'eid al-fitr': ['eid', 'eed', 'id', 'eidd'],
    'diwali': ['divali', 'dewali', 'diwaly'],
    'lohri': ['lori', 'lohree', 'lohari'],
    'baisakhi': ['basakhi', 'baisaki'],
    'christmas': ['crhistmas', 'chritmas', 'christmass', 'xmas'],
    'republic day': ['republicday', 'republik day'],
    'independence day': ['independenceday', 'indepedence day'],
    'gandhi jayanti': ['gandhijayanti', 'gandi jayanti'],
    'navaratri': ['navartari', 'navrartri', 'navratri'],
    'basant panchami': ['vasant panchami', 'basantpanchmi'],
    'ramadan': ['ramzan', 'ramadhan'],
    'eid al-adha': ['bakrid', 'bakri-eid', 'bakreid'],
    'good friday': ['goodfriday', 'gud friday'],
    'dussehra': ['dushera', 'dasara'],
    'raksha bandhan': ['rakshabandhan', 'rakhi'],
    'janmashtami': ['janmastami', 'krishna janmashtami'],
    'ganesh chaturthi': ['ganeshchaturthi', 'ganpati'],
    'onam': ['oonam', 'onum'],
    'pongal': ['pungal', 'pongul'],
    'makar sankranti': ['makarsankranti', 'sankranthi'],
    'gurpurab': ['gurupurab', 'guru purab'],
    'easter': ['eastar', 'eastr'],
    'mahashivratri': ['mahashivaratri', 'shivratri'],
    'karva chauth': ['karwachauth', 'karva choth'],
    'chhath puja': ['chhathpuja', 'chat puja'],
    'krishna jayanti': ['krishnajayanti', 'krishna jayanthi'],
    'buddha purnima': ['buddhapurnima', 'buddha jayanti'],
    'ugadi': ['yugadi', 'uggadi'],
    'thai pongal': ['thaipongal', 'tai pongal'],
    'shahidi diwas': ['shahididiwas', 'shaheedi diwas'],
    'halloween': ['haloween', 'holloween', 'hallowean'],
    'shahidi week': ['shaheedi week', 'shahidiweek', 'shaheediweek'],
    'dhanteras': ['dhanterash', 'dhantaras'],
    'bhagoria': ['bhagorya', 'bhagria']
};
const festivalCalendar2025 = [
    { name: "Republic Day", date: "26-01-2025" },
    { name: "Buddha Purnima", date: "15-05-2025" },
    { name: "Shahidi Diwas", date: "16-06-2025" },
    { name: "Independence Day", date: "15-08-2025" },
    { name: "Gandhi Jayanti", date: "02-10-2025" },
    { name: "Halloween", date: "31-10-2025" },
    { name: "Christmas", date: "25-12-2025" },
    { name: "Dhanteras", date: "10-11-2025" }
];
const festivalCalendar = Object.entries(knownFestivals)
.filter(([_, details]) => details.fixedDate)
.map(([name, details]) => ({ name, date: details.fixedDate }));

function getLevenshteinDistance(a, b) {
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}
function findClosestFestival(input) {
    let minDistance = Infinity;
    let closestMatch = null;
    for (const [correctName, variations] of Object.entries(festivalNames)) {
        const allVariations = [correctName, ...variations];
        for (const variation of allVariations) {
            const distance = getLevenshteinDistance(input.toLowerCase(), variation.toLowerCase());
            if (distance < minDistance && distance <= 2) {
                minDistance = distance;
                closestMatch = correctName;
            }
        }
    }
    return closestMatch || Object.keys(knownFestivals).find(k => k.toLowerCase() === input.toLowerCase()) || null;
}
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, checking pathname:", window.location.pathname);
    setupEventListeners();
    if (window.location.pathname.includes('index.html')) {
        console.log("Setting up chatbot on index.html");
        setupChatbot();
    }
    loadChatHistory();
    loadScheduledFestivals();
    loadConversationMemory();
    if (window.location.pathname.includes('history.html')) {
        console.log("Detected history.html, calling displayChatHistory");
        displayChatHistory();
    }
    $('.festival-slideshow').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000
    });
});
function setupEventListeners() {
    const festivalForm = document.getElementById('festival-form');
    const contactForm = document.getElementById('contact-form');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (festivalForm) {
        festivalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            scheduleFestival();
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendContactMessage();
        });
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.classList.remove('active'); // Close nav on click
            // Ensure full page load for history
            if (link.getAttribute('href') === 'history.html') {
                window.location.href = 'history.html'; // Force reload
            }
        });
    });

    const chatbotInput = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('send-button');
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
}
function setupChatbot() {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeButton = document.getElementById('close-chatbot');

    if (chatbotButton && chatbotWindow && closeButton) {
        // Toggle chatbot window
        chatbotButton.addEventListener('click', () => {
            chatbotWindow.style.display = chatbotWindow.style.display === 'none' || chatbotWindow.style.display === '' ? 'flex' : 'none';
            if (chatbotWindow.style.display === 'flex') {
                document.getElementById('chatbot-input').focus();
            }
        });

        // Close chatbot window
        closeButton.addEventListener('click', () => {
            chatbotWindow.style.display = 'none';
            resetChatState();
        });

        // Initial message
        addMessageToChat('bot', "Hello! I'm your Cultural Festival Planner. Say 'plan a festival' or ask about a festival (e.g., 'What is Holi?') to start!");
    }
}
function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    addMessageToChat('user', message);
    input.value = '';
    disableInput(true);

    const response = getChatbotResponse(message);
    addMessageToChat('bot', response);
    disableInput(false);

    saveToChatHistory(message, response);
}
function getChatbotResponse(message) {
    console.log("Received message:", message);
    message = message.toLowerCase().trim();
    const currentYear = new Date().getFullYear();

    // Save to chat history (placeholder until response is set)
    saveToChatHistory(message, ""); // Will be updated with the final response

    // Handle "what did I plan" (unchanged)
    if (message === "what did i plan" || message === "what did i plan?") {
        if (scheduledFestivals.length === 0) {
            return "We haven’t planned anything together yet in this session! Your chat history shows no festivals saved so far. Would you like to start planning a festival? Say 'plan a festival' or name one (e.g., 'plan Holi') to begin! This chat will be saved in your history.";
        } else {
            let response = "Here’s what you’ve planned, saved in your chat history:\n\n";
            scheduledFestivals.forEach((plan, index) => {
                response += `Festival ${index + 1}: ${plan.name}\n`;
                response += `Date: ${plan.date}\n`;
                response += `Budget: ₹${plan.budget.toLocaleString()}\n`;
                response += `Location: ${plan.location}\n`;
                response += `Attendees: ${plan.people}\n`;
                response += `Food Type: ${plan.foodType}\n`;
                response += `Duration: ${plan.duration} day${plan.duration > 1 ? 's' : ''}\n`;
                response += `Details: ${plan.description || plan.details || 'A custom celebration'}\n\n`;
            });
            response += "Would you like to plan another festival or modify one of these?";
            console.log("Response generated:", response);
            return response;
        }
    }

    // Handle "no such festival" or similar (unchanged)
    if (message === "no such festival" || message.includes("not a festival") || message.includes("this is not a festival")) {
        resetChatState();
        return "Okay understood. Want to plan some other festival or quit?";
    }

    // Handle follow-up after "Okay understood..." (unchanged)
    if (message === "quit" && chatHistory.some(h => h.message.includes("Want to plan some other festival or quit"))) {
        resetChatState();
        return "Okay, I’ve stopped. Goodbye! See you at the next festival!";
    } else if (message.includes("plan") && chatHistory.some(h => h.message.includes("Want to plan some other festival or quit"))) {
        resetChatState();
        return questions[0];
    }

    // Exit handling (unchanged)
    if (message === 'exit' || message === 'quit' || message.includes('stop') || message.includes('cancel')) {
        const response = "Okay, I’ve stopped. Do you want to plan another festival? Say 'yes' or 'no'.";
        resetChatState();
        return response;
    }

    // Yes/No after exit or plan completion (unchanged)
    if (message === 'yes' && chatHistory.some(h => h.message.includes("Do you want to plan another festival?"))) {
        resetChatState();
        return questions[0];
    } else if (message === 'no' && chatHistory.some(h => h.message.includes("Do you want to plan another festival?"))) {
        return "Thank you so much! Visit again whenever you wish to plan a festival! Designed and developed by Aviral Varshney";
    }

    // Show festival calendars (unchanged)
    if (message === 'show festival calendar') {
        let calendarResponse = "Here’s the calendar of festivals with fixed dates (month-day):\n\n";
        festivalCalendar.forEach(festival => {
            calendarResponse += `${festival.name}: ${festival.date}\n`;
        });
        calendarResponse += "\nSay 'plan [festival name]' to start planning any of these!";
        return calendarResponse;
    }

    if (message === 'show 2025 calendar') {
        let calendarResponse = "Here’s the 2025 calendar for festivals with fixed dates:\n\n";
        festivalCalendar2025.forEach(festival => {
            calendarResponse += `${festival.name}: ${festival.date}\n`;
        });
        calendarResponse += "\nNote: Dates for variable festivals (e.g., Holi, Eid) depend on lunar/solar calendars and aren’t listed. Say 'plan [festival name]' to plan any festival for 2025!";
        return calendarResponse;
    }

    // Informational questions (unchanged)
    if (message.startsWith('what is ')) {
        const festival = message.replace('what is ', '').replace('?', '').trim();
        const festKey = findClosestFestival(festival);
        if (festKey && knownFestivals[festKey]) {
            return `${festKey.charAt(0).toUpperCase() + festKey.slice(1)}: ${knownFestivals[festKey].why}`;
        }
        return "I don’t know this festival. Please describe it if you'd like to plan it!";
    }

    // Plan initiation
    if (message.includes('plan') || Object.keys(festivalNames).some(f => message.includes(f.split(' ')[0]))) {
        if (!currentFestivalPlan || !currentFestivalPlan.name || message.includes('plan a festival')) {
            currentFestivalPlan = {};
            currentQuestionIndex = 0;
        }
        let festivalName = message.replace('plan ', '').trim();
        const closestMatch = findClosestFestival(festivalName);

        if (closestMatch && festivalName !== closestMatch && !message.includes('plan a festival')) {
            currentFestivalPlan.name = closestMatch;
            if (!conversationMemory[closestMatch]) {
                conversationMemory[closestMatch] = { known: true };
                saveConversationMemory();
            }
            if (knownFestivals[closestMatch].fixedDate) {
                awaitingYearConfirmation = true;
                return `${closestMatch} is universally fixed on ${closestMatch === 'christmas' ? '25-12' : knownFestivals[closestMatch].fixedDate}. Would you like to plan this for the current year (${currentYear})? Say 'yes' or 'no'.`;
            }
            currentQuestionIndex = 1;
            return questions[currentQuestionIndex];
        } else if (festivalName && !message.includes('plan a festival')) {
            if (Object.keys(knownFestivals).includes(festivalName.toLowerCase())) {
                currentFestivalPlan.name = festivalName;
                if (!conversationMemory[festivalName.toLowerCase()]) {
                    conversationMemory[festivalName.toLowerCase()] = { known: true };
                    saveConversationMemory();
                }
                if (knownFestivals[festivalName.toLowerCase()].fixedDate) {
                    awaitingYearConfirmation = true;
                    return `${festivalName} is universally fixed on ${festivalName.toLowerCase() === 'christmas' ? '25-12' : knownFestivals[festivalName.toLowerCase()].fixedDate}. Would you like to plan this for the current year (${currentYear})? Say 'yes' or 'no'.`;
                }
                currentQuestionIndex = 1;
                return questions[currentQuestionIndex];
            } else {
                currentFestivalPlan.name = festivalName;
                if (conversationMemory[festivalName.toLowerCase()] && conversationMemory[festivalName.toLowerCase()].description) {
                    currentFestivalPlan.description = conversationMemory[festivalName.toLowerCase()].description;
                    currentQuestionIndex = 1;
                    return questions[currentQuestionIndex];
                }
                awaitingDescription = true;
                return "Sorry, I am in learning process, I don't know about this festival now. Please describe it and I will save it in my memory.";
            }
        }
        return questions[currentQuestionIndex];
    }

    // Handle description input (unchanged)
    if (awaitingDescription) {
        currentFestivalPlan.description = message;
        conversationMemory[currentFestivalPlan.name.toLowerCase()] = { description: message, known: false };
        saveConversationMemory();
        awaitingDescription = false;
        currentQuestionIndex = 1;
        return questions[currentQuestionIndex];
    }

    // Handle year confirmation for fixed-date festivals
    if (awaitingYearConfirmation) {
        if (message === 'yes' || message === 'this year') {
            currentFestivalPlan.date = `${knownFestivals[currentFestivalPlan.name.toLowerCase()].fixedDate}-${currentYear}`;
            awaitingYearConfirmation = false;
            currentQuestionIndex = 2;
            saveToChatHistory(message, questions[currentQuestionIndex]);
            return questions[currentQuestionIndex];
        } else if (message === 'no') {
            awaitingYearConfirmation = false;
            return "Please specify the year (e.g., 2026) for planning " + currentFestivalPlan.name + ".";
        } else if (/^\d{4}$/.test(message)) {
            currentFestivalPlan.date = `${knownFestivals[currentFestivalPlan.name.toLowerCase()].fixedDate}-${message}`;
            awaitingYearConfirmation = false;
            currentQuestionIndex = 2;
            saveToChatHistory(message, questions[currentQuestionIndex]);
            return questions[currentQuestionIndex];
        } else {
            return "Please say 'yes' for this year (" + currentYear + ") or 'no' to specify a different year!";
        }
    }

    // Handle planning steps with date check
    if (currentFestivalPlan && currentQuestionIndex < questions.length) {
        let isValid = true;
        let errorMessage = '';

        switch (currentQuestionIndex) {
            case 0:
                currentFestivalPlan.name = message;
                break;
            case 1:
                const parsedDate = parseDate(message);
                if (!parsedDate || !validateDate(parsedDate)) {
                    isValid = false;
                    errorMessage = "Invalid date. Please use DD-MM-YYYY (e.g., 13-01-2026) or formats like '19 October 2025', 'October 19, 2025', or '19th October 2025'.";
                } else {
                    currentFestivalPlan.date = parsedDate;
                    const daysRemaining = calculateDaysRemaining(parsedDate);
                    if (daysRemaining <= 0) {
                        currentQuestionIndex = 0; // Reset to start anew
                        return "Sorry, the date has passed. Would you like to plan a different festival or exit? Say 'yes' to plan another or 'no' to exit.";
                    }
                }
                break;
            case 2:
                if (isNaN(parseFloat(message)) || parseFloat(message) <= 0) {
                    isValid = false;
                    errorMessage = "Invalid budget. Please enter a positive number (e.g., 50000).";
                } else {
                    currentFestivalPlan.budget = parseFloat(message);
                }
                break;
            case 3:
                currentFestivalPlan.location = message;
                break;
            case 4:
                if (isNaN(parseInt(message)) || parseInt(message) <= 0) {
                    isValid = false;
                    errorMessage = "Invalid number of people. Please enter a positive number.";
                } else {
                    currentFestivalPlan.people = parseInt(message);
                }
                break;
            case 5:
                currentFestivalPlan.foodType = message;
                break;
            case 6:
                if (isNaN(parseInt(message)) || parseInt(message) <= 0) {
                    isValid = false;
                    errorMessage = "Invalid duration. Please enter a positive number of days.";
                } else {
                    currentFestivalPlan.duration = parseInt(message);
                }
                break;
        }

        if (!isValid) {
            return `${errorMessage} ${questions[currentQuestionIndex]}`;
        }

        currentQuestionIndex++;
        saveToChatHistory(message, currentQuestionIndex < questions.length ? questions[currentQuestionIndex] : "");

        if (currentQuestionIndex === 7 && knownFestivals[currentFestivalPlan.name.toLowerCase()] && knownFestivals[currentFestivalPlan.name.toLowerCase()].fixedDuration) {
            currentFestivalPlan.duration = knownFestivals[currentFestivalPlan.name.toLowerCase()].fixedDuration;
            currentQuestionIndex++;
        }

        if (currentQuestionIndex < questions.length) {
            return questions[currentQuestionIndex];
        } else {
            scheduledFestivals.push(currentFestivalPlan);
            localStorage.setItem('scheduledFestivals', JSON.stringify(scheduledFestivals));
            const response = generateFestivalPlan(currentFestivalPlan);
            return response;
        }
    }

    // Handle "yes" or "no" after "Sorry, the date has passed..."
    if (message === 'yes' && chatHistory.some(h => h.message.includes("Would you like to plan a different festival or exit?"))) {
        resetChatState();
        return questions[0];
    } else if (message === 'no' && chatHistory.some(h => h.message.includes("Would you like to plan a different festival or exit?"))) {
        resetChatState();
        return "Thank you for your visit! Designed by Aviral Varshney. Come back to plan another festival anytime!";
    }

    // Default greetings (unchanged)
    if (message.includes('hi') || message.includes('hello')) {
        return "Hi! How can I help with your festival planning today? This chat will be saved in your history.";
    } else if (message.includes('bye') || message.includes('goodbye')) {
        return "Goodbye! See you at the next festival!";
    }

    // Out-of-domain handling (unchanged)
    const domainKeywords = ['festival', 'event', 'plan', 'calendar', 'why', 'when', 'what', 'celebrated', 'hi', 'hello', 'bye', 'goodbye'];
    const isOutOfDomain = !domainKeywords.some(keyword => message.includes(keyword)) &&
                         !Object.keys(festivalNames).some(f => message.includes(f.split(' ')[0]));
    if (isOutOfDomain) {
        return "Sorry! I am a Cultural Festival Chatbot designed for this domain only by Aviral Varshney. Do you want me to plan a festival or event? Please proceed then!";
    }

    return "Please say 'plan a festival' or mention a festival name (e.g., 'plan lohri') to start planning! This chat will be saved in your history.";
}
function validateInput(message, index) {
    switch (index) {
        case 1:
            return parseDate(message) && validateDate(parseDate(message)) ?
                { isValid: true } : { isValid: false, error: "Invalid date. Use DD-MM-YYYY or '19 October 2025'." };
        case 2:
            return !isNaN(parseFloat(message)) && parseFloat(message) > 0 ?
                { isValid: true } : { isValid: false, error: "Invalid budget. Enter a positive number." };
        case 4:
            return !isNaN(parseInt(message)) && parseInt(message) > 0 ?
                { isValid: true } : { isValid: false, error: "Invalid number of people. Enter a positive number." };
        case 5:
            const foodOptions = ['vegetarian', 'vegan', 'non-vegetarian', 'both', 'maharashtrian', 'gujarati', 'punjabi', 'south indian', 'bengali'];
            if (!foodOptions.some(option => message.toLowerCase().includes(option))) {
                return { isValid: false, error: "Invalid food type. Please enter 'vegetarian', 'vegan', 'non-vegetarian', 'both', or a specific cuisine (e.g., Maharashtrian, Gujarati)." };
            }
            return { isValid: true };
        case 6:
            return !isNaN(parseInt(message)) && parseInt(message) > 0 ?
                { isValid: true } : { isValid: false, error: "Invalid duration. Enter a positive number." };
        default:
            return { isValid: true };
    }
}
// Replace the existing generateFestivalPlan function with this
function generateFestivalPlan(plan) {
    const festKey = plan.name.toLowerCase();
    const festivalDetails = knownFestivals[festKey] || {
        activities: plan.description ? [plan.description] : ["Celebrate with community gatherings and joyful activities"],
        decorations: ["Use festive lights, banners, and local motifs"],
        food: [`${plan.foodType} dishes tailored to the occasion`],
        why: plan.description || conversationMemory[festKey]?.description || "A local or lesser-known celebration",
        significance: "A custom celebration based on your input",
        places: "Local community spaces or significant nearby locations",
        performances: ["Traditional music and dance performances"],
        budgetTips: "Keep costs low with DIY decor, potlucks, and minimal rentals.",
        enjoyment: "Enjoy by engaging with attendees and keeping the mood festive.",
        crowdManagement: "Set up clear entry/exit points and monitor crowd flow.",
        theme: "Community and celebration",
        dressCode: "Casual festive attire",
        songs: ["Local festive songs"],
        dances: ["Group dances to engage attendees"]
    };

    const splitField = (field) => Array.isArray(field) ? field : field.split('. ').filter(Boolean).map(item => item.trim() + (item.endsWith('.') ? '' : '.'));
    const activities = splitField(festivalDetails.activities);
    const decorations = splitField(festivalDetails.decorations);
    const performances = splitField(festivalDetails.performances);
    const songs = festivalDetails.songs ? splitField(festivalDetails.songs) : ["Traditional festive tunes"];
    const dances = festivalDetails.dances ? splitField(festivalDetails.dances) : ["Community dance styles"];
    const theme = festivalDetails.theme || `Celebration of ${plan.name}`;
    const dressCode = festivalDetails.dressCode || "Traditional or festive attire matching the occasion";
    const significance = festivalDetails.significance || "A meaningful celebration";

    // Handle food based on input
    let foodItems = [];
    if (plan.foodType.toLowerCase() === 'both') {
        foodItems = ["Vegetarian options like paneer tikka, dal", "Non-vegetarian options like chicken curry, mutton"];
    } else if (plan.foodType.toLowerCase() === 'maharashtrian') {
        foodItems = ["Puran poli, vada pav", "Misal pav, modak"];
    } else if (plan.foodType.toLowerCase() === 'gujarati') {
        foodItems = ["Dhokla, khandvi", "Thepla, undhiyu"];
    } else if (plan.foodType.toLowerCase() === 'punjabi') {
        foodItems = ["Sarson da saag, makki di roti", "Chole bhature"];
    } else if (plan.foodType.toLowerCase() === 'south indian') {
        foodItems = ["Idli, sambar", "Dosa, coconut chutney"];
    } else if (plan.foodType.toLowerCase() === 'bengali') {
        foodItems = ["Rosogolla, macher jhol", "Luchi, aloo dum"];
    } else {
        foodItems = [plan.foodType === 'vegetarian' ? "Vegetarian dishes like dal and roti" : plan.foodType === 'vegan' ? "Vegan dishes like vegetable curry" : plan.foodType === 'non-vegetarian' ? "Non-veg dishes like chicken tikka" : `Mixed ${plan.foodType} dishes`];
    }

    // Tailored "What to Do" based on description
    let tailoredActivities = [];
    if (plan.description && plan.description.toLowerCase().includes('social gathering') && plan.description.toLowerCase().includes('students')) {
        tailoredActivities = [
            "Organize a welcome session to reconnect with batchmates.",
            "Host a memory-sharing event to relive golden days and college stories.",
            "Plan a short trip to a nearby park or landmark.",
            "Visit a local restaurant for a group meal.",
            "Create a 'back to school' moment with a quiz or photo booth.",
            "End with a fun dance and song session to celebrate bonds."
        ];
    } else {
        tailoredActivities = activities; // Default to original activities if no specific tailoring
    }

    const duration = festivalDetails.fixedDuration || plan.duration;
    const daysRemaining = calculateDaysRemaining(plan.date);
    const perPersonBudget = Math.round(plan.budget / plan.people);

    // Budget warning
    let budgetNote = '';
    if (perPersonBudget < 500) {
        budgetNote = `\n**Budget Warning**: Your budget (₹${perPersonBudget} per person) is low. Consider reducing decorations, hosting a potluck, or limiting the event to a single day to stay within budget. Here's a scaled-down plan:\n`;
    }

    let planDetails = `Festival Plan: ${plan.name}\n`;
    planDetails += `Start Date: ${plan.date}\n`;
    planDetails += `Budget: ₹${plan.budget.toLocaleString()} (₹${perPersonBudget} per person)\n`;
    planDetails += `Location: ${plan.location}\n`;
    planDetails += `Attendees: ${plan.people}\n`;
    planDetails += `Food Type: ${plan.foodType}\n`;
    planDetails += `Duration: ${duration} day${duration > 1 ? 's' : ''}\n`;
    planDetails += daysRemaining > 30
        ? `There are still ${daysRemaining} days left, here is your plan for the festival:\n\n`
        : `Days Remaining: ${daysRemaining}\n\n`;
    planDetails += `Why Celebrate: ${festivalDetails.why}\n`;
    planDetails += `Significance: ${significance}\n`;
    planDetails += `Places to Visit: ${festivalDetails.places}\n`;
    planDetails += `Budget Tips: ${festivalDetails.budgetTips}\n`;
    planDetails += `Enjoyment Tips: ${festivalDetails.enjoyment}\n`;
    planDetails += `Crowd Management: ${festivalDetails.crowdManagement}${budgetNote}\n\n`;

    planDetails += `Detailed Day-wise Plan:\n`;
    for (let day = 0; day < duration; day++) {
        const dayDate = new Date(plan.date.split('-').reverse().join('-'));
        dayDate.setDate(dayDate.getDate() + day);
        const formattedDay = `${dayDate.getDate().toString().padStart(2, '0')}-${(dayDate.getMonth() + 1).toString().padStart(2, '0')}-${dayDate.getFullYear()}`;
        planDetails += `Day ${day + 1} (${formattedDay}):\n`;

        if (festivalDetails.dailySignificance && festivalDetails.dailySignificance[day]) {
            const { name, significance } = festivalDetails.dailySignificance[day];
            planDetails += `- Day Significance: ${name} - ${significance}\n`;
        }

        planDetails += `- Theme: ${theme}${festivalDetails.dailySignificance && festivalDetails.dailySignificance[day] ? ` (${festivalDetails.dailySignificance[day].name})` : ''}\n`;
        planDetails += `- Dress Code: ${dressCode}\n`;
        planDetails += `- What to Do: ${tailoredActivities[day % tailoredActivities.length]}\n`;
        planDetails += `- Decorations: ${decorations[day % decorations.length]}\n`;
        planDetails += `- Food: ${foodItems[day % foodItems.length]}\n`;
        planDetails += `- Performances: ${performances[day % performances.length]}\n`;
        planDetails += `- Songs to Play: ${songs[day % songs.length]}\n`;
        planDetails += `- Dances to Perform: ${dances[day % dances.length]}\n`;
        planDetails += `- Places to Visit: ${festivalDetails.places.split(', ')[day % festivalDetails.places.split(', ').length]}\n\n`;
    }

    planDetails += "Enjoy your festival! Do you want to plan another festival? Say 'yes' or 'no'.";
    scheduledFestivals.push(plan);
    localStorage.setItem('scheduledFestivals', JSON.stringify(scheduledFestivals));
    generateFestivalOutput();
    return planDetails;
}
function calculateDaysRemaining(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    const festivalDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = festivalDate - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function resetChatState() {
    currentFestivalPlan = null;
    currentQuestionIndex = 0;
    awaitingDescription = false;
    awaitingYearConfirmation = false;
}


function parseDate(input) {
    const monthMap = {
        'january': '01', 'jan': '01', 'february': '02', 'feb': '02', 'march': '03', 'mar': '03',
        'april': '04', 'apr': '04', 'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
        'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'october': '10', 'oct': '10',
        'november': '11', 'nov': '11', 'december': '12', 'dec': '12'
    };

    const ddmmyyyy = /^\d{2}-\d{2}-\d{4}$/;
    if (ddmmyyyy.test(input)) return input;

    const dayMonthYear = /^(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})$/i;
    if (dayMonthYear.test(input)) {
        const [, day, , month, year] = input.match(dayMonthYear);
        return `${day.padStart(2, '0')}-${monthMap[month.toLowerCase()]}-${year}`;
    }

    const monthDayYear = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),\s+(\d{4})$/i;
    if (monthDayYear.test(input)) {
        const [, month, day, year] = input.match(monthDayYear);
        return `${day.padStart(2, '0')}-${monthMap[month.toLowerCase()]}-${year}`;
    }

    return null;
}

function validateDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
}

function addMessageToChat(sender, message) {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = message.replace(/\n/g, '<br>');
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function disableInput(disable) {
    document.getElementById('chatbot-input').disabled = disable;
}

function saveToChatHistory(userMessage, botResponse) {
    chatHistory.push({ sender: 'user', message: userMessage, timestamp: new Date().toISOString() });
    chatHistory.push({ sender: 'bot', message: botResponse, timestamp: new Date().toISOString() });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory)); // Save immediately
}

function loadChatHistory() {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        chatHistory = JSON.parse(storedHistory);
    }
}

function displayChatHistory() {
    console.log("Entering displayChatHistory function");
    const historyContent = document.getElementById('history-content');
    if (!historyContent) {
        console.error("Error: 'history-content' element not found in the DOM!");
        return;
    }
    console.log("history-content element found");
    const storedHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    console.log("Loaded chat history from localStorage:", storedHistory);
    if (storedHistory.length === 0) {
        historyContent.innerHTML = 'No chat history yet.';
        console.log("No chat history to display, setting default message");
    } else {
        historyContent.innerHTML = storedHistory.map(h => `
            <div class="history-item ${h.sender}">
                <strong>${h.sender === 'user' ? 'You' : 'Bot'} (${new Date(h.timestamp).toLocaleString()}):</strong> ${h.message.replace(/\n/g, '<br>')}
            </div>
        `).join('');
        console.log("Chat history rendered with", storedHistory.length, "entries");
    }
}

function scheduleFestival() {
    const title = document.getElementById('festival-title').value;
    const date = document.getElementById('festival-date').value;
    const budget = document.getElementById('festival-budget').value;
    const location = document.getElementById('festival-location').value;
    const foodType = document.getElementById('festival-food-type').value;
    const details = document.getElementById('festival-details').value;

    if (!foodType || foodType === "Select Food Type") {
        showError('Please select a food type for the festival.');
        return;
    }

    const festival = {
        name: title,
        date,
        budget: parseFloat(budget.replace('₹', '').replace(/,/g, '')),
        location,
        foodType,
        details,
        people: 0,
        duration: 2
    };
    scheduledFestivals.push(festival);
    localStorage.setItem('scheduledFestivals', JSON.stringify(scheduledFestivals));
    generateFestivalOutput();
    document.getElementById('festival-form').reset();
    showSuccess('Festival saved successfully!');
}

function loadScheduledFestivals() {
    const storedFestivals = localStorage.getItem('scheduledFestivals');
    if (storedFestivals) {
        try {
            scheduledFestivals = JSON.parse(storedFestivals);
        } catch (e) {
            console.error("Error parsing scheduledFestivals:", e);
            scheduledFestivals = [];
            localStorage.setItem('scheduledFestivals', JSON.stringify(scheduledFestivals));
        }
    } else {
        scheduledFestivals = [];
    }
    generateFestivalOutput();
}

function generateFestivalOutput() {
    const festivalOutput = document.getElementById('festival-output');
    festivalOutput.innerHTML = scheduledFestivals.length === 0 ? 'No festivals planned yet.' : '<h3>Festival List</h3>' + scheduledFestivals.map((f, i) => `
        <div class="festival-item" data-index="${i}">
            <strong>${f.name}</strong><br>
            Date: ${f.date}<br>
            Budget: ₹${f.budget.toLocaleString()}<br>
            Location: ${f.location}<br>
            Food type: ${f.foodType}<br>
            Duration: ${f.duration} day${f.duration > 1 ? 's' : ''}<br>
            Details: ${f.details || 'None'}<br>
            <button class="delete-button" onclick="deleteFestival(${i})">Remove</button>
        </div>`).join('');
}

function deleteFestival(index) {
    scheduledFestivals.splice(index, 1);
    localStorage.setItem('scheduledFestivals', JSON.stringify(scheduledFestivals));
    generateFestivalOutput();
    showSuccess('Festival removed successfully!');
}

function sendContactMessage() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    console.log('Contact:', { name, email, message });
    showSuccess('Message sent successfully!');
    document.getElementById('contact-form').reset();
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ff6b00, #8a2be2); color: #fff; padding: 15px 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 3000; font-family: Orbitron, sans-serif;';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showError(message) {
    const div = document.createElement('div');
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ff3333, #ff6666); color: #fff; padding: 15px 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(255,0,0,0.5); z-index: 3000; font-family: Orbitron, sans-serif;';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}
function openChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotButton = document.getElementById('chatbot-button');
    if (chatbotWindow && chatbotButton) {
        chatbotWindow.style.display = 'flex'; // Force open on button click
        chatbotButton.style.display = 'flex'; // Ensure button remains visible
        document.getElementById('chatbot-input').focus();
    }
}
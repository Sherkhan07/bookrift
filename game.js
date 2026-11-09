(() => {
  'use strict';

  /* =========================================================
     BookRift · «Матильда» квесті — «Платформа ойындар» құжатының құрылымы
     6 деңгей + 4 қосымша ойын + геймификация жүйесі
     ========================================================= */

  const STORE_KEY = 'bookrift-matilda-v1';

  /* ---------------- ДЕРЕКТЕР ---------------- */

  const LEVELS = [
    {
      id: 1, icon: '🧩', tone: 'pink',
      title: 'Кітапқұмар: «Матильда кім?»',
      type: 'Әдеби детектив: Жұмбақ портрет',
      desc: 'Матильданың бөлмесінен жасырын заттарды тап. Әр заттың Матильдаға қатысын кітаптан тауып, сипаттап жаз.',
      xp: 100, coins: 40, badge: 'first-door', play: playLevel1
    },
    {
      id: 2, icon: '🔵', tone: 'blue',
      title: 'Кейіпкер: «Бұл кім?»',
      type: 'Мінездеме бойынша кейіпкерді тану',
      desc: 'Шағын сипаттаманы оқып, қай кейіпкер туралы айтылып тұрғанын тап.',
      xp: 100, coins: 40, badge: 'character', play: playLevel2
    },
    {
      id: 3, icon: '🟡', tone: 'gold',
      title: 'Зерттеу: «Мәтіннен дәлел тап»',
      type: 'Пазл-сәйкестендіру және фактологиялық квест',
      desc: 'Пазлды құрастырып, суретте қандай оқиға бейнеленгенін кітап мәтініне сүйеніп жаз.',
      xp: 150, coins: 60, badge: 'puzzle', play: playLevel3
    },
    {
      id: 4, icon: '🟠', tone: 'orange',
      title: 'Құпия: «Жасырын кодты шеш»',
      type: 'Криптограмма / Құпия есік коды',
      desc: 'Мисс Ханидің үйінің есігін аш. Кодтың сандары кітаптың ішінде жасырылған.',
      xp: 120, coins: 50, badge: 'code', play: playLevel4
    },
    {
      id: 5, icon: '🟣', tone: 'purple',
      title: 'Кейіпкерлермен сөйлесу',
      type: 'ЖИ-кейіпкер интерактиві',
      desc: 'Матильда, Мисс Хани не Транчбұлды таңда. Сөйлесу үшін кітаптағы фактілерді білуің керек.',
      xp: 150, coins: 60, badge: 'talker', play: playLevel5
    },
    {
      id: 6, icon: '🔴', tone: 'red',
      title: 'Финал: «Ойландырар он сұрақ»',
      type: 'Босс-деңгей: Транчбұлдың сынағы',
      desc: 'Таймерлі 10 терең сұраққа жауап беріп, мектепті Транчбұлдан құтқар.',
      xp: 250, coins: 100, badge: 'golden', play: playLevel6
    }
  ];

  const RANKS = [
    { min: 0, name: 'Жаңа оқырман' },
    { min: 150, name: 'Кітап іздеуші' },
    { min: 400, name: 'Зерттеуші' },
    { min: 700, name: 'Құпия шешуші' },
    { min: 1000, name: 'Әдеби сыншы' },
    { min: 1400, name: 'Алтын оқырман' }
  ];

  const BADGES = [
    { id: 'first-door', icon: '🚪', name: 'Алғашқы есік', how: '1-деңгейді аяқта' },
    { id: 'character', icon: '🎭', name: 'Кейіпкер танушы', how: '2-деңгейді аяқта' },
    { id: 'puzzle', icon: '🧩', name: 'Пазл шебері', how: '3-деңгейді аяқта' },
    { id: 'code', icon: '🔐', name: 'Код бұзушы', how: '4-деңгейді аяқта' },
    { id: 'talker', icon: '💬', name: 'Әңгімелесуші', how: '5-деңгейді аяқта' },
    { id: 'golden', icon: '🥇', name: 'Алтын Оқырман', how: 'Финалда Транчбұлды жең' },
    { id: 'flawless', icon: '💎', name: 'Мінсіз финал', how: 'Финалды бірде-бір қатесіз өт' },
    { id: 'stars', icon: '🌟', name: 'Жұлдызды оқырман', how: '18 жұлдыздың бәрін жина' },
    { id: 'words', icon: '🎯', name: 'Сөз мергені', how: '20 сөздің бәрін меңгер' },
    { id: 'story', icon: '✍️', name: 'Жалғастырушы', how: '3 үзіндіні дұрыс жалғастыр' },
    { id: 'traveler', icon: '🗺️', name: 'Саяхатшы', how: 'Картадағы 4 мөрді жина' },
    { id: 'style', icon: '👗', name: 'Сәнқой оқырман', how: 'Дүкеннен алғашқы затты ал' },
    { id: 'streak', icon: '🔥', name: 'Тұрақты оқырман', how: '3 күн қатар ойна' }
  ];

  const SHOP = [
    { id: 'bow', slot: 'head', emoji: '🎀', name: 'Матильданың лентасы', price: 25 },
    { id: 'cap', slot: 'head', emoji: '🎓', name: 'Оқырман қалпағы', price: 50 },
    { id: 'crown', slot: 'head', emoji: '👑', name: 'Оқырман тәжі', price: 200 },
    { id: 'glasses', slot: 'face', emoji: '👓', name: 'Ақылды көзілдірік', price: 20 },
    { id: 'magic-book', slot: 'hand', emoji: '📕', name: 'Сиқырлы кітап', price: 30 },
    { id: 'wand', slot: 'hand', emoji: '🪄', name: 'Сиқырлы таяқша', price: 40 },
    { id: 'stack', slot: 'hand', emoji: '📚', name: 'Кітап жинағы', price: 90 },
    { id: 'uniform', slot: 'outfit', emoji: '👔', name: 'Оқушы формасы', price: 45, color: '#24365f' },
    { id: 'cape', slot: 'outfit', emoji: '🧥', name: 'Сиқыршы шапаны', price: 150, color: '#6b3fb8' }
  ];

  const SLOT_NAMES = { head: 'Бас', face: 'Бет', hand: 'Қол', outfit: 'Киім' };

  // 1-деңгей: Матильданың бөлмесі
  const ROOM = [
    {
      id: 'book', emoji: '📚', label: 'Кітап', key: true, x: 27, y: 74, size: 0.9,
      keywords: ['кітап', 'оқы', 'әріп', 'ақыл', 'зерек', 'білім', 'төрт', '4'],
      model: 'Кітап — Матильда кітапқұмар: 4 жасынан бастап әріп танып, көп кітап оқыған. Бұдан оның зеректігін, білуге құштарлығын көреміз.'
    },
    {
      id: 'glass', emoji: '🥛', label: 'Стақан', key: true, x: 53, y: 49, size: 0.75,
      keywords: ['күш', 'қабілет', 'ерекше', 'энерги', 'телекинез', 'көз', 'қозғал', 'аудар', 'төңкер'],
      model: 'Стақан — Матильда ерекше қабілетті бала, бойында күш-энергиясы көп: ол көзінің күшімен стақанды аударып жіберді.'
    },
    {
      id: 'choco', emoji: '🍫', label: 'Шоколад', key: true, x: 21, y: 39, size: 0.7,
      keywords: ['ақыл', 'пысық', 'өзі', 'өздігі', 'тапқыр', 'батыл', 'жасай', 'торт'],
      model: 'Шоколад — Матильда ақылды, пысық, көп нәрсені өздігінен жасай алатын бала.'
    },
    {
      id: 'tv', emoji: '📺', label: 'Теледидар', key: false, x: 64, y: 43, size: 1.05,
      fact: 'Уормвудтар отбасы кешкі асты теледидар алдында ішетін. Ал Матильда теледидардың орнына кітапты таңдады.'
    },
    {
      id: 'card', emoji: '🎫', label: 'Кітапхана карточкасы', key: false, x: 45, y: 21, size: 0.7,
      fact: 'Матильда 4 жасында кітапханаға өзі барып, кітаптарды бірінен соң бірін оқи бастады.'
    }
  ];

  // 2-деңгей: Бұл кім?
  const CAST = [
    { id: 'matilda', name: 'Матильда', emoji: '👧' },
    { id: 'honey', name: 'Мисс Хани', emoji: '👩‍🏫' },
    { id: 'trunchbull', name: 'Мисс Транчбұл', emoji: '🏋️‍♀️' },
    { id: 'mrw', name: 'Мистер Уормвуд', emoji: '👨‍💼' },
    { id: 'mrsw', name: 'Миссис Уормвуд', emoji: '👱‍♀️' }
  ];

  const WHO = [
    {
      text: 'Бингоға салынып кеткен әйел, аптасына 5 рет ойнайды. Сап-сары етіп бояған шашының түбінен қоңыр талдары жылтыраған жуан әйел.',
      answer: 'mrsw'
    },
    {
      text: 'Қызына назар аудармайды, немқұрайлы қарайды. Мінілген автокөлік сатумен айналысатын дилер, дөрекі сөйлейді. Қызынан ұлын артық көреді. Адамдарды алдап ақша табады.',
      answer: 'mrw'
    },
    {
      text: 'Айтқанды лезде қағып алатын қағылездігі мен үйренуге зеректігін ата-анасы баяғыда байқау керек еді. Бір жарым жасында ересек адамша жатық сөйлеп, жұртты бай сөздік қорымен таңғалдыратын. Оны «шуылдақ» деп атады. 4 жасында еркін кітап оқыды.',
      answer: 'matilda'
    }
  ];

  // 3-деңгей: пазлдар
  const PUZZLES = [
    {
      src: 'assets/puzzle-blackboard.jpg', cols: 4, rows: 3, ratio: '1432 / 1005',
      keywords: ['тақта', 'бор', 'магнус', 'хат', 'агата', 'жаз', 'есінен', 'қорық', 'тәубе', 'телекинез'],
      answer: 'Мисс Транчбұл тақтадағы жазуларды көріп, оны Мисс Ханидің әкесі Магнус жазды деп ойлап, есінен танып қалады. Ал бұл жазуларды Матильда Транчбұлды тәубесіне түсіру үшін борды көзінің күшімен қозғалтып жазған еді.'
    },
    {
      src: 'assets/puzzle-amanda.jpg', cols: 3, rows: 3, ratio: '1448 / 1086',
      keywords: ['аманда', 'бұрым', 'шаш', 'лақтыр', 'айналдыр', 'трип'],
      answer: 'Мектеп директоры Мисс Транчбұл Аманда Трип деген оқушы қызды бұрымынан ұстап, айналдырып лақтырып жібереді.'
    }
  ];

  // 4-деңгей: құпия код
  const CODE = '2123';
  const CLUES = [
    {
      label: '1-сан', text: 'Мисс Ханидің үйіндегі орындықтар саны.',
      hint: 'Матильда Мисс Ханидің үйшігіне қонаққа барған тарауды оқы. Ас үйдегі жиһазға назар аудар.'
    },
    {
      label: '2-сан', text: 'Матильданың әкесі автокөлік спидометрін қанша мильге кері айналдырды? Санның бірінші цифрын жаз.',
      hint: 'Уормвуд мырза өз «құпиясын» ұлына үйреткен бөлімді тап. Сан «мың» сөзімен келеді.'
    },
    {
      label: '3–4-сандар', text: 'Мисс Хани неше жаста?',
      hint: 'Мисс Хани Матильдаға өз өмірін әңгімелеген тарауды оқы.'
    }
  ];

  // 5-деңгей: ЖИ-кейіпкерлер
  const CHARACTERS = [
    {
      id: 'matilda', name: 'Матильда', emoji: '👧',
      greet: 'Сәлем! Мен Матильдамын. Қазір кітапханадан алған тағы бір кітабымды оқып отырмын 📚',
      challenge: 'Сөйлесу үшін алдымен бір сұрағыма жауап берші: мектепте мені шын түсінген адам кім болды?',
      check: ['хани', 'ханн', 'honey'],
      praise: 'Иә! Мисс Хани — менің ең жақын досым әрі ұстазым. Енді өзің маған сұрақ қой!',
      accept: 'Жауабың үшін рақмет! Кітапта бұл — Мисс Хани, менің ең жақын досым әрі ұстазым. Енді өзің маған сұрақ қой!',
      wrong: 'Жоқ, ол емес... Ол — менің сынып жетекшім, өте мейірімді мұғалім. Кітаптың мектеп туралы тарауларын оқып көр.',
      chips: ['Кітапты қашан оқи бастадың?', 'Күшің қайдан пайда болды?', 'Транчбұлды қалай жеңдің?', 'Ата-анаң қандай адамдар?'],
      topics: [
        { k: ['күш', 'телекинез', 'көз', 'стақан', 'қабілет'], a: 'Бір күні Транчбұлға қатты ашуландым... Көзімнен ерекше бір күш шығып, стақанды аударып жібердім! Көп кітап оқығаным мен ішімде жиналған ашу-ыза осы күшті оятты дейді.' },
        { k: ['транчб', 'директор', 'жең', 'тақта', 'бор'], a: 'Мен тақтадағы борды көзімнің күшімен қозғалтып, Мисс Ханидің әкесі Магнустың атынан хат жаздым. Транчбұл қатты қорқып, мектептен біржола кетіп қалды!' },
        { k: ['кітап', 'оқы', 'кітапхана'], a: 'Мен 4 жасымда кітапханаға өзім барып, кітап оқи бастадым. Кітап маған тұтас әлемді ашты — басқа елдер, басқа адамдар, басқа өмір!' },
        { k: ['әке', 'шеше', 'ана', 'ата-ана', 'отбасы', 'уормвуд'], a: 'Ата-анам маған көп көңіл бөлмейтін. Олар кешке теледидар көріп, кітапты бос нәрсе дейтін. Бірақ мен оларға бірнеше рет сабақ бердім 😉' },
        { k: ['тотықұс', 'мұржа', 'елес', 'папуга'], a: 'Хаха! Тотықұсты мұржаға жасырып қойдым. Ата-анам үйде елес бар деп ойлап, зәресі ұшты!' },
        { k: ['хани', 'мұғалім', 'ұстаз'], a: 'Мисс Хани — әлемдегі ең мейірімді мұғалім. Менің қабілетімді бірінші болып байқаған да сол.' },
        { k: ['сәлем', 'қалайсың', 'жағдай'], a: 'Сәлем! Жақсы, рақмет! Кітап туралы сұрақ қойсаң, қуанамын.' }
      ],
      fallback: ['Қызық сұрақ! Бұл туралы кітапта жақсырақ жазылған. Тауып оқышы, сосын маған айтып бер 📖', 'Хм... Осы туралы тараудан оқып көр. Кітапта бәрі бар!']
    },
    {
      id: 'honey', name: 'Мисс Хани', emoji: '👩‍🏫',
      greet: 'Сәлем, қымбаттым! Мен Мисс Ханимін, Матильданың сынып жетекшісімін.',
      challenge: 'Сөйлесуді бастамас бұрын айтшы: менің марқұм әкемнің есімі кім еді?',
      check: ['магнус', 'magnus'],
      praise: 'Дұрыс, менің әкем — Магнус. Кітапты мұқият оқыпсың! Енді сұрағыңды қоя бер.',
      accept: 'Жауабың үшін рақмет, қымбаттым. Кітапта менің әкемнің есімі — Магнус. Енді сұрағыңды қоя бер.',
      wrong: 'Жоқ, қымбаттым. Матильда тақтаға хат жазған тарауды оқы. Хаттың соңындағы есімге назар аудар.',
      chips: ['Транчбұл сізге кім болады?', 'Сіздің үйіңіз қандай?', 'Матильда туралы не ойлайсыз?', 'Әкеңізге не болды?'],
      topics: [
        { k: ['транчб', 'тәте', 'әпке', 'туыс'], a: 'Транчбұл — менің туыс тәтем. Әкем қайтыс болғаннан кейін ол мені қорқытып, үйім мен жалақымды тартып алды.' },
        { k: ['үй', 'орындық', 'үйшік'], a: 'Мен кішкентай фермер үйшігінде тұрамын. Жиһазым өте аз... Кітаптан санап көр: үйімде неше орындық бар еді?' },
        { k: ['матильда', 'қабілет', 'дарын', 'ақылды'], a: 'Матильда — мен көрген ең дарынды бала. Оның қабілетін ата-анасы байқамағаны өкінішті.' },
        { k: ['әке', 'магнус', 'қайтыс'], a: 'Әкем Магнус дәрігер еді. Ол кенеттен қайтыс болды, содан бастап мен тәтемнің қолында өстім.' },
        { k: ['жалақы', 'ақша', 'кедей'], a: 'Тәтем жалақымды өзіне алатын. Маған тек аз ғана ақша қалдыратын. Сондықтан тұрмысым өте қарапайым.' },
        { k: ['сәлем', 'қалайсыз', 'жағдай'], a: 'Сәлем! Рақмет, жақсымын. Сен кітапты қай жерге дейін оқыдың?' }
      ],
      fallback: ['Жақсы сұрақ! Оның жауабы кітапта бар. Бірге іздеп көрейік 📖', 'Қымбаттым, бұл туралы кітаптан оқысаң, бәрін түсінесің.']
    },
    {
      id: 'trunchbull', name: 'Мисс Транчбұл', emoji: '🏋️‍♀️',
      greet: 'ТЫНЫШТЫҚ! Мен — Crunchem Hall мектебінің директоры Мисс Транчбұлмын!',
      challenge: 'Менімен сөйлескің келе ме? Онда жауап бер: маған қарсы шыққан оқушыларды қамайтын тар шкафтың аты не?!',
      check: ['шоки', 'чоки', 'тұншық', 'туншык', 'choky', 'chokey'],
      praise: 'Хм... Білесің екен. Иә, «Шоки» — тұншықтырғыш! Жарайды, сұрағыңды қой. Тек тез!',
      accept: 'Хм! Кітапта бұл — «Шоки», тұншықтырғыш! Есіңде сақта. Жарайды, сұрағыңды қой. Тек тез!',
      wrong: 'ҚАТЕ! Кітапты оқымағансың ба?! Барып оқы! Кітапта бұл тар шкаф туралы анық жазылған.',
      chips: ['Неге балаларға өш болып, оларды жазалауды қалайсыз?', 'Аманданы неге лақтырдыңыз?', 'Юлий Ротуиңклге не болды?', 'Тақтадағы жазудан неге қорықтыңыз?'],
      topics: [
        { k: ['неге', 'өш', 'жазала', 'балалар', 'жек', 'қатал'], a: 'Балалар — жиіркенішті кішкентай құрттар! Мен бала кезімде... ешкімнен мейірім көрген жоқпын. (Транчбұл кенет үнсіз қалды.)', note: 'Ойлан: Транчбұлдың қаталдығының себебі неде? Кітаптағы оның өткені туралы бөлімдерді оқы.' },
        { k: ['аманда', 'бұрым', 'шаш'], a: 'Бұрым деген не?! Мен ол қызды бұрымынан ұстап, айналдырып лақтырып жібердім! Бұрымды жек көремін!' },
        { k: ['юлий', 'терезе', 'тәтті'], a: 'Юлий Ротуиңкл сабақ кезінде тәтті жеп отырды! Сондықтан оны терезеден лақтырып жібердім.' },
        { k: ['брюс', 'торт'], a: 'Брюс Богтроттер менің тортымды жеді! Сондықтан бүкіл мектептің алдында тұтас тортты жеуге мәжбүр еттім.' },
        { k: ['магнус', 'тақта', 'хат', 'матильда', 'бор'], a: 'Ол туралы сөйлеспейміз!! Тақтадағы жазу... МАГНУС... Жоқ, жоқ, жоқ!' },
        { k: ['хани'], a: 'Хани ме? Ол әлсіз, жылауық! Оны жетілдіру менің міндетім еді!' },
        { k: ['сәлем'], a: 'Сәлем деме маған! «Қайырлы күн, Мисс Транчбұл» де!' }
      ],
      fallback: ['Сұрағың ақылға сыймайды! Кітапты оқы да, сосын келіп сұра!', 'ТЫНЫШ! Мұндай сұрақтың жауабы кітапта жазылған. Барып оқы!']
    }
  ];

  // 6-деңгей: ойландырар он сұрақ (бірінші нұсқа — дұрыс жауап)
  const FINAL_QUESTIONS = [
    {
      q: 'Транчбұл мен Мисс Ханиді не байланыстырады?',
      options: ['Транчбұл — Мисс Ханидің туыс тәтесі', 'Олар бала кезден бірге өскен құрбылар', 'Транчбұл — Мисс Ханидің бұрынғы мұғалімі', 'Екеуі бір үйді жалға алып тұрады'],
      note: 'Мисс Хани әкесінен ерте айырылып, туыс тәтесі Транчбұлдың қолында өскен.'
    },
    {
      q: 'Мисс Хани Транчбұлдан қалай құтылды?',
      options: ['Матильда тақтаға Ханидің әкесі Магнустың атынан хат жазып, Транчбұлды қорқытты', 'Мисс Хани полицияға шағымданды', 'Ата-аналар жиналып, Транчбұлды жұмыстан шығарды', 'Транчбұл өз еркімен басқа қалаға көшті'],
      note: 'Матильда борды көзінің күшімен қозғалтып, «Магнустың» атынан жазды.'
    },
    {
      q: 'Не себепті Матильданың отбасы оның Мисс Ханимен қалуына қарсы болмады?',
      options: ['Олар үшін Матильданың бар-жоғы маңызды емес еді', 'Мисс Хани оларға көп ақша төледі', 'Матильда соттан арнайы рұқсат алды', 'Олар Мисс Ханиді бала кезден танитын'],
      note: 'Уормвудтар елден асығыс кетіп бара жатып, қызын оңай қалдыра салды.'
    },
    {
      q: 'Неліктен ешбір бала үйіне Транчбұлдың қылығы жайлы айтып бармайды?',
      options: ['Ата-аналардың өзі одан қорқады', 'Балалар Транчбұлды жақсы көреді', 'Транчбұл балаларға сыйлық таратады', 'Балалар бұл оқиғаларды бірден ұмытады'],
      note: 'Үлкендердің өзі Транчбұлдан қорқады, ал оның сұмдық қылықтарына сену де қиын.'
    },
    {
      q: 'Матильданың бойындағы тылсым күштің пайда болуына не әсер етті?',
      options: ['Көп кітап оқуы мен іштегі ашу-ызасының ұлғаюы', 'Сиқырлы таяқша тауып алуы', 'Мисс Ханидің берген дәрісі', 'Әкесінің көлігінен тапқан құпия зат'],
      note: 'Миы үнемі жұмыс істеп, ішінде ашу-ыза жиналғанда ерекше күш оянды.'
    },
    {
      q: 'Мисс Транчбұлды мектептен де, үйден де кетуге не мәжбүр етті?',
      options: ['Матильданың тақтаға қатысты ойлап тапқан жоспары', 'Директорлар кеңесінің шешімі', 'Брюс Богтроттердің торт жеуі', 'Мектеп инспекторының тексеруі'],
      note: 'Тақтадағы «Магнустың» хатынан кейін Транчбұл жоғалып кетті, ал үй Мисс Ханиге қайтты.'
    },
    {
      q: 'Транчбұл Юлий Ротуиңклді неге терезеден лақтырып жіберді?',
      options: ['Сабақ кезінде тәтті жеп отырғаны үшін', 'Сабаққа кешігіп келгені үшін', 'Шашы ұзын болғаны үшін', 'Үй тапсырмасын орындамағаны үшін'],
      note: 'Бұл оқиға Транчбұлдың балаларға қаншалықты қатыгез екенін көрсетеді.'
    },
    {
      q: 'Транчбұл неге осындай қатал әрекеттер жасайды деп ойлайсың?',
      options: ['Ол бала кезінде ешкімнен мейірім көрмеген', 'Ол балаларды шын жақсы көреді', 'Мектептегі жалақысы аз болғандықтан', 'Ол Матильданың күшінен қорыққандықтан'],
      note: 'Мейірімсіздік көбіне мейірім көрмегендіктен туады. Осы туралы ойлан.'
    },
    {
      q: 'Мисс Транчбұл мен Матильданың отбасының ұқсастығы қандай?',
      options: ['Екеуі де қатал, мейірімсіз, тек өздерін ойлайды', 'Екеуі де кітап оқығанды жақсы көреді', 'Екеуі де Матильдаға қамқор', 'Олардың ешқандай ұқсастығы жоқ'],
      note: 'Екеуі де Матильданың дарынын бағаламады.'
    }
  ];
  const REFLECTION_Q = 'Егер Матильданың орнында болсаң, осы оқиғалардың бәрінде не істер едің?';

  // Қосымша: Оқиғаны жалғастыр
  const STORIES = [
    {
      start: 'Уормвудтар отбасы әдеттегідей үлкен бөлмедегі теледидар алдында кешкі тамақ ішіп отырған. Бір кезде ас үй жақтан…',
      options: ['«Сәлем! Сәлем! Сәлем!» — деген айқын да нық дауыс саңқ ете қалды.', 'есік қағылып, Мисс Хани кіріп келді.', 'теледидар өздігінен сөніп қалды.'],
      note: 'Бұл дауыс — Матильда мұржаға жасырып қойған тотықұстікі еді. Отбасы үйде елес бар деп қорқып кетті.'
    },
    {
      start: 'Миссис Уормвуд асүйге кіріп, күйеуіне көзі түскенде кілт тоқтады да, қалшиып қалды. Бір кезде…',
      options: ['ұшып кетердей жан ұшыра шыңғырып жіберді.', 'күліп жіберіп, оны құшақтай алды.', 'ештеңе байқамағандай теледидарға қайта бұрылды.'],
      note: 'Матильда әкесінің шаш майына ақшыл шаш бояуын араластырып қойған еді. Уормвуд мырзаның шашы күміс түске боялып кетті.'
    },
    {
      start: 'Транчбұл сары алтын бидайдың сабағындай әдемі бұрымы селтеңдеген он жас шамасындағы қызға қарай беттеді…',
      options: ['Оң қолымен Аманданың бұрымына тарпа бас салды да, қызды жоғары көтеріп, айналдыра бастады.', 'Қызға жылы жымиып, бұрымын мақтады.', 'Қыздың қасынан үндемей өтіп кетті.'],
      note: 'Транчбұл бұрымды жек көретін. Ол Аманда Трипті бұрымынан ұстап, алысқа лақтырып жіберді.'
    }
  ];

  // Қосымша: Сөз мергені (20 сөз)
  const WORDS = [
    ['сорақы', 'ақылға сыймайтын, өрескел'],
    ['бөспе', 'өтірікті қосып айтатын мақтаншақ'],
    ['ынжық', 'сөзін тіке айта алмайтын, жасық, жігерсіз'],
    ['дернәсіл', 'кейбір жануарлардың жұмыртқадан шыққаннан кейінгі алғашқы даму кезеңі'],
    ['айсберг', 'мұзтау, теңізде жүзіп жүрген алып мұз'],
    ['қотыр', 'адам мен жануар терісіне шығатын жұқпалы қышыма ауру'],
    ['немқұрайлы', 'шын ниетімен емес, қалай болса солай; селқос'],
    ['жасөспірім', '10–19 жас аралығындағы адам'],
    ['мұқабасыз', 'сырт қабы (мұқабасы) жоқ'],
    ['тапжылмай күту', 'ұзақ сарыла тосу'],
    ['жаһан', 'әлем, дүние (парсы сөзі)'],
    ['жымқыру', 'басқаларға білдірмей, жасырып-жауып алу'],
    ['тәуба', 'барға шүкір ету; райынан қайту'],
    ['сигар', 'темекі жапырағынан жуан етіп оралған шылым'],
    ['шынаяқ', 'шай ішетін ыдыс, кесе'],
    ['күңгірт', 'жарығы аз, қарауытқан'],
    ['сұңғақ', 'ұзын, сымбатты (қу мен қаздың мойнындай)'],
    ['мұржа', 'пештің түтін шығатын мойны, түтіндік'],
    ['беймарал', 'еркін, бейқам'],
    ['анағұрлым', 'әлдеқайда, едәуір, біршама']
  ];

  // Қосымша: Кітап картасы
  const STATIONS = [
    {
      id: 'home', emoji: '🏠', name: 'Матильданың үйі', unlock: 1,
      desc: 'Уормвудтар отбасының үйі. Мұнда теледидар үнемі қосулы, ал кітапқа ешкім мән бермейді.',
      q: 'Уормвудтар отбасы кешкі асты қайда ішетін?',
      options: ['Теледидар алдында', 'Үстел басында әңгімелесіп', 'Мейрамханада', 'Бақшада']
    },
    {
      id: 'library', emoji: '📚', name: 'Кітапхана', unlock: 2,
      desc: 'Матильда кітапханаға өзі жаяу барып, кітаптарды бірінен соң бірін оқыды.',
      q: 'Матильда кітапханаға алғаш неше жасында барды?',
      options: ['4 жасында', '7 жасында', '10 жасында', '2 жасында']
    },
    {
      id: 'school', emoji: '🏫', name: 'Crunchem Hall мектебі', unlock: 3,
      desc: 'Матильда оқитын бастауыш мектеп. Мұнда қатал директор бәрін қорқытып ұстайды.',
      q: 'Crunchem Hall мектебінің директоры кім?',
      options: ['Мисс Транчбұл', 'Мисс Хани', 'Миссис Уормвуд', 'Мистер Уормвуд']
    },
    {
      id: 'cottage', emoji: '🏡', name: 'Мисс Ханидің үйшігі', unlock: 4,
      desc: 'Мисс Ханидің кішкентай, жұпыны үйшігі. Матильда осында ұстазының құпия тарихын біледі.',
      q: 'Мисс Хани өз жалақысын кімге беруге мәжбүр болды?',
      options: ['Мисс Транчбұлға', 'Мистер Уормвудқа', 'Мектеп кітапханасына', 'Матильдаға']
    }
  ];

  const STUDENTS = [
    { name: 'Алия', score: 1320, streak: 8 },
    { name: 'Нұржан', score: 1180, streak: 7 },
    { name: 'Мадина', score: 960, streak: 6 },
    { name: 'Ержан', score: 740, streak: 5 },
    { name: 'Сара', score: 520, streak: 4 }
  ];

  /* ---------------- КҮЙ (STATE) ---------------- */

  function freshState() {
    return {
      v: 1,
      name: '',
      xp: 0,
      coins: 0,
      levels: {},
      badges: [],
      owned: [],
      equipped: { head: null, face: null, hand: null, outfit: null },
      words: [],
      stories: [],
      stations: [],
      flags: {},
      streak: { count: 0, last: null },
      daily: { date: null, pages: false, minutes: false },
      status: false
    };
  }

  function loadState() {
    const base = freshState();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return {
        ...base,
        ...saved,
        equipped: { ...base.equipped, ...(saved.equipped || {}) },
        streak: { ...base.streak, ...(saved.streak || {}) },
        daily: { ...base.daily, ...(saved.daily || {}) },
        flags: { ...(saved.flags || {}) },
        levels: { ...(saved.levels || {}) }
      };
    } catch (error) {
      return base;
    }
  }

  let state = loadState();

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (error) {
      /* сақтау мүмкін болмаса, ойын жалғаса береді */
    }
  }

  /* ---------------- КӨМЕКШІ ФУНКЦИЯЛАР ---------------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'style') node.style.cssText = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const norm = (text) => String(text).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  const hasKeyword = (text, keywords) => keywords.some((keyword) => norm(text).includes(keyword));
  const wordCount = (text) => norm(text).split(' ').filter(Boolean).length;

  function dateKey(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  const today = () => dateKey(new Date());
  const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  };

  const starsHTML = (count, max = 3) =>
    `<span class="stars" aria-label="${count} жұлдыз">${'★'.repeat(count)}<span class="stars-off">${'☆'.repeat(max - count)}</span></span>`;

  const bookHint = (text) => `<div class="book-hint"><span class="book-hint-icon">📖</span><p><strong>Кітапқа бағыттау:</strong> ${text}</p></div>`;

  const rankIndex = (xp) => RANKS.reduce((acc, rank, index) => (xp >= rank.min ? index : acc), 0);
  const rankFor = (xp) => RANKS[rankIndex(xp)];

  const isDone = (id) => Boolean(state.levels[id] && state.levels[id].done);
  const isUnlocked = (id) => id === 1 || isDone(id - 1);
  const totalStars = () => Object.values(state.levels).reduce((sum, level) => sum + (level.stars || 0), 0);

  function currentStreak() {
    const { count, last } = state.streak;
    return last === today() || last === yesterday() ? count : 0;
  }

  /* ---------------- ХАБАРЛАМА ЖӘНЕ АНИМАЦИЯ ---------------- */

  const dialog = $('#game-dialog');
  const toastStack = $('#toast-stack');

  function overlayHost() {
    return dialog.open ? dialog : document.body;
  }

  function toast(html, kind = '') {
    const host = overlayHost();
    if (toastStack.parentNode !== host) host.append(toastStack);
    const node = h('div', { class: `toast ${kind}`, html });
    toastStack.append(node);
    setTimeout(() => node.classList.add('leaving'), 2800);
    setTimeout(() => node.remove(), 3200);
  }

  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#8d7dff', '#5ad1ff', '#ff7ecf', '#ffd76e', '#7ee8a7'];
    const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < 70; i += 1) {
      layer.append(
        h('i', {
          style: `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.5}s;animation-duration:${1.8 + Math.random() * 1.4}s;--r:${Math.random() * 720 - 360}deg`
        })
      );
    }
    overlayHost().append(layer);
    setTimeout(() => layer.remove(), 4000);
  }

  /* ---------------- ГЕЙМИФИКАЦИЯ ЯДРОСЫ ---------------- */

  function award(xp, coins, reason) {
    const before = rankIndex(state.xp);
    state.xp += xp;
    state.coins += coins;
    save();
    const parts = [];
    if (xp) parts.push(`+${xp} ⭐`);
    if (coins) parts.push(`+${coins} 🪙`);
    toast(`<strong>${reason}</strong><span>${parts.join(' · ')}</span>`);
    if (xp > 0) touchStreak();
    const after = rankIndex(state.xp);
    if (after > before) toast(`🎖️ Жаңа атақ: <strong>${RANKS[after].name}</strong>`, 'rank');
    checkBadges();
    renderAll();
  }

  function touchStreak() {
    const now = today();
    if (state.streak.last === now) return;
    state.streak.count = state.streak.last === yesterday() ? state.streak.count + 1 : 1;
    state.streak.last = now;
    save();
    if (state.streak.count > 1) toast(`🔥 Серия: <strong>${state.streak.count} күн</strong>`, 'streak');
    if (state.streak.count % 3 === 0) award(100, 10, `🔥 ${state.streak.count} күн қатар оқу бонусы`);
  }

  function unlockBadge(id) {
    if (state.badges.includes(id)) return;
    const badge = BADGES.find((item) => item.id === id);
    if (!badge) return;
    state.badges.push(id);
    save();
    toast(`🏅 Жаңа жетістік: <strong>${badge.icon} ${badge.name}</strong>`, 'badge');
  }

  function checkBadges() {
    if (state.words.length >= WORDS.length) unlockBadge('words');
    if (state.stories.length >= STORIES.length) unlockBadge('story');
    if (state.stations.length >= STATIONS.length) unlockBadge('traveler');
    if (state.streak.count >= 3) unlockBadge('streak');
    if (totalStars() >= LEVELS.length * 3) unlockBadge('stars');
    if (state.owned.length > 0) unlockBadge('style');
  }

  // Бір рет берілетін шағын сыйлық
  function awardOnce(flag, xp, coins, reason) {
    if (state.flags[flag]) return false;
    state.flags[flag] = true;
    award(xp, coins, reason);
    return true;
  }

  function completeLevel(id, mistakes, thresholds) {
    const stars = mistakes <= thresholds[0] ? 3 : mistakes <= thresholds[1] ? 2 : 1;
    const previous = state.levels[id] || { done: false, stars: 0 };
    const level = LEVELS[id - 1];
    let xp = 0;
    let coins = 0;
    if (!previous.done) {
      xp += level.xp;
      coins += level.coins;
    }
    if (stars > previous.stars) {
      xp += (stars - previous.stars) * 20;
      coins += (stars - previous.stars) * 10;
    }
    state.levels[id] = { done: true, stars: Math.max(stars, previous.stars) };
    save();
    if (xp || coins) award(xp, coins, `${id}-деңгей аяқталды!`);
    unlockBadge(level.badge);
    checkBadges();
    renderAll();
    confetti();
    return { stars, xp, coins };
  }

  function showLevelResult(body, id, result, extraHTML = '') {
    const rewardText =
      result.xp || result.coins
        ? `+${result.xp} ⭐ · +${result.coins} 🪙`
        : 'Бұл деңгейдің сыйлығын бұрын алғансың. Жұлдыз көбейсе, бонус беріледі.';
    body.innerHTML = `
      <div class="result-screen">
        <div class="result-stars">${starsHTML(result.stars)}</div>
        <h3>${id}-деңгей аяқталды!</h3>
        ${extraHTML}
        <p class="result-reward">${rewardText}</p>
        <div class="result-actions"></div>
      </div>`;
    const actions = $('.result-actions', body);
    let nextButton = null;
    if (id < LEVELS.length) {
      const next = LEVELS[id];
      nextButton = h('button', { class: 'button button-primary', type: 'button', onclick: () => openLevel(id + 1) }, `${id + 1}-деңгейге өту: ${next.icon} ${next.title} →`);
      actions.append(nextButton);
    }
    actions.append(h('button', { class: 'button button-secondary', type: 'button', onclick: () => openLevel(id) }, 'Қайта ойнау ↻'));
    actions.append(h('button', { class: 'button button-secondary', type: 'button', onclick: () => dialog.close() }, 'Миссиялар картасына оралу'));
    dialog.scrollTop = 0;
    if (nextButton) nextButton.focus({ preventScroll: true });
  }

  /* ---------------- ДИАЛОГ ---------------- */

  let cleanups = [];
  const addCleanup = (fn) => cleanups.push(fn);
  function runCleanups() {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        /* ignore */
      }
    });
    cleanups = [];
  }

  function openDialog({ eyebrow = '', title, wide = false }) {
    runCleanups();
    $('#dialog-eyebrow').textContent = eyebrow;
    $('#dialog-title').textContent = title;
    dialog.classList.toggle('wide', wide);
    const body = $('#dialog-body');
    body.innerHTML = '';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    return body;
  }

  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    runCleanups();
    if (toastStack.parentNode !== document.body) document.body.append(toastStack);
    if (/^#level-\d$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  });

  function openLevel(id) {
    const level = LEVELS[id - 1];
    if (!level) return;
    if (!isUnlocked(id)) {
      toast(`🔒 Алдымен ${id - 1}-деңгейді аяқта`, 'warn');
      return;
    }
    const body = openDialog({ eyebrow: `${level.icon} ${id}-деңгей · ${level.type}`, title: level.title, wide: true });
    level.play(body, level);
  }

  /* =========================================================
     1-ДЕҢГЕЙ: «Матильда кім?» — Жұмбақ портрет
     ========================================================= */
  function playLevel1(body) {
    let mistakes = 0;
    const found = new Set();
    const described = new Set();

    body.innerHTML = `
      ${bookHint('Матильданың бөлмесінде 3 негізгі зат жасырылған. Оларды тауып, кітаптан осы заттар кездесетін бөліктерді оқы. Заттың Матильдаға қатысын жаз. Үшеуін де дұрыс сипаттасаң, келесі бөлменің есігі ашылады.')}
      <div class="room-meta">
        <span>Табылған негізгі заттар: <strong id="l1-found">0/3</strong></span>
        <span>Сипатталды: <strong id="l1-desc">0/3</strong></span>
      </div>
      <div class="room" id="room">
        <div class="room-window"></div>
        <div class="room-shelf"><span></span><span></span><span></span></div>
        <div class="room-bed"></div>
        <div class="room-table"></div>
        <div class="room-rug"></div>
        <button class="room-door" type="button" id="room-door" disabled aria-label="Келесі бөлменің есігі, құлыпталған">🚪<small>🔒</small></button>
      </div>
      <div class="task-panel" id="l1-task"><p class="muted-text">🔍 Бөлмедегі заттарды басып көр. Кейбірі жасырынып тұр!</p></div>
      <div id="l1-next"></div>`;

    const room = $('#room', body);
    const task = $('#l1-task', body);
    const door = $('#room-door', body);

    const updateMeta = () => {
      $('#l1-found', body).textContent = `${found.size}/3`;
      $('#l1-desc', body).textContent = `${described.size}/3`;
    };

    ROOM.forEach((obj) => {
      const button = h(
        'button',
        {
          class: 'room-object',
          type: 'button',
          style: `left:${obj.x}%;top:${obj.y}%;--s:${obj.size}`,
          'aria-label': obj.label
        },
        obj.emoji
      );
      button.addEventListener('click', () => pick(obj, button));
      room.append(button);
    });

    function pick(obj, button) {
      button.classList.add('found');
      if (!obj.key) {
        task.innerHTML = `
          <div class="task-card fact">
            <div class="task-head"><span class="task-emoji">${obj.emoji}</span><div><strong>${obj.label}</strong><small>Қосымша дерек</small></div></div>
            <p>${obj.fact}</p>
            <p class="muted-text">Бұл зат негізгі үшеудің қатарына кірмейді. Іздеуді жалғастыр!</p>
          </div>`;
        awardOnce(`l1-fact-${obj.id}`, 0, 5, `${obj.emoji} Қосымша дерек табылды`);
        return;
      }
      if (!found.has(obj.id)) {
        found.add(obj.id);
        updateMeta();
      }
      renderTask(obj);
    }

    function renderTask(obj) {
      if (described.has(obj.id)) {
        task.innerHTML = `
          <div class="task-card success">
            <div class="task-head"><span class="task-emoji">${obj.emoji}</span><div><strong>${obj.label}</strong><small>Жауабың қабылданды ✓ Үлгімен салыстыр</small></div></div>
            <p><strong>Үлгі жауап:</strong> ${obj.model}</p>
          </div>`;
        return;
      }
      task.innerHTML = `
        <div class="task-card">
          <div class="task-head"><span class="task-emoji">${obj.emoji}</span><div><strong>${obj.label}</strong><small>Бұл заттың Матильдаға қандай қатысы бар? Ол Матильданың қандай бала екенін көрсетеді?</small></div></div>
          <textarea rows="3" placeholder="Мысалы: Бұл зат Матильданың ... екенін көрсетеді, себебі кітапта ..."></textarea>
          <div class="task-actions">
            <button class="small-action" type="button">Тексеру</button>
            <span class="feedback" aria-live="polite"></span>
          </div>
        </div>`;
      const textarea = $('textarea', task);
      const feedback = $('.feedback', task);
      textarea.focus();
      $('button', task).addEventListener('click', () => {
        const text = textarea.value;
        // Жауап әртүрлі болуы мүмкін — бос болмаса, қабылданады
        if (!text.trim()) {
          feedback.textContent = 'Өз ойыңды жаз.';
          feedback.dataset.state = 'retry';
          return;
        }
        described.add(obj.id);
        updateMeta();
        awardOnce(`l1-desc-${obj.id}`, 10, 5, `${obj.emoji} Дәлел табылды`);
        renderTask(obj);
        if (described.size === 3) openDoor();
      });
    }

    function openDoor() {
      door.disabled = false;
      door.classList.add('open');
      door.innerHTML = '🚪<small>✨</small>';
      door.setAttribute('aria-label', 'Келесі бөлменің есігі ашылды');
      const go = h('button', { class: 'button button-primary', type: 'button' }, '🚪 Деңгейді аяқтау → 2-деңгей');
      go.addEventListener('click', finish);
      $('#l1-next', body).append(
        h('p', { class: 'door-note center', text: '✨ Есік ашылды! Үш затты да сипаттадың.' }),
        h('div', { class: 'center-actions' }, go)
      );
      go.scrollIntoView({ behavior: 'smooth', block: 'center' });
      go.focus({ preventScroll: true });
    }

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      const result = completeLevel(1, mistakes, [1, 3]);
      showLevelResult(body, 1, result, '<p>Сен Матильданың портретін аштың: ол — кітапқұмар, зерек, ерекше қабілетті бала.</p>');
    }

    door.addEventListener('click', finish);
  }

  /* =========================================================
     2-ДЕҢГЕЙ: «Бұл кім?»
     ========================================================= */
  function playLevel2(body) {
    let index = 0;
    let mistakes = 0;

    function render() {
      const item = WHO[index];
      body.innerHTML = `
        ${bookHint('Берілген мәтінді оқып, қай кейіпкер туралы айтылып тұрғанын тап. Есіңе түспесе, кейіпкер алғаш шығатын тарауды қайта оқы.')}
        <p class="step-counter">Сипаттама ${index + 1}/${WHO.length}</p>
        <blockquote class="who-card">${item.text}<span>БҰЛ КІМ?</span></blockquote>
        <div class="cast-grid" id="cast-grid"></div>
        <p class="feedback center" id="who-feedback" aria-live="polite"></p>`;
      const grid = $('#cast-grid', body);
      const feedback = $('#who-feedback', body);
      let solved = false;
      CAST.forEach((person) => {
        const button = h(
          'button',
          { class: 'cast-button', type: 'button' },
          h('span', { class: 'cast-face', text: person.emoji }),
          h('span', { text: person.name })
        );
        button.addEventListener('click', () => {
          if (solved) return;
          if (person.id === item.answer) {
            solved = true;
            button.classList.add('correct');
            feedback.textContent = `✓ Дұрыс! Бұл — ${person.name}.`;
            feedback.dataset.state = 'success';
            awardOnce(`l2-${index}`, 10, 5, `🎭 Кейіпкер танылды: ${person.name}`);
            const next = h('button', { class: 'button button-primary', type: 'button' }, index < WHO.length - 1 ? 'Келесі сипаттама →' : 'Деңгейді аяқтау ✓');
            next.addEventListener('click', () => {
              index += 1;
              if (index < WHO.length) render();
              else showLevelResult(body, 2, completeLevel(2, mistakes, [0, 1]));
            });
            feedback.after(h('div', { class: 'center-actions' }, next));
            next.focus();
          } else {
            mistakes += 1;
            button.classList.add('wrong');
            button.disabled = true;
            feedback.textContent = 'Жоқ, бұл басқа кейіпкер. Мінездемені қайта оқып көр.';
            feedback.dataset.state = 'retry';
          }
        });
        grid.append(button);
      });
    }
    render();
  }

  /* =========================================================
     3-ДЕҢГЕЙ: «Мәтіннен дәлел тап» — пазл
     ========================================================= */
  function mountPuzzle(host, puzzle, onSolved) {
    const total = puzzle.cols * puzzle.rows;
    let order = shuffle([...Array(total).keys()]);
    while (order.every((value, position) => value === position)) order = shuffle(order);
    let selected = null;
    let moves = 0;
    let finished = false;

    const meta = h('p', { class: 'puzzle-meta' });
    const grid = h('div', {
      class: 'puzzle',
      style: `--cols:${puzzle.cols};--rows:${puzzle.rows};aspect-ratio:${puzzle.ratio}`
    });
    const tiles = order.map((_, position) => {
      const tile = h('button', { class: 'tile', type: 'button', 'aria-label': `Бөлік ${position + 1}` });
      tile.addEventListener('click', () => pick(position));
      grid.append(tile);
      return tile;
    });
    host.append(meta, grid);

    function draw() {
      tiles.forEach((tile, position) => {
        const piece = order[position];
        const row = Math.floor(piece / puzzle.cols);
        const col = piece % puzzle.cols;
        tile.style.backgroundImage = `url(${puzzle.src})`;
        tile.style.backgroundSize = `${puzzle.cols * 100}% ${puzzle.rows * 100}%`;
        tile.style.backgroundPosition = `${(col / (puzzle.cols - 1)) * 100}% ${(row / (puzzle.rows - 1)) * 100}%`;
        tile.classList.toggle('ok', piece === position);
        tile.classList.toggle('sel', selected === position);
      });
      const placed = order.filter((value, position) => value === position).length;
      meta.innerHTML = `Жүріс: <strong>${moves}</strong> · Орнында: <strong>${placed}/${total}</strong> · Екі бөлікті басып, орындарын ауыстыр.`;
    }

    function pick(position) {
      if (finished) return;
      if (selected === null) {
        selected = position;
      } else if (selected === position) {
        selected = null;
      } else {
        [order[selected], order[position]] = [order[position], order[selected]];
        selected = null;
        moves += 1;
      }
      draw();
      if (order.every((value, index) => value === index)) {
        finished = true;
        grid.classList.add('solved');
        tiles.forEach((tile) => {
          tile.disabled = true;
        });
        setTimeout(() => onSolved(moves, total), 600);
      }
    }
    draw();
  }

  function playLevel3(body) {
    let index = 0;
    let mistakes = 0;

    function render() {
      const puzzle = PUZZLES[index];
      body.innerHTML = `
        ${bookHint('Пазлды құрастыр. Суретте кітаптағы қай оқиға бейнеленгенін тап және кітап мәтініне сүйеніп жаз.')}
        <p class="step-counter">Пазл ${index + 1}/${PUZZLES.length}</p>
        <div id="puzzle-host"></div>
        <div id="puzzle-task"></div>`;
      mountPuzzle($('#puzzle-host', body), puzzle, (moves, total) => {
        if (moves > total * 1.5) mistakes += 1;
        awardOnce(`l3-solve-${index}`, 10, 5, '🧩 Пазл құрастырылды');
        renderQuestion(puzzle);
      });
    }

    function renderQuestion(puzzle) {
      const host = $('#puzzle-task', body);
      host.innerHTML = `
        <div class="task-card">
          <div class="task-head"><span class="task-emoji">🔎</span><div><strong>Қандай оқиға бейнеленген?</strong><small>Кім? Не істеді? Неліктен? Кітапқа сүйеніп жаз.</small></div></div>
          <textarea rows="3" placeholder="Суретте ... бейнеленген. Кітапта ..."></textarea>
          <div class="task-actions"><button class="small-action" type="button">Тексеру</button><span class="feedback" aria-live="polite"></span></div>
        </div>`;
      const textarea = $('textarea', host);
      const feedback = $('.feedback', host);
      textarea.focus();
      $('button', host).addEventListener('click', () => {
        const text = textarea.value;
        // Жауап әртүрлі болуы мүмкін — бос болмаса, қабылданады
        if (!text.trim()) {
          feedback.textContent = 'Суретте не бейнеленгенін жаз.';
          feedback.dataset.state = 'retry';
          return;
        }
        awardOnce(`l3-text-${index}`, 15, 5, '🔎 Дәлел мәтіннен табылды');
        host.innerHTML = `
          <div class="task-card success">
            <div class="task-head"><span class="task-emoji">✓</span><div><strong>Жауабың қабылданды!</strong><small>Өз жауабыңды үлгімен салыстыр</small></div></div>
            <p><strong>Үлгі жауап:</strong> ${puzzle.answer}</p>
          </div>`;
        const next = h('button', { class: 'button button-primary', type: 'button' }, index < PUZZLES.length - 1 ? 'Келесі пазл →' : 'Деңгейді аяқтау ✓');
        next.addEventListener('click', () => {
          index += 1;
          if (index < PUZZLES.length) render();
          else showLevelResult(body, 3, completeLevel(3, mistakes, [1, 3]));
        });
        host.append(h('div', { class: 'center-actions' }, next));
      });
    }
    render();
  }

  /* =========================================================
     4-ДЕҢГЕЙ: «Жасырын кодты шеш»
     ========================================================= */
  function playLevel4(body) {
    let entry = '';
    let mistakes = 0;
    let locked = false;
    const HINT_PRICE = 10;

    body.innerHTML = `
      ${bookHint('Матильда Мисс Ханидің үйіне кіруі керек. Есік коды — 4 таңбалы сан. Сандарды табу үшін кітапты аш!')}
      <div class="code-layout">
        <div class="clues" id="clues"></div>
        <div class="vault" id="vault">
          <div class="vault-door">
            <p class="vault-label">🏡 Мисс Ханидің есігі</p>
            <div class="code-slots" id="code-slots"><span></span><span></span><span></span><span></span></div>
            <div class="keypad" id="keypad"></div>
            <p class="feedback center" id="code-feedback" aria-live="polite"></p>
          </div>
        </div>
      </div>`;

    const clues = $('#clues', body);
    CLUES.forEach((clue) => {
      const card = h('div', { class: 'clue-card' });
      card.innerHTML = `<span class="clue-label">${clue.label}</span><p>${clue.text}</p>`;
      const hintButton = h('button', { class: 'hint-button', type: 'button' }, `💡 Кеңес (${HINT_PRICE} 🪙)`);
      hintButton.addEventListener('click', () => {
        if (state.coins < HINT_PRICE) {
          toast(`Монета жетпейді. Кеңес ${HINT_PRICE} 🪙 тұрады.`, 'warn');
          return;
        }
        state.coins -= HINT_PRICE;
        save();
        renderAll();
        hintButton.replaceWith(h('p', { class: 'clue-hint', text: `💡 ${clue.hint}` }));
      });
      card.append(hintButton);
      clues.append(card);
    });

    const slots = $$('#code-slots span', body);
    const feedback = $('#code-feedback', body);
    const keypad = $('#keypad', body);

    function drawSlots(marks) {
      slots.forEach((slot, i) => {
        slot.textContent = entry[i] || '';
        slot.className = marks ? marks[i] : entry[i] ? 'filled' : '';
      });
    }

    function press(key) {
      if (locked) return;
      if (key === 'back') entry = entry.slice(0, -1);
      else if (key === 'ok') return submit();
      else if (entry.length < 4) entry += key;
      feedback.textContent = '';
      drawSlots();
    }

    function submit() {
      if (entry.length < 4) {
        feedback.textContent = '4 сан тер.';
        feedback.dataset.state = 'retry';
        return;
      }
      const marks = [...entry].map((digit, i) => (digit === CODE[i] ? 'good' : 'bad'));
      drawSlots(marks);
      if (entry === CODE) {
        locked = true;
        feedback.textContent = '🔓 Есік ашылды! Мисс Ханидің үйіне кірдің.';
        feedback.dataset.state = 'success';
        $('#vault', body).classList.add('opened');
        setTimeout(() => {
          showLevelResult(
            body,
            4,
            completeLevel(4, mistakes, [0, 2]),
            '<p>Код: <strong>2 · 1 · 23</strong>. Үйде 2 орындық, спидометр 10 000 мильге кері айналды, Мисс Хани 23 жаста.</p>'
          );
        }, 1100);
        return;
      }
      mistakes += 1;
      locked = true;
      feedback.textContent = 'Есік ашылмады. Жасыл — дұрыс сан. Қызыл сандарды кітаптан қайта тексер.';
      feedback.dataset.state = 'retry';
      setTimeout(() => {
        entry = '';
        locked = false;
        drawSlots();
      }, 1400);
    }

    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'].forEach((key) => {
      const label = key === 'back' ? '⌫' : key === 'ok' ? '✓' : key;
      const button = h('button', { class: `key${key === 'ok' ? ' key-ok' : ''}`, type: 'button', 'aria-label': key === 'back' ? 'Өшіру' : key === 'ok' ? 'Тексеру' : key }, label);
      button.addEventListener('click', () => press(key));
      keypad.append(button);
    });

    const onKey = (event) => {
      if (event.target && event.target.tagName === 'INPUT') return;
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') press('back');
      else if (event.key === 'Enter') {
        event.preventDefault();
        press('ok');
      }
    };
    dialog.addEventListener('keydown', onKey);
    addCleanup(() => dialog.removeEventListener('keydown', onKey));
    drawSlots();
  }

  /* =========================================================
     5-ДЕҢГЕЙ: ЖИ-кейіпкерлермен сөйлесу
     ========================================================= */
  function playLevel5(body) {
    let mistakes = 0;
    let active = CHARACTERS[0].id;
    const timers = [];
    addCleanup(() => timers.forEach(clearTimeout));
    const talks = Object.fromEntries(CHARACTERS.map((c) => [c.id, { messages: [], passed: false, fallbackIndex: 0 }]));

    body.innerHTML = `
      ${bookHint('Кейіпкерді таңда. Ол алдымен кітап бойынша сұрақ қояды. Дұрыс жауап берсең ғана, оған өз сұрағыңды қоя аласың. Үш кейіпкердің де сынағынан өт.')}
      <div class="chat-layout">
        <div class="chat-cast" id="chat-cast" role="tablist" aria-label="Кейіпкерлер"></div>
        <div class="chat-box">
          <div class="chat-head" id="chat-head"></div>
          <div class="chat-log" id="chat-log" aria-live="polite"></div>
          <div class="chat-chips" id="chat-chips"></div>
          <form class="chat-form" id="chat-form">
            <input type="text" id="chat-input" placeholder="Жауабыңды немесе сұрағыңды жаз..." autocomplete="off" maxlength="200" />
            <button class="small-action" type="submit">Жіберу</button>
          </form>
        </div>
      </div>
      <div class="chat-footer">
        <span>Сынақтан өттің: <strong id="chat-pass">0/3</strong></span>
        <button class="button button-primary" type="button" id="chat-finish" hidden>Деңгейді аяқтау ✓</button>
      </div>`;

    const castHost = $('#chat-cast', body);
    const log = $('#chat-log', body);
    const chips = $('#chat-chips', body);
    const input = $('#chat-input', body);
    const finish = $('#chat-finish', body);

    const character = () => CHARACTERS.find((c) => c.id === active);

    function renderCast() {
      castHost.innerHTML = '';
      CHARACTERS.forEach((c) => {
        const button = h(
          'button',
          { class: `chat-person${c.id === active ? ' active' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(c.id === active) },
          h('span', { class: 'cast-face', text: c.emoji }),
          h('span', { text: c.name }),
          talks[c.id].passed ? h('span', { class: 'chat-check', text: '✓' }) : null
        );
        button.addEventListener('click', () => select(c.id));
        castHost.append(button);
      });
      const passed = CHARACTERS.filter((c) => talks[c.id].passed).length;
      $('#chat-pass', body).textContent = `${passed}/3`;
      finish.hidden = passed < CHARACTERS.length;
    }

    function renderLog() {
      const c = character();
      $('#chat-head', body).innerHTML = `<span class="cast-face">${c.emoji}</span><div><strong>${c.name}</strong><small>ЖИ-кейіпкер · кітап мазмұнына бапталған</small></div>`;
      log.innerHTML = '';
      talks[active].messages.forEach((m) => log.append(bubble(m)));
      log.scrollTop = log.scrollHeight;
      chips.innerHTML = '';
      if (talks[active].passed) {
        c.chips.forEach((text) => {
          chips.append(h('button', { class: 'chip', type: 'button', onclick: () => send(text) }, text));
        });
      }
    }

    function bubble(message) {
      const node = h('div', { class: `bubble ${message.from}` });
      node.textContent = message.text;
      if (message.note) node.append(h('small', { class: 'bubble-note', text: `💡 ${message.note}` }));
      return node;
    }

    function botSay(id, text, note) {
      const typing = h('div', { class: 'bubble bot typing', 'aria-label': 'жазып жатыр' }, h('i'), h('i'), h('i'));
      if (id === active) {
        log.append(typing);
        log.scrollTop = log.scrollHeight;
      }
      const timer = setTimeout(() => {
        typing.remove();
        talks[id].messages.push({ from: 'bot', text, note });
        if (id === active) renderLog();
      }, 650);
      timers.push(timer);
    }

    function select(id) {
      active = id;
      const talk = talks[id];
      const c = character();
      renderCast();
      if (talk.messages.length === 0) {
        talk.messages.push({ from: 'bot', text: c.greet });
        talk.messages.push({ from: 'bot', text: c.challenge });
      }
      renderLog();
      input.focus();
    }

    function respond(c, text) {
      const topic = c.topics.find((t) => hasKeyword(text, t.k));
      if (topic) return topic;
      const talk = talks[c.id];
      const reply = c.fallback[talk.fallbackIndex % c.fallback.length];
      talk.fallbackIndex += 1;
      return { a: reply };
    }

    function send(text) {
      const clean = text.trim();
      if (!clean) return;
      const c = character();
      const talk = talks[c.id];
      talk.messages.push({ from: 'me', text: clean });
      renderLog();
      if (!talk.passed) {
        // Жауап әртүрлі болуы мүмкін — кез келген жауап қабылданады
        talk.passed = true;
        botSay(c.id, hasKeyword(clean, c.check) ? c.praise : c.accept);
        awardOnce(`l5-${c.id}`, 15, 5, `💬 ${c.name} сынағы өтті`);
        renderCast();
        return;
      }
      const reply = respond(c, clean);
      botSay(c.id, reply.a, reply.note);
    }

    $('#chat-form', body).addEventListener('submit', (event) => {
      event.preventDefault();
      send(input.value);
      input.value = '';
    });
    finish.addEventListener('click', () => showLevelResult(body, 5, completeLevel(5, mistakes, [1, 3])));

    select(active);
  }

  /* =========================================================
     6-ДЕҢГЕЙ: Финал — Транчбұлдың сынағы (босс)
     ========================================================= */
  function playLevel6(body) {
    const TIME = 30;
    const questions = FINAL_QUESTIONS.map((item) => ({
      ...item,
      shuffled: shuffle(item.options.map((text, i) => ({ text, ok: i === 0 })))
    }));
    let index = 0;
    let hearts = 3;
    let wrong = 0;
    let timer = null;
    addCleanup(() => clearInterval(timer));

    body.innerHTML = `
      ${bookHint('Барлық жауап кітаптың ішінде. Әр сұраққа 30 секунд беріледі. Сенің 3 жүрегің бар: қате жауап немесе уақыт бітсе, бір жүрек кетеді.')}
      <div class="boss-bar">
        <div class="boss">
          <span class="boss-face">🏋️‍♀️</span>
          <div class="boss-info"><strong>Мисс Транчбұл</strong><div class="hp"><span id="boss-hp"></span></div></div>
        </div>
        <div class="hearts" id="hearts" aria-label="Жүректер"></div>
      </div>
      <div class="timer" aria-hidden="true"><span id="timer-fill"></span></div>
      <div id="boss-stage"></div>`;

    const stage = $('#boss-stage', body);
    const hpBar = $('#boss-hp', body);
    const timerFill = $('#timer-fill', body);

    function drawStatus() {
      const correct = index - wrong;
      hpBar.style.width = `${Math.max(0, 100 - (correct / questions.length) * 100)}%`;
      $('#hearts', body).textContent = '❤️'.repeat(hearts) + '🤍'.repeat(3 - hearts);
    }

    function startTimer(onTimeout) {
      clearInterval(timer);
      const startedAt = Date.now();
      timerFill.style.width = '100%';
      timerFill.classList.remove('low');
      timer = setInterval(() => {
        const left = Math.max(0, TIME - (Date.now() - startedAt) / 1000);
        timerFill.style.width = `${(left / TIME) * 100}%`;
        timerFill.classList.toggle('low', left < 8);
        if (left <= 0) {
          clearInterval(timer);
          onTimeout();
        }
      }, 100);
    }

    function renderQuestion() {
      drawStatus();
      const item = questions[index];
      stage.innerHTML = `
        <p class="step-counter">Сұрақ ${index + 1}/${questions.length + 1}</p>
        <h3 class="boss-question">${item.q}</h3>
        <div class="boss-options" id="boss-options"></div>
        <div id="boss-after"></div>`;
      const options = $('#boss-options', stage);
      let answered = false;
      const buttons = item.shuffled.map((option) => {
        const button = h('button', { class: 'boss-option', type: 'button' }, option.text);
        button.addEventListener('click', () => answer(option, button));
        options.append(button);
        return button;
      });

      function answer(option, button) {
        if (answered) return;
        answered = true;
        clearInterval(timer);
        buttons.forEach((b, i) => {
          b.disabled = true;
          if (item.shuffled[i].ok) b.classList.add('correct');
        });
        const ok = Boolean(option && option.ok);
        if (!ok) {
          wrong += 1;
          hearts -= 1;
          if (button) button.classList.add('wrong');
        }
        index += 1;
        drawStatus();
        const after = $('#boss-after', stage);
        after.innerHTML = `
          <div class="task-card ${ok ? 'success' : 'fact'}">
            <p><strong>${ok ? '✓ Дұрыс! Транчбұл шегінді.' : option ? '✗ Қате.' : '⏰ Уақыт бітті.'}</strong> ${item.note}</p>
          </div>`;
        const next = h('button', { class: 'button button-primary', type: 'button' });
        if (hearts <= 0) {
          next.textContent = 'Нәтижені көру';
          next.addEventListener('click', defeat);
        } else if (index < questions.length) {
          next.textContent = 'Келесі сұрақ →';
          next.addEventListener('click', renderQuestion);
        } else {
          next.textContent = 'Соңғы сұраққа өту →';
          next.addEventListener('click', renderReflection);
        }
        after.append(h('div', { class: 'center-actions' }, next));
        next.focus();
      }

      startTimer(() => answer(null, null));
    }

    function renderReflection() {
      clearInterval(timer);
      timerFill.style.width = '0%';
      drawStatus();
      stage.innerHTML = `
        <p class="step-counter">Сұрақ ${questions.length + 1}/${questions.length + 1} · Өз ойың</p>
        <h3 class="boss-question">${REFLECTION_Q}</h3>
        <div class="task-card">
          <textarea rows="4" placeholder="Мен Матильданың орнында болсам, ..."></textarea>
          <div class="task-actions"><button class="small-action" type="button">Жауапты жіберу</button><span class="feedback" aria-live="polite"></span></div>
        </div>`;
      const textarea = $('textarea', stage);
      const feedback = $('.feedback', stage);
      textarea.focus();
      $('button', stage).addEventListener('click', () => {
        if (!textarea.value.trim()) {
          feedback.textContent = 'Өз ойыңды жаз.';
          feedback.dataset.state = 'retry';
          return;
        }
        victory();
      });
    }

    function victory() {
      hpBar.style.width = '0%';
      state.status = true;
      save();
      const result = completeLevel(6, wrong, [0, 1]);
      if (wrong === 0) unlockBadge('flawless');
      renderAll();
      showLevelResult(
        body,
        6,
        result,
        `<div class="medal">🥇</div>
         <p><strong>«Алтын Оқырман»</strong> медалі және <strong>«Матильданың интеллектуалды досы»</strong> статусы профиліңе қосылды!</p>
         <p class="muted-text">Дұрыс жауап: ${questions.length - wrong}/${questions.length}</p>`
      );
    }

    function defeat() {
      clearInterval(timer);
      stage.innerHTML = `
        <div class="result-screen">
          <div class="medal">😤</div>
          <h3>Транчбұл бұл жолы жеңді!</h3>
          <p>Қате жауап берген сұрақтарыңа қатысты тарауларды қайта оқып, тағы байқап көр. Кітап — сенің ең күшті қаруың.</p>
          <div class="result-actions"></div>
        </div>`;
      $('.result-actions', stage).append(
        h('button', { class: 'button button-primary', type: 'button', onclick: () => openLevel(6) }, 'Қайта бастау ↻'),
        h('button', { class: 'button button-secondary', type: 'button', onclick: () => dialog.close() }, 'Жабу')
      );
    }

    renderQuestion();
  }

  /* =========================================================
     ҚОСЫМША ОЙЫНДАР
     ========================================================= */

  // Оқиғаны жалғастыр
  function openStory(start = 0) {
    const body = openDialog({ eyebrow: '✍️ Қосымша ойын · Шығармашылық модуль', title: 'Оқиғаны жалғастыр' });
    let index = start;

    function render() {
      const item = STORIES[index];
      const options = shuffle(item.options.map((text, i) => ({ text, ok: i === 0 })));
      const done = state.stories.includes(index);
      body.innerHTML = `
        ${bookHint('Үзінді қай жерде үзілді? Кітаптан осы жерді тауып, дұрыс жалғасын таңда.')}
        <p class="step-counter">Үзінді ${index + 1}/${STORIES.length}${done ? ' · ✓ орындалған' : ''}</p>
        <blockquote class="who-card story">${item.start}</blockquote>
        <div class="boss-options" id="story-options"></div>
        <div id="story-after"></div>`;
      const host = $('#story-options', body);
      let solved = false;
      options.forEach((option) => {
        const button = h('button', { class: 'boss-option', type: 'button' }, `…${option.text}`);
        button.addEventListener('click', () => {
          if (solved) return;
          if (!option.ok) {
            button.classList.add('wrong');
            button.disabled = true;
            toast('Кітаптағы жалғасы басқаша. Үзіндіні тауып оқы!', 'warn');
            return;
          }
          solved = true;
          button.classList.add('correct');
          if (!state.stories.includes(index)) {
            state.stories.push(index);
            award(20, 15, '✍️ Үзінді дұрыс жалғасты');
          }
          const after = $('#story-after', body);
          after.innerHTML = `<div class="task-card success"><p>${item.note}</p></div>`;
          const next = h('button', { class: 'button button-primary', type: 'button' }, index < STORIES.length - 1 ? 'Келесі үзінді →' : 'Аяқтау ✓');
          next.addEventListener('click', () => {
            index += 1;
            if (index < STORIES.length) render();
            else dialog.close();
          });
          after.append(h('div', { class: 'center-actions' }, next));
        });
        host.append(button);
      });
    }
    render();
  }

  // Сөз мергені
  function openWords() {
    const body = openDialog({ eyebrow: '🎯 Қосымша ойын · Сөздік қор', title: 'Сөз мергені', wide: true });
    const pool = shuffle(WORDS.map((_, i) => i))
      .sort((a, b) => Number(state.words.includes(a)) - Number(state.words.includes(b)))
      .slice(0, 10);
    let round = 0;
    let correctCount = 0;

    function powerBar() {
      const pct = (state.words.length / WORDS.length) * 100;
      return `<div class="power"><span>🪄 Сиқырлы күш: <strong>${state.words.length}/${WORDS.length}</strong></span><div class="xp-track"><span style="width:${pct}%"></span></div></div>`;
    }

    function render() {
      const wordIndex = pool[round];
      const [word, meaning] = WORDS[wordIndex];
      const distractors = shuffle(WORDS.filter((_, i) => i !== wordIndex)).slice(0, 3).map((w) => w[1]);
      const options = shuffle([{ text: meaning, ok: true }, ...distractors.map((text) => ({ text, ok: false }))]);
      body.innerHTML = `
        ${powerBar()}
        <p class="step-counter">Сөз ${round + 1}/${pool.length}</p>
        <div class="word-card">${word}</div>
        <p class="center muted-text">Бұл сөздің мағынасы қандай?</p>
        <div class="boss-options" id="word-options"></div>
        <div id="word-after"></div>`;
      const host = $('#word-options', body);
      let answered = false;
      const buttons = options.map((option) => {
        const button = h('button', { class: 'boss-option', type: 'button' }, option.text);
        button.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          buttons.forEach((b, i) => {
            b.disabled = true;
            if (options[i].ok) b.classList.add('correct');
          });
          if (option.ok) {
            correctCount += 1;
            if (!state.words.includes(wordIndex)) {
              state.words.push(wordIndex);
              award(10, 5, `🎯 «${word}» сөзі меңгерілді`);
            }
          } else {
            button.classList.add('wrong');
          }
          const next = h('button', { class: 'button button-primary', type: 'button' }, round < pool.length - 1 ? 'Келесі сөз →' : 'Нәтиже');
          next.addEventListener('click', () => {
            round += 1;
            if (round < pool.length) render();
            else summary();
          });
          $('#word-after', body).append(h('div', { class: 'center-actions' }, next));
          next.focus();
        });
        host.append(button);
        return button;
      });
    }

    function summary() {
      body.innerHTML = `
        ${powerBar()}
        <div class="result-screen compact">
          <h3>Раунд аяқталды: ${correctCount}/${pool.length}</h3>
          <p class="muted-text">Жасыл сөздер — меңгерілген. Қалғандарын келесі раундта үйрен.</p>
        </div>
        <ul class="glossary">${WORDS.map(([w, m], i) => `<li class="${state.words.includes(i) ? 'known' : ''}"><strong>${w}</strong><span>${m}</span></li>`).join('')}</ul>
        <div class="center-actions"></div>`;
      $('.center-actions', body).append(
        h('button', { class: 'button button-primary', type: 'button', onclick: openWords }, 'Тағы ойнау ↻'),
        h('button', { class: 'button button-secondary', type: 'button', onclick: () => dialog.close() }, 'Жабу')
      );
    }
    render();
  }

  // Аватар және дүкен
  function avatarHTML(equipped) {
    const outfit = SHOP.find((item) => item.id === equipped.outfit);
    const bodyColor = outfit ? outfit.color : '#e86b9d';
    const item = (slot) => {
      const found = SHOP.find((s) => s.id === equipped[slot]);
      return found ? `<span class="av-${slot}">${found.emoji}</span>` : '';
    };
    return `
      <div class="avatar-figure">
        <svg viewBox="0 0 120 140" role="img" aria-label="Оқырман аватары">
          <ellipse cx="60" cy="134" rx="40" ry="5" fill="rgba(0,0,0,0.3)" />
          <path d="M22 134 C22 100 38 88 60 88 C82 88 98 100 98 134 Z" fill="${bodyColor}" />
          ${outfit && outfit.id === 'uniform' ? '<path d="M56 90 L64 90 L62 112 L60 116 L58 112 Z" fill="#c8384f" /><path d="M48 90 L60 100 L72 90" fill="none" stroke="#ffffff" stroke-width="3" />' : ''}
          <path d="M28 60 C26 82 30 98 40 104 L44 66 Z" fill="#5a3a26" />
          <path d="M92 60 C94 82 90 98 80 104 L76 66 Z" fill="#5a3a26" />
          <circle cx="60" cy="58" r="28" fill="#f6d2b8" />
          <path d="M31 58 C29 32 46 24 60 24 C76 24 93 32 89 58 C85 45 76 38 60 38 C45 38 35 45 31 58 Z" fill="#5a3a26" />
          <circle cx="50" cy="61" r="3.2" fill="#2b2b3a" />
          <circle cx="70" cy="61" r="3.2" fill="#2b2b3a" />
          <circle cx="44" cy="70" r="4" fill="#f4a3a8" opacity="0.6" />
          <circle cx="76" cy="70" r="4" fill="#f4a3a8" opacity="0.6" />
          <path d="M52 73 Q60 80 68 73" stroke="#b5523b" stroke-width="2.5" fill="none" stroke-linecap="round" />
        </svg>
        ${item('head')}${item('face')}${item('hand')}
      </div>`;
  }

  function openAvatar() {
    const body = openDialog({ eyebrow: '👗 Қосымша ойын · BookCoins дүкені', title: 'Оқырмандық костюмдау', wide: true });

    function render() {
      body.innerHTML = `
        <div class="shop-layout">
          <div class="shop-preview">
            <div class="avatar-stage big">${avatarHTML(state.equipped)}</div>
            <p class="shop-wallet">Әмиян: <strong>${state.coins} 🪙</strong></p>
            <p class="muted-text center">Монетаны тапсырма орындап жина: деңгейлер, сөздер, үзінділер, карта.</p>
          </div>
          <div class="shop-grid" id="shop-grid"></div>
        </div>`;
      const grid = $('#shop-grid', body);
      SHOP.forEach((item) => {
        const owned = state.owned.includes(item.id);
        const worn = state.equipped[item.slot] === item.id;
        const card = h('div', { class: `shop-item${worn ? ' worn' : ''}` });
        card.innerHTML = `<span class="shop-emoji">${item.emoji}</span><strong>${item.name}</strong><small>${SLOT_NAMES[item.slot]}</small>`;
        let label;
        if (!owned) label = `${item.price} 🪙 · Сатып алу`;
        else label = worn ? 'Шешу' : 'Кию';
        const button = h('button', { class: 'small-action', type: 'button' }, label);
        if (!owned && state.coins < item.price) button.classList.add('poor');
        button.addEventListener('click', () => {
          if (!owned) {
            if (state.coins < item.price) {
              toast(`Монета жетпейді: тағы ${item.price - state.coins} 🪙 жина`, 'warn');
              return;
            }
            state.coins -= item.price;
            state.owned.push(item.id);
            state.equipped[item.slot] = item.id;
            save();
            toast(`🛍️ <strong>${item.name}</strong> сатып алынды`);
            checkBadges();
          } else {
            state.equipped[item.slot] = worn ? null : item.id;
            save();
          }
          renderAll();
          render();
        });
        card.append(button);
        grid.append(card);
      });
    }
    render();
  }

  // Кітап картасы
  function openStation(station) {
    const body = openDialog({ eyebrow: '🗺️ Кітап картасы', title: `${station.emoji} ${station.name}` });
    const visited = state.stations.includes(station.id);
    const options = shuffle(station.options.map((text, i) => ({ text, ok: i === 0 })));
    body.innerHTML = `
      <p class="station-desc">${station.desc}</p>
      ${visited ? '<p class="stamp">✓ Мөр алынды</p>' : ''}
      <h3 class="boss-question">${station.q}</h3>
      <div class="boss-options" id="station-options"></div>
      <div id="station-after"></div>`;
    const host = $('#station-options', body);
    let solved = false;
    options.forEach((option) => {
      const button = h('button', { class: 'boss-option', type: 'button' }, option.text);
      button.addEventListener('click', () => {
        if (solved) return;
        if (!option.ok) {
          button.classList.add('wrong');
          button.disabled = true;
          toast('Қате. Осы орын туралы тарауды кітаптан оқы.', 'warn');
          return;
        }
        solved = true;
        button.classList.add('correct');
        if (!state.stations.includes(station.id)) {
          state.stations.push(station.id);
          award(25, 20, `📍 ${station.name}: мөр алынды`);
        }
        const after = $('#station-after', body);
        after.innerHTML = '<p class="stamp">✓ Мөр алынды! Келесі аялдамаға жол аш.</p>';
        after.append(h('div', { class: 'center-actions' }, h('button', { class: 'button button-primary', type: 'button', onclick: () => dialog.close() }, 'Картаға оралу')));
      });
      host.append(button);
    });
  }

  /* ---------------- РЕНДЕР ---------------- */

  function setCounter(selector, value) {
    const node = $(selector);
    const text = String(value);
    if (node.textContent === text) return;
    node.textContent = text;
    const pill = node.closest('.hud-item');
    pill.classList.remove('bump');
    void pill.offsetWidth;
    pill.classList.add('bump');
  }

  function renderHUD() {
    setCounter('#hud-xp', state.xp);
    setCounter('#hud-coins', state.coins);
    setCounter('#hud-streak', currentStreak());
    const index = rankIndex(state.xp);
    const rank = RANKS[index];
    const next = RANKS[index + 1];
    $('#rank-name').textContent = rank.name;
    if (next) {
      $('#rank-next').textContent = `«${next.name}» атағына: ${next.min - state.xp} ⭐`;
      $('#rank-fill').style.width = `${((state.xp - rank.min) / (next.min - rank.min)) * 100}%`;
    } else {
      $('#rank-next').textContent = 'Ең жоғары атақ!';
      $('#rank-fill').style.width = '100%';
    }
  }

  function renderProfile() {
    $('#profile-avatar').innerHTML = avatarHTML(state.equipped);
    const doneCount = LEVELS.filter((l) => isDone(l.id)).length;
    $('#stat-levels').textContent = `${doneCount}/6`;
    $('#stat-stars').textContent = `${totalStars()}/18`;
    $('#stat-badges').textContent = state.badges.length;
    $('#profile-status').hidden = !state.status;
    const nameInput = $('#player-name');
    if (document.activeElement !== nameInput) nameInput.value = state.name;
  }

  function renderLevels() {
    const host = $('#level-list');
    host.innerHTML = '';
    LEVELS.forEach((level) => {
      const done = isDone(level.id);
      const unlocked = isUnlocked(level.id);
      const stars = done ? state.levels[level.id].stars : 0;
      const card = h('article', { class: `quest-card tone-${level.tone}${done ? ' done' : ''}${unlocked ? '' : ' locked'}`, id: `level-${level.id}` });
      card.innerHTML = `
        <div class="quest-top">
          <span class="quest-icon">${unlocked ? level.icon : '🔒'}</span>
          <span class="level-tag">${level.id}-деңгей</span>
          ${done ? starsHTML(stars) : ''}
        </div>
        <h3>${level.title}</h3>
        <p class="quest-type">${level.type}</p>
        <p>${level.desc}</p>
        <p class="quest-reward">+${level.xp} ⭐ · +${level.coins} 🪙 · жұлдыз бонусы</p>`;
      const button = h(
        'button',
        { class: `small-action${unlocked && !done ? ' primary' : ''}`, type: 'button', disabled: !unlocked },
        !unlocked ? `🔒 ${level.id - 1}-деңгейден кейін` : done ? 'Қайта ойнау ↻' : 'Бастау →'
      );
      button.addEventListener('click', () => openLevel(level.id));
      // Аяқталған деңгейде келесі деңгейге бірден өтетін батырма
      const nextLevel = LEVELS[level.id];
      if (done && nextLevel) {
        const nextButton = h(
          'button',
          { class: `small-action${isDone(nextLevel.id) ? '' : ' primary'}`, type: 'button' },
          `${nextLevel.id}-деңгейге өту →`
        );
        nextButton.addEventListener('click', () => openLevel(nextLevel.id));
        card.append(h('div', { class: 'quest-actions' }, button, nextButton));
      } else {
        card.append(button);
      }
      host.append(card);
    });
  }

  function renderDaily() {
    const now = today();
    const claimed = state.daily.date === now ? state.daily : { pages: false, minutes: false };
    $$('[data-daily]').forEach((button) => {
      const done = claimed[button.dataset.daily];
      button.classList.toggle('claimed', done);
      button.setAttribute('aria-pressed', String(done));
    });
    const streak = currentStreak();
    const toBonus = 3 - (streak % 3);
    $('#streak-text').textContent = `Серия: ${streak} күн`;
    const filled = streak === 0 ? 0 : ((streak - 1) % 3) + 1;
    $('#streak-dots').innerHTML =
      [0, 1, 2].map((i) => `<span class="${i < filled ? 'on' : ''}"></span>`).join('') +
      `<small>${streak > 0 && streak % 3 === 0 ? 'Бонус алынды!' : `Бонусқа ${toBonus} күн`}</small>`;
  }

  function renderExtras() {
    $('#story-progress').textContent = `${state.stories.length}/${STORIES.length}`;
    $('#words-progress').textContent = `${state.words.length}/${WORDS.length}`;
    $('#map-progress').textContent = `${state.stations.length}/${STATIONS.length}`;
  }

  function renderMap() {
    const host = $('#book-map');
    host.innerHTML = '';
    STATIONS.forEach((station, i) => {
      const open = true; // Барлық аялдама бірден ашық
      const visited = state.stations.includes(station.id);
      const node = h(
        'button',
        { class: `station${open ? ' open' : ''}${visited ? ' visited' : ''}`, type: 'button', disabled: !open },
        h('span', { class: 'station-step', text: String(i + 1) }),
        h('span', { class: 'station-emoji', text: open ? station.emoji : '🔒' }),
        h('strong', { text: station.name }),
        h('small', { text: visited ? '✓ Мөр алынды' : open ? 'Сұраққа жауап бер' : `${station.unlock}-деңгейден кейін ашылады` })
      );
      node.addEventListener('click', () => openStation(station));
      host.append(node);
    });
  }

  function renderBadges() {
    const host = $('#badge-grid');
    host.innerHTML = BADGES.map((badge) => {
      const owned = state.badges.includes(badge.id);
      return `<div class="badge-tile${owned ? ' owned' : ''}">
        <span class="badge-icon">${owned ? badge.icon : '🔒'}</span>
        <strong>${badge.name}</strong>
        <small>${badge.how}</small>
      </div>`;
    }).join('');
  }

  function renderLeaderboard() {
    const host = $('#game-leaderboard');
    const me = { name: state.name || 'Сен', score: state.xp, streak: currentStreak(), me: true };
    const rows = [...STUDENTS, me].sort((a, b) => b.score - a.score);
    host.innerHTML = '';
    rows.forEach((row, i) => {
      const tr = h('tr', { class: row.me ? 'me' : '' });
      tr.append(
        h('td', { text: `#${i + 1}` }),
        h('td', { text: row.me ? `${row.name} (сен)` : row.name }),
        h('td', { text: String(row.score) }),
        h('td', { text: `${row.streak} күн` }),
        h('td', {}, h('span', { class: `badge-pill ${i === 0 ? 'gold' : i < 3 ? 'blue' : 'green'}`, text: rankFor(row.score).name }))
      );
      host.append(tr);
    });
  }

  function renderMiniQuest() {
    const host = $('#mini-quest');
    if (!host) return;
    host.innerHTML = '';
    LEVELS.forEach((level) => {
      const done = isDone(level.id);
      const unlocked = isUnlocked(level.id);
      const item = h(
        'li',
        { class: `${done ? 'done' : ''}${unlocked ? '' : ' locked'}` },
        h(
          'button',
          { type: 'button', disabled: !unlocked, onclick: () => openLevel(level.id) },
          h('span', { class: 'mini-icon', text: unlocked ? level.icon : '🔒' }),
          h('span', { class: 'mini-title', text: level.title }),
          h('span', { class: 'mini-state', html: done ? starsHTML(state.levels[level.id].stars) : unlocked ? 'Ойнау →' : '' })
        )
      );
      host.append(item);
    });
    $('#quest-note').textContent = `${LEVELS.filter((l) => isDone(l.id)).length}/6 деңгей`;
  }

  function renderTerms() {
    const host = $('#terms-list');
    if (!host) return;
    const openSet = new Set($$('.term-item.is-open', host).map((node) => node.dataset.term));
    host.innerHTML = '';
    WORDS.forEach(([word, meaning], i) => {
      const known = state.words.includes(i);
      const button = h(
        'button',
        { type: 'button', class: `term-item${known ? ' known' : ''}${openSet.has(word) ? ' is-open' : ''}`, 'data-term': word },
        h('strong', { text: known ? `${word} ✓` : word }),
        h('span', { text: meaning })
      );
      host.append(button);
    });
    $('#terms-note').textContent = `${state.words.length}/${WORDS.length} меңгерілді`;
    filterTerms();
  }

  function filterTerms() {
    const input = $('#term-search');
    if (!input) return;
    const query = norm(input.value);
    $$('.term-item').forEach((item) => {
      item.hidden = query !== '' && !norm(item.textContent).includes(query);
    });
  }

  function renderAll() {
    renderHUD();
    renderProfile();
    renderMiniQuest();
    renderTerms();
    renderLevels();
    renderDaily();
    renderExtras();
    renderMap();
    renderBadges();
    renderLeaderboard();
  }

  /* ---------------- ОҚИҒАЛАР ---------------- */

  $('#player-name').addEventListener('input', (event) => {
    state.name = event.target.value.trim().slice(0, 20);
    save();
    renderLeaderboard();
  });

  $$('[data-daily]').forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.daily;
      const now = today();
      if (state.daily.date !== now) state.daily = { date: now, pages: false, minutes: false };
      if (state.daily[kind]) {
        toast('Бүгін бұл сыйлықты алдың. Ертең қайта кел! 📅', 'warn');
        return;
      }
      state.daily[kind] = true;
      save();
      if (kind === 'pages') award(30, 5, '📘 15 бет оқылды');
      else award(50, 5, '⏱️ 20 минут оқылды');
    });
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open]');
    if (!trigger) return;
    const target = trigger.dataset.open;
    if (target === 'avatar') openAvatar();
    if (target === 'story') openStory();
    if (target === 'words') openWords();
  });

  $$('[data-continue]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = LEVELS.find((level) => !isDone(level.id));
      if (next) openLevel(next.id);
      else {
        toast('Барлық деңгей аяқталды! 🌟 Жұлдыздарды толық жинау үшін қайта ойна.');
        $('#levels').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const termSearch = $('#term-search');
  if (termSearch) termSearch.addEventListener('input', filterTerms);
  const termsList = $('#terms-list');
  if (termsList) {
    termsList.addEventListener('click', (event) => {
      const item = event.target.closest('.term-item');
      if (item) item.classList.toggle('is-open');
    });
  }

  $('#reset-progress').addEventListener('click', () => {
    if (!window.confirm('Барлық ұпай, монета және жетістіктер өшеді. Жалғастырасың ба?')) return;
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (error) {
      /* ignore */
    }
    state = freshState();
    renderAll();
    toast('Прогресс тазаланды. Ойынды жаңадан баста!');
  });

  function handleHash() {
    const match = /^#level-(\d)$/.exec(location.hash);
    if (!match) return;
    const id = Number(match[1]);
    if (isUnlocked(id)) openLevel(id);
    else {
      toast(`🔒 ${id}-деңгей әлі жабық. Алдымен ${id - 1}-деңгейді аяқта.`, 'warn');
      $('#levels').scrollIntoView({ behavior: 'smooth' });
    }
  }
  window.addEventListener('hashchange', handleHash);

  $('#year').textContent = new Date().getFullYear();
  renderAll();
  handleHash();
})();

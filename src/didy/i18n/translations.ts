export type SupportedLanguage = 'ar' | 'en';

export interface Translations {
  // App General
  appName: string;
  appSubtitle: string;
  langName: string;
  toggleLangBtn: string;
  
  // Navigation & Main Menu
  play: string;
  quickPlay: string;
  characters: string;
  pets: string;
  profile: string;
  shop: string;
  settings: string;
  bluetooth: string;
  chooseMode: string;
  close: string;
  back: string;
  confirm: string;
  cancel: string;
  save: string;
  loading: string;

  // Modes
  modeSoloPark: string;
  modeSoloParkDesc: string;
  modeDrop2v2: string;
  modeDrop2v2Desc: string;
  modeDrop4v4: string;
  modeDrop4v4Desc: string;
  modeBt2v2: string;
  modeBt2v2Desc: string;
  modeBt4v4: string;
  modeBt4v4Desc: string;

  // Bluetooth Modal
  btTitle: string;
  btSubtitle: string;
  btCreateRoom: string;
  btJoinRoom: string;
  btSearchDevices: string;
  btSearching: string;
  btPlayerConnected: string;
  btWaitingPlayers: string;
  btReady: string;
  btNotReady: string;
  btStartGame: string;
  btDisconnect: string;
  btRoomName: string;
  btAvailableRooms: string;
  btNearbyDevices: string;
  btNoDevicesFound: string;
  btConnectedPeers: string;
  btHost: string;
  btJoin: string;
  btTeamBlue: string;
  btTeamRed: string;
  btSwitchTeam: string;
  btSafetyTitle: string;
  btSafetyDesc: string;
  btSignal: string;
  btLatency: string;

  // Profile Modal
  profileTitle: string;
  playerName: string;
  editName: string;
  saveName: string;
  wins: string;
  matchesPlayed: string;
  didyCupTrophies: string;
  bestScore: string;
  favoriteChar: string;
  favoriteCompanion: string;
  coins: string;
  level: string;

  // Characters Modal
  charSelectTitle: string;
  charSelectSubtitle: string;
  selectHero: string;
  selected: string;
  statSpeed: string;
  statJump: string;
  statStamina: string;
  specialAbility: string;
  testEmote: string;

  // Pets Modal
  petSelectTitle: string;
  petSelectSubtitle: string;
  petActive: string;
  petSelect: string;
  petSpeedBonus: string;

  // Shop Modal
  shopTitle: string;
  shopSubtitle: string;
  gliders: string;
  costumes: string;
  buy: string;
  equipped: string;
  equip: string;
  needMoreCoins: string;

  // Settings Modal
  settingsTitle: string;
  tabLanguage: string;
  tabGraphics: string;
  tabControls: string;
  tabAudio: string;
  tabPrivacy: string;
  selectLanguage: string;
  graphicsPreset: string;
  presetLow: string;
  presetMedium: string;
  presetHigh: string;
  presetUltra: string;
  presetBattery: string;
  targetFps: string;
  shadows: string;
  particles: string;
  movementScheme: string;
  schemeDynamic: string;
  schemeDynamicDesc: string;
  schemeFixed: string;
  schemeFixedDesc: string;
  schemeSwipe: string;
  schemeSwipeDesc: string;
  schemeDpad: string;
  schemeDpadDesc: string;
  cameraSens: string;
  joystickSens: string;
  customizeHudBtn: string;
  masterVol: string;
  musicVol: string;
  sfxVol: string;
  voicesVol: string;
  muteAll: string;
  resetDefaults: string;

  // In Game HUD
  score: string;
  altitude: string;
  meters: string;
  phasePlane: string;
  phaseFreefall: string;
  phaseGliding: string;
  phaseLanded: string;
  jumpFromPlane: string;
  deployGlider: string;
  sprint: string;
  crouch: string;
  jump: string;
  interact: string;
  highFive: string;
  emote: string;
  paused: string;
  resume: string;
  quitMatch: string;
  teamBlueScore: string;
  teamRedScore: string;

  // Victory Modal
  victoryTitle: string;
  victoryWinner: string;
  victoryCongratulations: string;
  finalScore: string;
  medalsGathered: string;
  playAgain: string;
  returnToMenu: string;
  cupPresentedBy: string;

  // Emotes
  emoteVictoryDance: string;
  emoteMuscleFlex: string;
  emoteHifive: string;
  emoteBensonRage: string;
  emotePopsLaugh: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  ar: {
    // App General
    appName: 'كأس ديدي',
    appSubtitle: 'باتل رويال الكرتون - عالم ريجولار شو',
    langName: 'العربية',
    toggleLangBtn: 'English 🇺🇸',

    // Navigation & Main Menu
    play: 'العب الآن',
    quickPlay: 'مباراة سريعة',
    characters: 'الشخصيات',
    pets: 'الرفقاء',
    profile: 'الملف الشخصي',
    shop: 'المتجر',
    settings: 'الإعدادات',
    bluetooth: 'بلوتوث محلي',
    chooseMode: 'اختر وضع اللعبة',
    close: 'إغلاق',
    back: 'رجوع',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    save: 'حفظ التعديلات',
    loading: 'جارٍ التحميل...',

    // Modes
    modeSoloPark: 'استكشاف الحديقة',
    modeSoloParkDesc: 'تجول حر وفردي في أرجاء حديقة ريجولار شو واجمع الجوائز والميداليات الذهبية.',
    modeDrop2v2: 'إنزال جوي 2 ضد 2',
    modeDrop2v2Desc: 'وضع الإنزال الجوي بالمظلات! لاعبان في كل فريق يتنافسان على كأس ديدي.',
    modeDrop4v4: 'إنزال جوي 4 ضد 4',
    modeDrop4v4Desc: 'معركة حماسية كبرى! أربعة لاعبين ضد أربعة في ساحة الحديقة الكاملة.',
    modeBt2v2: 'بلوتوث 2 ضد 2 (بدون نت)',
    modeBt2v2Desc: 'اتصل بالأجهزة القريبة عبر البلوتوث أو الواي فاي المباشر وتحدَّ أصدقاءك محلياً!',
    modeBt4v4: 'بلوتوث 4 ضد 4 (بدون نت)',
    modeBt4v4Desc: 'مباراة بلوتوث جماعية ملحمية مع الأصدقاء القريبين بدون استهلاك بيانات الهاتف.',

    // Bluetooth Modal
    btTitle: 'لعبة البلوتوث والشبكة المحلية',
    btSubtitle: 'العب مع الأصدقاء بجوارك عبر البلوتوث أو نقطة الاتصال دون الحاجة للإنترنت',
    btCreateRoom: 'إنشاء غرفة بلوتوث',
    btJoinRoom: 'الانضمام إلى غرفة',
    btSearchDevices: 'البحث عن أجهزة قريبة',
    btSearching: 'جارٍ البحث عن لاعبين بجوارك...',
    btPlayerConnected: 'تم اتصال لاعب جديد!',
    btWaitingPlayers: 'في انتظار اكتمال اللاعبين...',
    btReady: 'جاهز للبدء',
    btNotReady: 'غير جاهز',
    btStartGame: 'ابدأ المعركة الآن!',
    btDisconnect: 'قطع الاتصال',
    btRoomName: 'اسم الغرفة',
    btAvailableRooms: 'الغرف المتاحة بالقرب منك',
    btNearbyDevices: 'الأجهزة المكتشفة القريبة',
    btNoDevicesFound: 'لم يتم العثور على أجهزة بعد. تأكد من تفعيل البلوتوث وظهور الجهاز.',
    btConnectedPeers: 'اللاعبون المتصلون بالغرفة',
    btHost: 'المضيف (صاحب الغرفة)',
    btJoin: 'انضمام',
    btTeamBlue: 'الفريق الأزرق',
    btTeamRed: 'الفريق الأحمر',
    btSwitchTeam: 'تبديل الفريق',
    btSafetyTitle: 'أذونات البلوتوث والأمان والخصوصية',
    btSafetyDesc: 'نستخدم تقنية البلوتوث والاتصال المحلي فقط للربط بين أجهزة اللاعبين القريبة لمزامنة الحركات. لا نطلب ولا نصل إلى أي صور أو جهات اتصال أو بيانات شخصية إطلاقاً.',
    btSignal: 'قوة الإشارة',
    btLatency: 'زمن الاستجابة',

    // Profile Modal
    profileTitle: 'الملف الشخصي للاعب',
    playerName: 'اسم اللاعب',
    editName: 'تعديل الاسم',
    saveName: 'حفظ الاسم',
    wins: 'عدد الانتصارات',
    matchesPlayed: 'المباريات الملعوبة',
    didyCupTrophies: 'كؤوس ديدي 🏆',
    bestScore: 'أفضل نتيجة',
    favoriteChar: 'الشخصية المفضلة',
    favoriteCompanion: 'الرفيق المفضل',
    coins: 'العملات الذهبية',
    level: 'المستوى',

    // Characters Modal
    charSelectTitle: 'اختر بطلك من ريجولار شو',
    charSelectSubtitle: 'شخصيات كرتونية ثلاثية الأبعاد بتفاصيل كاملة وحركات مميزة',
    selectHero: 'اختيار الشخصية',
    selected: 'تم الاختيار ✓',
    statSpeed: 'السرعة',
    statJump: 'قوة القفز',
    statStamina: 'التحمل',
    specialAbility: 'الحركة الخاصة',
    testEmote: 'عرض الحركة التعبيرية',

    // Pets Modal
    petSelectTitle: 'اختر الرفيق الحيواني',
    petSelectSubtitle: 'حيوانات أليفة ترافقك أثناء الركض والقفز وتمنحك سرعة إضافية',
    petActive: 'الرفيق الحالي ✓',
    petSelect: 'اختيار الرفيق',
    petSpeedBonus: 'مكافأة السرعة',

    // Shop Modal
    shopTitle: 'متجر الحديقة',
    shopSubtitle: 'افتح طائرات شراعية ومظلات ملونة لتظهر بأسلوب أسطوري أثناء الإنزال',
    gliders: 'المظلات والطائرات الشراعية',
    costumes: 'الأزياء والأشكال',
    buy: 'شراء',
    equipped: 'مُستخدَم حالياً ✓',
    equip: 'استخدام',
    needMoreCoins: 'تحتاج المزيد من العملات!',

    // Settings Modal
    settingsTitle: 'إعدادات اللعبة',
    tabLanguage: 'اللغة',
    tabGraphics: 'الرسومات والأداء',
    tabControls: 'عناصر التحكم باللمس',
    tabAudio: 'الأصوات والموسيقى',
    tabPrivacy: 'الخصوصية والأذونات',
    selectLanguage: 'اختر لغة واجهة اللعبة:',
    graphicsPreset: 'جودة الرسومات',
    presetLow: 'منخفضة (سريعة جداً)',
    presetMedium: 'متوسطة',
    presetHigh: 'عالية (موصى بها)',
    presetUltra: 'فائقة (أقوى جودة)',
    presetBattery: 'توفير البطارية',
    targetFps: 'معدل الإطارات المستهدف',
    shadows: 'الظلال ثلاثية الأبعاد',
    particles: 'مؤثرات الغبار والغيوم',
    movementScheme: 'نمط عصا الحركة باللمس',
    schemeDynamic: 'عصا عائمة ديناميكية (تظهر مكان الإبهام)',
    schemeDynamicDesc: 'تظهر دائرة التحكم تلقائياً أينما لمست الجانب الأيسر من الشاشة.',
    schemeFixed: 'عصا تحكم كلاسيكية ثابتة في الزاوية',
    schemeFixedDesc: 'عصا تحكم مرئية وثابتة في أسفل يسار الشاشة بحدود واضحة.',
    schemeSwipe: 'لوحة التمرير المباشر (سحب للأمام والخلف)',
    schemeSwipeDesc: 'حرك شخصيتك فوراً بالسحب المباشر بأصبعك بدون دائرة.',
    schemeDpad: 'أزرار الاتجاهات (D-Pad)',
    schemeDpadDesc: 'أزرار اتجاهية منفصلة للأمام، الخلف، اليسار واليمين.',
    cameraSens: 'حساسية تدوير الكاميرا (الجانب الأيمن)',
    joystickSens: 'حساسية حركة الشخصية',
    customizeHudBtn: 'تخصيص مواضع أزرار الشاشة (HUD)',
    masterVol: 'الصوت العام',
    musicVol: 'موسيقى الحديقة الحماسية',
    sfxVol: 'المؤثرات الصوتية والقفز',
    voicesVol: 'أصوات وصرخات الشخصيات',
    muteAll: 'كتم جميع الأصوات',
    resetDefaults: 'استعادة الإعدادات الافتراضية',

    // In Game HUD
    score: 'النقاط',
    altitude: 'الارتفاع',
    meters: 'متر',
    phasePlane: 'داخل طائرة الإنزال',
    phaseFreefall: 'سقوط حر في الهواء',
    phaseGliding: 'طيران بالمظلة الشراعية',
    phaseLanded: 'هبوط على أرض الحديقة',
    jumpFromPlane: 'اقفز من الطائرة! 🚀',
    deployGlider: 'افتح المظلة الشراعية 🪂',
    sprint: 'ركض',
    crouch: 'تسلل',
    jump: 'قفز',
    interact: 'تفاعل',
    highFive: 'هاي فايف',
    emote: 'حركات',
    paused: 'اللعبة متوقفة مؤقتاً',
    resume: 'متابعة اللعب',
    quitMatch: 'الخروج للقائمة الرئيسية',
    teamBlueScore: 'الأزرق',
    teamRedScore: 'الأحمر',

    // Victory Modal
    victoryTitle: '🏆 كأس ديدي - DIDY CUP',
    victoryWinner: 'الفائز بالبطولة',
    victoryCongratulations: 'ألف مبروك! لقد حققت النصر وتوّجت بكأس ديدي الذهبي!',
    finalScore: 'النتيجة الإجمالية',
    medalsGathered: 'الميداليات التي جُمِعت',
    playAgain: 'إعادة التحدي 🔄',
    returnToMenu: 'العودة للقائمة الرئيسية 🏠',
    cupPresentedBy: 'تم التتويج في حديقة ريجولار شو الرسمية',

    // Emotes
    emoteVictoryDance: 'رقصة النصر 🕺',
    emoteMuscleFlex: 'استعراض العضلات 💪',
    emoteHifive: 'هاي فايف شبحي ✋',
    emoteBensonRage: 'غضب بنسون 😡',
    emotePopsLaugh: 'ضحكة بوبس المرحة 🍭'
  },
  en: {
    // App General
    appName: 'DIDY CUP',
    appSubtitle: 'Cartoon Battle Royale - Regular Show Edition',
    langName: 'English',
    toggleLangBtn: 'العربية 🇸🇦',

    // Navigation & Main Menu
    play: 'PLAY NOW',
    quickPlay: 'QUICK MATCH',
    characters: 'CHARACTERS',
    pets: 'PETS',
    profile: 'PROFILE',
    shop: 'SHOP',
    settings: 'SETTINGS',
    bluetooth: 'BLUETOOTH',
    chooseMode: 'SELECT GAME MODE',
    close: 'Close',
    back: 'Back',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save Changes',
    loading: 'Loading...',

    // Modes
    modeSoloPark: 'Solo Park Roam',
    modeSoloParkDesc: 'Free-roam explore the iconic Regular Show park grounds, collect medals and jump on bounce pads.',
    modeDrop2v2: 'AIR-DROP 2v2',
    modeDrop2v2Desc: 'Sky-high descent mode! Two players per team compete to claim the DIDY CUP.',
    modeDrop4v4: 'AIR-DROP 4v4',
    modeDrop4v4Desc: 'Full squad battle royale! Four players per team in an action-packed park showdown.',
    modeBt2v2: 'Bluetooth 2v2 (Offline)',
    modeBt2v2Desc: 'Connect with nearby Android devices via Bluetooth or local hotspot without internet.',
    modeBt4v4: 'Bluetooth 4v4 (Offline)',
    modeBt4v4Desc: 'Epic local squad matches with friends nearby using zero mobile data.',

    // Bluetooth Modal
    btTitle: 'Bluetooth & Local Network Multiplayer',
    btSubtitle: 'Play with nearby friends using Bluetooth or local Wi-Fi without needing an internet connection.',
    btCreateRoom: 'Create Bluetooth Room',
    btJoinRoom: 'Join Bluetooth Room',
    btSearchDevices: 'Search for Nearby Players',
    btSearching: 'Searching for nearby players...',
    btPlayerConnected: 'Player connected!',
    btWaitingPlayers: 'Waiting for players...',
    btReady: 'READY',
    btNotReady: 'NOT READY',
    btStartGame: 'Start Match Now!',
    btDisconnect: 'Disconnect',
    btRoomName: 'Room Name',
    btAvailableRooms: 'Available Nearby Rooms',
    btNearbyDevices: 'Discovered Nearby Devices',
    btNoDevicesFound: 'No devices found yet. Ensure Bluetooth is enabled and discoverable.',
    btConnectedPeers: 'Connected Lobby Players',
    btHost: 'Host (Room Owner)',
    btJoin: 'Join Room',
    btTeamBlue: 'Blue Team',
    btTeamRed: 'Red Team',
    btSwitchTeam: 'Switch Team',
    btSafetyTitle: 'Bluetooth Safety, Permissions & Privacy',
    btSafetyDesc: 'We only request nearby device permissions to discover other players for direct gameplay sync. No personal files, photos, or contacts are ever accessed.',
    btSignal: 'Signal Strength',
    btLatency: 'Ping / Latency',

    // Profile Modal
    profileTitle: 'Player Profile',
    playerName: 'Player Name',
    editName: 'Edit Name',
    saveName: 'Save Name',
    wins: 'Total Wins',
    matchesPlayed: 'Matches Played',
    didyCupTrophies: 'DIDY CUP Trophies 🏆',
    bestScore: 'Best Score',
    favoriteChar: 'Favorite Character',
    favoriteCompanion: 'Favorite Companion',
    coins: 'Park Coins',
    level: 'Level',

    // Characters Modal
    charSelectTitle: 'Select Your Regular Show Character',
    charSelectSubtitle: 'Smooth 3D cartoon models with custom animations and characteristic voices',
    selectHero: 'Select Character',
    selected: 'Selected ✓',
    statSpeed: 'Speed',
    statJump: 'Jump Force',
    statStamina: 'Stamina',
    specialAbility: 'Special Ability',
    testEmote: 'Play Emote',

    // Pets Modal
    petSelectTitle: 'Select Animal Companion',
    petSelectSubtitle: 'Faithful companions that follow you across the park and provide speed boosts',
    petActive: 'Active Pet ✓',
    petSelect: 'Select Companion',
    petSpeedBonus: 'Speed Boost',

    // Shop Modal
    shopTitle: 'Park Supply Shop',
    shopSubtitle: 'Unlock colorful parachutes and gliders to descend onto the park in style',
    gliders: 'Gliders & Parachutes',
    costumes: 'Outfits & Styles',
    buy: 'Buy',
    equipped: 'Equipped ✓',
    equip: 'Equip',
    needMoreCoins: 'Need more coins!',

    // Settings Modal
    settingsTitle: 'Game Settings',
    tabLanguage: 'Language',
    tabGraphics: 'Graphics & Performance',
    tabControls: 'Touch Controls',
    tabAudio: 'Audio & Music',
    tabPrivacy: 'Permissions & Safety',
    selectLanguage: 'Select Game Interface Language:',
    graphicsPreset: 'Graphics Quality',
    presetLow: 'Low (Maximum FPS)',
    presetMedium: 'Medium',
    presetHigh: 'High (Recommended)',
    presetUltra: 'Ultra (Best Visuals)',
    presetBattery: 'Battery Saver',
    targetFps: 'Target Frame Rate',
    shadows: '3D Realtime Shadows',
    particles: 'Dust & Cloud Particles',
    movementScheme: 'Touch Movement Scheme',
    schemeDynamic: 'Dynamic Floating Thumbstick (Follows Thumb)',
    schemeDynamicDesc: 'Spawns smoothly wherever your left thumb touches the screen.',
    schemeFixed: 'Fixed Bottom-Left Virtual Joystick',
    schemeFixedDesc: 'Visible stationary thumbstick anchored to the bottom-left corner.',
    schemeSwipe: 'Direct Swipe Pad (Vector Touch Control)',
    schemeSwipeDesc: 'Touch and drag anywhere on the left half to move in that direction.',
    schemeDpad: 'Directional Buttons (D-Pad)',
    schemeDpadDesc: 'Classic four-way directional buttons for discrete movement.',
    cameraSens: 'Camera Look Sensitivity (Right Screen Side)',
    joystickSens: 'Movement Input Sensitivity',
    customizeHudBtn: 'Customize On-Screen HUD Layout',
    masterVol: 'Master Volume',
    musicVol: 'High-Energy Park Music',
    sfxVol: 'Sound Effects & Jump Pads',
    voicesVol: 'Character Shouts & Emotes',
    muteAll: 'Mute All Audio',
    resetDefaults: 'Reset to Defaults',

    // In Game HUD
    score: 'Score',
    altitude: 'Altitude',
    meters: 'm',
    phasePlane: 'Inside Cargo Aircraft',
    phaseFreefall: 'Sky Diving Freefall',
    phaseGliding: 'Gliding & Parachuting',
    phaseLanded: 'Landed on Park Grounds',
    jumpFromPlane: 'JUMP FROM PLANE! 🚀',
    deployGlider: 'OPEN GLIDER 🪂',
    sprint: 'Sprint',
    crouch: 'Crouch',
    jump: 'Jump',
    interact: 'Interact',
    highFive: 'High Five',
    emote: 'Emote',
    paused: 'Game Paused',
    resume: 'Resume Match',
    quitMatch: 'Exit to Main Menu',
    teamBlueScore: 'Blue',
    teamRedScore: 'Red',

    // Victory Modal
    victoryTitle: '🏆 DIDY CUP',
    victoryWinner: 'TOURNAMENT CHAMPION',
    victoryCongratulations: 'Congratulations! You claimed victory and hoisted the golden DIDY CUP!',
    finalScore: 'Total Score',
    medalsGathered: 'Medals Collected',
    playAgain: 'Rematch 🔄',
    returnToMenu: 'Main Menu 🏠',
    cupPresentedBy: 'Awarded on the Official Regular Show Park Grounds',

    // Emotes
    emoteVictoryDance: 'Victory Dance 🕺',
    emoteMuscleFlex: 'Muscle Flex 💪',
    emoteHifive: 'Ghostly High-Five ✋',
    emoteBensonRage: "Benson's Fury 😡",
    emotePopsLaugh: "Pops' Jolly Laugh 🍭"
  }
};

/**
 * Helper to get translation object based on language
 */
export function getTranslations(lang: SupportedLanguage = 'ar'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.ar;
}

/**
 * Character name and bio Arabic translations
 */
export const CHARACTER_AR_NAMES: Record<string, { name: string; title: string; quote: string }> = {
  mordecai: {
    name: 'مورديكاي',
    title: 'طائر القيق الأزرق',
    quote: 'أوووووه! هيا نلعب للفوز بكأس ديدي!'
  },
  rigby: {
    name: 'ريغبي',
    title: 'الراكون السريع المشاغب',
    quote: 'هامر تايم! لن يهزمني أحد اليوم!'
  },
  skips: {
    name: 'سكيبس',
    title: 'الييتي الخالد الحكيم',
    quote: 'لقد رأيت هذا التحدي من قبل... وسأفوز به.'
  },
  muscle_man: {
    name: 'ماسيل مان',
    title: 'ميتش سورينشتاين القوي',
    quote: 'أتعرف من يحب الفوز بكأس ديدي أيضاً؟! أميييي!'
  },
  hifive_ghost: {
    name: 'هاي فايف غوست',
    title: 'الشبح الطائر الودود',
    quote: 'أعطني هاي فايف في السماء!'
  },
  benson: {
    name: 'بنسون',
    title: 'مدير الحديقة الصارم',
    quote: 'إما أن تفوزوا بكأس ديدي، أو أنكم جميعاً مطرودوووون!'
  },
  pops: {
    name: 'بوبس ميلارد',
    title: 'المصاصة المبهجة الراقية',
    quote: 'يا له من عرض مبهج ورائع حقاً! ها ها ها!'
  },
  margaret: {
    name: 'مارغريت',
    title: 'طائر روبن الأحمر الودود',
    quote: 'أنا مستعدة دائماً للمنافسة والمرح!'
  },
  eileen: {
    name: 'إيلين',
    title: 'خلد الماء العبقرية',
    quote: 'حسبت مسار الهبوط بدقة متناهية!'
  },
  thomas: {
    name: 'توماس',
    title: 'الماعز المتدرب السري',
    quote: 'أنا مجرد متدرب... ولكن لدي مهارات مفاجئة!'
  },
  death: {
    name: 'ديث',
    title: 'ملك الروك والدراجات النارية',
    quote: 'سأريكم معنى السرعة الحقيقية في الحديقة!'
  },
  gary: {
    name: 'غاري',
    title: 'حارس المجرة الفضائي',
    quote: 'قوى الفضاء الكونية تدعم هذا الهبوط!'
  }
};

/**
 * Pet companion Arabic translations
 */
export const PET_AR_NAMES: Record<string, { name: string; type: string; desc: string }> = {
  pet_dog: {
    name: 'باستر',
    type: 'كلب وفي ونشيط',
    desc: 'يركض معك في كل مكان ويزيد سرعتك بنسبة 5%!'
  },
  pet_cat: {
    name: 'ويسكرز',
    type: 'قط رشيق وخفيف',
    desc: 'حركات رشيقة وقفزات بهلوانية تمنحك خفة حركة إضافية.'
  },
  pet_fox: {
    name: 'روكي',
    type: 'ثعلب بري سريع',
    desc: 'ذكاء حاد وسرعة هجومية مذهلة عند جمع الميداليات.'
  },
  pet_panda: {
    name: 'سباركي',
    type: 'باندا مقاتل لطيف',
    desc: 'حركات كوميدية ودعم طاقة مستمر طوال المباراة.'
  },
  pet_rabbit: {
    name: 'هوبر',
    type: 'أرنب قافز سريع',
    desc: 'يعزز ارتفاع قفزاتك على منصات الترامبولين.'
  },
  pet_bird: {
    name: 'بيب',
    type: 'طائر صغير مغرد',
    desc: 'يرافقك أثناء الهبوط بالمظلة الشراعية ويمنحك توازناً سلساً.'
  }
};

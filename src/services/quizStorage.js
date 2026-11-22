// Storage & Default Quizzes & Presets Service

const STORAGE_KEY_QUIZZES = 'lqc_quizzes_v1';
const STORAGE_KEY_USER_PROFILE = 'lqc_user_profile_v1';
const STORAGE_KEY_FAVORITES = 'lqc_favorites_v1';
const STORAGE_KEY_HIGH_SCORES = 'lqc_high_scores_v1';

export const VOCAB_PRESETS = [
  {
    name: 'French Bistro & Food 🥐',
    userLang: 'English',
    targetLang: 'French',
    passPercent: 70,
    xpAmount: 45,
    subQuizzes: [
      {
        number: 1,
        title: 'Bistro Food & Drinks',
        phrases: [
          { id: 'fr-1', en: 'Croissant', ml: 'Le croissant', blankWord: 'croissant', blankOptions: ['croissant', 'café', 'fromage', 'pain'], imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'fr-2', en: 'Coffee', ml: 'Le café', blankWord: 'café', blankOptions: ['café', 'thé', 'lait', 'vin'], imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'fr-3', en: 'Wine', ml: 'Le vin', blankWord: 'vin', blankOptions: ['vin', 'eau', 'jus', 'bière'], imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        number: 2,
        title: 'Greetings & Courtesies',
        phrases: [
          { id: 'fr-4', en: 'Cheese', ml: 'Le fromage', blankWord: 'fromage', blankOptions: ['fromage', 'beurre', 'pain', 'pomme'], imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'fr-5', en: 'Thank you very much', ml: 'Merci beaucoup', blankWord: 'beaucoup', blankOptions: ['beaucoup', 'bien', 'toujours', 'jamais'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'fr-6', en: 'Good morning / Hello', ml: 'Bonjour', blankWord: 'Bonjour', blankOptions: ['Bonjour', 'Bonsoir', 'Au revoir', 'Salut'], imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'fr-1', en: 'Croissant', ml: 'Le croissant', blankWord: 'croissant', blankOptions: ['croissant', 'café', 'fromage', 'pain'], imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-2', en: 'Coffee', ml: 'Le café', blankWord: 'café', blankOptions: ['café', 'thé', 'lait', 'vin'], imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-3', en: 'Wine', ml: 'Le vin', blankWord: 'vin', blankOptions: ['vin', 'eau', 'jus', 'bière'], imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-4', en: 'Cheese', ml: 'Le fromage', blankWord: 'fromage', blankOptions: ['fromage', 'beurre', 'pain', 'pomme'], imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-5', en: 'Thank you very much', ml: 'Merci beaucoup', blankWord: 'beaucoup', blankOptions: ['beaucoup', 'bien', 'toujours', 'jamais'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-6', en: 'Good morning / Hello', ml: 'Bonjour', blankWord: 'Bonjour', blankOptions: ['Bonjour', 'Bonsoir', 'Au revoir', 'Salut'], imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    name: 'Italian Travel & Greetings 🇮🇹',
    userLang: 'English',
    targetLang: 'Italian',
    passPercent: 70,
    xpAmount: 40,
    subQuizzes: [
      {
        number: 1,
        title: 'Italian Dining',
        phrases: [
          { id: 'it-1', en: 'Pizza', ml: 'La pizza', blankWord: 'pizza', blankOptions: ['pizza', 'pasta', 'torta', 'insalata'], imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'it-4', en: 'Beautiful', ml: 'Bellissimo', blankWord: 'Bellissimo', blankOptions: ['Bellissimo', 'Bravissimo', 'Carino', 'Buono'], imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        number: 2,
        title: 'Italian Greetings',
        phrases: [
          { id: 'it-2', en: 'Hello / Bye', ml: 'Ciao', blankWord: 'Ciao', blankOptions: ['Ciao', 'Grazie', 'Prego', 'Scusa'], imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'it-3', en: 'See you later', ml: 'Arrivederci', blankWord: 'Arrivederci', blankOptions: ['Arrivederci', 'Buongiorno', 'Buonasera', 'Notte'], imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'it-1', en: 'Pizza', ml: 'La pizza', blankWord: 'pizza', blankOptions: ['pizza', 'pasta', 'torta', 'insalata'], imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-2', en: 'Hello / Bye', ml: 'Ciao', blankWord: 'Ciao', blankOptions: ['Ciao', 'Grazie', 'Prego', 'Scusa'], imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-3', en: 'See you later', ml: 'Arrivederci', blankWord: 'Arrivederci', blankOptions: ['Arrivederci', 'Buongiorno', 'Buonasera', 'Notte'], imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-4', en: 'Beautiful', ml: 'Bellissimo', blankWord: 'Bellissimo', blankOptions: ['Bellissimo', 'Bravissimo', 'Carino', 'Buono'], imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    name: 'Malayalam Basics 🌴',
    userLang: 'English',
    targetLang: 'Malayalam',
    passPercent: 75,
    xpAmount: 50,
    subQuizzes: [
      {
        number: 1,
        title: 'Greetings & Thanks',
        phrases: [
          { id: 'ml-1', en: 'Hello / Greetings', ml: 'നമസ്കാരം (Namaskaram)', blankWord: 'നമസ്കാരം', blankOptions: ['നമസ്കാരം', 'നന്ദി', 'സ്വാഗതം', 'സുഖം'], imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'ml-2', en: 'Thank you', ml: 'നന്ദി (Nandi)', blankWord: 'നന്ദി', blankOptions: ['നന്ദി', 'നമസ്കാരം', 'ക്ഷമിക്കണം', 'ശരി'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        number: 2,
        title: 'Water & Tea',
        phrases: [
          { id: 'ml-3', en: 'Water', ml: 'വെള്ളം (Vellam)', blankWord: 'വെള്ളം', blankOptions: ['വെള്ളം', 'ചായ', 'പാൽ', 'പഴം'], imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'ml-4', en: 'Tea', ml: 'ചായ (Chaaya)', blankWord: 'ചായ', blankOptions: ['ചായ', 'കാപ്പി', 'വെള്ളം', 'ജ്യൂസ്'], imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'ml-1', en: 'Hello / Greetings', ml: 'നമസ്കാരം (Namaskaram)', blankWord: 'നമസ്കാരം', blankOptions: ['നമസ്കാരം', 'നന്ദി', 'സ്വാഗതം', 'സുഖം'], imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-2', en: 'Thank you', ml: 'നന്ദി (Nandi)', blankWord: 'നന്ദി', blankOptions: ['നന്ദി', 'നമസ്കാരം', 'ക്ഷമിക്കണം', 'ശരി'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-3', en: 'Water', ml: 'വെള്ളം (Vellam)', blankWord: 'വെള്ളം', blankOptions: ['വെള്ളം', 'ചായ', 'പാൽ', 'പഴം'], imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-4', en: 'Tea', ml: 'ചായ (Chaaya)', blankWord: 'ചായ', blankOptions: ['ചായ', 'കാപ്പി', 'വെള്ളം', 'ജ്യൂസ്'], imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  }
];

export const INITIAL_QUIZZES = [
  {
    id: 'sample-spanish-1',
    title: 'Spanish Essentials & Everyday Phrases',
    userLang: 'English',
    targetLang: 'Spanish',
    category: 'Beginner',
    passPercent: 70,
    xpAmount: 50,
    config: { visual: 3, audio: 3, matching: 3, speech: 3, blanks: 3, imageSpeech: 3, total: 18 },
    subQuizzes: [
      {
        id: 'sp-sq1',
        number: 1,
        title: 'Food & Animals',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'sp-1', en: 'Apple', ml: 'La manzana', blankWord: 'manzana', blankOptions: ['manzana', 'naranja', 'pera', 'uva'], imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'sp-2', en: 'Cat', ml: 'El gato', blankWord: 'gato', blankOptions: ['gato', 'perro', 'ratón', 'pájaro'], imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'sp-3', en: 'Dog', ml: 'El perro', blankWord: 'perro', blankOptions: ['perro', 'gato', 'caballo', 'conejo'], imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        id: 'sp-sq2',
        number: 2,
        title: 'Drinks & Greetings',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'sp-4', en: 'Water', ml: 'El agua', blankWord: 'agua', blankOptions: ['agua', 'leche', 'jugo', 'café'], imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'sp-5', en: 'Hello', ml: 'Hola', blankWord: 'Hola', blankOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'], imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'sp-6', en: 'Thank you', ml: 'Gracias', blankWord: 'Gracias', blankOptions: ['Gracias', 'De nada', 'Por favor', 'Disculpa'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'sp-1', en: 'Apple', ml: 'La manzana', blankWord: 'manzana', blankOptions: ['manzana', 'naranja', 'pera', 'uva'], imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-2', en: 'Cat', ml: 'El gato', blankWord: 'gato', blankOptions: ['gato', 'perro', 'ratón', 'pájaro'], imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-3', en: 'Dog', ml: 'El perro', blankWord: 'perro', blankOptions: ['perro', 'gato', 'caballo', 'conejo'], imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-4', en: 'Water', ml: 'El agua', blankWord: 'agua', blankOptions: ['agua', 'leche', 'jugo', 'café'], imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-5', en: 'Hello', ml: 'Hola', blankWord: 'Hola', blankOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'], imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-6', en: 'Thank you', ml: 'Gracias', blankWord: 'Gracias', blankOptions: ['Gracias', 'De nada', 'Por favor', 'Disculpa'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    id: 'sample-german-1',
    title: 'German Basics & Greetings',
    userLang: 'English',
    targetLang: 'German',
    category: 'Beginner',
    passPercent: 66,
    xpAmount: 40,
    config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
    subQuizzes: [
      {
        id: 'de-sq1',
        number: 1,
        title: 'Food & Nature',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'de-1', en: 'Bread', ml: 'Das Brot', blankWord: 'Brot', blankOptions: ['Brot', 'Wasser', 'Käse', 'Apfel'], imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'de-2', en: 'Coffee', ml: 'Der Kaffee', blankWord: 'Kaffee', blankOptions: ['Kaffee', 'Tee', 'Wein', 'Saft'], imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        id: 'de-sq2',
        number: 2,
        title: 'Greetings & Time',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'de-3', en: 'Sun', ml: 'Die Sonne', blankWord: 'Sonne', blankOptions: ['Sonne', 'Mond', 'Erde', 'Wolke'], imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'de-4', en: 'Good evening', ml: 'Guten Abend', blankWord: 'Abend', blankOptions: ['Abend', 'Morgen', 'Tag', 'Nacht'], imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'de-1', en: 'Bread', ml: 'Das Brot', blankWord: 'Brot', blankOptions: ['Brot', 'Wasser', 'Käse', 'Apfel'], imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-2', en: 'Coffee', ml: 'Der Kaffee', blankWord: 'Kaffee', blankOptions: ['Kaffee', 'Tee', 'Wein', 'Saft'], imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-3', en: 'Sun', ml: 'Die Sonne', blankWord: 'Sonne', blankOptions: ['Sonne', 'Mond', 'Erde', 'Wolke'], imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-4', en: 'Good evening', ml: 'Guten Abend', blankWord: 'Abend', blankOptions: ['Abend', 'Morgen', 'Tag', 'Nacht'], imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    id: 'sample-japanese-1',
    title: 'Japanese Conversational Essentials',
    userLang: 'English',
    targetLang: 'Japanese',
    category: 'Advanced',
    passPercent: 75,
    xpAmount: 60,
    config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
    subQuizzes: [
      {
        id: 'jp-sq1',
        number: 1,
        title: 'Items & Surroundings',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'jp-1', en: 'Tea', ml: 'お茶 (Ocha)', blankWord: 'お茶', blankOptions: ['お茶', '水', '酒', '牛乳'], imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'jp-2', en: 'Book', ml: '本 (Hon)', blankWord: '本', blankOptions: ['本', '新聞', '手紙', '写真'], imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      },
      {
        id: 'jp-sq2',
        number: 2,
        title: 'Greetings & Nature',
        config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: [
          { id: 'jp-3', en: 'Mountain', ml: '山 (Yama)', blankWord: '山', blankOptions: ['山', '川', '海', '空'], imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: 'jp-4', en: 'Good afternoon', ml: 'こんにちは (Konnichiwa)', blankWord: 'こんにちは', blankOptions: ['こんにちは', 'おはよう', 'こんばんは', 'さようなら'], imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ]
      }
    ],
    phrases: [
      { id: 'jp-1', en: 'Tea', ml: 'お茶 (Ocha)', blankWord: 'お茶', blankOptions: ['お茶', '水', '酒', '牛乳'], imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-2', en: 'Book', ml: '本 (Hon)', blankWord: '本', blankOptions: ['本', '新聞', '手紙', '写真'], imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-3', en: 'Mountain', ml: '山 (Yama)', blankWord: '山', blankOptions: ['山', '川', '海', '空'], imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-4', en: 'Good afternoon', ml: 'こんにちは (Konnichiwa)', blankWord: 'こんにちは', blankOptions: ['こんにちは', 'おはよう', 'こんばんは', 'さようなら'], imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  }
];

export const normalizeQuiz = (quiz) => {
  if (!quiz) return null;
  const cloned = { ...quiz };
  cloned.targetOnly = Boolean(cloned.targetOnly);

  const normalizeConfig = (cfg) => {
    const c = cfg || {};
    return {
      visual: Number(c.visual ?? 2),
      audio: Number(c.audio ?? 2),
      matching: Number(c.matching ?? 2),
      speech: Number(c.speech ?? c.speaking ?? 2),
      blanks: Number(c.blanks ?? 2),
      imageSpeech: Number(c.imageSpeech ?? c.imgSpeech ?? c.image_speech ?? 2),
      total: Number(c.total ?? 12)
    };
  };

  if (!Array.isArray(cloned.subQuizzes) || cloned.subQuizzes.length === 0) {
    const rawPhrases = Array.isArray(cloned.phrases) ? cloned.phrases : [];
    cloned.subQuizzes = [
      {
        id: `${cloned.id || 'quiz'}-sq1`,
        number: 1,
        title: 'Core Vocabulary',
        config: normalizeConfig(cloned.config),
        phrases: rawPhrases
      }
    ];
  } else {
    cloned.subQuizzes = cloned.subQuizzes.map((sq, idx) => ({
      ...sq,
      id: sq.id || `${cloned.id || 'quiz'}-sq${idx + 1}`,
      number: idx + 1,
      title: sq.title || `Topic ${idx + 1}`,
      phrases: Array.isArray(sq.phrases) ? sq.phrases : [],
      config: normalizeConfig(sq.config || cloned.config)
    }));
  }

  // Keep flattened phrases array for overall quiz mixed play & compatibility
  cloned.phrases = cloned.subQuizzes.flatMap(sq => sq.phrases || []);
  return cloned;
};

export const getQuizzes = () => {
  const data = localStorage.getItem(STORAGE_KEY_QUIZZES);
  if (!data) {
    const initialNormalized = INITIAL_QUIZZES.map(normalizeQuiz);
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(initialNormalized));
    return initialNormalized;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed.map(normalizeQuiz);
  } catch {
    return INITIAL_QUIZZES.map(normalizeQuiz);
  }
};

export const getQuizById = (id) => {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.id === id) || null;
};

export const saveQuiz = (quizData) => {
  const normalized = normalizeQuiz(quizData);
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === normalized.id);
  let updated;
  if (existingIndex >= 0) {
    updated = [...quizzes];
    updated[existingIndex] = normalized;
  } else {
    updated = [normalized, ...quizzes];
  }
  localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(updated));
  return updated;
};

export const deleteQuiz = (id) => {
  const quizzes = getQuizzes();
  const updated = quizzes.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(updated));
  return updated;
};

// Shareable Direct Link Helpers
export const generateShareableURL = (quiz) => {
  try {
    const jsonStr = JSON.stringify(quiz);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?quiz=${encoded}`;
  } catch (e) {
    return window.location.href;
  }
};

export const parseSharedQuizURL = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const quizParam = params.get('quiz');
    if (quizParam) {
      const decodedStr = decodeURIComponent(atob(quizParam));
      const quizObj = JSON.parse(decodedStr);
      if (quizObj && quizObj.title && Array.isArray(quizObj.phrases)) {
        saveQuiz(quizObj);
        return quizObj;
      }
    }
  } catch (e) {
    console.error('Invalid shared quiz URL');
  }
  return null;
};

// Export & Import Quizzes (JSON File Backup)
export const exportQuizzesJSON = () => {
  const quizzes = getQuizzes();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quizzes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `language_quizzes_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const importQuizzesJSON = (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    if (Array.isArray(imported)) {
      const existing = getQuizzes();
      const existingIds = new Set(existing.map(q => q.id));
      const newItems = imported.filter(q => !existingIds.has(q.id));
      const merged = [...newItems, ...existing];
      localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    alert('Invalid JSON File.');
  }
  return getQuizzes();
};

// Favorites Service
export const getFavorites = () => {
  const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
  return data ? JSON.parse(data) : [];
};

export const toggleFavorite = (quizId) => {
  const favs = getFavorites();
  const isFav = favs.includes(quizId);
  const updated = isFav ? favs.filter(id => id !== quizId) : [...favs, quizId];
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
  return updated;
};

// High Scores Service
export const getHighScores = () => {
  const data = localStorage.getItem(STORAGE_KEY_HIGH_SCORES);
  return data ? JSON.parse(data) : {};
};

export const recordHighScore = (quizId, score, total) => {
  const scores = getHighScores();
  const currentBest = scores[quizId]?.percentage || 0;
  const percentage = Math.round((score / total) * 100);

  if (percentage >= currentBest) {
    scores[quizId] = { score, total, percentage, date: new Date().toLocaleDateString() };
    localStorage.setItem(STORAGE_KEY_HIGH_SCORES, JSON.stringify(scores));
  }
  return scores;
};

// Leveling Formula
export const getLevelInfo = (totalXP = 0) => {
  const levels = [
    { level: 1, name: 'Novice Polyglot 🐣', minXP: 0, maxXP: 100 },
    { level: 2, name: 'Linguistic Apprentice 📜', minXP: 100, maxXP: 250 },
    { level: 3, name: 'Vocab Explorer 🧭', minXP: 250, maxXP: 450 },
    { level: 4, name: 'Fluent Scholar 🎓', minXP: 450, maxXP: 700 },
    { level: 5, name: 'Master Polyglot 👑', minXP: 700, maxXP: 1000 }
  ];

  let currentLevel = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].minXP) {
      currentLevel = levels[i];
      break;
    }
  }

  const xpInCurrentLevel = totalXP - currentLevel.minXP;
  const levelSpan = currentLevel.maxXP - currentLevel.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / levelSpan) * 100)));

  return {
    ...currentLevel,
    xpInCurrentLevel,
    levelSpan,
    progressPercent
  };
};

// User Profile Service
export const getUserProfile = () => {
  const data = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
  const defaultProfile = {
    totalPoints: 0,
    quizzesCompleted: 0,
    streakDays: 0
  };

  if (!data) {
    localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultProfile;
  }
};

export const resetUserProfile = () => {
  const emptyProfile = {
    totalPoints: 0,
    quizzesCompleted: 0,
    streakDays: 0
  };
  localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(emptyProfile));
  localStorage.removeItem(STORAGE_KEY_HIGH_SCORES);
  return emptyProfile;
};

export const awardRewards = ({ quizId, xpAmount }) => {
  const profile = getUserProfile();
  const pointsAdded = xpAmount || 50;

  profile.totalPoints += pointsAdded;
  profile.quizzesCompleted += 1;
  profile.streakDays = Math.max(1, profile.streakDays + 1);

  localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));

  return {
    profile,
    pointsAdded
  };
};

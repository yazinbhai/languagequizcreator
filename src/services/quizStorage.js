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
    gpConfig: {
      type: 'french_xp',
      amount: 45,
      passPercent: 70,
      achievementId: 201,
      badgeTitle: 'French Gourmet Badge',
      badgeIcon: '🇫🇷'
    },
    phrases: [
      { id: 'fr-1', en: 'Croissant', ml: 'Le croissant', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-2', en: 'Coffee', ml: 'Le café', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-3', en: 'Wine', ml: 'Le vin', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-4', en: 'Cheese', ml: 'Le fromage', imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-5', en: 'Thank you very much', ml: 'Merci beaucoup', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'fr-6', en: 'Good morning / Hello', ml: 'Bonjour', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    name: 'Italian Travel & Greetings 🇮🇹',
    userLang: 'English',
    targetLang: 'Italian',
    gpConfig: {
      type: 'italian_xp',
      amount: 40,
      passPercent: 70,
      achievementId: 202,
      badgeTitle: 'Italian Explorer Badge',
      badgeIcon: '🇮🇹'
    },
    phrases: [
      { id: 'it-1', en: 'Pizza', ml: 'La pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-2', en: 'Hello / Bye', ml: 'Ciao', imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-3', en: 'See you later', ml: 'Arrivederci', imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'it-4', en: 'Beautiful', ml: 'Bellissimo', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    name: 'Malayalam Basics 🌴',
    userLang: 'English',
    targetLang: 'Malayalam',
    gpConfig: {
      type: 'malayalam_xp',
      amount: 50,
      passPercent: 75,
      achievementId: 203,
      badgeTitle: 'Kerala Explorer Badge',
      badgeIcon: '🌴'
    },
    phrases: [
      { id: 'ml-1', en: 'Hello / Greetings', ml: 'നമസ്കാരം (Namaskaram)', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-2', en: 'Thank you', ml: 'നന്ദി (Nandi)', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-3', en: 'Water', ml: 'വെള്ളം (Vellam)', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'ml-4', en: 'Tea', ml: 'ചായ (Chaaya)', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
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
    config: { visual: 4, audio: 4, matching: 4, total: 12 },
    gpConfig: {
      type: 'spanish_xp',
      amount: 50,
      passPercent: 70,
      achievementId: 101,
      badgeTitle: 'Spanish Conquistador Badge',
      badgeIcon: '🇪🇸'
    },
    phrases: [
      { id: 'sp-1', en: 'Apple', ml: 'La manzana', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-2', en: 'Cat', ml: 'El gato', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-3', en: 'Dog', ml: 'El perro', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-4', en: 'Water', ml: 'El agua', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-5', en: 'Hello', ml: 'Hola', imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'sp-6', en: 'Thank you', ml: 'Gracias', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    id: 'sample-german-1',
    title: 'German Basics & Greetings',
    userLang: 'English',
    targetLang: 'German',
    category: 'Beginner',
    config: { visual: 3, audio: 3, matching: 3, total: 9 },
    gpConfig: {
      type: 'german_points',
      amount: 40,
      passPercent: 66,
      achievementId: 102,
      badgeTitle: 'German Meister Badge',
      badgeIcon: '🇩🇪'
    },
    phrases: [
      { id: 'de-1', en: 'Bread', ml: 'Das Brot', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-2', en: 'Coffee', ml: 'Der Kaffee', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-3', en: 'Sun', ml: 'Die Sonne', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'de-4', en: 'Good evening', ml: 'Guten Abend', imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  },
  {
    id: 'sample-japanese-1',
    title: 'Japanese Conversational Essentials',
    userLang: 'English',
    targetLang: 'Japanese',
    category: 'Advanced',
    config: { visual: 3, audio: 3, matching: 3, total: 9 },
    gpConfig: {
      type: 'japanese_xp',
      amount: 60,
      passPercent: 75,
      achievementId: 103,
      badgeTitle: 'Samurai Linguist Badge',
      badgeIcon: '🇯🇵'
    },
    phrases: [
      { id: 'jp-1', en: 'Tea', ml: 'お茶 (Ocha)', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-2', en: 'Book', ml: '本 (Hon)', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-3', en: 'Mountain', ml: '山 (Yama)', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
      { id: 'jp-4', en: 'Good afternoon', ml: 'こんにちは (Konnichiwa)', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
    ]
  }
];

export const getQuizzes = () => {
  const data = localStorage.getItem(STORAGE_KEY_QUIZZES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(INITIAL_QUIZZES));
    return INITIAL_QUIZZES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_QUIZZES;
  }
};

export const getQuizById = (id) => {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.id === id) || null;
};

export const saveQuiz = (quizData) => {
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === quizData.id);
  let updated;
  if (existingIndex >= 0) {
    updated = [...quizzes];
    updated[existingIndex] = quizData;
  } else {
    updated = [quizData, ...quizzes];
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

// Clean Default Profile for New Users (Starts at 0 XP, Level 1)
export const getUserProfile = () => {
  const data = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
  const defaultProfile = {
    totalPoints: 0,
    pointsByType: {},
    quizzesCompleted: 0,
    streakDays: 0,
    achievements: []
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
    pointsByType: {},
    quizzesCompleted: 0,
    streakDays: 0,
    achievements: []
  };
  localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(emptyProfile));
  localStorage.removeItem(STORAGE_KEY_HIGH_SCORES);
  return emptyProfile;
};

export const awardRewards = ({ quizId, quizTitle, gpConfig }) => {
  const profile = getUserProfile();
  const { type, amount, achievementId, badgeTitle, badgeIcon } = gpConfig || {};

  let pointsAdded = 0;
  let newBadgeUnlocked = null;

  if (type && amount) {
    profile.pointsByType[type] = (profile.pointsByType[type] || 0) + amount;
    profile.totalPoints += amount;
    pointsAdded = amount;
  }

  profile.quizzesCompleted += 1;
  profile.streakDays = Math.max(1, profile.streakDays + 1);

  if (achievementId && !profile.achievements.some(a => a.id === achievementId)) {
    newBadgeUnlocked = {
      id: achievementId,
      quizTitle: quizTitle || 'Language Quiz',
      title: badgeTitle || `Achievement #${achievementId}`,
      icon: badgeIcon || '🏆',
      unlockedAt: new Date().toLocaleDateString()
    };
    profile.achievements.push(newBadgeUnlocked);
  }

  localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(profile));

  return {
    profile,
    pointsAdded,
    pointsType: type,
    newBadgeUnlocked
  };
};

// Web Audio API Sound Effects & Speech Synthesis Utilities

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('lqc_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('lqc_muted', this.isMuted ? 'true' : 'false');
    if (this.isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  playCorrect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Two-tone rising chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playMatch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCelebration() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Victory fanfare (C5, E5, G5, C6)
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.4, t: 0.36 }
    ];

    melody.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0, now + n.t);
      gain.gain.linearRampToValueAtTime(0.3, now + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }
}

export const soundFx = new SoundEngine();

// Comprehensive Language Code map for Web Speech API & Recognition
export const langCodeMap = {
  spanish: 'es-ES',
  es: 'es-ES',
  german: 'de-DE',
  de: 'de-DE',
  french: 'fr-FR',
  fr: 'fr-FR',
  japanese: 'ja-JP',
  ja: 'ja-JP',
  english: 'en-US',
  en: 'en-US',
  italian: 'it-IT',
  it: 'it-IT',
  malayalam: 'ml-IN',
  ml: 'ml-IN',
  hindi: 'hi-IN',
  hi: 'hi-IN',
  portuguese: 'pt-PT',
  pt: 'pt-PT',
  chinese: 'zh-CN',
  zh: 'zh-CN',
  mandarin: 'zh-CN',
  cantonese: 'zh-HK',
  russian: 'ru-RU',
  ru: 'ru-RU',
  arabic: 'ar-SA',
  ar: 'ar-SA',
  korean: 'ko-KR',
  ko: 'ko-KR',
  dutch: 'nl-NL',
  nl: 'nl-NL',
  greek: 'el-GR',
  el: 'el-GR',
  hebrew: 'he-IL',
  he: 'he-IL',
  iw: 'he-IL',
  indonesian: 'id-ID',
  id: 'id-ID',
  polish: 'pl-PL',
  pl: 'pl-PL',
  swedish: 'sv-SE',
  sv: 'sv-SE',
  turkish: 'tr-TR',
  tr: 'tr-TR',
  ukrainian: 'uk-UA',
  uk: 'uk-UA',
  vietnamese: 'vi-VN',
  vi: 'vi-VN',
  thai: 'th-TH',
  th: 'th-TH',
  tamil: 'ta-IN',
  ta: 'ta-IN',
  telugu: 'te-IN',
  te: 'te-IN',
  bengali: 'bn-BD',
  bn: 'bn-BD',
  urdu: 'ur-PK',
  ur: 'ur-PK',
  tagalog: 'fil-PH',
  filipino: 'fil-PH',
  tl: 'fil-PH',
  fil: 'fil-PH',
  latin: 'la',
  la: 'la'
};

// Cached Voices array
let cachedVoices = [];

export const getVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
  return cachedVoices;
};

// Initialize voice listener
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    getVoices();
  };
}

/**
 * Resolves a language name or code to a standard BCP 47 tag.
 */
export const resolveLangBCP47 = (langNameOrCode = 'en-US') => {
  if (!langNameOrCode) return 'en-US';
  const key = String(langNameOrCode).trim().toLowerCase();
  return langCodeMap[key] || (key.includes('-') ? key : 'en-US');
};

/**
 * Clean phrase text for Speech Synthesis.
 * Strips bracketed annotations or transliterations intelligently depending on available voice packs.
 */
export const cleanTextForSpeech = (text, targetBCP47) => {
  if (!text) return '';
  let str = String(text).trim();

  // Pattern: "MainPhrase (Transliteration)" or "MainPhrase (Explanation)"
  const parenMatch = str.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const mainPart = parenMatch[1].trim();
    const parenPart = parenMatch[2].trim();

    const voices = getVoices();
    const langPrefix = targetBCP47.toLowerCase().slice(0, 2);
    const hasTargetVoice = voices.some(v => v.lang.toLowerCase().startsWith(langPrefix));

    // If native voice exists for target language, speak native part; otherwise fall back to Latin transliteration
    if (hasTargetVoice && mainPart) {
      return mainPart;
    } else if (!hasTargetVoice && parenPart) {
      return parenPart;
    }
  }

  // Remove square brackets or extra symbols
  return str.replace(/\[.*?\]/g, '').trim();
};

/**
 * Speak text using the free browser Web Speech API (SpeechSynthesis)
 */
export const speakPhrase = (text, langNameOrCode = 'en-US') => {
  if (soundFx.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

  // Fix Chrome/Chromium pause hang bug
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  window.speechSynthesis.cancel();

  const targetBCP47 = resolveLangBCP47(langNameOrCode);
  const textToSpeak = cleanTextForSpeech(text, targetBCP47);
  if (!textToSpeak) return;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = targetBCP47;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const voices = getVoices();
  const langPrefix = targetBCP47.toLowerCase().slice(0, 2);

  // Match voice: exact -> prefix
  const matchedVoice =
    voices.find(v => v.lang.toLowerCase() === targetBCP47.toLowerCase()) ||
    voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Retain reference on window to prevent Chrome GC from cutting off speech midway
  window._lqcActiveUtterance = utterance;
  utterance.onend = () => {
    window._lqcActiveUtterance = null;
  };
  utterance.onerror = (_e) => {
    // Non-fatal, clear reference
    window._lqcActiveUtterance = null;
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Checks if a phrase has a valid custom uploaded/linked audio file.
 */
export const hasCustomAudio = (phrase, langType = 'target') => {
  if (!phrase) return false;
  const url = langType === 'target' ? phrase.audioUrlTargetLang : phrase.audioUrlUserLang;
  return Boolean(url && url.trim().length > 0);
};

/**
 * Plays audio for a phrase.
 * If user uploaded custom audio, it attempts to play that file.
 * If user did not upload audio (or audio fails to load/play), it falls back seamlessly to the free browser Web Speech API.
 *
 * @param {Object} phrase - The phrase object with en, ml, and optional audio URLs
 * @param {'target'|'user'} langType - Whether to play target language or user language
 * @param {string} langNameOrCode - Language name or code (e.g. 'Spanish', 'es-ES')
 */
export const playPhraseAudio = (phrase, langType = 'target', langNameOrCode = 'en-US') => {
  if (soundFx.isMuted || !phrase) return;

  const audioUrl = langType === 'target'
    ? phrase.audioUrlTargetLang?.trim()
    : phrase.audioUrlUserLang?.trim();

  const text = langType === 'target' ? phrase.ml : phrase.en;

  if (audioUrl) {
    const audio = new Audio(audioUrl);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Custom audio playback failed, falling back to Web Speech API:', err);
        speakPhrase(text, langNameOrCode);
      });
    }
  } else {
    // Default audio using free browser Web Speech API
    speakPhrase(text, langNameOrCode);
  }
};

/**
 * Checks if the user's browser supports Web Speech Recognition.
 */
export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Creates a SpeechRecognition instance for recognizing target speech.
 *
 * @param {Object} options
 * @param {string} options.langNameOrCode - Target language (e.g., 'Spanish', 'es-ES')
 * @param {Function} options.onResult - Callback ({ finalTranscript, interimTranscript, fullTranscript, alternatives })
 * @param {Function} options.onError - Callback (errorEvent)
 * @param {Function} options.onEnd - Callback ()
 * @param {Function} options.onStart - Callback ()
 */
export const createSpeechRecognizer = ({ langNameOrCode = 'es-ES', onResult, onError, onEnd, onStart }) => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  const targetBCP47 = resolveLangBCP47(langNameOrCode);
  recognition.lang = targetBCP47;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  if (onStart) recognition.onstart = onStart;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';
    const alternatives = [];

    for (let i = 0; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        finalTranscript += res[0].transcript;
      } else {
        interimTranscript += res[0].transcript;
      }
      for (let j = 0; j < res.length; j++) {
        if (res[j]?.transcript) alternatives.push(res[j].transcript.trim());
      }
    }

    if (onResult) {
      onResult({
        finalTranscript: finalTranscript.trim(),
        interimTranscript: interimTranscript.trim(),
        fullTranscript: (finalTranscript || interimTranscript).trim(),
        alternatives
      });
    }
  };

  if (onError) recognition.onerror = onError;
  if (onEnd) recognition.onend = onEnd;

  return recognition;
};

/**
 * Normalizes strings for lenient speech comparison (removes accents, punctuation, parentheticals, articles)
 */
export const normalizeSpeechText = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // remove transliteration in parens
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»¡!¿]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics/accents for fuzzy comparison
    .replace(/\s+/g, ' ')
    .trim();
};

function levenshtein(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function calculateSimilarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const editDistance = levenshtein(longer, shorter);
  return (longerLength - editDistance) / parseFloat(longerLength);
}

/**
 * Checks if what the user spoke matches the expected target phrase.
 * Supports:
 * - Exact match
 * - Accent-insensitive match
 * - Article stripping (e.g. "el perro" matches "perro")
 * - Substring containment
 * - Parenthetical transliteration match (e.g. for non-Latin scripts)
 * - Levenshtein distance similarity (> 72%)
 */
export const evaluateSpeechAccuracy = (spokenText, expectedText) => {
  if (!spokenText || !expectedText) return { isCorrect: false, score: 0 };

  const normSpoken = normalizeSpeechText(spokenText);
  const normExpected = normalizeSpeechText(expectedText);

  if (!normSpoken || !normExpected) return { isCorrect: false, score: 0 };

  // 1. Direct or accent-free match
  if (normSpoken === normExpected) {
    return { isCorrect: true, score: 1.0, reason: 'Exact match' };
  }

  // 2. Also check if original target had parenthetical transliteration that was spoken
  const parenMatch = String(expectedText).match(/\((.*?)\)/);
  if (parenMatch) {
    const normParen = normalizeSpeechText(parenMatch[1]);
    if (normParen && (normSpoken === normParen || normSpoken.includes(normParen) || normParen.includes(normSpoken))) {
      return { isCorrect: true, score: 0.95, reason: 'Transliteration match' };
    }
  }

  // 3. Substring containment (e.g., spoken "el gato" when expected is "gato", or spoken "gato" when expected is "el gato")
  if (normSpoken.includes(normExpected) || normExpected.includes(normSpoken)) {
    return { isCorrect: true, score: 0.9, reason: 'Contains expected phrase' };
  }

  // 4. Common articles removal (Spanish/French/German/Italian/Portuguese)
  const stripArticles = (s) => s.replace(/^(el|la|los|las|un|una|le|les|l'|du|de la|das|der|die|ein|eine|il|lo|gli|i|o|a|os|as)\s+/i, '').trim();
  const strippedSpoken = stripArticles(normSpoken);
  const strippedExpected = stripArticles(normExpected);

  if (strippedSpoken === strippedExpected && strippedSpoken.length > 0) {
    return { isCorrect: true, score: 0.9, reason: 'Root phrase match' };
  }

  // 5. Similarity ratio (Levenshtein distance)
  const similarity = calculateSimilarity(normSpoken, normExpected);
  if (similarity >= 0.72) {
    return { isCorrect: true, score: similarity, reason: 'High phonetic similarity' };
  }

  return { isCorrect: false, score: similarity, reason: 'Does not match' };
};

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, X, ArrowRight, CheckCircle2, XCircle, RefreshCw, Image as ImageIcon, Heart, Zap, Mic, RotateCcw, Lightbulb, Send, Edit3, BookOpen, Sparkles } from 'lucide-react';
import { soundFx, playPhraseAudio, hasCustomAudio, createSpeechRecognizer, isSpeechRecognitionSupported, evaluateSpeechAccuracy } from '../utils/audio';

export default function QuizPlayer({ quiz, subQuiz = null, mode = 'mixed', onFinish, onExit }) {
  const isTargetOnly = Boolean(quiz?.targetOnly);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, text: string }
  const [showFloatingXP, setShowFloatingXP] = useState(false);

  // Matching Mode State
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedMatchLeft, setSelectedMatchLeft] = useState(null);
  const [selectedMatchRight, setSelectedMatchRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [wrongMatchPair, setWrongMatchPair] = useState(null);

  // Speech Recognition Quiz State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const [showFallbackInput, setShowFallbackInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const recognitionRef = useRef(null);

  // Helper shuffle
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Distractors Generator
  const getDistractors = (phrase, allPhrases, count = 3) => {
    const available = allPhrases.filter(p => p.id !== phrase.id && (isTargetOnly ? p.ml !== phrase.ml : (p.en !== phrase.en && p.ml !== phrase.ml)));
    return shuffle(available).slice(0, count);
  };

  // Build Blank (Cloze) Question Item
  const createBlankQuestionItem = (phrase, allPhrases) => {
    const extractTokens = (txt) => {
      if (!txt) return [];
      return txt
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .split(/[\s,.;:!?¡¿]+/)
        .map(w => w.trim())
        .filter(Boolean);
    };

    const tokens = extractTokens(phrase.ml);
    const blankWord = (phrase.blankWord && phrase.blankWord.trim()) ||
      (tokens.length > 1 ? tokens[tokens.length - 1] : tokens[0]) ||
      phrase.ml;

    let optionsList = [];
    if (Array.isArray(phrase.blankOptions) && phrase.blankOptions.filter(Boolean).length >= 2) {
      optionsList = [...phrase.blankOptions.map(o => String(o).trim()).filter(Boolean)];
      if (!optionsList.some(o => o.toLowerCase() === blankWord.toLowerCase())) {
        optionsList[0] = blankWord;
      }
    } else {
      const pool = [];
      allPhrases.forEach(p => {
        if (p.id !== phrase.id && p.ml) {
          extractTokens(p.ml).forEach(w => {
            if (w.toLowerCase() !== blankWord.toLowerCase() && !pool.includes(w)) {
              pool.push(w);
            }
          });
        }
      });
      const dists = shuffle(pool).slice(0, 3);
      optionsList = [blankWord, ...dists];
      while (optionsList.length < 4) {
        optionsList.push(`Option ${optionsList.length + 1}`);
      }
    }

    return {
      type: 'blanks',
      phrase,
      blankWord,
      options: shuffle(optionsList).slice(0, 4)
    };
  };

  // Build Quiz Queue on Mount
  useEffect(() => {
    if (!quiz) return;

    // Use sub-quiz phrases if playing a specific sub-quiz, otherwise quiz.phrases
    const phrases = (subQuiz && Array.isArray(subQuiz.phrases) && subQuiz.phrases.length > 0)
      ? subQuiz.phrases
      : (Array.isArray(quiz.phrases) ? quiz.phrases : []);

    if (phrases.length === 0) return;

    let generatedQueue = [];

    const createQuestionItem = (type, phrase) => {
      const distractors = getDistractors(phrase, phrases);
      const options = shuffle([phrase, ...distractors]);
      return { type, phrase, distractors, options };
    };

    if (mode === 'mixed') {
      const cfg = (subQuiz && subQuiz.config) ? subQuiz.config : (quiz.config || { visual: 4, audio: 4, matching: 4, speech: 3, blanks: 3, imageSpeech: 2 });
      let pool = shuffle([...phrases]);
      let poolIdx = 0;

      // Visual Qs
      for (let i = 0; i < (cfg.visual || 0); i++) {
        const p = pool[poolIdx % pool.length];
        const qType = i % 2 === 0 ? 'visual' : 'reverse_visual';
        generatedQueue.push(createQuestionItem(qType, p));
        poolIdx++;
      }

      // Audio Qs
      for (let i = 0; i < (cfg.audio || 0); i++) {
        const p = pool[poolIdx % pool.length];
        const qType = i % 2 === 0 ? 'audio' : 'reverse_audio';
        generatedQueue.push(createQuestionItem(qType, p));
        poolIdx++;
      }

      // Matching Qs
      for (let i = 0; i < (cfg.matching || 0); i++) {
        const p = pool[poolIdx % pool.length];
        generatedQueue.push(createQuestionItem('matching', p));
        poolIdx++;
      }

      // Speech Qs
      const speechCount = cfg.speech ?? cfg.speaking ?? 3;
      for (let i = 0; i < speechCount; i++) {
        const p = pool[poolIdx % pool.length];
        generatedQueue.push(createQuestionItem('speech', p));
        poolIdx++;
      }

      // Fill in the Blanks Qs
      const blanksCount = cfg.blanks ?? 3;
      for (let i = 0; i < blanksCount; i++) {
        const p = pool[poolIdx % pool.length];
        generatedQueue.push(createBlankQuestionItem(p, phrases));
        poolIdx++;
      }

      // Image to Speech Match Qs
      const imgSpeechCount = cfg.imageSpeech ?? cfg.imgSpeech ?? cfg.image_speech ?? 2;
      const phrasesWithImg = phrases.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
      const imgPool = phrasesWithImg.length > 0 ? phrasesWithImg : pool;
      for (let i = 0; i < imgSpeechCount; i++) {
        const p = imgPool[i % imgPool.length];
        generatedQueue.push(createQuestionItem('image_speech', p));
      }

      if (generatedQueue.length === 0) {
        phrases.forEach((p, idx) => {
          generatedQueue.push(createQuestionItem(idx % 2 === 0 ? 'text' : 'reverse_text', p));
        });
      }

      generatedQueue = shuffle(generatedQueue);
    } else {
      // Standard Single Mode Queue
      phrases.forEach((p, idx) => {
        let qType = mode;
        if (mode === 'visual') qType = idx % 2 === 0 ? 'visual' : 'reverse_visual';
        if (mode === 'audio') qType = idx % 2 === 0 ? 'audio' : 'reverse_audio';
        if (mode === 'text') qType = idx % 2 === 0 ? 'text' : 'reverse_text';
        if (mode === 'speech' || mode === 'speaking') qType = 'speech';
        if (mode === 'image_speech' || mode === 'image-speech' || mode === 'img_speech') qType = 'image_speech';

        if (mode === 'blanks' || mode === 'cloze') {
          generatedQueue.push(createBlankQuestionItem(p, phrases));
        } else {
          generatedQueue.push(createQuestionItem(qType, p));
        }
      });
      generatedQueue = shuffle(generatedQueue);
    }

    setQueue(generatedQueue);
    setCurrentIndex(0);
    setScore(0);
    setHearts(5);
    setIsAnswered(false);
    setFeedback(null);
  }, [quiz, subQuiz, mode]);

  const currentQ = queue[currentIndex];

  useEffect(() => {
    if (!currentQ) return;

    setIsAnswered(false);
    setSelectedOptionId(null);
    setFeedback(null);
    setShowFloatingXP(false);

    // Reset Speech state
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
    setSpeechError(null);
    setShowFallbackInput(false);
    setManualInput('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        void e;
      }
    }

    // Audio Autoplay: Default to browser Web Speech API if user did not upload audio
    if (isTargetOnly) {
      if (currentQ.type === 'audio' || currentQ.type === 'reverse_audio') {
        playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang);
      } else if (currentQ.type === 'speech' || currentQ.type === 'blanks') {
        // Target Immersion: Play pronunciation model in target language
        playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang);
      }
    } else {
      if (currentQ.type === 'audio') {
        playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang);
      } else if (currentQ.type === 'reverse_audio') {
        playPhraseAudio(currentQ.phrase, 'user', quiz.userLang);
      } else if (currentQ.type === 'speech') {
        // Play native audio as prompt context for speech challenge
        playPhraseAudio(currentQ.phrase, 'user', quiz.userLang);
      } else if (currentQ.type === 'blanks') {
        // Play native audio as prompt context for cloze challenge
        playPhraseAudio(currentQ.phrase, 'user', quiz.userLang);
      }
    }

    // Setup Matching state
    if (currentQ.type === 'matching') {
      const matchSet = [currentQ.phrase, ...currentQ.distractors.slice(0, 3)];
      if (isTargetOnly) {
        setLeftItems(shuffle(matchSet.map(item => ({
          id: item.id,
          imageUrl: item.imageUrl || null,
          text: item.imageUrl ? '' : item.ml,
          phrase: item
        }))));
      } else {
        setLeftItems(shuffle(matchSet.map(item => ({ id: item.id, text: item.en, phrase: item }))));
      }
      setRightItems(shuffle(matchSet.map(item => ({ id: item.id, text: item.ml, phrase: item }))));
      setSelectedMatchLeft(null);
      setSelectedMatchRight(null);
      setMatchedIds(new Set());
    }
  }, [currentIndex, queue]);

  // Clean up SpeechRecognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Keyboard Shortcuts Listener (1, 2, 3, 4, Enter, Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter' || e.key === ' ') {
        if (feedback) {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (!isAnswered && currentQ && currentQ.options && currentQ.type !== 'matching' && currentQ.type !== 'speech' && currentQ.type !== 'image_speech') {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= currentQ.options.length) {
          const selectedOption = currentQ.options[keyNum - 1];
          if (selectedOption) {
            if (currentQ.type === 'blanks') {
              handleBlankAnswerSelect(selectedOption);
            } else {
              handleAnswerSelect(selectedOption);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, feedback, currentQ]);

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;

    const isCorrect = option.id === currentQ.phrase.id;
    setIsAnswered(true);
    setSelectedOptionId(option.id);

    if (isCorrect) {
      soundFx.playCorrect();
      setScore(prev => prev + 1);
      setShowFloatingXP(true);
      setFeedback({ isCorrect: true, text: 'Correct! Excellent pronunciation & choice.' });
    } else {
      soundFx.playError();
      setHearts(prev => Math.max(0, prev - 1));
      setFeedback({ isCorrect: false, text: `Incorrect. The correct answer was "${currentQ.phrase.ml}".` });
    }
  };

  const handleBlankAnswerSelect = (optionText) => {
    if (isAnswered) return;

    const clean = (s) => String(s || '').trim().toLowerCase();
    const isCorrect = clean(optionText) === clean(currentQ.blankWord);
    setIsAnswered(true);
    setSelectedOptionId(optionText);

    if (isCorrect) {
      soundFx.playCorrect();
      setScore(prev => prev + 1);
      setShowFloatingXP(true);
      setFeedback({
        isCorrect: true,
        text: `Superb! The completed phrase is "${currentQ.phrase.ml}".`
      });
    } else {
      soundFx.playError();
      setHearts(prev => Math.max(0, prev - 1));
      setFeedback({
        isCorrect: false,
        text: `Not quite. Correct word was "${currentQ.blankWord}". Complete phrase: "${currentQ.phrase.ml}".`
      });
    }

    // Play complete phrase audio so the user hears correct pronunciation in context
    playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang);
  };

  const renderClozeSentence = (q) => {
    const fullText = q.phrase.ml || '';
    const word = (q.blankWord || '').trim();

    const renderBlankPill = () => {
      if (!isAnswered) {
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-xl border-2 border-dashed border-purple-400 bg-purple-950/70 text-purple-200 font-bold shadow-inner animate-pulse">
            [ ? ]
          </span>
        );
      }
      const clean = (s) => String(s || '').trim().toLowerCase();
      const isChoiceCorrect = clean(selectedOptionId) === clean(word);
      if (isChoiceCorrect) {
        return (
          <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-xl border-2 border-emerald-400 bg-emerald-500/25 text-emerald-300 font-extrabold shadow-lg shadow-emerald-500/30">
            ✓ {selectedOptionId}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-rose-500 bg-rose-500/25 text-rose-300 font-bold line-through">
            ✗ {selectedOptionId || 'Blank'}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold">
            ({word})
          </span>
        </span>
      );
    };

    if (!word) {
      return (
        <div className="flex items-center gap-2">
          <span>{fullText}</span>
          {renderBlankPill()}
        </div>
      );
    }

    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    const parts = fullText.split(regex);

    if (parts.length <= 1) {
      return (
        <div className="flex items-center gap-2">
          <span>{fullText}</span>
          {renderBlankPill()}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.toLowerCase() === word.toLowerCase()) {
            return <React.Fragment key={pIdx}>{renderBlankPill()}</React.Fragment>;
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </div>
    );
  };

  // Speech Recognition Control
  const startListening = () => {
    if (isAnswered) return;
    if (!isSpeechRecognitionSupported()) {
      setShowFallbackInput(true);
      setSpeechError('Microphone speech recognition is not supported on this browser. You can type your answer below.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        void e;
      }
    }

    setSpeechError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognizer = createSpeechRecognizer({
      langNameOrCode: quiz.targetLang,
      onStart: () => {
        setIsListening(true);
      },
      onResult: ({ finalTranscript, interimTranscript: interim, fullTranscript }) => {
        setInterimTranscript(interim);
        if (finalTranscript || fullTranscript) {
          setTranscript(fullTranscript);
        }
      },
      onError: (err) => {
        console.warn('SpeechRecognition error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone permissions or type your answer.');
          setShowFallbackInput(true);
        } else if (err.error === 'no-speech') {
          setSpeechError('No speech detected. Please tap the microphone and speak clearly.');
        } else {
          setSpeechError(`Speech recognition: ${err.error || 'Please try again'}`);
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
        setShowFallbackInput(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        void e;
      }
    }
    setIsListening(false);
  };

  const handleEvaluateSpeech = (spokenText) => {
    const textToCheck = spokenText || transcript || interimTranscript;
    if (!textToCheck || !textToCheck.trim()) {
      setSpeechError('No speech detected yet. Speak clearly into your mic, then tap check.');
      return;
    }

    stopListening();
    const result = evaluateSpeechAccuracy(textToCheck, currentQ.phrase.ml);
    setTranscript(textToCheck);

    if (result.isCorrect) {
      soundFx.playCorrect();
      setScore(prev => prev + 1);
      setShowFloatingXP(true);
      setIsAnswered(true);
      setFeedback({
        isCorrect: true,
        text: `Brilliant pronunciation! You said "${textToCheck}". Match for "${currentQ.phrase.ml}".`
      });
    } else {
      soundFx.playError();
      setHearts(prev => Math.max(0, prev - 1));
      setFeedback({
        isCorrect: false,
        text: `Heard "${textToCheck}". The expected target phrase is "${currentQ.phrase.ml}".`
      });
    }
  };

  const handleRetrySpeech = () => {
    setIsAnswered(false);
    setFeedback(null);
    setTranscript('');
    setInterimTranscript('');
    setSpeechError(null);
    startListening();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleEvaluateSpeech(manualInput.trim());
  };

  // Matching Game Selection Handler
  const handleMatchClick = (side, item) => {
    if (matchedIds.has(item.id) || isAnswered) return;

    if (side === 'left') {
      setSelectedMatchLeft(item);
      if (selectedMatchRight) {
        checkMatchPair(item, selectedMatchRight);
      }
    } else {
      setSelectedMatchRight(item);
      if (selectedMatchLeft) {
        checkMatchPair(selectedMatchLeft, item);
      }
    }
  };

  const checkMatchPair = (left, right) => {
    if (left.id === right.id) {
      soundFx.playMatch();
      const newMatched = new Set(matchedIds);
      newMatched.add(left.id);
      setMatchedIds(newMatched);
      setSelectedMatchLeft(null);
      setSelectedMatchRight(null);

      // Play audio on correct match (uses uploaded audio or falls back to Web Speech API)
      const matchedPhrase = quiz.phrases?.find(p => p.id === right.id) || { ml: right.text };
      playPhraseAudio(matchedPhrase, 'target', quiz.targetLang);

      if (newMatched.size === leftItems.length) {
        setIsAnswered(true);
        soundFx.playCorrect();
        setScore(prev => prev + 1);
        setShowFloatingXP(true);
        setFeedback({ isCorrect: true, text: 'All pairs matched perfectly!' });
      }
    } else {
      soundFx.playError();
      setWrongMatchPair({ leftId: left.id, rightId: right.id });
      setHearts(prev => Math.max(0, prev - 1));
      setTimeout(() => {
        setWrongMatchPair(null);
        setSelectedMatchLeft(null);
        setSelectedMatchRight(null);
      }, 600);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= queue.length) {
      onFinish({ score: score, total: queue.length });
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (!currentQ) {
    return (
      <div className="glass-panel p-8 max-w-xl mx-auto text-center my-12 animate-fade-in">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Preparing Quiz Session...</h2>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-fade-in relative">
      {/* Floating XP Animation Popup */}
      {showFloatingXP && (
        <div className="absolute top-0 right-8 z-50 animate-float-xp flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-lg text-sm">
          <Zap className="w-4 h-4 fill-slate-950" /> +10 XP
        </div>
      )}

      {/* Quiz Header Progress Bar & Hearts */}
      <div className="glass-panel p-4 mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-slate-400 hover:text-white p-1 rounded transition" title="Exit Quiz">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">{quiz.title}</span>
              {subQuiz ? (
                <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-sky-400" />
                  {subQuiz.title || 'Sub-Quiz Topic'}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                  All Sub-Quizzes ({quiz.subQuizzes?.length || 1})
                </span>
              )}
            </div>
          </div>

          {/* Hearts Display */}
          <div className="flex items-center gap-1" title="Hearts / Lives">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition ${
                  i < hearts ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-700 fill-slate-800 scale-90'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {mode.toUpperCase()} • Q{currentIndex + 1}/{queue.length}
            </span>
            <span className="badge-tag badge-amber font-extrabold text-xs">
              Score: {score}
            </span>
          </div>
        </div>

        {/* Progress Fill Line */}
        <div className="w-full bg-slate-950/60 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card Container */}
      <div className="glass-panel p-6 md:p-8 relative min-h-[440px] flex flex-col justify-between">
        <div>
          {/* VISUAL QUESTION */}
          {currentQ.type === 'visual' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Which image represents "<span className="text-sky-400">{currentQ.phrase.ml}</span>"?
                </h2>
                <button
                  onClick={() => playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang)}
                  className="mt-2 text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen Pronunciation
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.phrase.id;

                  let borderClass = 'border-white/10 hover:border-sky-400/50';
                  if (isAnswered) {
                    if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20';
                    else if (isSelected) borderClass = 'border-rose-500 bg-rose-500/20';
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleAnswerSelect(opt)}
                      className={`glass-card p-3 cursor-pointer border-2 transition duration-200 flex flex-col items-center justify-center text-center group relative ${borderClass}`}
                    >
                      <span className="absolute top-2 left-2 hotkey-badge">
                        {idx + 1}
                      </span>

                      {opt.imageUrl ? (
                        <img
                          src={opt.imageUrl}
                          alt={opt.ml}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}

                      <div
                        className="w-full h-32 bg-slate-950/40 rounded-lg mb-2 flex items-center justify-center text-slate-400 font-bold p-2 text-center text-sm"
                        style={{ display: opt.imageUrl ? 'none' : 'flex' }}
                      >
                        <ImageIcon className="w-6 h-6 mr-1" /> {opt.ml}
                      </div>
                      <span className="font-semibold text-xs text-slate-300 group-hover:text-white">
                        {opt.ml}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVERSE VISUAL QUESTION */}
          {currentQ.type === 'reverse_visual' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">What is this phrase in {quiz.targetLang}?</h2>
                <div className="flex justify-center mb-4">
                  {currentQ.phrase.imageUrl ? (
                    <img
                      src={currentQ.phrase.imageUrl}
                      alt="Question Visual"
                      className="max-h-48 rounded-xl border border-white/20 shadow-xl object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div
                    className="p-8 bg-slate-950/50 rounded-xl border border-white/10 text-slate-400 text-center"
                    style={{ display: currentQ.phrase.imageUrl ? 'none' : 'block' }}
                  >
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                    <span>Visual Phrase: "{isTargetOnly ? currentQ.phrase.ml : currentQ.phrase.en}"</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.phrase.id;

                  let cardStyle = 'btn-outline text-left justify-between py-3 px-4 relative pl-10';
                  if (isAnswered) {
                    if (isCorrect) cardStyle = 'btn-outline border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold relative pl-10';
                    else if (isSelected) cardStyle = 'btn-outline border-rose-500 bg-rose-500/20 text-rose-300 relative pl-10';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerSelect(opt)}
                      className={cardStyle}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 hotkey-badge">
                        {idx + 1}
                      </span>
                      <span>{opt.ml}</span>
                      <Volume2
                        className="w-4 h-4 text-slate-400 hover:text-sky-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPhraseAudio(opt, 'target', quiz.targetLang);
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIO / REVERSE AUDIO QUESTION */}
          {(currentQ.type === 'audio' || currentQ.type === 'reverse_audio') && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {isTargetOnly ? `Listen to ${quiz.targetLang} & select the correct phrase` : 'Listen & choose the correct matching meaning'}
                </h2>

                <div className="p-6 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 max-w-sm mx-auto flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isTargetOnly || currentQ.type === 'audio') {
                        playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang);
                      } else {
                        playPhraseAudio(currentQ.phrase, 'user', quiz.userLang);
                      }
                    }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 hover:scale-105 transition mb-3"
                    title="Play Audio"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-indigo-200">Tap to Play Audio Again</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                      {isTargetOnly || currentQ.type === 'audio'
                        ? (hasCustomAudio(currentQ.phrase, 'target') ? 'Custom Audio' : 'Free Web Speech API')
                        : (hasCustomAudio(currentQ.phrase, 'user') ? 'Custom Audio' : 'Free Web Speech API')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.phrase.id;
                  const displayText = isTargetOnly ? opt.ml : (currentQ.type === 'audio' ? opt.en : opt.ml);

                  let cardStyle = 'btn-outline text-left justify-between py-3 px-4 relative pl-10';
                  if (isAnswered) {
                    if (isCorrect) cardStyle = 'btn-outline border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold relative pl-10';
                    else if (isSelected) cardStyle = 'btn-outline border-rose-500 bg-rose-500/20 text-rose-300 relative pl-10';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerSelect(opt)}
                      className={cardStyle}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 hotkey-badge">
                        {idx + 1}
                      </span>
                      <span>{displayText}</span>
                      <Volume2
                        className="w-4 h-4 text-slate-400 hover:text-sky-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTargetOnly || currentQ.type !== 'audio') {
                            playPhraseAudio(opt, 'target', quiz.targetLang);
                          } else {
                            playPhraseAudio(opt, 'user', quiz.userLang);
                          }
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEXT / REVERSE TEXT QUESTION */}
          {(currentQ.type === 'text' || currentQ.type === 'reverse_text') && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isTargetOnly
                    ? `Identify the phrase in ${quiz.targetLang}:`
                    : (currentQ.type === 'text'
                      ? `What does "${currentQ.phrase.ml}" mean?`
                      : `What is "${currentQ.phrase.en}" in ${quiz.targetLang}?`)}
                </h2>
                <button
                  onClick={() =>
                    playPhraseAudio(
                      currentQ.phrase,
                      'target',
                      quiz.targetLang
                    )
                  }
                  className="text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen Audio
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.phrase.id;
                  const displayText = isTargetOnly ? opt.ml : (currentQ.type === 'text' ? opt.en : opt.ml);

                  let cardStyle = 'btn-outline text-left justify-between py-3.5 px-4 text-base font-semibold relative pl-10';
                  if (isAnswered) {
                    if (isCorrect) cardStyle = 'btn-outline border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold relative pl-10';
                    else if (isSelected) cardStyle = 'btn-outline border-rose-500 bg-rose-500/20 text-rose-300 relative pl-10';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerSelect(opt)}
                      className={cardStyle}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 hotkey-badge">
                        {idx + 1}
                      </span>
                      <span>{displayText}</span>
                      <Volume2
                        className="w-4 h-4 text-slate-400 hover:text-sky-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTargetOnly || currentQ.type !== 'text') {
                            playPhraseAudio(opt, 'target', quiz.targetLang);
                          } else {
                            playPhraseAudio(opt, 'user', quiz.userLang);
                          }
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SPEECH / SPEAKING QUIZ QUESTION */}
          {currentQ.type === 'speech' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <span className="badge-tag badge-amber font-bold text-xs mb-3 flex items-center gap-1.5 px-3 py-1">
                <Mic className="w-3.5 h-3.5 text-amber-300" /> Speech Recognition Challenge
              </span>

              <h2 className="text-xl md:text-2xl font-black text-white mb-1">
                {isTargetOnly ? (
                  <>Pronounce this phrase in <span className="text-amber-400">{quiz.targetLang}</span></>
                ) : (
                  <>Speak this phrase in <span className="text-amber-400">{quiz.targetLang}</span></>
                )}
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {isTargetOnly
                  ? 'Listen to the target pronunciation model or read the phrase, then speak it clearly.'
                  : 'Listen or read the native phrase, then speak your translation into the microphone.'}
              </p>

              {/* Native Prompt Box */}
              <div className="glass-card p-6 w-full max-w-lg mb-6 border-indigo-500/30 bg-slate-900/60 shadow-xl relative overflow-hidden">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                  {isTargetOnly ? `${quiz.targetLang} Pronunciation Model` : `${quiz.userLang} Phrase`}
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                  "{isTargetOnly ? currentQ.phrase.ml : currentQ.phrase.en}"
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!isTargetOnly && (
                    <button
                      type="button"
                      onClick={() => playPhraseAudio(currentQ.phrase, 'user', quiz.userLang)}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen Native Audio
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang)}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
                    title="Hear how to pronounce the target phrase"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> {isTargetOnly ? 'Listen Target Audio' : 'Pronunciation Hint'}
                  </button>
                </div>
              </div>

              {/* Speech Recognition Mic Interactive Area */}
              <div className="flex flex-col items-center w-full max-w-md mb-4">
                <div className="relative mb-4">
                  {/* Glowing Pulse Rings when listening */}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                      <div className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-pulse" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAnswered}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                      isListening
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-105 shadow-rose-500/50'
                        : isAnswered
                        ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                        : 'bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 text-white hover:scale-105 shadow-orange-500/30 cursor-pointer'
                    }`}
                    title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
                  >
                    <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce text-white' : 'text-white'}`} />
                  </button>
                </div>

                <div className="text-center min-h-[44px] mb-3">
                  {isListening ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-rose-400 text-sm font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        Listening for {quiz.targetLang}... Speak now!
                      </div>
                      <p className="text-xs text-slate-400">Tap microphone again when finished.</p>
                    </div>
                  ) : isAnswered ? (
                    <p className="text-xs text-slate-400">Speech evaluated</p>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">Tap Microphone & Speak</p>
                      <p className="text-xs text-slate-400">Pronounce the phrase in {quiz.targetLang}</p>
                    </div>
                  )}
                </div>

                {/* Live Recognized Transcript Card */}
                {(transcript || interimTranscript) && (
                  <div className="w-full glass-card p-3 rounded-xl border border-white/15 bg-slate-950/70 mb-3 text-center animate-fade-in">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      {isListening ? 'Real-Time Speech Detection' : 'Recognized Speech'}
                    </span>
                    <p className="text-base font-semibold text-sky-300">
                      "{transcript || interimTranscript}"
                    </p>
                  </div>
                )}

                {/* Error Notice */}
                {speechError && (
                  <div className="w-full p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center mb-3">
                    {speechError}
                  </div>
                )}

                {/* Check / Finish Button when speech is ready */}
                {transcript && !isAnswered && (
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleEvaluateSpeech()}
                      className="btn-primary text-xs py-2 px-5 font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Check My Speech
                    </button>
                    <button
                      type="button"
                      onClick={handleRetrySpeech}
                      className="btn-outline text-xs py-2 px-3 text-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
                    </button>
                  </div>
                )}

                {/* Typing Fallback Option */}
                {!isAnswered && (
                  <div className="pt-2 border-t border-white/5 w-full text-center">
                    {!showFallbackInput ? (
                      <button
                        type="button"
                        onClick={() => setShowFallbackInput(true)}
                        className="text-xs text-slate-400 hover:text-sky-300 underline transition"
                      >
                        Can't speak or microphone unavailable? Type answer
                      </button>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="flex gap-2 w-full mt-2 animate-fade-in">
                        <input
                          type="text"
                          className="input-field text-sm flex-1"
                          placeholder={`Type translation in ${quiz.targetLang}...`}
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          autoFocus
                        />
                        <button type="submit" className="btn-primary text-xs py-2 px-3 whitespace-nowrap">
                          <Send className="w-3.5 h-3.5 mr-1" /> Check
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IMAGE TO SPEECH MATCH QUIZ QUESTION */}
          {currentQ.type === 'image_speech' && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <span className="badge-tag badge-emerald font-bold text-xs mb-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                <Mic className="w-3.5 h-3.5 text-amber-300" /> Image to Speech Match
              </span>

              <h2 className="text-xl md:text-2xl font-black text-white mb-1">
                Speak what you see in <span className="text-emerald-400">{quiz.targetLang}</span>
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Look at the image below and speak the corresponding {quiz.targetLang} phrase into the microphone.
              </p>

              {/* Prominent Image Display Card */}
              <div className="glass-card p-4 md:p-6 w-full max-w-lg mb-6 border-emerald-500/30 bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col items-center">
                {currentQ.phrase.imageUrl && currentQ.phrase.imageUrl.trim() !== '' ? (
                  <div className="relative group w-full flex justify-center mb-3">
                    <img
                      src={currentQ.phrase.imageUrl}
                      alt="Visual prompt to speak"
                      className="max-h-56 sm:max-h-64 w-auto object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-dashed border-white/20 text-slate-400">
                      <ImageIcon className="w-12 h-12 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold text-white">"{isTargetOnly ? currentQ.phrase.ml : currentQ.phrase.en}"</p>
                      <span className="text-[11px] text-slate-500">(Image unavailable)</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-950/70 rounded-2xl border border-dashed border-emerald-500/30 text-slate-300 mb-3 w-full">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 text-emerald-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-bold text-white mb-1">"{isTargetOnly ? currentQ.phrase.ml : currentQ.phrase.en}"</p>
                    <span className="text-xs text-slate-400">
                      {isTargetOnly ? 'Listen to the audio or speak the target phrase' : 'No image uploaded — speak the target translation'}
                    </span>
                  </div>
                )}

                {/* Helpful Audio Hints */}
                <div className="flex items-center justify-center gap-2 flex-wrap mt-1">
                  {!isTargetOnly && (
                    <button
                      type="button"
                      onClick={() => playPhraseAudio(currentQ.phrase, 'user', quiz.userLang)}
                      className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                      title={`Listen in ${quiz.userLang}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Native Hint
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang)}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
                    title="Hear how to pronounce the target phrase"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> {isTargetOnly ? 'Listen Target Audio' : 'Pronunciation Hint'}
                  </button>
                </div>
              </div>

              {/* Speech Recognition Mic Interactive Area */}
              <div className="flex flex-col items-center w-full max-w-md mb-4">
                <div className="relative mb-4">
                  {/* Glowing Pulse Rings when listening */}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                      <div className="absolute -inset-2 rounded-full border-2 border-rose-400 animate-pulse" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAnswered}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                      isListening
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white scale-105 shadow-rose-500/50'
                        : isAnswered
                        ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                        : 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600 text-white hover:scale-105 shadow-emerald-500/30 cursor-pointer'
                    }`}
                    title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
                  >
                    <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce text-white' : 'text-white'}`} />
                  </button>
                </div>

                <div className="text-center min-h-[44px] mb-3">
                  {isListening ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-rose-400 text-sm font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        Listening for {quiz.targetLang}... Speak now!
                      </div>
                      <p className="text-xs text-slate-400">Tap microphone again when finished.</p>
                    </div>
                  ) : isAnswered ? (
                    <p className="text-xs text-slate-400">Speech evaluated</p>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">Tap Microphone & Speak</p>
                      <p className="text-xs text-slate-400">Say the phrase for this image in {quiz.targetLang}</p>
                    </div>
                  )}
                </div>

                {/* Live Recognized Transcript Card */}
                {(transcript || interimTranscript) && (
                  <div className="w-full glass-card p-3 rounded-xl border border-white/15 bg-slate-950/70 mb-3 text-center animate-fade-in">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      {isListening ? 'Real-Time Speech Detection' : 'Recognized Speech'}
                    </span>
                    <p className="text-base font-semibold text-emerald-300">
                      "{transcript || interimTranscript}"
                    </p>
                  </div>
                )}

                {/* Error Notice */}
                {speechError && (
                  <div className="w-full p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs text-center mb-3">
                    {speechError}
                  </div>
                )}

                {/* Check / Finish Button when speech is ready */}
                {transcript && !isAnswered && (
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleEvaluateSpeech()}
                      className="btn-primary text-xs py-2 px-5 font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Check My Speech
                    </button>
                    <button
                      type="button"
                      onClick={handleRetrySpeech}
                      className="btn-outline text-xs py-2 px-3 text-slate-300"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
                    </button>
                  </div>
                )}

                {/* Typing Fallback Option */}
                {!isAnswered && (
                  <div className="pt-2 border-t border-white/5 w-full text-center">
                    {!showFallbackInput ? (
                      <button
                        type="button"
                        onClick={() => setShowFallbackInput(true)}
                        className="text-xs text-slate-400 hover:text-sky-300 underline transition"
                      >
                        Can't speak or microphone unavailable? Type answer
                      </button>
                    ) : (
                      <form onSubmit={handleManualSubmit} className="flex gap-2 w-full mt-2 animate-fade-in">
                        <input
                          type="text"
                          className="input-field text-sm flex-1"
                          placeholder={`Type translation in ${quiz.targetLang}...`}
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          autoFocus
                        />
                        <button type="submit" className="btn-primary text-xs py-2 px-3 whitespace-nowrap">
                          <Send className="w-3.5 h-3.5 mr-1" /> Check
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FILL IN THE BLANKS (CLOZE) QUESTION */}
          {currentQ.type === 'blanks' && (
            <div className="flex flex-col items-center text-center animate-fade-in max-w-2xl mx-auto">
              <span className="badge-tag badge-purple font-bold text-xs mb-3 flex items-center gap-1.5 px-3 py-1">
                <Edit3 className="w-3.5 h-3.5 text-purple-300" /> Fill in the Blank
              </span>

              <h2 className="text-xl md:text-2xl font-black text-white mb-1">
                Complete the phrase in <span className="text-purple-400">{quiz.targetLang}</span>
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Choose the correct missing word from the 4 options below to complete the sentence.
              </p>

              {/* Native meaning hint box - hidden in Immersion / Target Only Mode */}
              {isTargetOnly ? (
                <div className="glass-card p-3.5 w-full mb-6 border-purple-500/30 bg-slate-900/70 shadow-lg relative rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Target Immersion Cloze
                  </span>
                  <button
                    type="button"
                    onClick={() => playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang)}
                    className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1.5 bg-purple-500/15 px-3.5 py-1.5 rounded-full border border-purple-500/30 transition hover:bg-purple-500/25"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Listen Target Audio
                  </button>
                </div>
              ) : (
                <div className="glass-card p-4 w-full mb-6 border-purple-500/30 bg-slate-900/70 shadow-lg relative rounded-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                    Meaning in {quiz.userLang}:
                  </span>
                  <p className="text-xl md:text-2xl font-bold text-white mb-2">
                    "{currentQ.phrase.en}"
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => playPhraseAudio(currentQ.phrase, 'target', quiz.targetLang)}
                      className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/25 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen Target Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => playPhraseAudio(currentQ.phrase, 'user', quiz.userLang)}
                      className="text-xs text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen Native Audio
                    </button>
                  </div>
                </div>
              )}

              {/* The Cloze Sentence with Blank */}
              <div className="glass-panel p-6 w-full bg-slate-950/80 border-2 border-purple-500/40 rounded-2xl mb-6 shadow-xl">
                <div className="text-xl md:text-2xl font-bold text-white flex flex-wrap items-center justify-center gap-2">
                  {renderClozeSentence(currentQ)}
                </div>
              </div>

              {/* 4 Answer Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {currentQ.options.map((optText, idx) => {
                  const isSelected = selectedOptionId === optText;
                  const clean = (s) => String(s || '').trim().toLowerCase();
                  const isCorrect = clean(optText) === clean(currentQ.blankWord);

                  let btnStyle = 'btn-outline py-4 px-4 text-center justify-center text-base font-bold relative transition duration-200 border-white/10 hover:border-purple-400/60 hover:bg-purple-500/10';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'btn-outline border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-lg shadow-emerald-500/20 py-4 px-4 text-center justify-center text-base relative';
                    } else if (isSelected) {
                      btnStyle = 'btn-outline border-rose-500 bg-rose-500/20 text-rose-300 py-4 px-4 text-center justify-center text-base relative';
                    } else {
                      btnStyle = 'btn-outline opacity-40 py-4 px-4 text-center justify-center text-base relative border-white/5';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleBlankAnswerSelect(optText)}
                      className={btnStyle}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 hotkey-badge">
                        {idx + 1}
                      </span>
                      <span>{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MATCHING PAIRS QUESTION */}
          {currentQ.type === 'matching' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Match the Phrase Pairs</h2>
                <p className="text-xs text-slate-400">Select one phrase from each column to form a pair.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                    {isTargetOnly ? 'Visual / Sound Prompt' : quiz.userLang}
                  </h3>
                  {leftItems.map((item) => {
                    const isMatched = matchedIds.has(item.id);
                    const isSelected = selectedMatchLeft?.id === item.id;
                    const isWrong = wrongMatchPair?.leftId === item.id;

                    let tileClass = 'match-card';
                    if (isMatched) tileClass += ' matched';
                    else if (isSelected) tileClass += ' selected';
                    else if (isWrong) tileClass += ' wrong animate-shake';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const p = quiz.phrases?.find(phrase => phrase.id === item.id) || item.phrase || { en: item.text, ml: item.text };
                          if (isTargetOnly) {
                            playPhraseAudio(p, 'target', quiz.targetLang);
                          } else {
                            playPhraseAudio(p, 'user', quiz.userLang);
                          }
                          handleMatchClick('left', item);
                        }}
                        className={tileClass}
                      >
                        {isTargetOnly && item.imageUrl ? (
                          <div className="flex items-center justify-center p-1">
                            <img src={item.imageUrl} alt="Match prompt" className="max-h-16 rounded object-contain" />
                          </div>
                        ) : isTargetOnly ? (
                          <div className="flex items-center justify-center gap-1.5 text-sky-400 font-semibold">
                            <Volume2 className="w-4 h-4" /> <span>{item.text || 'Audio Clue'}</span>
                          </div>
                        ) : (
                          item.text
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{quiz.targetLang}</h3>
                  {rightItems.map((item) => {
                    const isMatched = matchedIds.has(item.id);
                    const isSelected = selectedMatchRight?.id === item.id;
                    const isWrong = wrongMatchPair?.rightId === item.id;

                    let tileClass = 'match-card';
                    if (isMatched) tileClass += ' matched';
                    else if (isSelected) tileClass += ' selected';
                    else if (isWrong) tileClass += ' wrong animate-shake';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const p = quiz.phrases?.find(phrase => phrase.id === item.id) || { ml: item.text };
                          playPhraseAudio(p, 'target', quiz.targetLang);
                          handleMatchClick('right', item);
                        }}
                        className={tileClass}
                      >
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback & Navigation Footer */}
        {feedback && (
          <div className="mt-8 animate-fade-in">
            <div
              className={`p-4 rounded-xl flex items-center justify-between mb-4 border ${
                feedback.isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <span className="font-semibold text-sm">{feedback.text}</span>
              </div>
            </div>

            {/* Try Speaking Again Option for speech quiz */}
            {!feedback.isCorrect && (currentQ.type === 'speech' || currentQ.type === 'image_speech') && (
              <button
                type="button"
                onClick={handleRetrySpeech}
                className="btn-outline text-sm w-full mb-3 justify-center border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Try Speaking Again
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-primary w-full justify-center py-3.5 text-base font-bold flex items-center gap-2"
            >
              <span>{currentIndex + 1 >= queue.length ? 'View Quiz Results' : 'Next Question'}</span>
              <kbd className="hotkey-badge bg-white/20 text-white border-white/30 px-1.5 py-0.5 text-[10px]">
                Space / Enter
              </kbd>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

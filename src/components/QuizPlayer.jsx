import React, { useState, useEffect } from 'react';
import { Volume2, X, ArrowRight, CheckCircle2, XCircle, RefreshCw, Image as ImageIcon, Heart, Zap } from 'lucide-react';
import { soundFx, speakPhrase } from '../utils/audio';

export default function QuizPlayer({ quiz, mode = 'mixed', onFinish, onExit }) {
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

  // Helper shuffle
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // Distractors Generator
  const getDistractors = (phrase, allPhrases, count = 3) => {
    const available = allPhrases.filter(p => p.id !== phrase.id && p.en !== phrase.en && p.ml !== phrase.ml);
    return shuffle(available).slice(0, count);
  };

  // Build Quiz Queue on Mount
  useEffect(() => {
    if (!quiz || !quiz.phrases || quiz.phrases.length === 0) return;

    const phrases = quiz.phrases;
    let generatedQueue = [];

    const createQuestionItem = (type, phrase) => {
      const distractors = getDistractors(phrase, phrases);
      const options = shuffle([phrase, ...distractors]);
      return { type, phrase, distractors, options };
    };

    if (mode === 'mixed') {
      const cfg = quiz.config || { visual: 4, audio: 4, matching: 4 };
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
        generatedQueue.push(createQuestionItem(qType, p));
      });
      generatedQueue = shuffle(generatedQueue);
    }

    setQueue(generatedQueue);
    setCurrentIndex(0);
    setScore(0);
    setHearts(5);
    setIsAnswered(false);
    setFeedback(null);
  }, [quiz, mode]);

  const currentQ = queue[currentIndex];

  useEffect(() => {
    if (!currentQ) return;

    setIsAnswered(false);
    setSelectedOptionId(null);
    setFeedback(null);
    setShowFloatingXP(false);

    // Audio Autoplay
    if (currentQ.type === 'audio') {
      if (currentQ.phrase.audioUrlTargetLang) {
        new Audio(currentQ.phrase.audioUrlTargetLang).play().catch(() => speakPhrase(currentQ.phrase.ml, quiz.targetLang));
      } else {
        speakPhrase(currentQ.phrase.ml, quiz.targetLang);
      }
    } else if (currentQ.type === 'reverse_audio') {
      if (currentQ.phrase.audioUrlUserLang) {
        new Audio(currentQ.phrase.audioUrlUserLang).play().catch(() => speakPhrase(currentQ.phrase.en, quiz.userLang));
      } else {
        speakPhrase(currentQ.phrase.en, quiz.userLang);
      }
    }

    // Setup Matching state
    if (currentQ.type === 'matching') {
      const matchSet = [currentQ.phrase, ...currentQ.distractors.slice(0, 3)];
      setLeftItems(shuffle(matchSet.map(item => ({ id: item.id, text: item.en }))));
      setRightItems(shuffle(matchSet.map(item => ({ id: item.id, text: item.ml }))));
      setSelectedMatchLeft(null);
      setSelectedMatchRight(null);
      setMatchedIds(new Set());
    }
  }, [currentIndex, queue]);

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

      if (!isAnswered && currentQ && currentQ.options && currentQ.type !== 'matching') {
        const keyNum = parseInt(e.key, 10);
        if (keyNum >= 1 && keyNum <= currentQ.options.length) {
          const selectedOption = currentQ.options[keyNum - 1];
          if (selectedOption) {
            handleAnswerSelect(selectedOption);
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

      speakPhrase(right.text, quiz.targetLang);

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
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="text-slate-400 hover:text-white p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>

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

          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            {mode.toUpperCase()} • Q{currentIndex + 1}/{queue.length}
          </span>
          <span className="badge-tag badge-amber font-extrabold text-xs">
            Score: {score}
          </span>
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
                  onClick={() => speakPhrase(currentQ.phrase.ml, quiz.targetLang)}
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
                    <span>Visual Phrase: "{currentQ.phrase.en}"</span>
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
                          speakPhrase(opt.ml, quiz.targetLang);
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
                  Listen & choose the correct matching meaning
                </h2>

                <div className="p-6 bg-indigo-950/40 rounded-2xl border border-indigo-500/30 max-w-sm mx-auto flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (currentQ.type === 'audio') {
                        if (currentQ.phrase.audioUrlTargetLang) new Audio(currentQ.phrase.audioUrlTargetLang).play();
                        else speakPhrase(currentQ.phrase.ml, quiz.targetLang);
                      } else {
                        if (currentQ.phrase.audioUrlUserLang) new Audio(currentQ.phrase.audioUrlUserLang).play();
                        else speakPhrase(currentQ.phrase.en, quiz.userLang);
                      }
                    }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 hover:scale-105 transition mb-3"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                  <span className="text-xs font-semibold text-indigo-300">Tap to Play Audio Again</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.phrase.id;
                  const displayText = currentQ.type === 'audio' ? opt.en : opt.ml;

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
                          speakPhrase(displayText, currentQ.type === 'audio' ? quiz.userLang : quiz.targetLang);
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
                  {currentQ.type === 'text'
                    ? `What does "${currentQ.phrase.ml}" mean?`
                    : `What is "${currentQ.phrase.en}" in ${quiz.targetLang}?`}
                </h2>
                <button
                  onClick={() =>
                    speakPhrase(
                      currentQ.type === 'text' ? currentQ.phrase.ml : currentQ.phrase.en,
                      currentQ.type === 'text' ? quiz.targetLang : quiz.userLang
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
                  const displayText = currentQ.type === 'text' ? opt.en : opt.ml;

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
                          speakPhrase(displayText, currentQ.type === 'text' ? quiz.userLang : quiz.targetLang);
                        }}
                      />
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
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{quiz.userLang}</h3>
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
                        onClick={() => handleMatchClick('left', item)}
                        className={tileClass}
                      >
                        {item.text}
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
                        onClick={() => handleMatchClick('right', item)}
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

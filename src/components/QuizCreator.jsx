import React, { useState } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Volume2, Image as ImageIcon, Sparkles, HelpCircle, Wand2, Eye, Mic, Edit3, Layers, BookOpen } from 'lucide-react';
import { playPhraseAudio } from '../utils/audio';
import { VOCAB_PRESETS } from '../services/quizStorage';

export default function QuizCreator({ initialQuiz, onSave, onCancel }) {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [userLang, setUserLang] = useState(initialQuiz?.userLang || 'English');
  const [targetLang, setTargetLang] = useState(initialQuiz?.targetLang || 'Spanish');
  const [targetOnly, setTargetOnly] = useState(Boolean(initialQuiz?.targetOnly));

  // Initialize Sub-Quizzes structure (numbered 1 and above)
  const [subQuizzes, setSubQuizzes] = useState(() => {
    if (initialQuiz?.subQuizzes && initialQuiz.subQuizzes.length > 0) {
      return initialQuiz.subQuizzes.map((sq, idx) => ({
        id: sq.id || `sq-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        title: sq.title || `Topic ${idx + 1}`,
        config: sq.config || { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: sq.phrases || []
      }));
    }

    // Wrap initial phrases into Sub-Quiz 1
    const basePhrases = initialQuiz?.phrases && initialQuiz.phrases.length > 0
      ? initialQuiz.phrases
      : [
          { id: '1', en: 'Hello', ml: 'Hola', blankWord: 'Hola', blankOptions: ['Hola', 'Adiós', 'Gracias', 'Por favor'], imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: '2', en: 'Goodbye', ml: 'Adiós', blankWord: 'Adiós', blankOptions: ['Adiós', 'Hola', 'Gracias', 'Buenos días'], imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: '3', en: 'Thank you', ml: 'Gracias', blankWord: 'Gracias', blankOptions: ['Gracias', 'De nada', 'Por favor', 'Disculpa'], imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
          { id: '4', en: 'Please', ml: 'Por favor', blankWord: 'favor', blankOptions: ['favor', 'gracias', 'hola', 'adiós'], imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
        ];

    return [
      {
        id: `sq-${Date.now()}-1`,
        number: 1,
        title: 'Core Vocabulary',
        config: initialQuiz?.config || { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
        phrases: basePhrases
      }
    ];
  });

  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [previewIdx, setPreviewIdx] = useState(0);

  const activeSub = subQuizzes[activeSubIndex] || subQuizzes[0] || {};
  const currentPhrases = activeSub.phrases || [];

  // Sub-Quiz Management
  const addSubQuiz = () => {
    const nextNum = subQuizzes.length + 1;
    const newSub = {
      id: `sq-${Date.now()}-${nextNum}`,
      number: nextNum,
      title: `Topic ${nextNum}`,
      config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
      phrases: [
        { id: `p-${Date.now()}-1`, en: '', ml: '', blankWord: '', blankOptions: ['', '', '', ''], imageUrl: '', audioUrlUserLang: '', audioUrlTargetLang: '' },
        { id: `p-${Date.now()}-2`, en: '', ml: '', blankWord: '', blankOptions: ['', '', '', ''], imageUrl: '', audioUrlUserLang: '', audioUrlTargetLang: '' }
      ]
    };
    const updated = [...subQuizzes, newSub];
    setSubQuizzes(updated);
    setActiveSubIndex(updated.length - 1);
    setPreviewIdx(0);
  };

  const removeSubQuiz = (index) => {
    if (subQuizzes.length <= 1) {
      alert('A quiz must have at least one sub-quiz!');
      return;
    }
    const targetName = subQuizzes[index]?.title || `Sub-Quiz ${index + 1}`;
    if (!confirm(`Are you sure you want to delete the sub-quiz "${targetName}"?`)) {
      return;
    }

    const updated = subQuizzes
      .filter((_, i) => i !== index)
      .map((sq, i) => ({
        ...sq,
        number: i + 1,
        title: sq.title && sq.title.startsWith('Topic ') && /Topic \d+/.test(sq.title)
          ? sq.title.replace(/Topic \d+/, `Topic ${i + 1}`)
          : sq.title
      }));

    setSubQuizzes(updated);
    setActiveSubIndex(Math.max(0, Math.min(activeSubIndex, updated.length - 1)));
    setPreviewIdx(0);
  };

  const updateActiveSubQuiz = (field, value) => {
    const updated = [...subQuizzes];
    updated[activeSubIndex] = {
      ...updated[activeSubIndex],
      [field]: value
    };
    setSubQuizzes(updated);
  };

  const updateActiveSubQuizConfig = (cfgField, value) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const currentCfg = sub.config || { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2 };
    sub.config = {
      ...currentCfg,
      [cfgField]: value
    };
    setSubQuizzes(updated);
  };

  const applyPreset = (preset) => {
    setTitle(preset.name);
    setUserLang(preset.userLang);
    setTargetLang(preset.targetLang);

    if (preset.subQuizzes && Array.isArray(preset.subQuizzes) && preset.subQuizzes.length > 0) {
      setSubQuizzes(
        preset.subQuizzes.map((sq, idx) => ({
          id: `sq-${Date.now()}-${idx + 1}`,
          number: idx + 1,
          title: sq.title || `Sub-Quiz ${idx + 1}`,
          config: { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2, total: 12 },
          phrases: sq.phrases || []
        }))
      );
      setActiveSubIndex(0);
    } else if (preset.phrases) {
      // Single list of phrases into Sub-Quiz 1
      const updated = [...subQuizzes];
      updated[0] = {
        ...updated[0],
        phrases: preset.phrases
      };
      setSubQuizzes(updated);
      setActiveSubIndex(0);
    }
  };

  // Phrase Operations for Active Sub-Quiz
  const handlePhraseChange = (index, field, value) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const newPhrases = [...sub.phrases];
    newPhrases[index] = {
      ...newPhrases[index],
      [field]: value
    };
    sub.phrases = newPhrases;
    setSubQuizzes(updated);
  };

  const extractWords = (text) => {
    if (!text) return [];
    const base = text.replace(/\s*\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    return base
      .split(/[\s,.;:!?¡¿]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
  };

  const selectBlankWord = (phraseIdx, word) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const newPhrases = [...sub.phrases];
    const phrase = { ...newPhrases[phraseIdx] };
    phrase.blankWord = word;

    const currentOptions = Array.isArray(phrase.blankOptions) ? [...phrase.blankOptions] : ['', '', '', ''];
    while (currentOptions.length < 4) currentOptions.push('');
    currentOptions[0] = word;

    // Distractors pool from other phrases in this sub-quiz or all sub-quizzes
    const otherWords = [];
    subQuizzes.forEach(sq => {
      (sq.phrases || []).forEach(p => {
        if (p.ml) {
          extractWords(p.ml).forEach(w => {
            if (w.toLowerCase() !== word.toLowerCase() && !otherWords.includes(w)) {
              otherWords.push(w);
            }
          });
        }
      });
    });

    for (let opt = 1; opt < 4; opt++) {
      if (!currentOptions[opt] && otherWords.length > 0) {
        currentOptions[opt] = otherWords.shift();
      }
    }

    phrase.blankOptions = currentOptions;
    newPhrases[phraseIdx] = phrase;
    sub.phrases = newPhrases;
    setSubQuizzes(updated);
  };

  const handleBlankWordChange = (phraseIdx, val) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const newPhrases = [...sub.phrases];
    const phrase = { ...newPhrases[phraseIdx] };
    phrase.blankWord = val;

    if (Array.isArray(phrase.blankOptions)) {
      phrase.blankOptions[0] = val;
    } else {
      phrase.blankOptions = [val, '', '', ''];
    }
    newPhrases[phraseIdx] = phrase;
    sub.phrases = newPhrases;
    setSubQuizzes(updated);
  };

  const handleBlankOptionChange = (phraseIdx, optIdx, val) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const newPhrases = [...sub.phrases];
    const phrase = { ...newPhrases[phraseIdx] };
    const opts = Array.isArray(phrase.blankOptions) ? [...phrase.blankOptions] : ['', '', '', ''];
    while (opts.length < 4) opts.push('');
    opts[optIdx] = val;
    phrase.blankOptions = opts;
    newPhrases[phraseIdx] = phrase;
    sub.phrases = newPhrases;
    setSubQuizzes(updated);
  };

  const autoSuggestBlankDistractors = (phraseIdx) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    const newPhrases = [...sub.phrases];
    const phrase = { ...newPhrases[phraseIdx] };
    const words = extractWords(phrase.ml);
    const chosenWord = phrase.blankWord || (words.length > 1 ? words[words.length - 1] : words[0]) || '';
    phrase.blankWord = chosenWord;

    const pool = [];
    subQuizzes.forEach(sq => {
      (sq.phrases || []).forEach(p => {
        if (p.ml) {
          extractWords(p.ml).forEach(w => {
            if (w.toLowerCase() !== chosenWord.toLowerCase() && !pool.includes(w)) {
              pool.push(w);
            }
          });
        }
      });
    });

    const options = [chosenWord];
    while (options.length < 4 && pool.length > 0) {
      options.push(pool.shift());
    }
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }

    phrase.blankOptions = options;
    newPhrases[phraseIdx] = phrase;
    sub.phrases = newPhrases;
    setSubQuizzes(updated);
  };

  const renderClozePreview = (mlText, blankWord) => {
    if (!mlText) return <span className="text-slate-500 italic">No phrase entered yet</span>;
    if (!blankWord || !blankWord.trim()) {
      return <span>{mlText} <span className="text-purple-400 font-bold">(Select a word to remove)</span></span>;
    }

    const cleanWord = blankWord.trim();
    const regex = new RegExp(`(${cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    const parts = mlText.split(regex);

    if (parts.length <= 1) {
      return (
        <span>
          {mlText} <span className="bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-500/50">[ _____ ]</span>
        </span>
      );
    }

    return (
      <span>
        {parts.map((part, pIdx) => {
          if (part.toLowerCase() === cleanWord.toLowerCase()) {
            return (
              <span key={pIdx} className="bg-purple-950/90 text-purple-300 px-2.5 py-0.5 rounded-md border border-purple-500/60 font-bold mx-1 shadow-inner">
                [ _____ ]
              </span>
            );
          }
          return <span key={pIdx}>{part}</span>;
        })}
      </span>
    );
  };

  const addPhraseRow = () => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    sub.phrases = [
      ...(sub.phrases || []),
      {
        id: `p-${Date.now()}-${(sub.phrases?.length || 0) + 1}`,
        en: '',
        ml: '',
        blankWord: '',
        blankOptions: ['', '', '', ''],
        imageUrl: '',
        audioUrlUserLang: '',
        audioUrlTargetLang: ''
      }
    ];
    setSubQuizzes(updated);
  };

  const removePhraseRow = (index) => {
    const updated = [...subQuizzes];
    const sub = updated[activeSubIndex];
    if ((sub.phrases || []).length <= 2) {
      alert('Each Sub-Quiz must have at least 2 phrases!');
      return;
    }
    sub.phrases = sub.phrases.filter((_, i) => i !== index);
    setSubQuizzes(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a Quiz Title.');
      return;
    }

    // Validate that each sub-quiz has at least 2 valid phrases
    for (let i = 0; i < subQuizzes.length; i++) {
      const sq = subQuizzes[i];
      const valid = (sq.phrases || []).filter(p => {
        if (targetOnly) return p.ml.trim() !== '';
        return p.en.trim() !== '' && p.ml.trim() !== '';
      });
      if (valid.length < 2) {
        alert(
          targetOnly
            ? `Sub-Quiz "${sq.title || `Topic ${sq.number}`}" requires at least 2 complete Target phrases.`
            : `Sub-Quiz "${sq.title || `Topic ${sq.number}`}" requires at least 2 complete phrase pairs (Native & Target).`
        );
        setActiveSubIndex(i);
        return;
      }
    }

    const packagedSubQuizzes = subQuizzes.map((sq, idx) => {
      const validPhrases = (sq.phrases || [])
        .filter(p => targetOnly ? p.ml.trim() !== '' : (p.en.trim() !== '' && p.ml.trim() !== ''))
        .map(p => ({
          ...p,
          en: targetOnly && !p.en.trim() ? p.ml.trim() : p.en.trim(),
          ml: p.ml.trim(),
          blankWord: (p.blankWord || '').trim(),
          blankOptions: Array.isArray(p.blankOptions)
            ? p.blankOptions.map(o => String(o || '').trim()).filter(Boolean)
            : []
        }));

      const cfg = sq.config || { visual: 2, audio: 2, matching: 2, speech: 2, blanks: 2, imageSpeech: 2 };
      const subTotal =
        Number(cfg.visual || 0) +
        Number(cfg.audio || 0) +
        Number(cfg.matching || 0) +
        Number(cfg.speech || 0) +
        Number(cfg.blanks || 0) +
        Number(cfg.imageSpeech || 0);

      return {
        id: sq.id || `sq-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        title: (sq.title || `Topic ${idx + 1}`).trim(),
        config: {
          visual: Number(cfg.visual || 0),
          audio: Number(cfg.audio || 0),
          matching: Number(cfg.matching || 0),
          speech: Number(cfg.speech || 0),
          blanks: Number(cfg.blanks || 0),
          imageSpeech: Number(cfg.imageSpeech || 0),
          total: subTotal || validPhrases.length
        },
        phrases: validPhrases
      };
    });

    // Flatten all phrases across all sub-quizzes
    const allPhrases = packagedSubQuizzes.flatMap(sq => sq.phrases);

    // Compute overall quiz config
    const overallConfig = {
      visual: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.visual || 0), 0),
      audio: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.audio || 0), 0),
      matching: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.matching || 0), 0),
      speech: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.speech || 0), 0),
      blanks: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.blanks || 0), 0),
      imageSpeech: packagedSubQuizzes.reduce((sum, sq) => sum + (sq.config.imageSpeech || 0), 0),
      total: allPhrases.length
    };

    const quizData = {
      id: initialQuiz?.id || `quiz-${Date.now()}`,
      title: title.trim(),
      userLang: userLang.trim(),
      targetLang: targetLang.trim(),
      targetOnly: Boolean(targetOnly),
      category: initialQuiz?.category || 'Beginner',
      passPercent: initialQuiz?.passPercent || 70,
      xpAmount: initialQuiz?.xpAmount || 50,
      config: overallConfig,
      subQuizzes: packagedSubQuizzes,
      phrases: allPhrases
    };

    onSave(quizData);
  };

  const activePreviewPhrase = currentPhrases[previewIdx] || currentPhrases[0] || {};
  const totalPhrasesCount = subQuizzes.reduce((sum, sq) => sum + ((sq.phrases || []).filter(p => p.en && p.ml).length), 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="btn-outline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          {initialQuiz ? 'Edit Quiz & Sub-Quizzes' : 'Create Quiz & Sub-Quizzes'}
        </h1>
        <button onClick={handleSubmit} className="btn-primary">
          <Save className="w-4 h-4" /> Save Quiz
        </button>
      </div>

      {/* Preset Vocabulary Bar */}
      <div className="glass-panel p-4 mb-6 bg-gradient-to-r from-indigo-950/60 to-slate-900/60">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-300 uppercase tracking-wider">
          <Wand2 className="w-4 h-4 text-indigo-400" /> 1-Click Vocabulary Presets Generator
        </div>
        <div className="flex flex-wrap gap-2">
          {VOCAB_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="btn-outline text-xs py-1.5 px-3 hover:border-indigo-400 transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Quiz Basic Information */}
        <div className="glass-panel p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Main Quiz Information
            </h2>
            <span className="badge-tag badge-purple text-xs">
              {subQuizzes.length} Sub-Quizzes • {totalPhrasesCount} Total Phrases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                className="input-field font-semibold"
                placeholder="e.g. Spanish Essentials"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Language (Native) *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. English"
                value={userLang}
                onChange={(e) => setUserLang(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Language *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Spanish"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Target Language Immersion Mode Toggle */}
          <div className={`mt-4 p-4 rounded-xl border transition-all ${
            targetOnly
              ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900/50 border-white/10 hover:border-white/20'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={targetOnly}
                onChange={(e) => setTargetOnly(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className={`w-4 h-4 ${targetOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
                    Target Language Only (Immersion Mode)
                  </span>
                  {targetOnly && (
                    <span className="badge-tag bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates a quiz of only the target language without any native language text, audio, or speech prompts. Questions use images, target audio, target speech, and context cloze questions.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SUB-QUIZZES MANAGER */}
        <div className="glass-panel p-6 border-2 border-purple-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Sub-Quizzes Management</span>
              </h2>
              <p className="text-xs text-slate-400">
                Create and name custom sub-quizzes (e.g., "Food & Dining", "Everyday Greetings", "Travel") for modular learning.
              </p>
            </div>
            <button
              type="button"
              onClick={addSubQuiz}
              className="btn-primary text-xs py-2 px-3 shadow-md shadow-purple-500/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Sub-Quiz
            </button>
          </div>

          {/* Sub-Quizzes Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-white/10">
            {subQuizzes.map((sq, idx) => {
              const isActive = activeSubIndex === idx;
              const phraseCount = (sq.phrases || []).filter(p => p.en && p.ml).length;

              return (
                <button
                  key={sq.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveSubIndex(idx);
                    setPreviewIdx(0);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/10'
                  }`}
                >
                  <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{sq.title || `Topic ${idx + 1}`}</span>
                  <span className="text-[10px] opacity-75 font-mono">({phraseCount} pairs)</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={addSubQuiz}
              className="text-xs py-2.5 px-3 rounded-xl border border-dashed border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition flex items-center gap-1.5 whitespace-nowrap font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> + New Sub-Quiz
            </button>
          </div>

          {/* ACTIVE SUB-QUIZ FORM & PHRASES */}
          <div className="space-y-6">
            {/* Sub-Quiz Header Settings */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-purple-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 font-extrabold text-sm flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                      Active Sub-Quiz
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {activeSub.title || 'Untitled Topic'}
                    </span>
                  </div>
                </div>

                {subQuizzes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubQuiz(activeSubIndex)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Sub-Quiz
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    Sub-Quiz Name *
                  </label>
                  <input
                    type="text"
                    className="input-field text-sm font-bold bg-slate-950/70 border-purple-500/40 text-purple-200 focus:border-purple-400"
                    placeholder="e.g. Food & Dining, Travel Essentials, Greetings..."
                    value={activeSub.title || ''}
                    onChange={(e) => updateActiveSubQuiz('title', e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Edit the name of this sub-quiz. Learners will see this topic name in the library and during play.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Mix for "{activeSub.title || 'This Sub-Quiz'}"
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Visual</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1"
                        value={activeSub.config?.visual ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('visual', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Audio</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1"
                        value={activeSub.config?.audio ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('audio', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Match</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1"
                        value={activeSub.config?.matching ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('matching', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Speech</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1 text-amber-300"
                        value={activeSub.config?.speech ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('speech', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Blanks</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1 text-purple-300"
                        value={activeSub.config?.blanks ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('blanks', e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Img Speech</span>
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center font-bold text-xs py-1 px-1 text-emerald-300"
                        value={activeSub.config?.imageSpeech ?? 2}
                        onChange={(e) => updateActiveSubQuizConfig('imageSpeech', e.target.value)}
                        title="Image to Speech Match Questions"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Card Preview Drawer */}
            {activePreviewPhrase.en && (
              <div className="glass-panel p-4 bg-slate-900/90 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-sky-400" />
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Live Preview ({activeSub.title || 'Sub-Quiz'})
                    </span>
                    <p className="text-sm font-semibold text-white">
                      "{activePreviewPhrase.en}" ➔ "{activePreviewPhrase.ml}"
                    </p>
                    {activePreviewPhrase.blankWord && (
                      <p className="text-xs text-purple-300 font-mono mt-0.5">
                        Cloze: {activePreviewPhrase.ml.replace(new RegExp(activePreviewPhrase.blankWord, 'i'), '[ _____ ]')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playPhraseAudio(activePreviewPhrase, 'target', targetLang)}
                    className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1 text-sky-300 border-sky-500/40"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Play Voice
                  </button>
                  {activePreviewPhrase.imageUrl && (
                    <img
                      src={activePreviewPhrase.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-white/20"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Phrases & Media for Active Sub-Quiz */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Phrases in "{activeSub.title || 'Sub-Quiz'}"</span>
                    <span className="badge-tag badge-blue text-xs font-mono">
                      {currentPhrases.length} pairs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add native and target phrases. You can remove a word for Cloze questions and customize 4 answer options.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPhraseRow}
                  className="btn-secondary text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Phrase
                </button>
              </div>

              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
                {currentPhrases.map((phrase, idx) => (
                  <div
                    key={phrase.id || idx}
                    onClick={() => setPreviewIdx(idx)}
                    className={`glass-card p-4 space-y-3 cursor-pointer border-2 transition ${
                      previewIdx === idx ? 'border-sky-500/60 bg-slate-800/80' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-indigo-400 text-xs">
                        {activeSub.title || 'Sub-Quiz'} • Phrase {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhraseRow(idx);
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-slate-300">
                            {userLang || 'Native'} Phrase {targetOnly ? <span className="text-[10px] text-amber-400 font-semibold">(Optional Reference — omitted in quiz)</span> : '*'}
                          </label>
                          {phrase.en && !targetOnly && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPhraseAudio(phrase, 'user', userLang);
                              }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" /> Voice {phrase.audioUrlUserLang ? '(Audio)' : '(TTS)'}
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          className="input-field text-sm"
                          placeholder={targetOnly ? "Optional reference..." : "e.g. Hello"}
                          value={phrase.en}
                          onChange={(e) => handlePhraseChange(idx, 'en', e.target.value)}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-400">
                            {targetLang || 'Target'} Phrase *
                          </label>
                          {phrase.ml && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playPhraseAudio(phrase, 'target', targetLang);
                              }}
                              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" /> Voice {phrase.audioUrlTargetLang ? '(Audio)' : '(TTS)'}
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          className="input-field text-sm"
                          placeholder="e.g. Hola"
                          value={phrase.ml}
                          onChange={(e) => handlePhraseChange(idx, 'ml', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Fill in the Blanks Configuration */}
                    <div className="pt-3 border-t border-white/10 bg-slate-950/40 p-3 rounded-xl border border-purple-500/20">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Fill in the Blanks (Cloze Question)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            autoSuggestBlankDistractors(idx);
                          }}
                          className="btn-outline text-[11px] py-1 px-2.5 text-purple-300 border-purple-500/30 hover:border-purple-400 flex items-center gap-1"
                          title="Auto-fill options and distractors from other phrases"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" /> Auto-suggest Options
                        </button>
                      </div>

                      {/* Interactive Word Picker Chips from Target Phrase */}
                      {phrase.ml && (
                        <div className="mb-2.5">
                          <span className="text-[11px] text-slate-400 block mb-1">
                            Click a word from the phrase to remove it as the blank:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {extractWords(phrase.ml).map((word, wIdx) => {
                              const isSelected = (phrase.blankWord || '').trim().toLowerCase() === word.toLowerCase();
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectBlankWord(idx, word);
                                  }}
                                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition ${
                                    isSelected
                                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/50 ring-2 ring-purple-400'
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/10'
                                  }`}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Removed Word Input & Live Sentence Cloze Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Word Removed from Phrase (Answer)
                          </label>
                          <input
                            type="text"
                            className="input-field text-xs text-purple-200 border-purple-500/30"
                            placeholder="e.g. Hola"
                            value={phrase.blankWord || ''}
                            onChange={(e) => handleBlankWordChange(idx, e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Sentence Preview with Blank
                          </label>
                          <div className="p-2.5 bg-slate-900 rounded-lg border border-white/10 text-xs text-slate-300 font-mono flex items-center min-h-[38px] overflow-x-auto">
                            {renderClozePreview(phrase.ml, phrase.blankWord)}
                          </div>
                        </div>
                      </div>

                      {/* 4 Answer Options */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                          4 Answer Options (Option 1 is correct answer, remaining 3 are distractors):
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map((optIdx) => (
                            <div key={optIdx} className="relative">
                              <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                optIdx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {optIdx === 0 ? '✓' : String.fromCharCode(65 + optIdx)}
                              </span>
                              <input
                                type="text"
                                className="input-field text-xs pl-8"
                                placeholder={optIdx === 0 ? 'Correct answer' : `Option ${String.fromCharCode(65 + optIdx)}`}
                                value={phrase.blankOptions?.[optIdx] ?? ''}
                                onChange={(e) => handleBlankOptionChange(idx, optIdx, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Media URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-sky-400" /> Image URL {targetOnly ? <span className="text-emerald-400 font-bold">(Key for Immersion)</span> : '(Optional)'}
                        </label>
                        <input
                          type="url"
                          className="input-field text-xs"
                          placeholder="https://..."
                          value={phrase.imageUrl || ''}
                          onChange={(e) => handlePhraseChange(idx, 'imageUrl', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-emerald-400" /> Native Audio URL {targetOnly ? <span className="text-amber-400 text-[10px]">(Omitted in Immersion)</span> : '(Optional)'}
                        </label>
                        <input
                          type="url"
                          className="input-field text-xs"
                          placeholder={targetOnly ? "Not used in immersion mode" : "https://... (Uses Web Speech if blank)"}
                          disabled={targetOnly}
                          value={phrase.audioUrlUserLang || ''}
                          onChange={(e) => handlePhraseChange(idx, 'audioUrlUserLang', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-sky-400" /> Target Audio URL (Optional)
                        </label>
                        <input
                          type="url"
                          className="input-field text-xs"
                          placeholder="https://... (Uses Web Speech if blank)"
                          value={phrase.audioUrlTargetLang || ''}
                          onChange={(e) => handlePhraseChange(idx, 'audioUrlTargetLang', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={addPhraseRow}
                  className="btn-outline text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Phrase to "{activeSub.title || 'Sub-Quiz'}"
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="glass-panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Structure: <strong className="text-white">{title || 'Untitled Quiz'}</strong> containing{' '}
            <strong className="text-purple-400">{subQuizzes.length} Sub-Quizzes</strong> with{' '}
            <strong className="text-sky-400">{totalPhrasesCount} total phrases</strong>.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline text-sm w-full sm:w-auto justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-sm w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" /> Save Quiz & All Sub-Quizzes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

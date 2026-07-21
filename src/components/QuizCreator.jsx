import React, { useState } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Volume2, Image as ImageIcon, Sparkles, HelpCircle, Award, Wand2, Eye } from 'lucide-react';
import { speakPhrase } from '../utils/audio';
import { VOCAB_PRESETS } from '../services/quizStorage';

export default function QuizCreator({ initialQuiz, onSave, onCancel }) {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [userLang, setUserLang] = useState(initialQuiz?.userLang || 'English');
  const [targetLang, setTargetLang] = useState(initialQuiz?.targetLang || 'Spanish');

  const [config, setConfig] = useState({
    visual: initialQuiz?.config?.visual ?? 4,
    audio: initialQuiz?.config?.audio ?? 4,
    matching: initialQuiz?.config?.matching ?? 4
  });

  const [gpConfig, setGpConfig] = useState({
    type: initialQuiz?.gpConfig?.type || 'vocab_xp',
    amount: initialQuiz?.gpConfig?.amount ?? 50,
    passPercent: initialQuiz?.gpConfig?.passPercent ?? 70,
    achievementId: initialQuiz?.gpConfig?.achievementId ?? Math.floor(Math.random() * 900 + 100),
    badgeTitle: initialQuiz?.gpConfig?.badgeTitle || 'Language Master Badge',
    badgeIcon: initialQuiz?.gpConfig?.badgeIcon || '🎓'
  });

  const [phrases, setPhrases] = useState(initialQuiz?.phrases || [
    { id: '1', en: 'Hello', ml: 'Hola', imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
    { id: '2', en: 'Goodbye', ml: 'Adiós', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
    { id: '3', en: 'Thank you', ml: 'Gracias', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' },
    { id: '4', en: 'Please', ml: 'Por favor', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', audioUrlUserLang: '', audioUrlTargetLang: '' }
  ]);

  const [previewIdx, setPreviewIdx] = useState(0);

  const applyPreset = (preset) => {
    setTitle(preset.name);
    setUserLang(preset.userLang);
    setTargetLang(preset.targetLang);
    setGpConfig({
      ...gpConfig,
      ...preset.gpConfig
    });
    setPhrases(preset.phrases);
  };

  const handlePhraseChange = (index, field, value) => {
    const updated = [...phrases];
    updated[index][field] = value;
    setPhrases(updated);
  };

  const addPhraseRow = () => {
    setPhrases([
      ...phrases,
      {
        id: Date.now().toString(),
        en: '',
        ml: '',
        imageUrl: '',
        audioUrlUserLang: '',
        audioUrlTargetLang: ''
      }
    ]);
  };

  const removePhraseRow = (index) => {
    if (phrases.length <= 2) {
      alert('A quiz must have at least 2 phrases!');
      return;
    }
    setPhrases(phrases.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a Quiz Title.');
      return;
    }

    const validPhrases = phrases.filter(p => p.en.trim() !== '' && p.ml.trim() !== '');
    if (validPhrases.length < 2) {
      alert('Please fill at least 2 complete phrase pairs (Native & Target).');
      return;
    }

    const totalQuestions = Number(config.visual) + Number(config.audio) + Number(config.matching);

    const quizData = {
      id: initialQuiz?.id || `quiz-${Date.now()}`,
      title: title.trim(),
      userLang: userLang.trim(),
      targetLang: targetLang.trim(),
      config: {
        visual: Number(config.visual),
        audio: Number(config.audio),
        matching: Number(config.matching),
        total: totalQuestions
      },
      gpConfig: {
        ...gpConfig,
        amount: Number(gpConfig.amount),
        passPercent: Number(gpConfig.passPercent),
        achievementId: Number(gpConfig.achievementId)
      },
      phrases: validPhrases
    };

    onSave(quizData);
  };

  const activePreviewPhrase = phrases[previewIdx] || phrases[0] || {};

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="btn-outline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>
        <h1 className="text-2xl font-bold text-white">
          {initialQuiz ? 'Edit Quiz' : 'Create New Language Quiz'}
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
        {/* Basic Information */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. German Food & Dining"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Language (Native)
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
                Target Language
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. German"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Question Mix & Gamification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 border-l-4 border-sky-500">
            <h2 className="text-lg font-bold text-sky-400 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Mixed Mode Question Mix
            </h2>
            <p className="text-xs text-slate-400 mb-4">Set question counts per mode for mixed challenges.</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Visual Qs</label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-center font-bold"
                  value={config.visual}
                  onChange={(e) => setConfig({ ...config, visual: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Listening Qs</label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-center font-bold"
                  value={config.audio}
                  onChange={(e) => setConfig({ ...config, audio: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Matching Sets</label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-center font-bold"
                  value={config.matching}
                  onChange={(e) => setConfig({ ...config, matching: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-l-4 border-amber-500">
            <h2 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5" /> Quiz Rewards & Badges
            </h2>
            <p className="text-xs text-slate-400 mb-3">Configure XP points and achievements awarded upon passing.</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Min Passing %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field font-bold text-amber-400"
                  value={gpConfig.passPercent}
                  onChange={(e) => setGpConfig({ ...gpConfig, passPercent: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Reward Points Slug</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. german_xp"
                  value={gpConfig.type}
                  onChange={(e) => setGpConfig({ ...gpConfig, type: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">XP Amount</label>
                <input
                  type="number"
                  className="input-field"
                  value={gpConfig.amount}
                  onChange={(e) => setGpConfig({ ...gpConfig, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Badge Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Badge Name"
                  value={gpConfig.badgeTitle}
                  onChange={(e) => setGpConfig({ ...gpConfig, badgeTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Badge Emoji</label>
                <input
                  type="text"
                  className="input-field text-center text-lg"
                  value={gpConfig.badgeIcon}
                  onChange={(e) => setGpConfig({ ...gpConfig, badgeIcon: e.target.value })}
                />
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
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Live Card Preview</span>
                <p className="text-sm font-semibold text-white">
                  "{activePreviewPhrase.en}" ➔ "{activePreviewPhrase.ml}"
                </p>
              </div>
            </div>
            {activePreviewPhrase.imageUrl && (
              <img
                src={activePreviewPhrase.imageUrl}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/20"
              />
            )}
          </div>
        )}

        {/* Phrase Pair Editor */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Phrases & Media ({phrases.length})</h2>
              <p className="text-xs text-slate-400">Add native phrase, target phrase, image link, or audio link.</p>
            </div>
            <button
              type="button"
              onClick={addPhraseRow}
              className="btn-secondary text-sm"
            >
              <Plus className="w-4 h-4" /> Add Phrase Pair
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {phrases.map((phrase, idx) => (
              <div
                key={phrase.id || idx}
                onClick={() => setPreviewIdx(idx)}
                className={`glass-card p-4 space-y-3 cursor-pointer border-2 transition ${
                  previewIdx === idx ? 'border-sky-500/60 bg-slate-800/80' : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-indigo-400 text-sm">Phrase #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhraseRow(idx);
                    }}
                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">{userLang || 'Native'} Phrase</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`e.g. Hello`}
                      value={phrase.en}
                      onChange={(e) => handlePhraseChange(idx, 'en', e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-slate-300">{targetLang || 'Target'} Phrase</label>
                      {phrase.ml && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakPhrase(phrase.ml, targetLang);
                          }}
                          className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" /> Test Voice
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`e.g. Hola`}
                      value={phrase.ml}
                      onChange={(e) => handlePhraseChange(idx, 'ml', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      className="input-field text-xs"
                      placeholder="https://..."
                      value={phrase.imageUrl}
                      onChange={(e) => handlePhraseChange(idx, 'imageUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-emerald-400" /> Native Audio URL
                    </label>
                    <input
                      type="url"
                      className="input-field text-xs"
                      placeholder="https://... (Uses TTS if blank)"
                      value={phrase.audioUrlUserLang}
                      onChange={(e) => handlePhraseChange(idx, 'audioUrlUserLang', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-sky-400" /> Target Audio URL
                    </label>
                    <input
                      type="url"
                      className="input-field text-xs"
                      placeholder="https://... (Uses TTS if blank)"
                      value={phrase.audioUrlTargetLang}
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
              className="btn-outline text-sm"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" /> Save Quiz
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

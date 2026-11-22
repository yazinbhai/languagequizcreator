import React, { useState, useEffect } from 'react';
import { Play, Plus, Eye, Headphones, BookOpen, Layers, Edit, Trash2, Zap, Star, Trophy, Clock, Filter, Download, Upload, Share2, Check, Mic, Edit3, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getFavorites, toggleFavorite, getHighScores, exportQuizzesJSON, importQuizzesJSON, generateShareableURL } from '../services/quizStorage';

export default function QuizLibrary({ quizzes, onSelectQuiz, onCreateNew, onEditQuiz, onDeleteQuiz }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [highScores, setHighScores] = useState({});
  const [copiedQuizId, setCopiedQuizId] = useState(null);

  useEffect(() => {
    setFavorites(getFavorites());
    setHighScores(getHighScores());
  }, []);

  const handleToggleFav = (e, quizId) => {
    e.stopPropagation();
    const updated = toggleFavorite(quizId);
    setFavorites(updated);
  };

  const handleShareQuiz = (e, quiz) => {
    e.stopPropagation();
    const shareableURL = generateShareableURL(quiz);
    navigator.clipboard.writeText(shareableURL);
    setCopiedQuizId(quiz.id);
    setTimeout(() => setCopiedQuizId(null), 2000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content) {
        importQuizzesJSON(content);
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const categories = ['All', 'Favorites', 'Immersion Only', 'Beginner', 'Advanced'];

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.targetLang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.userLang.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'Favorites') {
      return favorites.includes(q.id);
    }
    if (selectedCategory === 'Immersion Only') {
      return Boolean(q.targetOnly);
    }
    if (selectedCategory !== 'All') {
      return (q.category || 'Beginner') === selectedCategory;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
      {/* Search & Category Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>Language Quizzes</span>
            <span className="badge-tag badge-purple text-xs font-bold">{filteredQuizzes.length} Available</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Select a practice mode or embark on a mixed challenge.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            className="input-field w-full sm:w-64"
            placeholder="Search language or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button onClick={exportQuizzesJSON} className="btn-outline text-xs py-2 px-3" title="Export Quizzes to JSON File">
            <Download className="w-4 h-4 text-sky-400" /> Export JSON
          </button>

          <label className="btn-outline text-xs py-2 px-3 cursor-pointer" title="Import Quizzes from JSON File">
            <Upload className="w-4 h-4 text-emerald-400" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button onClick={onCreateNew} className="btn-primary whitespace-nowrap w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Create Quiz
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-white/10">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat === 'Favorites' && <Star className="w-3.5 h-3.5 inline mr-1 fill-amber-400 text-amber-400" />}
            {cat}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const isFav = favorites.includes(quiz.id);
          const highScore = highScores[quiz.id];
          const isCopied = copiedQuizId === quiz.id;

          return (
            <div
              key={quiz.id}
              className="glass-panel p-6 flex flex-col justify-between hover:border-indigo-500/40 transition duration-300 group relative"
            >
              <div>
                {/* Header Badges & Favorite Button */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {quiz.targetOnly ? (
                    <span className="badge-tag bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> {quiz.targetLang} Immersion (No Native)
                    </span>
                  ) : (
                    <span className="badge-tag badge-blue font-bold">
                      {quiz.userLang} ➔ {quiz.targetLang}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="badge-tag badge-amber font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {quiz.xpAmount || 50} XP
                    </span>
                    <button
                      onClick={(e) => handleToggleFav(e, quiz.id)}
                      className="text-slate-400 hover:text-amber-400 transition p-1"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition">
                  {quiz.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span>{quiz.phrases?.length || 0} Phrases</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~3 mins
                  </span>
                  {highScore && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1" title="Personal Best">
                        <Trophy className="w-3 h-3 text-amber-400" /> Best: {highScore.percentage}%
                      </span>
                    </>
                  )}
                </div>

                {/* Question Mix Stats */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mb-6 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Visual</span>
                    <span className="font-bold text-sky-400 text-xs">{quiz.config?.visual || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Audio</span>
                    <span className="font-bold text-emerald-400 text-xs">{quiz.config?.audio || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Match</span>
                    <span className="font-bold text-indigo-400 text-xs">{quiz.config?.matching || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Speech</span>
                    <span className="font-bold text-amber-400 text-xs">{quiz.config?.speech ?? quiz.config?.speaking ?? 3}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Blanks</span>
                    <span className="font-bold text-purple-400 text-xs">{quiz.config?.blanks ?? 3}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Img Speech</span>
                    <span className="font-bold text-teal-400 text-xs">{quiz.config?.imageSpeech ?? 2}</span>
                  </div>
                </div>

                {/* Sub-Quizzes Section */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      Sub-Quizzes ({quiz.subQuizzes?.length || 1})
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Play individually or combined</span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(quiz.subQuizzes && quiz.subQuizzes.length > 0
                      ? quiz.subQuizzes
                      : [{ id: 'sq-1', number: 1, title: 'Core Vocabulary', phrases: quiz.phrases || [], config: quiz.config }]
                    ).map((sq, idx) => (
                      <div
                        key={sq.id || idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-sky-500/30 transition text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0 border border-sky-500/25">
                            <BookOpen className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-white font-semibold truncate block text-xs">
                              {sq.title || `Topic ${idx + 1}`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sq.phrases?.length || 0} phrases
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onSelectQuiz(quiz, 'mixed', sq)}
                            className="btn-outline py-1 px-2.5 text-xs font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10 flex items-center gap-1"
                            title={`Start "${sq.title || 'Sub-Quiz'}"`}
                          >
                            <Play className="w-3 h-3 fill-current" /> Play
                          </button>
                          <button
                            onClick={() => onSelectQuiz(quiz, 'image_speech', sq)}
                            className="btn-outline py-1 px-2 text-[11px] font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1"
                            title={`Image to Speech for "${sq.title || 'Sub-Quiz'}"`}
                          >
                            <ImageIcon className="w-3 h-3" />
                            <Mic className="w-3 h-3 text-amber-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Practice Modes */}
              <div className="space-y-3">
                <button
                  onClick={() => onSelectQuiz(quiz, 'mixed', null)}
                  className="btn-primary w-full justify-center text-sm py-3 font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Full Challenge</span>
                  <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold ml-1">
                    All Units
                  </span>
                </button>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-2 border-t border-white/10 text-xs">
                  <button
                    onClick={() => onSelectQuiz(quiz, 'visual', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium"
                    title="Visual Mode (All Sub-Quizzes)"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" /> Visual
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'audio', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium"
                    title="Listening Mode (All Sub-Quizzes)"
                  >
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" /> Audio
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'text', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium"
                    title="Reading Mode (All Sub-Quizzes)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Text
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'matching', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium"
                    title="Matching Mode (All Sub-Quizzes)"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Match
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'speech', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium border-amber-500/30 text-amber-300 hover:border-amber-400/60"
                    title="Speech Recognition Quiz Mode (All Sub-Quizzes)"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-400" /> Speech
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'blanks', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium border-purple-500/30 text-purple-300 hover:border-purple-400/60"
                    title="Fill in the Blanks (Cloze Question) Mode (All Sub-Quizzes)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" /> Blanks
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'image_speech', null)}
                    className="btn-outline justify-center py-2 px-1 text-[11px] font-medium border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60"
                    title="Image to Speech Match Quiz Mode (All Sub-Quizzes)"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Img Speech
                  </button>
                </div>

                {/* Share Link & Admin Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={(e) => handleShareQuiz(e, quiz)}
                    className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                      isCopied
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{isCopied ? 'Link Copied!' : 'Share Link'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 p-1 hover:bg-white/5 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${quiz.title}"?`)) onDeleteQuiz(quiz.id);
                      }}
                      className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 p-1 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Quiz Hero Card */}
        <div
          onClick={onCreateNew}
          className="glass-panel p-6 border-2 border-dashed border-white/20 hover:border-indigo-500/60 transition cursor-pointer flex flex-col items-center justify-center text-center min-h-[340px] group"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Plus className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Create Custom Quiz</h3>
          <p className="text-xs text-slate-400 max-w-xs">Add your own phrases, images, custom audio, and reward badges.</p>
        </div>
      </div>
    </div>
  );
}

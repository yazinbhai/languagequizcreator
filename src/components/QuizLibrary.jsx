import React, { useState, useEffect } from 'react';
import { Play, Plus, Eye, Headphones, BookOpen, Layers, Edit, Trash2, Zap, Star, Trophy, Clock, Filter, Download, Upload } from 'lucide-react';
import { getFavorites, toggleFavorite, getHighScores, exportQuizzesJSON, importQuizzesJSON } from '../services/quizStorage';

export default function QuizLibrary({ quizzes, onSelectQuiz, onCreateNew, onEditQuiz, onDeleteQuiz }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [highScores, setHighScores] = useState({});

  useEffect(() => {
    setFavorites(getFavorites());
    setHighScores(getHighScores());
  }, []);

  const handleToggleFav = (e, quizId) => {
    e.stopPropagation();
    const updated = toggleFavorite(quizId);
    setFavorites(updated);
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

  const categories = ['All', 'Favorites', 'Beginner', 'Advanced'];

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.targetLang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.userLang.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'Favorites') {
      return favorites.includes(q.id);
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

          return (
            <div
              key={quiz.id}
              className="glass-panel p-6 flex flex-col justify-between hover:border-indigo-500/40 transition duration-300 group relative"
            >
              <div>
                {/* Header Badges & Favorite Button */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-tag badge-blue font-bold">
                    {quiz.userLang} ➔ {quiz.targetLang}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="badge-tag badge-amber font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {quiz.gpConfig?.amount || 10} XP
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
                <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mb-6 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block">Visual</span>
                    <span className="font-bold text-sky-400">{quiz.config?.visual || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Listening</span>
                    <span className="font-bold text-emerald-400">{quiz.config?.audio || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Matching</span>
                    <span className="font-bold text-purple-400">{quiz.config?.matching || 0}</span>
                  </div>
                </div>
              </div>

              {/* Quick Practice Modes */}
              <div className="space-y-3">
                <button
                  onClick={() => onSelectQuiz(quiz, 'mixed')}
                  className="btn-primary w-full justify-center text-base py-3 shadow-lg shadow-indigo-500/25"
                >
                  <Play className="w-4 h-4 fill-white" /> START MIXED QUIZ
                </button>

                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-xs">
                  <button
                    onClick={() => onSelectQuiz(quiz, 'visual')}
                    className="btn-outline justify-center py-2 px-1 text-[11px]"
                    title="Visual Mode"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" /> Visual
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'audio')}
                    className="btn-outline justify-center py-2 px-1 text-[11px]"
                    title="Listening Mode"
                  >
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" /> Audio
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'text')}
                    className="btn-outline justify-center py-2 px-1 text-[11px]"
                    title="Reading Mode"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Text
                  </button>

                  <button
                    onClick={() => onSelectQuiz(quiz, 'matching')}
                    className="btn-outline justify-center py-2 px-1 text-[11px]"
                    title="Matching Mode"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> Match
                  </button>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
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

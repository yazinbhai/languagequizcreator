import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Plus, BookOpen, Layers, Flame, Zap, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

import QuizLibrary from './components/QuizLibrary';
import QuizCreator from './components/QuizCreator';
import QuizPlayer from './components/QuizPlayer';
import ResultsScreen from './components/ResultsScreen';
import UserProfileModal from './components/UserProfileModal';

import { getQuizzes, saveQuiz, deleteQuiz, getUserProfile, getLevelInfo, parseSharedQuizURL } from './services/quizStorage';
import { soundFx } from './utils/audio';

export default function App() {
  const [quizzes, setQuizzes] = useState([]);
  const [activeView, setActiveView] = useState('library'); // 'library' | 'creator' | 'player' | 'results'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedMode, setSelectedMode] = useState('mixed');
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [lastResults, setLastResults] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);

  useEffect(() => {
    // Check if opening a shareable link
    const sharedQuiz = parseSharedQuizURL();
    if (sharedQuiz) {
      setSelectedQuiz(sharedQuiz);
      setSelectedMode('mixed');
      setActiveView('player');
    }

    refreshData();
  }, []);

  const refreshData = () => {
    setQuizzes(getQuizzes());
    setUserProfile(getUserProfile());
  };

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleCreateNew = () => {
    setEditingQuiz(null);
    setActiveView('creator');
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setActiveView('creator');
  };

  const handleDeleteQuiz = (id) => {
    const updated = deleteQuiz(id);
    setQuizzes(updated);
  };

  const handleSaveQuiz = (quizData) => {
    const updated = saveQuiz(quizData);
    setQuizzes(updated);
    setActiveView('library');
    setEditingQuiz(null);
  };

  const handleSelectQuiz = (quiz, mode = 'mixed') => {
    setSelectedQuiz(quiz);
    setSelectedMode(mode);
    setActiveView('player');
  };

  const handleFinishQuiz = ({ score, total }) => {
    setLastResults({ score, total });
    setUserProfile(getUserProfile());
    setActiveView('results');
  };

  const handleBackToLibrary = () => {
    setActiveView('library');
    setSelectedQuiz(null);
    setLastResults(null);
    refreshData();
  };

  const levelInfo = getLevelInfo(userProfile?.totalPoints || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Brand Title */}
        <div
          onClick={handleBackToLibrary}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
            🌐
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Language Quiz Creator
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                V2.7 Pro UX
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Master Languages with Visual, Audio & Matching Quizzes</p>
          </div>
        </div>

        {/* Level Progress Bar (Center Desktop) */}
        <div className="hidden lg:flex flex-col items-center min-w-[200px]">
          <div className="flex items-center justify-between w-full text-xs mb-1 font-bold text-slate-300">
            <span>Level {levelInfo.level}: {levelInfo.name}</span>
            <span className="text-amber-400">{levelInfo.xpInCurrentLevel} / {levelInfo.levelSpan} XP</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Sound Effects & Audio' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Navigation Buttons */}
          {activeView !== 'library' && (
            <button
              onClick={handleBackToLibrary}
              className="btn-outline text-xs py-2 px-3"
            >
              <BookOpen className="w-4 h-4" /> Library
            </button>
          )}

          {activeView !== 'creator' && (
            <button
              onClick={handleCreateNew}
              className="btn-primary text-xs py-2 px-3"
            >
              <Plus className="w-4 h-4" /> Create Quiz
            </button>
          )}

          {/* Profile / Streak & XP Badge Button */}
          <button
            onClick={() => {
              setUserProfile(getUserProfile());
              setShowProfileModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer text-xs font-bold text-amber-300 shadow-sm"
          >
            <span className="flex items-center gap-1 text-rose-400 font-extrabold" title="Daily Streak">
              <Flame className="w-4 h-4 fill-rose-400" /> {userProfile?.streakDays || 0}
            </span>
            <div className="h-3.5 w-px bg-white/10" />
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              {userProfile?.totalPoints || 0} XP
            </span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {activeView === 'library' && (
          <QuizLibrary
            quizzes={quizzes}
            onSelectQuiz={handleSelectQuiz}
            onCreateNew={handleCreateNew}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        )}

        {activeView === 'creator' && (
          <QuizCreator
            initialQuiz={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={handleBackToLibrary}
          />
        )}

        {activeView === 'player' && selectedQuiz && (
          <QuizPlayer
            quiz={selectedQuiz}
            mode={selectedMode}
            onFinish={handleFinishQuiz}
            onExit={handleBackToLibrary}
          />
        )}

        {activeView === 'results' && selectedQuiz && lastResults && (
          <ResultsScreen
            quiz={selectedQuiz}
            score={lastResults.score}
            total={lastResults.total}
            onRetake={() => setActiveView('player')}
            onBackToLibrary={handleBackToLibrary}
          />
        )}
      </main>

      {/* Profile & Badges Modal */}
      {showProfileModal && (
        <UserProfileModal
          profile={userProfile}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={(updatedProfile) => {
            setUserProfile(updatedProfile);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

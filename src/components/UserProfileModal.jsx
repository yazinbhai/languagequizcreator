import React from 'react';
import { X, Award, Flame, Zap, CheckCircle2, ShieldCheck, RotateCcw } from 'lucide-react';
import { resetUserProfile } from '../services/quizStorage';

export default function UserProfileModal({ profile, onClose, onProfileUpdated }) {
  if (!profile) return null;

  const handleReset = () => {
    const resetProf = resetUserProfile();
    if (onProfileUpdated) onProfileUpdated(resetProf);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10 pr-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-2xl font-bold text-white">
              🎓
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Linguistic Adventurer</h2>
              <p className="text-sm text-slate-400">Rewards & Badges Vault</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition"
            title="Reset XP and Progress to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to 0 XP
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Zap className="w-5 h-5" />
              <span className="text-2xl font-extrabold">{profile.totalPoints || 0}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total XP Points</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-2xl font-extrabold">{profile.quizzesCompleted || 0}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Passed Quizzes</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-extrabold">{profile.streakDays || 0}</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Day Streak</span>
          </div>
        </div>

        {/* Points Breakdown by Type */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" /> Points by Category
          </h3>
          {Object.keys(profile.pointsByType || {}).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(profile.pointsByType || {}).map(([type, pts]) => (
                <div key={type} className="badge-tag badge-purple text-sm px-3 py-1.5">
                  <span className="capitalize">{type.replace('_', ' ')}:</span>
                  <span className="font-bold ml-1">{pts} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No points earned yet. Complete language quizzes to earn XP!</p>
          )}
        </div>

        {/* Unlocked Achievements */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Unlocked Badges ({profile.achievements?.length || 0})
          </h3>

          {profile.achievements && profile.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.achievements.map((ach) => (
                <div key={ach.id} className="glass-card p-4 flex items-center gap-4 border-l-4 border-emerald-500">
                  <div className="text-3xl p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-inner">
                    {ach.icon || '🏆'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{ach.title}</h4>
                    <p className="text-xs text-slate-400 mb-1">{ach.quizTitle}</p>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                      Unlocked on {ach.unlockedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-slate-400">
              <p className="text-sm">No badges unlocked yet. Complete language quizzes with 70%+ score to earn badges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Zap, RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, Flame, Trophy } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { awardRewards, recordHighScore } from '../services/quizStorage';

export default function ResultsScreen({ quiz, score, total, onRetake, onBackToLibrary }) {
  const percentage = Math.round((score / total) * 100);
  const passPercent = quiz.gpConfig?.passPercent ?? 70;
  const isPassed = percentage >= passPercent;

  const [rewardResult, setRewardResult] = useState(null);

  useEffect(() => {
    // Record High Score in Storage
    recordHighScore(quiz.id, score, total);

    if (isPassed) {
      soundFx.playCelebration();

      // Launch Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Process Rewards
      const res = awardRewards({
        quizId: quiz.id,
        quizTitle: quiz.title,
        gpConfig: quiz.gpConfig
      });
      setRewardResult(res);
    } else {
      soundFx.playError();
    }
  }, [quiz, score, total, isPassed]);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="glass-panel p-8 text-center relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 -z-10 ${
            isPassed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Status Header */}
        <div className="inline-flex p-4 rounded-3xl bg-slate-950/50 border border-white/10 mb-6 shadow-inner">
          <div className="text-4xl">{isPassed ? '🎉' : '💪'}</div>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          {isPassed ? 'Quiz Completed Successfully!' : 'Keep Practicing!'}
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          {isPassed
            ? `Outstanding work! You scored above the ${passPercent}% passing threshold.`
            : `You scored ${percentage}%. You need ${passPercent}% to pass and unlock rewards.`}
        </p>

        {/* Score Ring / Gauge */}
        <div className="glass-card p-6 max-w-sm mx-auto mb-8 border border-white/10">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 mb-1">
            {score} / {total}
          </div>
          <div className="text-xl font-bold text-white mb-2">{percentage}% Score</div>

          <div className="w-full bg-slate-950/60 h-3 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                isPassed
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Gamification Rewards Section */}
        {isPassed && rewardResult && (
          <div className="space-y-4 mb-8 animate-fade-in">
            {/* Points Awarded Card */}
            {rewardResult.pointsAdded > 0 && (
              <div className="glass-card p-4 border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base">+ {rewardResult.pointsAdded} XP Awarded!</h3>
                    <p className="text-xs text-amber-300/80">Category: {rewardResult.pointsType?.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className="badge-tag badge-amber text-xs font-extrabold">Points Claimed</span>
              </div>
            )}

            {/* Achievement Unlocked Modal Card */}
            {rewardResult.newBadgeUnlocked && (
              <div className="glass-card p-5 border-2 border-emerald-500 bg-emerald-500/15 animate-badge-pop text-left relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                    {rewardResult.newBadgeUnlocked.icon || '🏆'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      NEW BADGE UNLOCKED!
                    </span>
                    <h3 className="text-lg font-extrabold text-white">
                      {rewardResult.newBadgeUnlocked.title}
                    </h3>
                    <p className="text-xs text-slate-300">Added to your Badges Vault</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onRetake} className="btn-secondary w-full sm:w-auto justify-center">
            <RefreshCw className="w-4 h-4" /> Retake Quiz
          </button>
          <button onClick={onBackToLibrary} className="btn-primary w-full sm:w-auto justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}

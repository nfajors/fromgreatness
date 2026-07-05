import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';
import { useAppData } from '@/hooks/useAppData';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import AssessmentOverview from '@/components/assessments/AssessmentOverview';
import PersonalityTest from '@/components/assessments/PersonalityTest';
import AchievementTest from '@/components/assessments/AchievementTest';
import CulturalIdentityTest from '@/components/assessments/CulturalIdentityTest';
import type { AssessmentStatus, AssessmentView } from '@/components/assessments/types';
import type { AssessmentAnswers } from '@/components/assessments/types';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const { selectedStudentId } = useAppData();
  const utils = trpc.useUtils();
  const [view, setView] = useState<AssessmentView>('overview');
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    personality: {},
    achievement: {},
    cultural: {},
  });

  // Load assessments from backend
  const { data: dbAssessments } = trpc.assessment.listByStudent.useQuery(
    { studentId: selectedStudentId ?? 0 },
    { enabled: !!selectedStudentId }
  );

  // Create assessment mutation
  const getOrCreate = trpc.assessment.getOrCreate.useMutation();
  const submitAssessment = trpc.assessment.submitResponse.useMutation();

  // Map a UI assessment key to the DB `type` value.
  const dbType = (key: string): 'personality' | 'achievement' | 'cultural_identity' =>
    key === 'cultural' ? 'cultural_identity' : (key as 'personality' | 'achievement');

  // Ensure an assessment record exists, submit its results, then refresh the
  // list so the overview reflects completion and unlocks the next test.
  const completeAssessment = async (
    key: 'personality' | 'achievement' | 'cultural',
    payload: { responses: Record<string, unknown>; score?: number; traits?: string[] },
  ) => {
    if (!selectedStudentId) return;
    const type = dbType(key);
    // Ensure the record exists (create if the user never triggered start).
    const record = await getOrCreate.mutateAsync({
      studentId: selectedStudentId,
      type,
    });
    if (!record) return;
    await submitAssessment.mutateAsync({
      id: record.id,
      responses: payload.responses ?? {},
      score: payload.score,
      traits: payload.traits,
    });
    // Refresh so status flips to completed and the next test unlocks.
    await utils.assessment.listByStudent.invalidate({ studentId: selectedStudentId });
  };

  // Derive statuses from DB
  const getStatus = (type: string): AssessmentStatus => {
    // The cultural card uses key "cultural" but the DB stores "cultural_identity".
    const dbTypeForCard = type === 'cultural' ? 'cultural_identity' : type;
    if (!dbAssessments) return type === 'personality' ? 'not_started' : 'locked';
    const a = dbAssessments.find(x => x.type === dbTypeForCard);
    if (a?.status === 'completed') return 'completed';
    if (a?.status === 'in_progress') return 'in_progress';
    // Unlock if previous is completed
    if (type === 'achievement') {
      const prev = dbAssessments.find(x => x.type === 'personality');
      return prev?.status === 'completed' ? 'not_started' : 'locked';
    }
    if (type === 'cultural') {
      const prev = dbAssessments.find(x => x.type === 'achievement');
      return prev?.status === 'completed' ? 'not_started' : 'locked';
    }
    return 'not_started';
  };

  const statuses: Record<string, AssessmentStatus> = {
    personality: getStatus('personality'),
    achievement: getStatus('achievement'),
    cultural: getStatus('cultural'),
  };

  const handleStart = async (id: string) => {
    if (selectedStudentId) {
      await getOrCreate.mutateAsync({
        studentId: selectedStudentId,
        type: dbType(id),
      });
      await utils.assessment.listByStudent.invalidate({ studentId: selectedStudentId });
    }
    setView(id as AssessmentView);
  };

  const handlePersonalityComplete = async () => {
    const traitScores = Object.values(answers.personality || {}).reduce(
      (sum: number, v) => sum + (typeof v === 'number' ? v : 0),
      0,
    );
    const answered = Object.keys(answers.personality || {}).length;
    const avgScore = answered > 0 ? traitScores / answered : 50;
    await completeAssessment('personality', {
      responses: answers.personality ?? {},
      score: Math.round(avgScore),
      traits:
        avgScore > 70
          ? ['Curious', 'Creative', 'Determined']
          : avgScore > 40
            ? ['Thoughtful', 'Balanced']
            : ['Growing', 'Learning'],
    });
    setView('overview');
  };

  const handleAchievementComplete = async () => {
    const correct = Object.values(answers.achievement || {}).filter(v => v === 1).length;
    const total = Object.keys(answers.achievement || {}).length || 25;
    await completeAssessment('achievement', {
      responses: answers.achievement ?? {},
      score: Math.round((correct / total) * 100),
    });
    setView('overview');
  };

  const handleCulturalComplete = async () => {
    await completeAssessment('cultural', {
      responses: answers.cultural ?? {},
    });
    setView('complete');
  };

  const handleSavePersonality = useCallback((personalityAnswers: Record<number, number>) => {
    setAnswers(prev => ({ ...prev, personality: personalityAnswers }));
  }, []);

  const handleSaveAchievement = useCallback((achievementAnswers: Record<number, number>) => {
    setAnswers(prev => ({ ...prev, achievement: achievementAnswers }));
  }, []);

  const handleSaveCultural = useCallback((culturalAnswers: Record<number, number | number[] | string>) => {
    setAnswers(prev => ({ ...prev, cultural: culturalAnswers }));
  }, []);

  const handleBack = () => {
    if (view !== 'overview') {
      setView('overview');
    } else {
      navigate('/onboarding');
    }
  };

  const titles: Record<string, string> = {
    overview: 'Your Assessments',
    personality: 'Personality Test',
    achievement: 'Achievement Test',
    cultural: 'Cultural Identity',
    complete: 'All Done!',
  };

  return (
    <AppShell
      title={titles[view] || 'Your Assessments'}
      showBack={view !== 'complete'}
      onBack={handleBack}
    >
      <div className="min-h-[100dvh] bg-baseIndigo">
        <AnimatePresence mode="wait">
          {view === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <AssessmentOverview
                childName="Your Child"
                statuses={statuses}
                onStart={handleStart}
              />
            </motion.div>
          )}

          {view === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <PersonalityTest
                onComplete={handlePersonalityComplete}
                onExit={() => setView('overview')}
                savedAnswers={answers.personality}
                onSave={handleSavePersonality}
              />
            </motion.div>
          )}

          {view === 'achievement' && (
            <motion.div
              key="achievement"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <AchievementTest
                onComplete={handleAchievementComplete}
                onExit={() => setView('overview')}
                savedAnswers={answers.achievement}
                onSave={handleSaveAchievement}
              />
            </motion.div>
          )}

          {view === 'cultural' && (
            <motion.div
              key="cultural"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              <CulturalIdentityTest
                onComplete={handleCulturalComplete}
                onExit={() => setView('overview')}
                savedAnswers={answers.cultural}
                onSave={handleSaveCultural}
              />
            </motion.div>
          )}

          {view === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="px-5 py-8 min-h-[100dvh] flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-[rgba(0,200,83,0.1)] border-2 border-[#00C853] flex items-center justify-center mb-6"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, ease: easeOutExpo }}
                className="font-display text-3xl font-medium text-white text-center mb-2"
              >
                All Assessments Complete!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, ease: easeOutExpo }}
                className="text-[#CBD5E1] text-center mb-8"
              >
                Great work! You&apos;re ready for the next step.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, ease: easeOutExpo }}
                className="flex flex-col gap-3 w-full max-w-sm mb-8"
              >
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.2)]">
                  <div className="w-8 h-8 rounded-full bg-[rgba(0,200,83,0.1)] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#CBD5E1]">Personality Test</span>
                  <span className="ml-auto text-xs text-[#00C853] font-mono">Done</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.2)]">
                  <div className="w-8 h-8 rounded-full bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#CBD5E1]">Achievement Test</span>
                  <span className="ml-auto text-xs text-[#F59E0B] font-mono">Done</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(248,187,208,0.05)] border border-[rgba(248,187,208,0.2)]">
                  <div className="w-8 h-8 rounded-full bg-[rgba(248,187,208,0.1)] flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F8BBD0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#CBD5E1]">Cultural Identity Test</span>
                  <span className="ml-auto text-xs text-[#F8BBD0] font-mono">Done</span>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, ease: easeOutExpo }}
                onClick={() => navigate('/dna-upload')}
                className="glass-btn"
              >
                Continue to DNA Upload
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

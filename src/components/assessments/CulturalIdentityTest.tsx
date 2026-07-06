import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Heart, Camera, Square, RotateCcw, Save, SkipForward, CheckCircle2, Mic } from 'lucide-react';
import { culturalQuestions, videoPrompts } from './data';

interface CulturalIdentityTestProps {
  onComplete: () => void;
  onExit: () => void;
  savedAnswers?: Record<number, number | number[] | string>;
  onSave: (answers: Record<number, number | number[] | string>) => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function CulturalIdentityTest({ onComplete, onExit, savedAnswers = {}, onSave }: CulturalIdentityTestProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[] | string>>(savedAnswers);
  const [direction, setDirection] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [videoPhase, setVideoPhase] = useState<'idle' | 'recording' | 'review'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [textDraft, setTextDraft] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const livePreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const question = culturalQuestions[currentQ];
  const totalQuestions = culturalQuestions.length;
  const progress = ((currentQ + 1) / totalQuestions) * 100;

  // Auto-save text draft
  useEffect(() => {
    if (question?.type === 'text' && textDraft) {
      const timer = setTimeout(() => {
        setAnswers(prev => {
          const next = { ...prev, [question.id]: textDraft };
          onSave(next);
          return next;
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [textDraft, question, onSave]);

  // Recording timer
  useEffect(() => {
    if (videoPhase === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 119) {
            stopRecording();
            return 120;
          }
          return t + 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [videoPhase]);

  const handleMultipleAnswer = (idx: number) => {
    setAnswers(prev => {
      const next = { ...prev, [question.id]: idx };
      onSave(next);
      return next;
    });
  };

  const handleRatingAnswer = (val: number) => {
    setAnswers(prev => {
      const next = { ...prev, [question.id]: val };
      onSave(next);
      return next;
    });
  };

  const handleMultiselect = (idx: number) => {
    setAnswers(prev => {
      const current = (prev[question.id] as number[]) || [];
      const updated = current.includes(idx)
        ? current.filter(i => i !== idx)
        : [...current, idx];
      const next = { ...prev, [question.id]: updated };
      onSave(next);
      return next;
    });
  };

  const handleTextAnswer = () => {
    if (!textDraft.trim()) return;
    setAnswers(prev => {
      const next = { ...prev, [question.id]: textDraft };
      onSave(next);
      return next;
    });
  };

  const handleNext = () => {
    if (question.type === 'text') handleTextAnswer();
    if (currentQ < totalQuestions - 1) {
      setDirection(1);
      setCurrentQ(q => q + 1);
      setTextDraft('');
    } else {
      setShowVideo(true);
    }
  };

  const handlePrev = () => {
    if (showVideo) {
      setShowVideo(false);
      return;
    }
    if (currentQ > 0) {
      setDirection(-1);
      setCurrentQ(q => q - 1);
      setTextDraft('');
    }
  };

  const startRecording = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // Show the live camera feed so the user sees themselves while recording.
      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = stream;
        livePreviewRef.current.muted = true;
        await livePreviewRef.current.play().catch(() => {});
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setVideoPhase('recording');
      setRecordingTime(0);
    } catch (err) {
      // Honest failure: tell the user the camera couldn't start instead of
      // silently "simulating" a recording (which produced audio-only/black video).
      const name = err instanceof Error ? err.name : '';
      setCameraError(
        name === 'NotAllowedError'
          ? 'Camera access was blocked. Please allow camera and microphone permissions in your browser, then try again.'
          : name === 'NotFoundError'
            ? 'No camera was found on this device. You can skip the video or type your response instead.'
            : 'We couldn\u2019t start the camera. Check permissions and that no other app is using it, then try again.',
      );
      setVideoPhase('idle');
    }
  };

  // Keep the live preview wired if the element mounts after the stream starts.
  useEffect(() => {
    if (videoPhase === 'recording' && livePreviewRef.current && streamRef.current) {
      livePreviewRef.current.srcObject = streamRef.current;
      livePreviewRef.current.play().catch(() => {});
    }
  }, [videoPhase]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setVideoPhase('review');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const retake = () => {
    setVideoBlob(null);
    setVideoPhase('idle');
    setRecordingTime(0);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Completion screen
  if (showComplete) {
    return (
      <div className="px-5 py-8 min-h-[100dvh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.1, 1] }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="w-20 h-20 rounded-full bg-[rgba(248,187,208,0.1)] border-2 border-[#F8BBD0] flex items-center justify-center mb-6"
        >
          <Heart className="w-10 h-10 text-[#F8BBD0]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: easeOutExpo }}
          className="font-display text-3xl font-medium text-white text-center mb-2"
        >
          Cultural Identity Complete!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: easeOutExpo }}
          className="text-[#CBD5E1] text-center mb-8"
        >
          You did it! All assessments are finished.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: easeOutExpo }}
          className="w-full max-w-sm mb-8"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-3 text-center">What happens next</p>
          {[
            { icon: '⬆', text: 'Upload DNA data (or we\'ll use your survey answers)' },
            { icon: '🧬', text: 'AI analyzes your heritage' },
            { icon: '📚', text: 'Your study plan is generated' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2, ease: easeOutExpo }}
              className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
            >
              <span className="text-lg">{step.icon}</span>
              <span className="text-sm text-[#CBD5E1]">{step.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, ease: easeOutExpo }}
          onClick={onComplete}
          className="glass-btn"
        >
          Continue to DNA Upload
        </motion.button>
      </div>
    );
  }

  // Video recording section
  if (showVideo) {
    return (
      <div className="min-h-[100dvh] flex flex-col px-5 py-4">
        {/* Progress header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Video Recording</span>
            <span className="text-[10px] text-[#F8BBD0] font-mono">Optional</span>
          </div>
          <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
            <div className="h-full rounded-full w-full" style={{ background: 'linear-gradient(90deg, #F8BBD0, #00C853)' }} />
          </div>
        </div>

        {/* Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass p-4 mb-4"
        >
          <h3 className="font-body text-base font-semibold text-white mb-2">
            Share a story about your family!
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-[#F8BBD0]" />
            <p className="text-sm text-[#CBD5E1] italic">
              &ldquo;{videoPrompts[currentPrompt]}&rdquo;
            </p>
          </div>
          <button
            onClick={() => setCurrentPrompt(p => (p + 1) % videoPrompts.length)}
            className="text-xs text-[#64748B] hover:text-[#F8BBD0] transition-colors"
          >
            Get another prompt
          </button>
          <p className="text-xs text-[#64748B] mt-2">This is optional — skip if you prefer</p>
        </motion.div>

        {/* Video Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            {videoPhase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full aspect-[3/4] max-h-[320px] rounded-2xl bg-[rgba(255,255,255,0.03)] border-2 border-dashed border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center relative overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-16 h-16 text-[#64748B] mb-4" />
                </motion.div>
                <p className="text-sm text-[#CBD5E1] mb-1">Tap the record button to start</p>
                <p className="text-xs text-[#64748B]">Max 2 minutes</p>
              </motion.div>
            )}

            {videoPhase === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full aspect-[3/4] max-h-[320px] rounded-2xl bg-[#1E293B] border-2 border-[#F87171] flex flex-col items-center justify-center relative overflow-hidden"
                style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
              >
                {/* Live camera feed so the user sees themselves while recording */}
                <video
                  ref={livePreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[rgba(248,113,113,0.2)] px-3 py-1 rounded-full flex items-center gap-2 z-10">
                  <div className="w-2 h-2 rounded-full bg-[#F87171] animate-pulse" />
                  <span className="text-sm font-mono text-[#F87171]">{formatTime(recordingTime)}</span>
                </div>
              </motion.div>
            )}

            {videoPhase === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full aspect-[3/4] max-h-[320px] rounded-2xl bg-[#1E293B] border border-[rgba(255,255,255,0.08)] flex flex-col items-center justify-center relative overflow-hidden"
              >
                {videoBlob ? (
                  <video src={videoBlob} className="w-full h-full object-cover rounded-2xl" controls />
                ) : (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-[#00C853] mb-4" />
                    <p className="text-sm text-[#CBD5E1]">Recording saved!</p>
                    <p className="text-xs text-[#64748B]">{formatTime(recordingTime)}</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {cameraError && (
            <p className="text-xs text-[#F87171] mt-3 text-center px-4" role="alert">
              {cameraError}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {videoPhase === 'idle' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-[72px] h-[72px] rounded-full border-4 border-[#F87171] flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#F87171]" />
            </motion.button>
          )}

          {videoPhase === 'recording' && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-[72px] h-[72px] rounded-full border-4 border-[#F87171] flex items-center justify-center bg-[rgba(248,113,113,0.1)]"
            >
              <Square className="w-8 h-8 text-[#F87171]" />
            </motion.button>
          )}

          {videoPhase === 'review' && (
            <div className="flex items-center gap-4">
              <button onClick={retake} className="ghost-btn flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={() => setShowComplete(true)}
                className="glass-btn flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save & Continue
              </button>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="ghost-btn flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setShowComplete(true)}
            className="text-xs text-[#64748B] hover:text-lightSilver flex items-center gap-1 transition-colors"
          >
            <SkipForward className="w-3 h-3" /> Skip
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
            Question {currentQ + 1} of {totalQuestions}
          </span>
          <span className="text-[10px] text-[#F8BBD0] font-mono">
            {Object.keys(answers).filter(k => Number(k) <= totalQuestions).length}/{totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #F8BBD0, #00C853)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-6 flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQ}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="liquid-glass p-6 flex-1 flex flex-col"
          >
            <div className="mb-6">
              <span className="font-mono text-sm text-[#F8BBD0] mb-2 block">
                Q{question.id}
              </span>
              <h3 className="font-body text-xl font-semibold text-white leading-relaxed">
                {question.text}
              </h3>
            </div>

            {/* Multiple Choice */}
            {question.type === 'multiple' && (
              <div className="flex flex-col gap-3 flex-1">
                {question.options?.map((option, idx) => {
                  const isSelected = answers[question.id] === idx;
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMultipleAnswer(idx)}
                      className={`w-full text-left px-4 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? 'border-[#F8BBD0] bg-[rgba(248,187,208,0.08)]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)]'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Check className="w-5 h-5 text-[#F8BBD0]" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Rating Scale */}
            {question.type === 'rating' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {question.options?.map((val) => {
                      const numVal = Number(val);
                      const isSelected = (answers[question.id] as number) >= numVal;
                      return (
                        <motion.button
                          key={val}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRatingAnswer(numVal)}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'border-[#00C853] bg-[rgba(0,200,83,0.15)] text-[#00C853]'
                                : 'border-[rgba(255,255,255,0.1)] text-[#64748B]'
                            }`}
                          >
                            {val}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-4 px-1">
                    <span className="text-xs text-[#64748B]">Not connected</span>
                    <span className="text-xs text-[#64748B]">Very connected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-select Chips */}
            {question.type === 'multiselect' && (
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {question.options?.map((option, idx) => {
                    const current = (answers[question.id] as number[]) || [];
                    const isSelected = current.includes(idx);
                    return (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMultiselect(idx)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#00C853] bg-[rgba(0,200,83,0.08)] text-[#00C853]'
                            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#CBD5E1] hover:border-[rgba(255,255,255,0.15)]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Open Text */}
            {question.type === 'text' && (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={textDraft}
                  onChange={e => setTextDraft(e.target.value)}
                  placeholder="Type your answer here..."
                  maxLength={question.maxLength}
                  rows={4}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-3 text-sm text-white placeholder-[#334155] focus:outline-none focus:border-[#00C853] focus:shadow-[0_0_12px_rgba(0,200,83,0.2)] transition-all resize-none flex-1"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#64748B]">
                    {textDraft.length} / {question.maxLength}
                  </span>
                  <span className="text-xs text-[#64748B]">Auto-saves every 5s</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentQ === 0}
            className={`ghost-btn flex items-center gap-2 ${currentQ === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
            onClick={onExit}
            className="text-xs text-[#64748B] hover:text-lightSilver transition-colors"
          >
            Save & Exit
          </button>
          <button
            onClick={handleNext}
            className="glass-btn flex items-center gap-2"
          >
            {currentQ === totalQuestions - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

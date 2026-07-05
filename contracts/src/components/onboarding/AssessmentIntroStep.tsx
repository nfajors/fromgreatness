import { motion } from 'framer-motion';
import { Brain, Trophy, Heart, Clock } from 'lucide-react';

interface AssessmentIntroStepProps {
  studentName?: string;
  onBegin: () => void;
  onBack: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

const assessments = [
  {
    icon: Brain,
    iconColor: '#00C853',
    bgColor: 'rgba(0,200,83,0.1)',
    title: 'Personality Test',
    duration: '5-7 minutes',
    description:
      'A fun questionnaire that helps us understand your child\'s learning style, interests, and personality traits.',
    detail: '30 multiple-choice questions',
  },
  {
    icon: Trophy,
    iconColor: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.1)',
    title: 'Achievement Test',
    duration: '10-15 minutes',
    description:
      'A quiz that assesses your child\'s current knowledge across the four cultural domains.',
    detail: 'Helps us set the right starting level',
  },
  {
    icon: Heart,
    iconColor: '#F8BBD0',
    bgColor: 'rgba(248,187,208,0.1)',
    title: 'Cultural Identity Test',
    duration: '5-10 minutes',
    description:
      'A survey about your child\'s current cultural knowledge and connection, plus optional video responses.',
    detail: 'Share stories about family traditions',
  },
];

export default function AssessmentIntroStep({
  studentName,
  onBegin,
  onBack,
}: AssessmentIntroStepProps) {
  return (
    <motion.div
      className="px-4 pt-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.p className="section-label mb-2" variants={itemVariants}>
        STEP 5 OF 5
      </motion.p>
      <motion.h2
        className="font-display text-[28px] font-medium text-white mb-2"
        variants={itemVariants}
      >
        Almost There!
      </motion.h2>
      <motion.p className="text-lightSilver mb-6" variants={itemVariants}>
        {studentName
          ? `${studentName} will now complete three quick assessments. Here's what to expect:`
          : "Your child will now complete three quick assessments. Here's what to expect:"}
      </motion.p>

      {/* Assessment Cards */}
      <motion.div className="space-y-4 mb-8" variants={containerVariants}>
        {assessments.map((assessment) => {
          const Icon = assessment.icon;
          return (
            <motion.div
              key={assessment.title}
              variants={itemVariants}
              className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: assessment.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: assessment.iconColor }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-body text-sm font-semibold text-white">
                      {assessment.title}
                    </h3>
                    <span className="pill-badge text-[10px] px-2 py-0.5 !text-[#64748B] !border-[rgba(255,255,255,0.12)] !bg-[rgba(255,255,255,0.05)]">
                      {assessment.duration}
                    </span>
                  </div>
                  <p className="text-sm text-lightSilver leading-relaxed">
                    {assessment.description}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">{assessment.detail}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Total Time */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-6"
        variants={itemVariants}
      >
        <Clock className="w-4 h-4 text-[#64748B]" />
        <span className="text-sm text-lightSilver">
          Total estimated time: <span className="text-white font-medium">20–30 minutes</span>
        </span>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        type="button"
        onClick={onBegin}
        className="glass-btn w-full h-[52px] text-base rounded-full mb-4 animate-glow-pulse"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Begin Assessments
      </motion.button>

      {/* Note */}
      <motion.p
        className="text-center text-xs text-[#64748B] mb-4"
        variants={itemVariants}
      >
        Your child can take breaks between assessments. Progress is saved automatically.
      </motion.p>

      {/* Back Button */}
      <motion.button
        type="button"
        onClick={onBack}
        className="ghost-btn w-full h-12 text-sm rounded-full"
        variants={itemVariants}
      >
        Back
      </motion.button>
    </motion.div>
  );
}

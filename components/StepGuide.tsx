import React from 'react';
import { Step, Module } from '../types';
import { CheckCircle, Circle, ArrowRight, Lightbulb, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepGuideProps {
  module: Module;
  currentStepIndex: number;
  onNext: () => void;
  canAdvance: boolean;
}

const StepGuide: React.FC<StepGuideProps> = ({ module, currentStepIndex, onNext, canAdvance }) => {
  const step = module.steps[currentStepIndex];

  return (
    <div className="bg-robot-panel border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-redis-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
            <h3 className="text-redis-400 text-xs font-bold uppercase tracking-widest mb-1">
                Module {module.id.split('_')[1]} • Step {currentStepIndex + 1}/{module.steps.length}
            </h3>
            <h2 className="text-xl md:text-2xl font-bold text-white">{step.analogy}</h2>
        </div>
        <div className="hidden md:flex gap-1">
            {module.steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-redis-500' : idx < currentStepIndex ? 'bg-green-500' : 'bg-slate-700'}`} 
                />
            ))}
        </div>
      </div>

      {/* Content */}
      <motion.div 
        key={step.step_id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 z-10"
      >
        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {step.explanation}
        </p>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-start gap-3">
            <Code className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Command Syntax</div>
                <code className="font-mono text-blue-300 text-sm md:text-base">{step.command}</code>
            </div>
        </div>

        <div className="bg-redis-900/20 border border-redis-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-white">Your Task</span>
            </div>
            <p className="text-slate-200 text-sm">{step.task}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="mt-auto pt-4 flex justify-end z-10">
        <button
            onClick={onNext}
            disabled={!canAdvance}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300
                ${canAdvance 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }
            `}
        >
            {canAdvance ? (currentStepIndex === module.steps.length - 1 ? 'Finish Module' : 'Next Step') : 'Complete Task'}
            {canAdvance ? <ArrowRight className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default StepGuide;
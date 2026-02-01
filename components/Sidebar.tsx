import React from 'react';
import { Module } from '../types';
import { CheckCircle, Lock, PlayCircle, Check, ChevronRight, Github, Linkedin, Globe } from 'lucide-react';

interface SidebarProps {
  modules: Module[];
  currentModuleId: string;
  completedModules: string[];
  currentStepIndex: number;
  onSelectModule: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ modules, currentModuleId, completedModules, currentStepIndex, onSelectModule }) => {
  return (
    <div className="w-full md:w-64 bg-robot-panel border-r border-slate-700/50 flex flex-col hidden md:flex h-full shadow-2xl z-20">
      <div className="p-6 border-b border-slate-700/50 shrink-0">
        <h1 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
            <span className="text-redis-500">Redis</span> Playground
        </h1>
        <p className="text-xs text-slate-500 mt-1">The Robot Warehouse</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {modules.map((module, idx) => {
          const isCompleted = completedModules.includes(module.id);
          const isCurrent = currentModuleId === module.id;
          const isLocked = !isCompleted && !isCurrent && idx > 0 && !completedModules.includes(modules[idx - 1].id);

          return (
            <div key={module.id} className="mb-2">
              <button
                onClick={() => !isLocked && onSelectModule(module.id)}
                className={`w-full text-left px-6 py-3 border-l-4 transition-all hover:bg-slate-800/50 ${
                  isCurrent 
                    ? 'border-redis-500 bg-slate-800/50' 
                    : 'border-transparent'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase ${isCurrent ? 'text-redis-400' : 'text-slate-500'}`}>
                    Module {idx + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-slate-600" />
                  ) : isCurrent ? (
                    <PlayCircle className="w-4 h-4 text-redis-500" />
                  ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                  )}
                </div>
                <h3 className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                  {module.title.split(':')[1] || module.title}
                </h3>
              </button>

              {/* Detailed Step List for Current Module */}
              {isCurrent && (
                <div className="px-4 py-3 bg-black/20 border-y border-slate-800/50">
                    <div className="space-y-1.5">
                        {module.steps.map((step, sIdx) => {
                            const isStepCompleted = sIdx < currentStepIndex;
                            const isStepCurrent = sIdx === currentStepIndex;
                            
                            return (
                                <div key={step.step_id} className={`
                                    relative overflow-hidden rounded-lg transition-all duration-300
                                    ${isStepCurrent 
                                        ? 'bg-slate-800/80 border border-redis-500/30 shadow-lg shadow-black/20' 
                                        : 'hover:bg-slate-800/30 border border-transparent'}
                                `}>
                                    {isStepCurrent && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-redis-500" />
                                    )}
                                    
                                    <div className={`flex items-start gap-3 p-2.5 ${isStepCurrent ? 'pl-3.5' : 'pl-2.5'}`}>
                                        <div className="shrink-0 pt-1">
                                            {isStepCompleted ? (
                                                <div className="bg-green-500/10 p-0.5 rounded-full">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                </div>
                                            ) : isStepCurrent ? (
                                                <div className="relative flex items-center justify-center w-4 h-4">
                                                    <div className="absolute w-full h-full bg-redis-500 rounded-full animate-ping opacity-20" />
                                                    <div className="w-1.5 h-1.5 bg-redis-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-mono font-bold ${
                                                    isStepCurrent ? 'text-white' : 
                                                    isStepCompleted ? 'text-slate-500 line-through' : 'text-slate-500'
                                                }`}>
                                                    {step.command.split(' ')[0]}
                                                </span>
                                                {isStepCurrent && (
                                                    <ChevronRight className="w-3 h-3 text-redis-500 animate-pulse" />
                                                )}
                                            </div>
                                            
                                            {isStepCurrent && (
                                                <div className="text-[10px] text-slate-400 mt-1 leading-tight font-sans">
                                                    {step.task}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Social Section */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 shrink-0">
        <div className="flex justify-center items-center gap-5 mb-3">
            <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-110 hover:rotate-3" aria-label="GitHub">
                <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-all transform hover:scale-110 hover:-rotate-3" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-all transform hover:scale-110 hover:rotate-3" aria-label="Portfolio">
                <Globe className="w-5 h-5" />
            </a>
        </div>
        <div className="text-[10px] text-slate-600 text-center font-mono uppercase tracking-widest opacity-70">
           Redis Playground
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
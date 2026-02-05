import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { RedisStore, CommandResult } from './types';
import { executeCommand, checkExpirations } from './services/mockRedis';
import Terminal from './components/Terminal';
import WarehouseVisualizer from './components/WarehouseVisualizer';
import StepGuide from './components/StepGuide';
import Sidebar from './components/Sidebar';
import { Menu, X, Terminal as TerminalIcon, Database, Github, Linkedin, Globe, ChevronRight, Play, CheckCircle, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = useState(CURRICULUM.modules[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [store, setStore] = useState<RedisStore>({});
  const [history, setHistory] = useState<Array<{ command: string; output: string; status: 'success' | 'error' }>>([]);
  const [canAdvance, setCanAdvance] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'terminal' | 'visualizer'>('terminal');

  const currentModule = CURRICULUM.modules.find(m => m.id === currentModuleId)!;
  
  // Game Loop for Expiration
  useEffect(() => {
    const interval = setInterval(() => {
        const newStore = checkExpirations(store);
        if (newStore) {
            setStore(newStore);
        }
    }, 100); // Check every 100ms
    return () => clearInterval(interval);
  }, [store]);

  // Check if task is completed
  useEffect(() => {
    const step = currentModule.steps[currentStepIndex];
    
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (lastEntry.status === 'success') {
            const userCmd = lastEntry.command.toLowerCase().trim();
            const expectedCmd = step.input_code.toLowerCase().trim();
            
            // Allow exact match or logic-based validation
            const isExactMatch = userCmd === expectedCmd;
            
            // Specific validation helpers
            const keyMatches = (key: string, val: any) => store[key]?.value === val;
            const keyExists = (key: string) => !!store[key];
            const keyDeleted = (key: string) => !store[key];
            
            if (isExactMatch) {
                setCanAdvance(true);
            } else if (step.command.startsWith("SET") && expectedCmd.includes("user:name") && keyMatches("user:name", "Alice")) {
                 setCanAdvance(true);
            } else if (step.command.startsWith("DEL") && expectedCmd.includes("user:name") && keyDeleted("user:name")) {
                setCanAdvance(true);
            } else if (step.command.startsWith("LPUSH") && keyExists("todo_list")) {
                if (store["todo_list"].value[0] === "urgent_task") setCanAdvance(true);
            } else if (step.command.startsWith("FLUSHALL") && Object.keys(store).length === 0) {
                setCanAdvance(true);
            }
        }
    }
  }, [store, history, currentModule, currentStepIndex]);


  const handleExecute = (cmdInput: string) => {
    const result: CommandResult = executeCommand(cmdInput, store);
    
    setHistory(prev => [...prev, {
        command: cmdInput,
        output: result.output,
        status: result.output.startsWith('(error)') ? 'error' : 'success'
    }]);

    if (result.newStore) {
        setStore(result.newStore);
    }
  };

  const handleNext = () => {
    setCanAdvance(false);
    if (currentStepIndex < currentModule.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
    } else {
        if (!completedModules.includes(currentModuleId)) {
            setCompletedModules(prev => [...prev, currentModuleId]);
        }
        
        const currIdx = CURRICULUM.modules.findIndex(m => m.id === currentModuleId);
        if (currIdx < CURRICULUM.modules.length - 1) {
            setCurrentModuleId(CURRICULUM.modules[currIdx + 1].id);
            setCurrentStepIndex(0);
        } else {
            alert("Congratulations! You've mastered the Robot Warehouse basics!");
        }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-robot-dark text-slate-200 font-sans overflow-hidden">
      
      {/* Unified Header - Shows on ALL screen sizes (Android, Tablet, Desktop) */}
      <header className="w-full bg-robot-panel border-b border-slate-700/50 shrink-0 fixed top-0 left-0 right-0 shadow-lg" style={{ zIndex: 9999, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-redis-500/10 flex items-center justify-center border border-redis-500/20">
                <Database className="w-5 h-5 text-redis-500" />
            </div>
            <div>
                <h1 className="font-bold text-white text-sm leading-none">
                    <span className="text-redis-500">Redis</span> Playground
                </h1>
                <p className="text-[10px] text-slate-500 mt-0.5">The Robot Warehouse</p>
            </div>
        </div>
        <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-slate-300 hover:text-white transition-colors active:scale-95 flex items-center justify-center"
            style={{ minWidth: '48px', minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            type="button"
        >
            {mobileMenuOpen ? <X className="w-6 h-6 text-red-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>
      
      {/* Spacer for fixed header - Shows on ALL screen sizes */}
      <div style={{ height: '60px' }} />

      {/* Sidebar Overlay - Below Header - Shows on ALL screen sizes */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col"
            style={{ zIndex: 9998, paddingTop: '60px' }}
        >
             <div className="flex-1 overflow-y-auto px-4 py-4">
                 <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database className="w-3 h-3" /> Training Modules
                 </h2>
                 <div className="space-y-3">
                 {CURRICULUM.modules.map((module, idx) => {
                    const isCurrent = currentModuleId === module.id;
                    const isCompleted = completedModules.includes(module.id);
                    const isLocked = !isCompleted && !isCurrent && idx > 0 && !completedModules.includes(CURRICULUM.modules[idx - 1].id);

                    return (
                        <button 
                            key={module.id}
                            disabled={isLocked}
                            onClick={() => {
                                if (!isLocked) {
                                    setCurrentModuleId(module.id);
                                    setCurrentStepIndex(0);
                                    setMobileMenuOpen(false);
                                }
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                                isCurrent 
                                ? 'bg-gradient-to-r from-redis-900/40 to-slate-800/50 border-redis-500/50 text-white shadow-lg' 
                                : isLocked 
                                    ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 opacity-70'
                                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1 relative z-10">
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${isCurrent ? 'text-redis-400' : 'text-slate-500'}`}>
                                    Module {idx + 1}
                                </span>
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : isLocked ? (
                                    <Lock className="w-3 h-3" />
                                ) : isCurrent ? (
                                    <Play className="w-3 h-3 text-redis-500 fill-current" />
                                ) : null}
                            </div>
                            <div className="font-semibold text-sm relative z-10">{module.title}</div>
                            
                            {isCurrent && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-redis-500" />
                            )}
                        </button>
                    );
                 })}
                 </div>
             </div>
             
             {/* Mobile Footer */}
             <div className="p-6 border-t border-slate-800 bg-black/20">
                <div className="flex justify-center gap-8">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                        <Github className="w-5 h-5" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors p-2 rounded-full hover:bg-white/5">
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-white/5">
                        <Globe className="w-5 h-5" />
                    </a>
                </div>
                <div className="text-center mt-4 text-[10px] text-slate-600 font-mono">
                    v1.1.0 • MOBILE TERMINAL
                </div>
             </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Main content area with consistent layout across all devices */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-slate-900/50">
         {/* Mobile Tab Switcher - only visible on mobile and tablet */}
         <div className="lg:hidden px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
             <div className="flex bg-slate-800 p-1 rounded-lg">
                 <button 
                    onClick={() => setMobileTab('terminal')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                        mobileTab === 'terminal' 
                        ? 'bg-redis-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    }`}
                 >
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Terminal</span>
                 </button>
                 <button 
                    onClick={() => setMobileTab('visualizer')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                        mobileTab === 'visualizer' 
                        ? 'bg-redis-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    }`}
                 >
                    <Database className="w-3.5 h-3.5" />
                    <span>Warehouse</span>
                 </button>
             </div>
         </div>

         <div className="flex-1 flex flex-col lg:flex-row p-2 lg:p-4 gap-2 lg:gap-4 min-h-0 overflow-hidden">
            {/* Left Column: Guide & Terminal */}
            <div className={`flex flex-col gap-2 lg:gap-4 w-full lg:w-1/2 h-full min-h-0 ${mobileTab === 'visualizer' ? 'hidden lg:flex' : 'flex'}`}>
                {/* Guide shrinks/expands on mobile via internal state, but here we just place it */}
                <div className="flex-none z-10">
                    <StepGuide 
                        module={currentModule} 
                        currentStepIndex={currentStepIndex} 
                        onNext={handleNext}
                        canAdvance={canAdvance}
                    />
                </div>
                <div className="flex-1 min-h-0 relative z-0">
                    <Terminal 
                        onExecute={handleExecute} 
                        history={history} 
                        isProcessing={false}
                        isActive={mobileTab === 'terminal'}
                        suggestedCommand={currentModule.steps[currentStepIndex].input_code}
                    />
                </div>
            </div>

            {/* Right Column: Visualizer */}
            <div className={`flex-1 h-full min-h-0 ${mobileTab === 'terminal' ? 'hidden lg:block' : 'block'}`}>
                <WarehouseVisualizer store={store} />
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { RedisStore, CommandResult } from './types';
import { executeCommand, checkExpirations } from './services/mockRedis';
import Terminal from './components/Terminal';
import WarehouseVisualizer from './components/WarehouseVisualizer';
import StepGuide from './components/StepGuide';
import Sidebar from './components/Sidebar';
import { Menu, X, Terminal as TerminalIcon, Database, Github, Linkedin, Globe } from 'lucide-react';
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
            // Logic based validation is safer for cases like "EXPIRE" where state changes later
            const isExactMatch = userCmd === expectedCmd;
            
            // Specific validation helpers
            const keyMatches = (key: string, val: any) => store[key]?.value === val;
            const keyExists = (key: string) => !!store[key];
            const keyDeleted = (key: string) => !store[key];
            
            // Simple robust check:
            // 1. Exact command string match?
            // 2. OR: If command type matches and goal state is achieved
            if (isExactMatch) {
                setCanAdvance(true);
            } else if (step.command.startsWith("SET") && expectedCmd.includes("user:name") && keyMatches("user:name", "Alice")) {
                 setCanAdvance(true);
            } else if (step.command.startsWith("DEL") && expectedCmd.includes("user:name") && keyDeleted("user:name")) {
                setCanAdvance(true);
            } else if (step.command.startsWith("LPUSH") && keyExists("todo_list")) {
                // List steps are additive, so exact match is preferred, but loose check if they added correct item
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
        // Module complete
        if (!completedModules.includes(currentModuleId)) {
            setCompletedModules(prev => [...prev, currentModuleId]);
        }
        
        // Find next module
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
    <div className="flex h-screen bg-robot-dark text-slate-200 font-sans overflow-hidden">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-800 rounded-md border border-slate-700 shadow-lg text-white">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="absolute inset-0 z-40 bg-slate-900/95 p-6 pt-16 md:hidden overflow-y-auto flex flex-col"
        >
             <h2 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-2">Training Modules</h2>
             <div className="space-y-2 flex-1">
             {CURRICULUM.modules.map((module, idx) => (
                <button 
                    key={module.id}
                    onClick={() => {
                        setCurrentModuleId(module.id);
                        setCurrentStepIndex(0);
                        setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${currentModuleId === module.id ? 'bg-redis-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
                >
                    <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Module {idx + 1}</div>
                    <div className="font-bold">{module.title}</div>
                </button>
             ))}
             </div>
             
             {/* Mobile Footer with Socials */}
             <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex justify-center gap-8">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors">
                        <Linkedin className="w-6 h-6" />
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                        <Globe className="w-6 h-6" />
                    </a>
                </div>
             </div>
        </motion.div>
      )}
      </AnimatePresence>

      <Sidebar 
        modules={CURRICULUM.modules} 
        currentModuleId={currentModuleId}
        completedModules={completedModules}
        currentStepIndex={currentStepIndex}
        onSelectModule={(id) => {
            setCurrentModuleId(id);
            setCurrentStepIndex(0);
        }}
      />

      <main className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden relative">
         {/* Mobile Tab Switcher */}
         <div className="md:hidden flex gap-2 shrink-0">
             <button 
                onClick={() => setMobileTab('terminal')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold transition-colors ${mobileTab === 'terminal' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'}`}
             >
                <TerminalIcon className="w-4 h-4" /> Terminal
             </button>
             <button 
                onClick={() => setMobileTab('visualizer')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold transition-colors ${mobileTab === 'visualizer' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'}`}
             >
                <Database className="w-4 h-4" /> Warehouse
             </button>
         </div>

         {/* Left Column: Guide & Terminal */}
         <div className={`flex flex-col gap-2 md:gap-4 w-full md:w-1/2 h-full ${mobileTab === 'visualizer' ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-none">
                <StepGuide 
                    module={currentModule} 
                    currentStepIndex={currentStepIndex} 
                    onNext={handleNext}
                    canAdvance={canAdvance}
                />
            </div>
            <div className="flex-1 min-h-0">
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
         <div className={`flex-1 h-full min-h-0 ${mobileTab === 'terminal' ? 'hidden md:block' : 'block'}`}>
            <WarehouseVisualizer store={store} />
         </div>
      </main>
    </div>
  );
};

export default App;
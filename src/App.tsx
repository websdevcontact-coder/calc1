import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Delete, X, Divide, Minus, Plus, Equal, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);

  const handleNumber = (num: string) => {
    setDisplay((prev) => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setExpression((prev) => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = useCallback(() => {
    try {
      const fullExpression = expression + display;
      // Using Function constructor as a safer alternative to eval for simple math
      // In a real production app, use a math library like mathjs
      const result = new Function(`return ${fullExpression.replace(/×/g, '*').replace(/÷/g, '/')}`)();
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      
      const newHistoryItem: HistoryItem = {
        expression: fullExpression,
        result: formattedResult,
        timestamp: Date.now(),
      };
      
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 20));
      setDisplay(formattedResult);
      setExpression('');
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  }, [display, expression]);

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const backspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const toggleSign = () => {
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      let result = 0;
      switch (func) {
        case 'sin': result = Math.sin(val); break;
        case 'cos': result = Math.cos(val); break;
        case 'tan': result = Math.tan(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'pow2': result = Math.pow(val, 2); break;
        case 'pi': result = Math.PI; break;
        case 'e': result = Math.E; break;
      }
      setDisplay(result.toFixed(4).replace(/\.?0+$/, ''));
    } catch (e) {
      setDisplay('Error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) {
        const opMap: Record<string, string> = { '*': '×', '/': '÷', '+': '+', '-': '-' };
        handleOperator(opMap[e.key]);
      }
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Escape') clear();
      if (e.key === 'Backspace') backspace();
      if (e.key === '.') handleNumber('.');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate, display]);

  const Button = ({ children, onClick, className = '', variant = 'default' }: any) => {
    const variants: any = {
      default: 'bg-zinc-800 hover:bg-zinc-700 text-white',
      operator: 'bg-orange-500 hover:bg-orange-400 text-white',
      secondary: 'bg-zinc-300 hover:bg-zinc-200 text-zinc-900',
      danger: 'bg-red-500 hover:bg-red-400 text-white',
      scientific: 'bg-indigo-600 hover:bg-indigo-500 text-white text-xs',
    };

    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`h-14 rounded-2xl font-medium transition-colors flex items-center justify-center ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-800 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-zinc-400">
            <CalcIcon size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">Calculator</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsScientific(!isScientific)}
              className={`p-2 rounded-full transition-colors ${isScientific ? 'text-indigo-400 bg-indigo-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <span className="text-[10px] font-bold">SCI</span>
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-full transition-colors ${showHistory ? 'text-orange-400 bg-orange-400/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <History size={18} />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="px-8 py-4 text-right min-h-[140px] flex flex-col justify-end">
          <div className="text-zinc-500 text-sm font-mono h-6 overflow-hidden whitespace-nowrap">
            {expression}
          </div>
          <div className="text-white text-6xl font-light tracking-tighter truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-zinc-900">
          {isScientific && (
            <div className="col-span-4 grid grid-cols-4 gap-3 mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Button variant="scientific" onClick={() => handleScientific('sin')}>sin</Button>
              <Button variant="scientific" onClick={() => handleScientific('cos')}>cos</Button>
              <Button variant="scientific" onClick={() => handleScientific('tan')}>tan</Button>
              <Button variant="scientific" onClick={() => handleScientific('sqrt')}>√</Button>
              <Button variant="scientific" onClick={() => handleScientific('log')}>log</Button>
              <Button variant="scientific" onClick={() => handleScientific('ln')}>ln</Button>
              <Button variant="scientific" onClick={() => handleScientific('pi')}>π</Button>
              <Button variant="scientific" onClick={() => handleScientific('e')}>e</Button>
            </div>
          )}

          <Button variant="secondary" onClick={clear}>AC</Button>
          <Button variant="secondary" onClick={toggleSign}>+/-</Button>
          <Button variant="secondary" onClick={backspace}><Delete size={18} /></Button>
          <Button variant="operator" onClick={() => handleOperator('÷')}><Divide size={20} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperator('×')}><X size={20} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={20} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={20} /></Button>

          <Button className="col-span-2" onClick={() => handleNumber('0')}>0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button variant="operator" onClick={calculate}><Equal size={20} /></Button>
        </div>

        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 bg-zinc-900 z-10 flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-zinc-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <History size={18} /> History
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.length === 0 ? (
                  <div className="text-zinc-600 text-center py-20 italic">No history yet</div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.timestamp} 
                      className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors group"
                      onClick={() => {
                        setDisplay(item.result);
                        setShowHistory(false);
                      }}
                    >
                      <div className="text-zinc-500 text-xs mb-1 font-mono">{item.expression} =</div>
                      <div className="text-white text-xl font-medium">{item.result}</div>
                    </div>
                  ))
                )}
              </div>
              {history.length > 0 && (
                <div className="p-4 border-t border-zinc-800">
                  <button 
                    onClick={() => setHistory([])}
                    className="w-full py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <RotateCcw size={14} /> Clear History
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

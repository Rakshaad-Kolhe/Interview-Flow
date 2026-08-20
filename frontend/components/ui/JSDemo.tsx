'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export function JSDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [hoistResult, setHoistResult] = useState<string>('');
  
  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);
  const clearLogs = () => setLogs([]);

  // JavaScript - Event loop
  const runEventLoop = () => {
    clearLogs();
    addLog('1. Sync: Starting Event Loop Demo');
    
    setTimeout(() => {
      addLog('4. Macrotask: setTimeout executed');
    }, 0);

    Promise.resolve().then(() => {
      addLog('3. Microtask: Promise resolved');
    });

    addLog('2. Sync: Ending Event Loop Demo');
  };

  // JavaScript - Promises vs callbacks
  const mockFetchCallback = (cb: (err: any, data: string) => void) => {
    setTimeout(() => cb(null, 'Callback Data Loaded!'), 500);
  };
  const mockFetchPromise = () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve('Promise Data Loaded!'), 500);
    });
  };

  const runPromisesVsCallbacks = () => {
    clearLogs();
    addLog('Running Callback approach...');
    mockFetchCallback((err, data) => {
      if (err) addLog(`Error: ${err}`);
      else addLog(`Callback Result: ${data}`);
      
      addLog('Running Promise approach...');
      mockFetchPromise()
        .then(res => addLog(`Promise Result: ${res}`))
        .catch(e => addLog(`Promise Error: ${e}`));
    });
  };

  // JavaScript - async/await
  const runAsyncAwait = async () => {
    clearLogs();
    addLog('Starting sequential awaits...');
    const start1 = Date.now();
    await mockFetchPromise();
    await mockFetchPromise();
    addLog(`Sequential finished in ${Date.now() - start1}ms`);

    addLog('Starting concurrent Promise.all...');
    const start2 = Date.now();
    await Promise.all([mockFetchPromise(), mockFetchPromise()]);
    addLog(`Concurrent finished in ${Date.now() - start2}ms`);
  };

  // JavaScript - Closures
  // Factory function that returns a closure maintaining private state
  const createCounter = () => {
    let count = 0; // Private state
    return () => {
      count++;
      addLog(`Closure Counter triggered: ${count}`);
    };
  };
  const [closureCounter] = useState(() => createCounter());

  // JavaScript - Hoisting
  const runHoisting = () => {
    clearLogs();
    // Function hoisting
    addLog(`Function hoisting: ${hoistedFunc()}`);
    function hoistedFunc() { return 'I was hoisted!'; }

    // var hoisting
    try {
      // @ts-ignore
      addLog(`var hoisting (before init): ${hoistedVar}`);
    } catch (e: any) {
      addLog(`var error: ${e.message}`);
    }
    var hoistedVar = 'I am var';

    // let/const TDZ
    try {
      // @ts-ignore
      addLog(`let hoisting: ${hoistedLet}`);
    } catch (e: any) {
      addLog(`let/const TDZ error caught: ${e.message}`);
    }
    let hoistedLet = 'I am let';
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-bold">JavaScript Concepts Demo (Frontend)</h2>
      
      <div className="flex flex-wrap gap-4">
        <Button onClick={runEventLoop} variant="outline">Event Loop</Button>
        <Button onClick={runPromisesVsCallbacks} variant="outline">Promises vs Callbacks</Button>
        <Button onClick={runAsyncAwait} variant="outline">Async/Await</Button>
        <Button onClick={closureCounter} variant="outline">Closures</Button>
        <Button onClick={runHoisting} variant="outline">Hoisting</Button>
      </div>

      <div className="bg-slate-900 text-green-400 p-4 rounded-md font-mono text-sm min-h-[200px]">
        {logs.length === 0 ? <span className="opacity-50">Click a button to view console output...</span> : null}
        {logs.map((log, i) => (
          <div key={i}>{'>'} {log}</div>
        ))}
      </div>
    </Card>
  );
}

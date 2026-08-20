import Link from 'next/link';
// JavaScript - Event loop
// JavaScript - Promises vs callbacks
// JavaScript - async/await
// JavaScript - Closures
// JavaScript - Hoisting
// Environment variables & secrets management
// Git workflow
import { checkHealth } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { JSDemo } from '@/components/ui/JSDemo';

export default async function Home() {
  const healthStatus = await checkHealth();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Decorative subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
      
      <main className="max-w-3xl w-full space-y-12 relative z-10 py-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 mb-4">
            Interview Preparation Platform
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight sm:text-6xl">
            Master the <span className="text-indigo-600">technical interview</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Practice real-world backend and system design questions. Generate focused mock interviews, submit your answers, and refine your skills in a professional environment.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 shadow-md">
              Start Practicing
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-slate-200">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">
            System Connectivity Status
          </h2>
          {healthStatus ? (
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <StatusBadge label="API" status="connected" />
              <StatusBadge label="PostgreSQL" status={healthStatus.dependencies.postgres} />
              <StatusBadge label="MongoDB" status={healthStatus.dependencies.mongodb} />
              <StatusBadge label="Redis" status={healthStatus.dependencies.redis} />
            </div>
          ) : (
            <div className="max-w-md mx-auto p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200 text-center">
              Backend API is unreachable. Please ensure the server is running.
            </div>
          )}
        </div>
        
        <div className="mt-12 w-full max-w-4xl mx-auto">
          <JSDemo />
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ label, status }: { label: string, status: string }) {
  const isConnected = status === 'connected';
  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span className="text-slate-600 font-medium">{label}</span>
    </div>
  );
}

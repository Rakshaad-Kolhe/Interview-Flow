import { JSDemo } from '@/components/ui/JSDemo';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function JSDemoPage() {
  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">JavaScript Concepts</h1>
        <Link href="/dashboard">
          <Button variant="ghost">&larr; Back to Dashboard</Button>
        </Link>
      </div>
      <p className="text-slate-600">
        This interactive page demonstrates advanced JavaScript concepts executing directly in the client browser (Frontend).
      </p>
      
      <JSDemo />
    </div>
  );
}

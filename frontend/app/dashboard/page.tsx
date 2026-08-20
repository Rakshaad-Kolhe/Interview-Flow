import { serverFetch } from '@/lib/serverApi';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ResumeUpload } from '@/components/ui/ResumeUpload';

export default async function DashboardPage() {
  let interviews: any[] = [];
  let error = null;
  let cacheStatus = '';

  try {
    const res = await serverFetch('/interviews', { cache: 'no-store' });
    if (res.success) {
      interviews = res.data;
      cacheStatus = res.source;
    } else {
      error = res.message;
    }
  } catch (err: any) {
    error = 'Failed to load interviews. Are you logged in?';
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Session Expired</h1>
          <p className="text-slate-600 text-sm">{error}</p>
          <div className="pt-4">
            <Link href="/login">
              <Button className="w-full">Sign in again</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = interviews.filter(i => i.status === 'Completed').length;
  const inProgressCount = interviews.filter(i => i.status === 'In Progress' || i.status === 'Created').length;

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 py-10 space-y-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Track your interview preparation progress.</p>
        </div>
        <div className="flex items-center gap-4">
          {cacheStatus && (
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Data: {cacheStatus}
            </span>
          )}
          <Link href="/js-demo">
            <Button variant="outline">JS Demo</Button>
          </Link>
          <Link href="/interviews/new">
            <Button>New Interview</Button>
          </Link>
        </div>
      </section>

  {/* Progress Summary */}
      <section className="space-y-6">
        <ResumeUpload />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Interviews</h3>
            <p className="text-3xl font-bold text-slate-900">{interviews.length}</p>
          </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Completed</h3>
          <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">In Progress</h3>
          <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
        </Card>
        </div>
      </section>

      {/* Recent Interviews List */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Recent Interviews</h2>
        
        {interviews.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="max-w-sm mx-auto space-y-4">
              <h3 className="text-lg font-medium text-slate-900">No interviews yet</h3>
              <p className="text-slate-500 text-sm">Your first mock interview takes less than a minute to create.</p>
              <Link href="/interviews/new" className="inline-block pt-2">
                <Button>Start your first interview</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {interviews.map((i: any) => (
              <div key={i.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/interviews/${i.id}`} className="focus:outline-none">
                    <h3 className="text-base font-semibold text-indigo-600 hover:text-indigo-700 truncate">
                      {i.title}
                    </h3>
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                    <span>{i.type}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{new Date(i.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <Badge variant={i.status === 'Completed' ? 'success' : i.status === 'In Progress' ? 'info' : 'default'}>
                    {i.status}
                  </Badge>
                  
                  <Link href={`/interviews/${i.id}/live`}>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      Live Session &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

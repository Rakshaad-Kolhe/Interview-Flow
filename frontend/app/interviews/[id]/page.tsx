'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInterviewById, generateQuestions, getChallenge, verifyPayment } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Generation State
  const [generationState, setGenerationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [questions, setQuestions] = useState<any[]>([]);
  const [generationError, setGenerationError] = useState('');

  // Third party API state
  const [challenge, setChallenge] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getInterviewById(id);
        if (res.success) {
          setInterview(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to load interview metadata');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleGenerate = async () => {
    if (generationState === 'loading') return;

    setGenerationState('loading');
    setGenerationError('');

    try {
      const res = await generateQuestions(id, {
        role: interview?.title || 'Developer',
        difficulty: 'medium',
        count: 3
      });

      if (res.success) {
        setQuestions(res.data.questions);
        setGenerationState('success');
      } else {
        setGenerationState('error');
        setGenerationError(res.message);
      }
    } catch (err) {
      setGenerationState('error');
      setGenerationError('A network error occurred while generating questions.');
    }
  };

  const handleLoadChallenge = async () => {
    try {
      const res = await getChallenge();
      if (res.success) setChallenge(res.data.challengeText);
    } catch (err) {
      // Ignored
    }
  };

  const handleUnlockPremium = async () => {
    const confirmed = confirm('Sandbox Mode: Simulate a $10 payment to unlock premium features?');
    if (!confirmed) return;

    try {
      const res = await verifyPayment({ amount: 10, simulatedStatus: 'succeeded' });
      if (res.success) {
        alert('Premium unlocked successfully (Sandbox transaction).');
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Payment failed');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 py-10 space-y-6">
        <Skeleton className="h-4 w-24 mb-8" />
        <Card className="p-8 space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="border-t border-slate-100 pt-6 flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-6 py-10 space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 mb-6">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{interview?.title}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="font-medium">{interview?.type}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Medium Difficulty</span>
                </div>
              </div>
              <Badge variant={interview?.status === 'Completed' ? 'success' : interview?.status === 'In Progress' ? 'info' : 'default'}>
                {interview?.status}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={generationState === 'loading'}
                  isLoading={generationState === 'loading'}
                >
                  Generate AI Questions
                </Button>
                
                <Link href={`/interviews/${id}/live`}>
                  <Button variant="secondary">
                    Join Live Session
                  </Button>
                </Link>
              </div>

              {generationState === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-100 flex justify-between items-center">
                  <span>{generationError}</span>
                  <button onClick={handleGenerate} className="font-medium hover:underline">Retry</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Questions Section */}
          {generationState === 'success' && questions.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Interview Questions</h2>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="default" className="text-xs bg-slate-100 text-slate-600">{q.category}</Badge>
                            <Badge variant="default" className="text-xs bg-slate-100 text-slate-600">{q.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Premium Features</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unlock advanced questions, detailed AI feedback, and unlimited mock interviews.
              </p>
              <div className="pt-2">
                <Button 
                  onClick={handleUnlockPremium}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Unlock Premium (Sandbox)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Developer Challenge</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Load a rapid-fire trivia question while you wait.
              </p>
              <Button 
                onClick={handleLoadChallenge}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Load Trivia
              </Button>

              {challenge && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 italic">
                  "{challenge}"
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

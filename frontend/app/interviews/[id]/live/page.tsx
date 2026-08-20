'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/Button';

export default function LiveInterviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connected' | 'Disconnected' | 'Reconnecting'>('Disconnected');
  const [sessionState, setSessionState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required for live session.');
      router.push('/login');
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setConnectionStatus('Connected');
      socketInstance.emit('start_session', { interviewId: id });
    });

    socketInstance.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });
    
    socketInstance.on('connect_error', () => {
      setConnectionStatus('Reconnecting');
    });

    socketInstance.on('interview:started', () => {
      console.log('Live Session Started');
    });

    socketInstance.on('question:shown', (data) => {
      setCurrentQuestion(data);
      setAnswer('');
    });

    socketInstance.on('interview:progress', (data) => {
      setSessionState(data);
    });

    socketInstance.on('interview:completed', (data) => {
      alert(data.message);
      router.push(`/interviews/${id}`);
    });

    socketInstance.on('error', (err) => {
      alert(`Session Error: ${err.message}`);
      router.push('/dashboard');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [id, router]);

  const handleSubmit = () => {
    if (!socket || !answer.trim()) return;
    socket.emit('submit_answer', { interviewId: id, answer });
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-4rem)]">
      {/* Subtle Progress Bar */}
      {sessionState && (
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-indigo-600 h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${(sessionState.currentQuestion / sessionState.totalQuestions) * 100}%` }}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link href={`/interviews/${id}`} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              &larr; Exit Session
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
              Live Interview
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'Connected' ? 'bg-emerald-500' : 
              connectionStatus === 'Reconnecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs font-medium text-slate-600">{connectionStatus}</span>
          </div>
        </div>

        {!currentQuestion ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Initializing secure session...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Question Display */}
            <div>
              <div className="text-sm font-medium text-indigo-600 mb-3 tracking-wide uppercase">
                Question {currentQuestion.questionNumber} {sessionState && `of ${sessionState.totalQuestions}`}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Area */}
            <div className="space-y-4">
              <label htmlFor="answer" className="block text-sm font-medium text-slate-700">
                Your Answer
              </label>
              <textarea 
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full h-48 sm:h-64 bg-slate-50 border border-slate-200 rounded-lg p-5 text-slate-900 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none shadow-inner"
                placeholder="Type your response here. Take your time to think..."
                spellCheck="false"
              />

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  size="lg"
                  className="px-8 shadow-md"
                >
                  Submit Answer
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

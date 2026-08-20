'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/upload-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Resume uploaded successfully!');
        setFile(null); // Reset file
      } else {
        setStatus('error');
        setMessage(data.message || 'Upload failed. Please check file type and size.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('A network error occurred during upload.');
    }
  };

  return (
    <Card className="p-6 border-slate-200 shadow-sm bg-white">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Resume Upload</h3>
          <p className="text-sm text-slate-500">Upload your latest resume (PDF, PNG, JPG up to 5MB) to contextualize your mock interviews.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input 
            type="file" 
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || status === 'uploading'}
            isLoading={status === 'uploading'}
          >
            Upload
          </Button>
        </div>

        {status === 'success' && (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
            {message}
          </div>
        )}
      </div>
    </Card>
  );
}

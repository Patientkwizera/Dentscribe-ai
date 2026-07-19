'use client';
import { useState } from 'react';

export function JoinPractice() {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setJoining(true);
    setError('');
    
    try {
      const response = await fetch('/api/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code.toUpperCase() }),
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid invite code. Please check with your practice owner.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setJoining(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h2 className="font-display text-2xl text-ink mb-4">Join Your Practice</h2>
      <p className="text-ink/60 mb-6">Enter the invite code from your practice owner</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABC-1234"
        className="w-full text-center text-2xl tracking-widest border border-line rounded-lg py-3 mb-4 font-mono uppercase"
        maxLength={8}
      />
      {error && <p className="text-sm text-coral mb-4">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={joining || code.length < 6}
        className="w-full py-3 bg-teal text-white rounded-lg font-medium disabled:opacity-50"
      >
        {joining ? 'Joining...' : 'Join Practice'}
      </button>
    </div>
  );
}

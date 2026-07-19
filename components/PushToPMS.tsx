'use client';
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

interface PushToPMSProps {
  noteId: string;
  noteContent: string;
}

export function PushToPMS({ noteId, noteContent }: PushToPMSProps) {
  const [connectedPMS, setConnectedPMS] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [lastPushed, setLastPushed] = useState<Date | null>(null);

  useEffect(() => {
    checkPMSConnection();
  }, []);

  async function checkPMSConnection() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: settings } = await supabaseClient
      .from('pms_settings')
      .select('pms_type')
      .eq('user_id', user.id)
      .single();

    if (settings) {
      setConnectedPMS(settings.pms_type);
    }
  }

  const handlePush = async () => {
    setPushing(true);
    try {
      const response = await fetch('/api/pms/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, noteContent }),
      });

      if (response.ok) {
        setLastPushed(new Date());
      } else {
        alert('Push failed. Please check your PMS connection in Settings.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setPushing(false);
  };

  if (!connectedPMS) {
    return (
      <a href="/settings/integrations" className="text-sm text-teal underline">
        Connect your practice software to push notes directly →
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePush}
        disabled={pushing}
        className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg text-sm"
      >
        {pushing ? 'Pushing...' : `Push to ${connectedPMS}`}
      </button>
      {lastPushed && (
        <span className="text-xs text-ink/50">
          Last pushed {lastPushed.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

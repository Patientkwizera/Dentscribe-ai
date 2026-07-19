'use client';
import { useState, useEffect } from 'react';
import { Gift, Copy } from 'lucide-react';

export function ReferralProgram() {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [creditEarned, setCreditEarned] = useState(0);

  useEffect(() => {
    fetch('/api/referral/link')
      .then(r => r.json())
      .then(data => {
        setReferralLink(`${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${data.code}`);
      });

    // Fetch referral stats
    fetch('/api/referral/stats')
      .then(r => r.json())
      .then(data => {
        setReferralCount(data.count || 0);
        setCreditEarned(data.credit || 0);
      });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-paper border border-line rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-gold" />
        <h3 className="font-display text-lg">Give $20, Get $20</h3>
      </div>
      
      <p className="text-sm text-ink/60 mb-4">
        Share DentScribe with a colleague. They get $20 off their first month. 
        You get $20 credit when they subscribe.
      </p>

      <div className="flex gap-2">
        <input
          value={referralLink}
          readOnly
          className="flex-1 px-3 py-2 border border-line rounded-lg text-sm font-mono bg-white"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-line">
        <p className="text-xs text-ink/40">
          You've referred {referralCount} dentist{referralCount !== 1 ? 's' : ''} · ${creditEarned} in credits earned
        </p>
      </div>
    </div>
  );
}

'use client';
import { Zap, AlertTriangle, Users } from 'lucide-react';

interface SmartUpsellProps {
  profile: any;
  currentUsage: number;
}

export function SmartUpsell({ profile, currentUsage }: SmartUpsellProps) {
  const limits: Record<string, number> = { free: 10, solo: 500, practice: Infinity };
  const limit = limits[profile.plan] || 10;
  
  if (limit === Infinity) return null;

  const percentUsed = (currentUsage / limit) * 100;

  if (percentUsed >= 70 && percentUsed < 100) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-gold mt-0.5" />
          <div>
            <h4 className="font-medium text-ink">
              {profile.plan === 'free' 
                ? `You've used ${Math.round(percentUsed)}% of your free notes`
                : `You're at ${Math.round(percentUsed)}% of your Solo limit`
              }
            </h4>
            <p className="text-sm text-ink/60 mt-1">
              {profile.plan === 'free' 
                ? 'Upgrade to Solo for 500 notes/month and never worry about limits again.'
                : 'Practice plan gives you unlimited notes + team features for your whole office.'
              }
            </p>
            <div className="mt-3 flex gap-2">
              <a 
                href="/pricing" 
                className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium"
              >
                {profile.plan === 'free' ? 'Upgrade to Solo — $49/mo' : 'Upgrade to Practice — $99/mo'}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (percentUsed >= 100) {
    return (
      <div className="bg-coral/10 border border-coral/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-coral mt-0.5" />
          <div>
            <h4 className="font-medium text-ink">You've reached your note limit</h4>
            <p className="text-sm text-ink/60 mt-1">
              Your last note was saved, but you can't generate new ones until you upgrade.
            </p>
            <a 
              href="/pricing" 
              className="inline-block mt-3 px-4 py-2 bg-coral text-white rounded-lg text-sm font-medium"
            >
              Upgrade Now — Notes Resume Instantly
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

'use client';
import { Shield, Lock, EyeOff, Server, CheckCircle } from 'lucide-react';

interface SecurityBadgeProps {
  icon: string;
  label: string;
  status: 'active' | 'pending' | 'inactive';
  detail: string;
}

export function SecurityBadge({ icon, label, status, detail }: SecurityBadgeProps) {
  const icons: Record<string, any> = { Shield, Lock, EyeOff, Server };
  const Icon = icons[icon] || Shield;

  const statusColors = {
    active: 'bg-teal/10 text-teal border-teal/30',
    pending: 'bg-gold/10 text-gold border-gold/30',
    inactive: 'bg-ink/10 text-ink/50 border-line',
  };

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border ${statusColors[status]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <span className="font-medium text-sm text-center">{label}</span>
      <span className="text-xs text-center mt-1 opacity-70">{detail}</span>
      {status === 'active' && <CheckCircle className="w-4 h-4 mt-2" />}
    </div>
  );
}

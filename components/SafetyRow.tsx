import { CheckCircle, Download } from 'lucide-react';

interface SafetyRowProps {
  label: string;
  value: string;
  icon: string;
  action?: string;
}

export function SafetyRow({ label, value, icon, action }: SafetyRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {icon === 'CheckCircle' && <CheckCircle className="w-4 h-4 text-teal" />}
        {icon === 'Download' && <Download className="w-4 h-4 text-teal" />}
        <span className="text-sm text-ink/80">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">{value}</span>
        {action && (
          <a href={action} className="text-xs text-teal underline">
            Export
          </a>
        )}
      </div>
    </div>
  );
}

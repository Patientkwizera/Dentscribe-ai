import { Sparkles } from 'lucide-react';

interface PersonalizationBadgeProps {
  noteCount: number;
}

export function PersonalizationBadge({ noteCount }: PersonalizationBadgeProps) {
  const level = noteCount < 5 ? 'Learning your style...' 
    : noteCount < 20 ? 'Personalized to your voice'
    : 'Deeply personalized';
  
  const progress = Math.min(noteCount / 20 * 100, 100);

  return (
    <div className="flex items-center gap-2 text-xs text-teal bg-teal/10 px-3 py-1 rounded-full">
      <Sparkles className="w-3 h-3" />
      <span>{level}</span>
      <div className="w-16 h-1.5 bg-teal/20 rounded-full overflow-hidden">
        <div className="h-full bg-teal rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

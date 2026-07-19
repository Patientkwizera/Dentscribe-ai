interface ComplianceBadgeProps {
  score: number;
}

export function ComplianceBadge({ score }: ComplianceBadgeProps) {
  const color = score >= 90 ? 'bg-teal/10 text-teal' : score >= 70 ? 'bg-gold/10 text-gold' : 'bg-coral/10 text-coral';
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
      {score}/100
    </span>
  );
}

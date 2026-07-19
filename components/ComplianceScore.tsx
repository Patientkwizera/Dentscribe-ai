interface ComplianceScoreProps {
  flags: any[];
}

export function ComplianceScore({ flags }: ComplianceScoreProps) {
  const score = Math.max(0, 100 - flags.length * 10);
  const color = score >= 90 ? 'text-teal' : score >= 70 ? 'text-gold' : 'text-coral';
  const label = score >= 90 ? 'Audit-ready' : score >= 70 ? 'Minor gaps' : 'Needs review';

  return (
    <div className="flex items-center gap-2">
      <div className={`text-2xl font-display ${color}`}>{score}</div>
      <div className="text-sm text-ink/60">
        {label}
      </div>
    </div>
  );
}

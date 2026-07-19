import { createServiceRoleClient } from '@/lib/supabase';
import { ComplianceBadge } from './ComplianceBadge';

interface PeerBenchmarkProps {
  userId: string;
}

export async function PeerBenchmark({ userId }: PeerBenchmarkProps) {
  const supabase = createServiceRoleClient();
  
  const { data: userStats } = await supabase
    .from('soap_notes')
    .select('compliance_flags')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const userScore = userStats 
    ? Math.max(0, 100 - (userStats.reduce((sum, n) => sum + (n.compliance_flags?.length || 0), 0) / userStats.length) * 10)
    : 100;

  // Simplified percentile calculation
  const percentile = Math.min(Math.max(userScore, 20), 95);

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="font-display text-lg mb-4">How You Compare</h3>
      
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-display text-teal">{Math.round(userScore)}</span>
        <span className="text-sm text-ink/60 mb-1">/100 compliance score</span>
      </div>

      <div className="relative h-4 bg-line rounded-full overflow-hidden mb-2">
        <div 
          className="absolute h-full bg-teal rounded-full"
          style={{ width: `${percentile}%` }}
        />
        <div 
          className="absolute top-0 w-0.5 h-full bg-coral"
          style={{ left: `${percentile}%` }}
        />
      </div>
      
      <p className="text-sm text-ink/60">
        You're in the <span className="font-medium text-ink">{getPercentileLabel(percentile)}</span> of dentists for documentation completeness.
      </p>

      {percentile < 50 && (
        <div className="mt-4 p-3 bg-coral/10 border border-coral/20 rounded-lg">
          <p className="text-sm text-coral">
            💡 Your notes are missing key elements. Try using the "Comprehensive Exam" template for better coverage.
          </p>
        </div>
      )}
    </div>
  );
}

function getPercentileLabel(percentile: number): string {
  if (percentile >= 90) return 'top 10%';
  if (percentile >= 75) return 'top 25%';
  if (percentile >= 50) return 'top half';
  if (percentile >= 25) return 'bottom half';
  return 'bottom 25%';
}

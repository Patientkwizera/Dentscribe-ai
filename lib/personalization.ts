import { createServiceRoleClient } from './supabase';

export async function getPersonalizationHints(userId: string, templateType: string): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const { data: notes } = await supabase
    .from('soap_notes')
    .select('generated_note, compliance_flags')
    .eq('user_id', userId)
    .eq('template_type', templateType)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!notes || notes.length === 0) return '';

  const avgLength = notes.reduce((sum, n) => sum + (n.generated_note?.length || 0), 0) / notes.length;
  const avgFlags = notes.reduce((sum, n) => sum + (n.compliance_flags?.length || 0), 0) / notes.length;
  const style = avgLength > 800 ? 'detailed' : 'concise';

  return `This dentist's style (learned from ${notes.length} previous notes):
- Prefers ${style} documentation (avg ${Math.round(avgLength)} chars)
- Average compliance flags: ${avgFlags.toFixed(1)}
- Maintain consistent terminology and formatting.`;
}

export function calculateComplianceScore(flags: any[]): number {
  const penaltyPerFlag = 10;
  return Math.max(0, 100 - flags.length * penaltyPerFlag);
}

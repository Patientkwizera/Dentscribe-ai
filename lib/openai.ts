import OpenAI from 'openai';
import { createServiceRoleClient } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Patterns to redact before sending to OpenAI
const REDACTION_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,           // SSN
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,  // Dates
  /\b\d{10}\b/g,                       // Phone numbers
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,     // Full names (basic)
];

export function sanitizeNarration(narration: string): string {
  let sanitized = narration;
  REDACTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  return sanitized;
}

function getSystemPrompt(templateType: string): string {
  const basePrompt = `Generate a dental SOAP note. Format:
S: [subjective - patient complaint, history, symptoms]
O: [objective - clinical findings, vitals, observations, test results]
A: [assessment - diagnosis, differential diagnosis]
P: [plan - treatment, prescriptions, follow-up, referrals]

Rules:
- Flag missing elements: informed consent, vitals/baseline, post-op instructions, follow-up plan
- Use professional clinical tone
- Redact all patient identifiers (already done)
- Include procedure-specific details if mentioned
- Note any allergies or medical conditions relevant to dental treatment`;

  const templates: Record<string, string> = {
    'comprehensive-exam': `${basePrompt}\n\nThis is a comprehensive dental exam. Include: full mouth series, periodontal charting, occlusion, TMJ assessment, oral cancer screening.`,
    'periodic-exam': `${basePrompt}\n\nThis is a periodic (routine) exam. Include: comparison to previous findings, update on existing conditions.`,
    'restoration': `${basePrompt}\n\nThis is a restoration procedure. Include: tooth number, surface, material used, anesthesia details, shade match.`,
    'extraction': `${basePrompt}\n\nThis is an extraction. Include: tooth number, reason for extraction, anesthesia, difficulty level, sutures if used, post-op instructions given.`,
    'root-canal': `${basePrompt}\n\nThis is endodontic therapy. Include: tooth number, canal configuration, files used, obturation material, final restoration plan.`,
    'prophylaxis': `${basePrompt}\n\nThis is a prophylaxis. Include: calculus level, bleeding points, oral hygiene instructions, fluoride treatment if given.`,
  };

  return templates[templateType] || basePrompt;
}

export async function generateSOAPNote(
  narration: string, 
  templateType: string,
  userId?: string
) {
  // 1. Sanitize
  const sanitized = sanitizeNarration(narration);

  // 2. Truncate if too long (saves tokens)
  const maxLength = 2000;
  const truncated = sanitized.length > maxLength 
    ? sanitized.slice(0, maxLength) + '...' 
    : sanitized;

  // 3. Fetch personalization hints if userId provided
  let personalizationHints = '';
  if (userId) {
    personalizationHints = await getPersonalizationHints(userId, templateType);
  }

  // 4. Build final system prompt
  const systemPrompt = personalizationHints 
    ? `${getSystemPrompt(templateType)}\n\n${personalizationHints}`
    : getSystemPrompt(templateType);

  // 5. Call OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: truncated },
    ],
    max_tokens: 800,
    temperature: 0.2,
  });

  const content = response.choices[0].message.content || '';
  const tokensUsed = response.usage?.total_tokens || 0;

  // 6. Log token usage
  await logTokenUsage(tokensUsed, templateType);

  // 7. Parse compliance flags from the response
  const flags = extractComplianceFlags(content);

  return {
    content,
    flags,
    tokensUsed,
  };
}

async function getPersonalizationHints(userId: string, templateType: string): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const { data: notes } = await supabase
    .from('soap_notes')
    .select('generated_note, compliance_flags')
    .eq('user_id', userId)
    .eq('template_type', templateType)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!notes || notes.length === 0) return '';

  const avgLength = notes.reduce((sum, n) => sum + (n.generated_note?.length || 0), 0) / notes.length;
  const style = avgLength > 800 ? 'detailed' : 'concise';

  return `This dentist prefers ${style} documentation (avg ${Math.round(avgLength)} chars).`;
}

function extractComplianceFlags(content: string): any[] {
  const flags: any[] = [];
  const lower = content.toLowerCase();

  if (!lower.includes('consent')) {
    flags.push({ field: 'Informed Consent', severity: 'error', message: 'No informed consent documented' });
  }
  if (!lower.includes('vitals') && !lower.includes('bp') && !lower.includes('blood pressure')) {
    flags.push({ field: 'Vitals/Baseline', severity: 'warning', message: 'No baseline vitals recorded' });
  }
  if (!lower.includes('follow-up') && !lower.includes('follow up')) {
    flags.push({ field: 'Follow-up Plan', severity: 'warning', message: 'No follow-up plan specified' });
  }
  if (!lower.includes('post-op') && !lower.includes('postoperative')) {
    flags.push({ field: 'Post-op Instructions', severity: 'warning', message: 'Post-operative instructions not documented' });
  }

  return flags;
}

async function logTokenUsage(tokens: number, templateType: string) {
  const supabase = createServiceRoleClient();
  await supabase.from('token_usage').insert({
    tokens,
    template_type: templateType,
    created_at: new Date().toISOString(),
  });

  // Alert if high
  if (tokens > 2000) {
    console.warn(`High token usage: ${tokens} for ${templateType}`);
  }
}

// Demo version (limited)
export async function generateDemoNote(narration: string) {
  const sanitized = sanitizeNarration(narration);
  const truncated = sanitized.length > 1000 ? sanitized.slice(0, 1000) + '...' : sanitized;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Generate a brief dental SOAP note. Include S, O, A, P sections. Flag any obvious missing elements.' 
      },
      { role: 'user', content: truncated },
    ],
    max_tokens: 400,
    temperature: 0.2,
  });

  const content = response.choices[0].message.content || '';
  return {
    content,
    flags: extractComplianceFlags(content),
  };
}

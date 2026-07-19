export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: 'free' | 'solo' | 'practice' | 'group' | 'cancelled';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  notes_used_this_period: number;
  period_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface SOAPNote {
  id: string;
  user_id: string;
  template_type: string;
  narration: string | null;
  generated_note: string | null;
  compliance_flags: any[];
  word_count: number | null;
  created_at: string;
}

export interface ComplianceFlag {
  field: string;
  severity: 'warning' | 'error';
  message: string;
}

export interface Practice {
  id: string;
  name: string;
  invite_code: string;
  plan: 'practice' | 'group';
  owner_id: string;
  created_at: string;
}

export interface PracticeMember {
  id: string;
  practice_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface OpenDentalConfig {
  developerKey: string;
  customerKey: string;
  baseUrl: string;
}

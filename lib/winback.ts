import { createServiceRoleClient } from './supabase';

export async function sendWinBackEmails() {
  const supabase = createServiceRoleClient();
  
  const intervals = [
    { days: 7, subject: 'Missing DentScribe already?' },
    { days: 30, subject: 'Your notes are waiting — 50% off your first month back' },
    { days: 90, subject: 'We built new features you asked for' },
  ];

  for (const interval of intervals) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - interval.days);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const { data: cancelledUsers } = await supabase
      .from('profiles')
      .select('id, email, full_name, cancelled_at, plan')
      .eq('plan', 'cancelled')
      .gte('cancelled_at', startDate.toISOString())
      .lt('cancelled_at', endDate.toISOString());

    for (const user of cancelledUsers || []) {
      const body = getWinBackEmailBody(user.full_name || 'there', interval.days);
      
      // Send via your email provider (Resend, SendGrid, etc.)
      // For now, log it — replace with actual email sending
      console.log(`Sending win-back email to ${user.email}: ${interval.subject}`);
      
      // Example with fetch to email API:
      // await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      //   body: JSON.stringify({
      //     from: 'Dr. Founder <founder@dentscribe.com>',
      //     to: user.email,
      //     subject: interval.subject,
      //     text: body,
      //   }),
      // });
    }
  }
}

function getWinBackEmailBody(name: string, days: number): string {
  if (days === 7) {
    return `Hi ${name},

We noticed you cancelled DentScribe a week ago. If it was a budget thing, we get it — running a practice is expensive.

If it was something else (missing features, too complex, didn't save time), I'd love to know. Just reply to this email — I read every one personally.

If you want to come back, your account and all your notes are exactly where you left them.

- The DentScribe Team`;
  }

  if (days === 30) {
    return `Hi ${name},

It's been a month since you left DentScribe. We miss having you on the team.

Come back and get 50% off your first month. Your templates and note history are exactly where you left them.

Reactivate here: ${process.env.NEXT_PUBLIC_SITE_URL}/pricing?promo=COMEBACK50

- The DentScribe Team`;
  }

  return `Hi ${name},

It's been 3 months, and we've been busy:

• New voice dictation mode — no more typing
• One-click push to Open Dental
• Team analytics for your whole practice
• 40% faster note generation

Your account is still there. Want to see what's new?

Reactivate for free: ${process.env.NEXT_PUBLIC_SITE_URL}/pricing?promo=RETURNFREE

- The DentScribe Team`;
}

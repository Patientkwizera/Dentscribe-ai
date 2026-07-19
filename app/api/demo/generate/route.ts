import { NextResponse } from 'next/server';
import { generateDemoNote } from '@/lib/openai';

// Simple in-memory rate limiting (replace with Redis in production)
const ipRequests: Record<string, number[]> = {};

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000; // 1 hour window
  
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  }
  
  ipRequests[ip] = ipRequests[ip].filter(time => time > windowStart);
  
  if (ipRequests[ip].length >= 3) {
    return true;
  }
  
  ipRequests[ip].push(now);
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Demo limit reached. Create a free account for more.' },
      { status: 429 }
    );
  }

  try {
    const { narration } = await request.json();
    
    if (!narration || narration.length < 20) {
      return NextResponse.json(
        { error: 'Please provide a longer narration (at least 20 characters).' },
        { status: 400 }
      );
    }

    const note = await generateDemoNote(narration);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Demo generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate note. Please try again.' },
      { status: 500 }
    );
  }
}

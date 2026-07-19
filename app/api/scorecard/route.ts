import { NextResponse } from 'next/server';

const REQUIRED_ELEMENTS = [
  { keyword: 'subjective', name: 'Subjective section', weight: 12 },
  { keyword: 'objective', name: 'Objective section', weight: 12 },
  { keyword: 'assessment', name: 'Assessment section', weight: 12 },
  { keyword: 'plan', name: 'Plan section', weight: 12 },
  { keyword: 'consent', name: 'Informed consent', weight: 10 },
  { keyword: 'vitals', name: 'Vitals/baseline', weight: 10 },
  { keyword: 'follow-up', name: 'Follow-up plan', weight: 10 },
  { keyword: 'post-op', name: 'Post-op instructions', weight: 10 },
  { keyword: 'allerg', name: 'Allergies', weight: 6 },
  { keyword: 'medication', name: 'Medications', weight: 6 },
];

export async function POST(request: Request) {
  try {
    const { note } = await request.json();

    if (!note || note.length < 50) {
      return NextResponse.json(
        { error: 'Please provide a longer note (at least 50 characters).' },
        { status: 400 }
      );
    }

    const missingElements = [];
    let score = 100;
    const lower = note.toLowerCase();

    for (const element of REQUIRED_ELEMENTS) {
      if (!lower.includes(element.keyword)) {
        missingElements.push(element.name);
        score -= element.weight;
      }
    }

    return NextResponse.json({ 
      score: Math.max(0, score),
      missingElements,
      totalElements: REQUIRED_ELEMENTS.length,
      passedElements: REQUIRED_ELEMENTS.length - missingElements.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}

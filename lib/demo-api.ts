export async function generateDemoNote(narration: string) {
  const response = await fetch('/api/demo/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ narration }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate note');
  }

  return response.json();
}

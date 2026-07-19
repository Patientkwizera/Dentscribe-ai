import { OpenDentalConfig } from '@/types';

export async function pushToOpenDental(
  config: OpenDentalConfig,
  patientId: string,
  procedureId: string,
  note: string
) {
  const response = await fetch(`${config.baseUrl}/procnotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.customerKey}`,
      'X-Developer-Key': config.developerKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      PatNum: patientId,
      ProcNum: procedureId,
      Note: note,
      EntryDateTime: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Open Dental push failed: ${error}`);
  }

  return response.json();
}

export async function testOpenDentalConnection(config: OpenDentalConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.baseUrl}/patients?limit=1`, {
      headers: {
        'Authorization': `Bearer ${config.customerKey}`,
        'X-Developer-Key': config.developerKey,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

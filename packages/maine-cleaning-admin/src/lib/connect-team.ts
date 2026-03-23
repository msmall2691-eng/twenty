import type { Job } from '@prisma/client';

type ConnectTeamShift = {
  title: string;
  startTime: string;
  endTime: string;
  locationName?: string;
  description?: string;
  assignedUserIds?: string[];
};

type ConnectTeamJobUpdate = {
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: string;
};

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CONNECT_TEAM_API_KEY}`,
  };
}

const BASE_URL = process.env.CONNECT_TEAM_API_URL ?? 'https://api.connecteam.com/api/v1';

type JobWithClient = Job & {
  client: { firstName: string; lastName: string };
};

// Push a new job as a shift in ConnectTeam
export async function createConnectTeamShift(job: JobWithClient): Promise<string | null> {
  if (!process.env.CONNECT_TEAM_API_KEY) {
    console.warn('ConnectTeam API key not configured');
    return null;
  }

  try {
    const startTime = new Date(job.scheduledAt);
    const endTime = new Date(startTime.getTime() + job.duration * 60 * 1000);

    const assignedTo: string[] = job.assignedTo ? JSON.parse(job.assignedTo) : [];

    const shift: ConnectTeamShift = {
      title: `${job.serviceType} – ${job.client.firstName} ${job.client.lastName}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      locationName: job.address ?? undefined,
      description: [
        `Service: ${job.serviceType}`,
        job.address ? `Address: ${job.address}` : '',
        job.notes ? `Notes: ${job.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      assignedUserIds: assignedTo,
    };

    const response = await fetch(`${BASE_URL}/shifts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shift),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ConnectTeam create shift error:', error);
      return null;
    }

    const data = await response.json() as { id: string };
    return data.id ?? null;
  } catch (error) {
    console.error('ConnectTeam create shift error:', error);
    return null;
  }
}

// Update shift status in ConnectTeam (e.g. when job is completed)
export async function updateConnectTeamShift(
  shiftId: string,
  update: ConnectTeamJobUpdate,
): Promise<boolean> {
  if (!process.env.CONNECT_TEAM_API_KEY) return false;

  try {
    const response = await fetch(`${BASE_URL}/shifts/${shiftId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(update),
    });

    return response.ok;
  } catch (error) {
    console.error('ConnectTeam update shift error:', error);
    return false;
  }
}

// Delete shift (on job cancellation)
export async function deleteConnectTeamShift(shiftId: string): Promise<boolean> {
  if (!process.env.CONNECT_TEAM_API_KEY) return false;

  try {
    const response = await fetch(`${BASE_URL}/shifts/${shiftId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('ConnectTeam delete shift error:', error);
    return false;
  }
}

// Get shift status / clock-in data from ConnectTeam
export async function getConnectTeamShift(shiftId: string): Promise<Record<string, unknown> | null> {
  if (!process.env.CONNECT_TEAM_API_KEY) return null;

  try {
    const response = await fetch(`${BASE_URL}/shifts/${shiftId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('ConnectTeam get shift error:', error);
    return null;
  }
}

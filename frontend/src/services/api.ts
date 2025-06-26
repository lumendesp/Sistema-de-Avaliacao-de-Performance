const API_URL = 'http://localhost:3000';

// Função auxiliar para obter o token do localStorage
const getAuthToken = () => localStorage.getItem('token');

// Headers padrão para chamadas autenticadas
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

export const loginRequest = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  return res.json();
};


// This function seems unused in the committee context, but I'll leave it.
// To use it, you would need a corresponding backend endpoint.
export const updateEvaluation = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/users/evaluations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update evaluation');
  }
  return response.json();
}; 

//RH Criteria

export const getAllRhCriteria = async () => {
  const res = await fetch(`${API_URL}/rh-criteria`);
  if (!res.ok) throw new Error('Erro ao buscar critérios');
  return res.json();
};

export const createRhCriterion = async (data: { name: string; generalDescription: string; active?: boolean }) => {
  const res = await fetch(`${API_URL}/rh-criteria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar critério');
  return res.json();
};

export const updateRhCriterion = async (id: number, data: Partial<{ name: string; generalDescription: string; active: boolean }>) => {
  const res = await fetch(`${API_URL}/rh-criteria/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar critério');
  return res.json();
};

export const deleteRhCriterion = async (id: number) => {
  const res = await fetch(`${API_URL}/rh-criteria/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar critério');
  return res.json();
};

// Track API functions
export const getAllTracks = async () => {
  const res = await fetch(`${API_URL}/tracks`);
  if (!res.ok) throw new Error('Erro ao buscar tracks');
  return res.json();
};

export const getTrackById = async (id: number) => {
  const res = await fetch(`${API_URL}/tracks/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar track');
  return res.json();
};

export const createTrack = async (data: { name: string }) => {
  const res = await fetch(`${API_URL}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar track');
  return res.json();
};

export const updateTrack = async (id: number, data: Partial<{ name: string }>) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar track');
  return res.json();
};

export const deleteTrack = async (id: number) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar track');
  return res.json();
};

// Track users management
export const addUserToTrack = async (trackId: number, userId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Erro ao adicionar usuário à track');
  return res.json();
};

export const removeUserFromTrack = async (trackId: number, userId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao remover usuário da track');
  return res.json();
};

export const getTrackUsers = async (trackId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users`);
  if (!res.ok) throw new Error('Erro ao buscar usuários da track');
  return res.json();
};

export const getTrackHistory = async (trackId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/history`);
  if (!res.ok) throw new Error('Erro ao buscar histórico da track');
  return res.json();
};

// Get all criteria for a track
export const getCriteriaByTrack = async (trackId: number) => {
  const res = await fetch(`${API_URL}/rh-criteria/track/${trackId}`);
  if (!res.ok) throw new Error('Erro ao buscar critérios da trilha');
  return res.json();
};

// ConfiguredCriterion API functions
export const createConfiguredCriterion = async (data: {
  criterionId: number;
  groupId: number;
  trackId: number;
  unitId: number;
  positionId: number;
  mandatory: boolean;
}) => {
  const res = await fetch(`${API_URL}/rh-criteria/configured`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar critério configurado');
  return res.json();
};

export const getAllConfiguredCriteria = async () => {
  const res = await fetch(`${API_URL}/rh-criteria/configured/all`);
  if (!res.ok) throw new Error('Erro ao buscar critérios configurados');
  return res.json();
};

// Add a criterion to a track
export const addCriterionToTrack = async (
  trackId: number,
  criterionId: number,
  groupId: number,
  unitId: number,
  positionId: number,
  mandatory: boolean
) => {
  const res = await fetch(`${API_URL}/rh-criteria/track/${trackId}/criterion/${criterionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, unitId, positionId, mandatory }),
    }
  );
  if (!res.ok) throw new Error('Erro ao adicionar critério à trilha');
  return res.json();
};

// Remove a criterion from a track
export const removeCriterionFromTrack = async (trackId: number, criterionId: number) => {
  const res = await fetch(`${API_URL}/rh-criteria/track/${trackId}/criterion/${criterionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao remover critério da trilha');
  return res.json();
};
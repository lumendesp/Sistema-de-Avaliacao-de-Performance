const API_URL = "http://localhost:3000";

// Função auxiliar para obter o token do localStorage
const getAuthToken = () => localStorage.getItem("token");

// Headers padrão para chamadas autenticadas
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

export const loginRequest = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
};

export const fetchMentors = async () => {
  const res = await fetch(`${API_URL}/mentors`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erro ao buscar mentores');
  }

  return res.json(); // aqui retorna o array de mentores (ou o que sua API devolver)
};


export const submitMentorEvaluation = async (
  evaluateeId: number,
  score: number,
  justification: string
) => {
  const token = getAuthToken();
  console.log("Token JWT enviado:", token);

  const res = await fetch(`${API_URL}/mentor-evaluations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      evaluateeId,
      score,
      justification,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao enviar avaliação");
  }

  return res.json();
};

export const fetchMentorEvaluation = async (evaluateeId: number) => {
  const res = await fetch(`${API_URL}/mentor-evaluations/me/${evaluateeId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar avaliação existente");
  }

  return res.json();
};


// Fetches all users with their associated evaluations
export const getUsersWithEvaluations = async () => {
  const response = await fetch(`${API_URL}/committee/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
};

// Creates a new final evaluation
export const createFinalEvaluation = async (data: {
  score: number;
  justification: string;
  evaluateeId: number;
  evaluatorId: number;
}) => {
  const response = await fetch(`${API_URL}/committee/evaluations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    console.log(data.score);
    console.log(data.justification);
    console.log(data.evaluateeId);
    console.log(data.evaluatorId);
    throw new Error("Failed to create final evaluation");
  }
  return response.json();
};

// This function seems unused in the committee context, but I'll leave it.
// To use it, you would need a corresponding backend endpoint.
export const updateEvaluation = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/users/evaluations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update evaluation");
  }
  return response.json();
};

export const fetchManagerCollaborators = async (managerId: number) => {
  const res = await fetch(`${API_URL}/manager/${managerId}/collaborators`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar colaboradores');
  return res.json();
};

export const fetchManagerEvaluation = async (collaboratorId: number) => {
  const res = await fetch(`${API_URL}/manager-evaluation/by-evaluatee/${collaboratorId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (res.status === 404) return null; // Não existe avaliação ainda
  if (!res.ok) throw new Error('Erro ao buscar avaliação');
  return res.json();
};

export const createManagerEvaluation = async (data: { evaluateeId: number; cycleId: number; groups: any[] }) => {
  // Log para debug
  console.log('Payload enviado para manager-evaluation:', data);
  const res = await fetch(`${API_URL}/manager-evaluation`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Erro ao criar avaliação:', error);
    throw new Error(error.message || 'Erro ao criar avaliação');
  }
  return res.json();
};

export const updateManagerEvaluation = async (evaluateeId: number, data: any) => {
  const res = await fetch(`${API_URL}/manager-evaluation/by-evaluatee/${evaluateeId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar avaliação');
  return res.json();
};

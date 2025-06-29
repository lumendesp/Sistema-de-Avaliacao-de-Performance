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
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar mentores");
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
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar avaliação existente");
  }

  return res.json();
};

export const fetchCollaboratorsBySearch = async (searchTerm: string) => {
  const res = await fetch(
    `${API_URL}/collaborators-search-bar?search=${encodeURIComponent(
      searchTerm
    )}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar colaboradores");
  }

  return res.json(); // array de usuários com role COLLABORATOR
};

// Cria uma nova referência
export const createReference = async (
  receiverId: number,
  cycleId: number,
  justification: string
) => {
  const res = await fetch(`${API_URL}/references`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ receiverId, cycleId, justification }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar referência");
  }
  return res.json();
};

// Busca todas as referências enviadas pelo usuário logado em um ciclo
export const fetchMyReferences = async (cycleId: number) => {
  const res = await fetch(`${API_URL}/references/me?cycleId=${cycleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar minhas referências");
  }
  return res.json();
};

export const createPeerEvaluation = async (evaluationData: {
  evaluateeId: number;
  cycleId: number;
  strengths: string;
  improvements: string;
  motivation: string; // CONCORDO_TOTALMENTE etc.
  score: number;
  projects: { name: string; period: number }[];
}) => {
  const res = await fetch(`${API_URL}/peer-evaluations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(evaluationData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar avaliação por pares");
  }

  return res.json();
};

export const fetchMyPeerEvaluations = async (cycleId: number) => {
  const res = await fetch(`${API_URL}/peer-evaluations/me?cycleId=${cycleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar avaliações por pares");
  }

  return res.json(); // retorna array de avaliações
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

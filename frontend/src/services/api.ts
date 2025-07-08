import { data } from "react-router-dom";

export const API_URL = "http://localhost:3000";

// Função auxiliar para obter o token do localStorage
const getAuthToken = () => localStorage.getItem("token");

// Headers padrão para chamadas autenticadas
export const getAuthHeaders = () => ({
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

export const fetchActiveEvaluationCycle = async () => {
  const res = await fetch(`${API_URL}/evaluation-cycle/active`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar ciclo ativo");
  }

  return res.json();
};

export const fetchEvaluationCompletionStatus = async (cycleId: number) => {
  const res = await fetch(`http://localhost:3000/evaluation-completion/status?cycleId=${cycleId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar status da avaliação");
  }

  return (await res.json()) as {
    self: boolean;
    peer: boolean;
    mentor: boolean;
    reference: boolean;
  };
};

export const fetchMentorEvaluation = async (evaluateeId: number, cycleId?: number) => {
  let url = `${API_URL}/mentor-evaluations/me/${evaluateeId}`;
  if (cycleId) {
    url += `?cycleId=${cycleId}`;
  }
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar avaliação existente");
  }

  return res.json();
};

export const findOrCreateEmptyMentorEvaluation = async (
  evaluateeId: number
) => {
  const res = await fetch(
    `${API_URL}/mentor-evaluations/find-or-create/${evaluateeId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar ou criar avaliação vazia");
  }

  return res.json();
};

export const updateMentorEvaluation = async (
  evaluationId: number,
  data: { score?: number; justification?: string }
) => {
  const res = await fetch(`${API_URL}/mentor-evaluations/${evaluationId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar avaliação do mentor");
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

export async function updateReference(id: number, newJustification: string) {
  const res = await fetch(`${API_URL}/references/${id}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ justification: newJustification }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao editar referência");
  }

  return res.json();
}

export async function deleteReference(id: number) {
  const res = await fetch(`${API_URL}/references/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao deletar referência");
  }

  return res.json();
}

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

export const findOrCreateEmptyPeerEvaluation = async (evaluateeId: number) => {
  const res = await fetch(
    `${API_URL}/peer-evaluations/find-or-create/${evaluateeId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar ou criar avaliação vazia");
  }

  return res.json();
};

export const updatePeerEvaluation = async (
  evaluationId: number,
  data: {
    score?: number;
    strengths?: string;
    improvements?: string;
    motivation?: string;
    projects?: { name: string; period: number }[];
  }
) => {
  const res = await fetch(`${API_URL}/peer-evaluations/${evaluationId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar avaliação por pares");
  }

  return res.json();
};

export const deletePeerEvaluation = async (id: number) => {
  const res = await fetch(`${API_URL}/peer-evaluations/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(), // reutiliza a lógica de token
    },
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir avaliação");
  }

  return true;
};

export const getProjects = async () => {
  const res = await fetch(`${API_URL}/projects`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar projetos");
  }

  return res.json(); // deve retornar a lista de projetos
};


export const fetchAISummary = async (
  userId: number,
  cycleId: number
): Promise<string> => {
  console.log(userId, cycleId);
  const res = await fetch(
    `${API_URL}/ai-summary?userId=${userId}&cycleId=${cycleId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar resumo da IA");
  }

  return res.text(); // o backend já retorna só o texto do resumo
};

// Fetches all users with their associated evaluations

export const getUsersWithEvaluationsForCommittee = async () => {
  const response = await fetch(`${API_URL}/users/evaluations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
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

// Busca os dados do usuário pelo id
export const getUserById = async (id: number) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Não foi possível obter o usuário");
  }
  return response.json();
};

// Gestor (avaliações)

export const fetchManagerCollaborators = async (managerId: number) => {
  const res = await fetch(`${API_URL}/manager/${managerId}/collaborators`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar colaboradores");
  return res.json();
};

export const fetchManagerEvaluation = async (collaboratorId: number) => {
  const res = await fetch(
    `${API_URL}/manager-evaluation/by-evaluatee/${collaboratorId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (res.status === 404) return null; // Não existe avaliação ainda
  if (!res.ok) throw new Error("Erro ao buscar avaliação");
  return res.json();
};

export const createManagerEvaluation = async (data: {
  evaluateeId: number;
  cycleId: number;
  groups: any[];
}) => {
  // Log para debug
  console.log("Payload enviado para manager-evaluation:", data);
  const res = await fetch(`${API_URL}/manager-evaluation`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("Erro ao criar avaliação:", error);
    throw new Error(error.message || "Erro ao criar avaliação");
  }
  return res.json();
};

export const updateManagerEvaluation = async (
  evaluateeId: number,
  data: any
) => {
  const res = await fetch(
    `${API_URL}/manager-evaluation/by-evaluatee/${evaluateeId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Erro ao atualizar avaliação");
  return res.json();
};

//RH Criteria

export const getAllRhCriteria = async () => {
  const res = await fetch(`${API_URL}/rh-criteria`);
  if (!res.ok) throw new Error("Erro ao buscar critérios");
  return res.json();
};

export const createRhCriterion = async (data: {
  name: string;
  generalDescription: string;
  active?: boolean;
}) => {
  const res = await fetch(`${API_URL}/rh-criteria`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar critério");
  return res.json();
};

export const updateRhCriterion = async (
  id: number,
  data: Partial<{ name: string; generalDescription: string; active: boolean }>
) => {
  const res = await fetch(`${API_URL}/rh-criteria/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar critério");
  return res.json();
};

export const deleteRhCriterion = async (id: number) => {
  const res = await fetch(`${API_URL}/rh-criteria/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar critério");
  return res.json();
};

// Track API functions
export const getAllTracks = async () => {
  const res = await fetch(`${API_URL}/tracks`);
  if (!res.ok) throw new Error("Erro ao buscar tracks");
  return res.json();
};

export const getTrackById = async (id: number) => {
  const res = await fetch(`${API_URL}/tracks/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar track");
  return res.json();
};

export const createTrack = async (data: { name: string }) => {
  const res = await fetch(`${API_URL}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar track");
  return res.json();
};

export const updateTrack = async (
  id: number,
  data: Partial<{ name: string }>
) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar track");
  return res.json();
};

export const deleteTrack = async (id: number) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar track");
  // Don't try to parse JSON for 204 No Content responses
  if (res.status === 204) {
    return { success: true };
  }
  return res.json();
};

// Track users management
export const addUserToTrack = async (trackId: number, userId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Erro ao adicionar usuário à track");
  return res.json();
};

export const removeUserFromTrack = async (trackId: number, userId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao remover usuário da track");
  // Don't try to parse JSON for 204 No Content responses
  if (res.status === 204) {
    return { success: true };
  }
  return res.json();
};

export const getTrackUsers = async (trackId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/users`);
  if (!res.ok) throw new Error("Erro ao buscar usuários da track");
  return res.json();
};

export const getTrackHistory = async (trackId: number) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}/history`);
  if (!res.ok) throw new Error("Erro ao buscar histórico da track");
  return res.json();
};

// Get all criteria for a track
export const getCriteriaByTrack = async (trackId: number) => {
  const res = await fetch(`${API_URL}/rh-criteria/track/${trackId}`);
  if (!res.ok) throw new Error("Erro ao buscar critérios da trilha");
  return res.json();
};

// Get tracks with criteria organized by groups
export const getTracksWithCriteria = async () => {
  const res = await fetch(`${API_URL}/rh-criteria/tracks/with-criteria`);
  if (!res.ok) throw new Error("Erro ao buscar trilhas com critérios");
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar critério configurado");
  return res.json();
};

export const getAllConfiguredCriteria = async () => {
  const res = await fetch(`${API_URL}/rh-criteria/configured/all`);
  if (!res.ok) throw new Error("Erro ao buscar critérios configurados");
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
  const res = await fetch(
    `${API_URL}/rh-criteria/track/${trackId}/criterion/${criterionId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, unitId, positionId, mandatory }),
    }
  );
  if (!res.ok) throw new Error("Erro ao adicionar critério à trilha");
  return res.json();
};

// Remove a criterion from a track
export const removeCriterionFromTrack = async (
  trackId: number,
  criterionId: number
) => {
  const res = await fetch(
    `${API_URL}/rh-criteria/track/${trackId}/criterion/${criterionId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Erro ao remover critério da trilha");
  // Don't try to parse JSON for 204 No Content responses
  if (res.status === 204) {
    return { success: true };
  }
  return res.json();
};

// Update a criterion in a track
export const updateCriterionInTrack = async (
  trackId: number,
  criterionId: number,
  data: { mandatory?: boolean; unitId?: number; positionId?: number }
) => {
  const res = await fetch(
    `${API_URL}/rh-criteria/track/${trackId}/criterion/${criterionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Erro ao atualizar critério na trilha");
  return res.json();
};

// Get all units
export const getUnits = async () => {
  const res = await fetch(`${API_URL}/units`);
  if (!res.ok) throw new Error("Erro ao buscar unidades");
  return res.json();
};

// Get all positions
export const getPositions = async () => {
  const res = await fetch(`${API_URL}/positions`);
  if (!res.ok) throw new Error("Erro ao buscar posições");
  return res.json();
};

// Create default group for a track
export const createDefaultGroup = async (
  trackId: number,
  unitId: number,
  positionId: number
) => {
  const res = await fetch(
    `${API_URL}/rh-criteria/track/${trackId}/default-group`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId, positionId }),
    }
  );
  if (!res.ok) throw new Error("Erro ao criar grupo padrão");
  return res.json();
};

// Create a new criterion group
export const createCriterionGroup = async (data: {
  name: string;
  trackId: number;
  unitId: number;
  positionId: number;
}) => {
  const res = await fetch(`${API_URL}/criterion-groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar grupo de critérios");
  return res.json();
};

// Add a criterion to a specific group
export const addCriterionToGroup = async (
  groupId: number,
  criterionId: number,
  trackId: number,
  unitId: number,
  positionId: number,
  mandatory: boolean = false
) => {
  const res = await fetch(`${API_URL}/rh-criteria/configured`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      criterionId,
      groupId,
      trackId,
      unitId,
      positionId,
      mandatory,
    }),
  });
  if (!res.ok) throw new Error("Erro ao adicionar critério ao grupo");
  return res.json();
};

// Update a criterion group
export const updateCriterionGroup = async (
  id: number,
  data: { name: string }
) => {
  const res = await fetch(`${API_URL}/criterion-groups/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar grupo de critérios");
  return res.json();
};

// Delete a criterion group
export const deleteCriterionGroup = async (id: number) => {
  const res = await fetch(`${API_URL}/criterion-groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao deletar grupo de critérios");
  // Don't try to parse JSON for 204 No Content responses
  if (res.status === 204) {
    return { success: true };
  }
  return res.json();
};

export const fetchManagersBySearch = async (searchTerm: string) => {
  const res = await fetch(
    `${API_URL}/managers-search-bar?search=${encodeURIComponent(searchTerm)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar gestores");
  }

  return res.json(); // array de usuários com role MANAGER
};

// Committee evaluation functions
export const getUsersWithEvaluations = async () => {
  const res = await fetch(`${API_URL}/users/evaluations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar usuários com avaliações");
  return res.json();
};

// Final Score functions
export const createFinalScore = async (data: {
  userId: number;
  executionScore?: number;
  postureScore?: number;
  finalScore?: number;
  summary?: string;
  justification: string;
  cycleId?: number;
}) => {
  console.log("Creating final score with data:", data);
  const res = await fetch(`${API_URL}/final-scores`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errorMsg = "Erro ao criar avaliação final";
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorMsg;
    } catch {
      const errorText = await res.text();
      if (errorText) errorMsg = errorText;
    }
    console.error("Error response:", errorMsg);
    throw new Error(errorMsg);
  }
  return res.json();
};

export const updateFinalScore = async (
  id: number,
  data: {
    executionScore?: number;
    postureScore?: number;
    finalScore?: number;
    summary?: string;
    justification?: string;
  }
) => {
  const res = await fetch(`${API_URL}/final-scores/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar avaliação final");
  return res.json();
};

export const getFinalScores = async (cycleId?: number) => {
  const url = cycleId
    ? `${API_URL}/final-scores?cycleId=${cycleId}`
    : `${API_URL}/final-scores`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar avaliações finais");
  return res.json();
};

export const getFinalScoreByUser = async (userId: number, cycleId?: number) => {
  const url = cycleId
    ? `${API_URL}/final-scores/user/${userId}?cycleId=${cycleId}`
    : `${API_URL}/final-scores/user/${userId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar avaliação final do usuário");
  return res.json();
};

export const getManagerEvaluations = async (cycleId?: number) => {
  const url = cycleId
    ? `${API_URL}/manager-evaluations?cycleId=${cycleId}`
    : `${API_URL}/manager-evaluations`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar avaliações dos gestores");
  return res.json();
};

export const getManagerEvaluationsByUser = async (
  userId: number,
  cycleId?: number
) => {
  const url = cycleId
    ? `${API_URL}/manager-evaluations/user/${userId}?cycleId=${cycleId}`
    : `${API_URL}/manager-evaluations/user/${userId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error("Erro ao buscar avaliações do gestor para o usuário");
  return res.json();
};

export const getMyManagerEvaluations = async (cycleId?: number) => {
  const url = cycleId
    ? `${API_URL}/manager-evaluations/evaluator/me?cycleId=${cycleId}`
    : `${API_URL}/manager-evaluations/evaluator/me`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar minhas avaliações de gestor");
  return res.json();
};

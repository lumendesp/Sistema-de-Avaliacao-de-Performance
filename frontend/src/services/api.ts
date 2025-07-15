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

// Agora aceita um parâmetro opcional de role
export const fetchActiveEvaluationCycle = async (role?: string) => {
  let mainRole = role;
  if (!mainRole) {
    // Buscar o usuário do localStorage para obter o role
    const userStr = localStorage.getItem("user");
    mainRole = "COLLABORATOR"; // default
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        mainRole = user.roles?.[0] || "COLLABORATOR";
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage:", error);
      }
    }
  }
  const res = await fetch(
    `${API_URL}/evaluation-cycle/active?type=${mainRole}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error("Erro ao buscar ciclo ativo");
  }
  return res.json();
};

export const fetchEvaluationCompletionStatus = async (cycleId: number) => {
  const res = await fetch(
    `http://localhost:3000/evaluation-completion/status?cycleId=${cycleId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar status da avaliação");
  }

  return (await res.json()) as {
    completionStatus: {
      self: boolean;
      peer: boolean;
      mentor: boolean;
      reference: boolean;
    };
    lastSubmittedAt: string | null;
    isSubmit: boolean;
  };
};

export const submitEvaluation = async (cycleId: number) => {
  const res = await fetch(
    `http://localhost:3000/evaluation-completion/submit`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ cycleId }),
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.message || "Erro ao enviar avaliações";
    throw new Error(message);
  }

  return (await res.json()) as {
    submittedAt: string;
  };
};

export const unlockEvaluations = async (cycleId: number) => {
  const res = await fetch(
    "http://localhost:3000/evaluation-completion/unlock",
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ cycleId }),
    }
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = errorBody?.message || "Erro ao desbloquear avaliações";
    throw new Error(message);
  }

  return await res.json();
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

// Get significant drops for a user in a specific cycle
export const getSignificantDrops = async (userId: number, cycleId: number) => {
  const response = await fetch(
    `${API_URL}/users/${userId}/significant-drops/${cycleId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No significant drops found
    }
    throw new Error("Failed to fetch significant drops");
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

// Climate Survey
export const createClimateSurvey = async (data: {
  title: string;
  description?: string;
  endDate: string;
  questions: { text: string }[];
}) => {
  const res = await fetch(`${API_URL}/rh/climate-survey`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao criar pesquisa de clima");
  }

  return res.json();
};

export const getClimateSurveys = async () => {
  const res = await fetch(`${API_URL}/rh/climate-survey`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar pesquisas de clima");
  }

  return res.json();
};

export const getClimateSurveyById = async (surveyId: number) => {
  const res = await fetch(`${API_URL}/rh/climate-survey/${surveyId}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar pesquisa");
  }

  return res.json();
};

export const getClimateSurveyResponses = async (surveyId: number) => {
  const res = await fetch(
    `${API_URL}/rh/climate-survey/${surveyId}/responses`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao buscar respostas da pesquisa");
  }

  return res.json();
};

export const closeClimateSurvey = async (
  surveyId: number,
  endDate?: string
) => {
  const res = await fetch(`${API_URL}/rh/climate-survey/${surveyId}/close`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ endDate }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao encerrar pesquisa");
  }

  return res.json();
};

export const reopenClimateSurvey = async (surveyId: number) => {
  const res = await fetch(`${API_URL}/rh/climate-survey/${surveyId}/reopen`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao reabrir pesquisa");
  }

  return res.json();
};

export const countCollaborators = async () => {
  const res = await fetch(`${API_URL}/rh/climate-survey/count`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao contar colaboradores");
  }

  return res.json(); // vai retornar algo como: { count: 42 }
};

export const getClimateSurveyAverages = async () => {
  const res = await fetch(`${API_URL}/rh/climate-survey/averages`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erro ao buscar médias das pesquisas");
  }
  return res.json();
};

export const getLastCompletedSurveyData = async () => {
  try {
    console.log("🔍 Buscando dados da última pesquisa finalizada...");

    // Busca todas as pesquisas
    const surveys = await getClimateSurveys();
    console.log("Pesquisas encontradas:", surveys.length);

    // Filtra apenas as pesquisas finalizadas (não ativas) e ordena por data de criação
    const completedSurveys = surveys
      .filter((s: any) => !s.isActive)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    console.log("Pesquisas finalizadas:", completedSurveys.length);

    if (completedSurveys.length === 0) {
      console.log("Nenhuma pesquisa finalizada encontrada");
      return { satisfactionScore: null, shortText: null };
    }

    // Pega a pesquisa mais recente finalizada
    const lastCompletedSurvey = completedSurveys[0];
    console.log("Última pesquisa finalizada:", lastCompletedSurvey);

    // Busca o resumo de IA da última pesquisa finalizada
    console.log("Buscando resumo para pesquisa ID:", lastCompletedSurvey.id);
    const summary = await getClimateAISummary(lastCompletedSurvey.id);
    console.log("Resumo completo:", summary);
    console.log("Score de satisfação:", summary.satisfactionScore);
    console.log("Resumo curto:", summary.shortText);

    return {
      satisfactionScore: summary.satisfactionScore,
      shortText: summary.shortText,
    };
  } catch (error) {
    console.error(
      "Erro ao buscar dados da última pesquisa finalizada:",
      error
    );
    return { satisfactionScore: null, shortText: null };
  }
};

export const getClimateAISummary = async (surveyId: number) => {
  const res = await fetch(
    `${API_URL}/ai-climate-summary?surveyId=${surveyId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erro ao buscar resumo de IA da pesquisa");
  }

  const data = await res.json();
  return {
    text: data.text || null,
    shortText: data.shortText || null,
    satisfactionScore: data.satisfactionScore || null,
    status: data.status || "pending",
  };
};

export const generateClimateAISummary = async (surveyId: number) => {
  const res = await fetch(`${API_URL}/ai-climate-summary`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ surveyId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const errorMessage =
      error.message || "Erro ao gerar resumo de IA da pesquisa";

    // Verificar se é um erro relacionado à configuração da API
    if (
      errorMessage.includes("API") ||
      errorMessage.includes("Gemini") ||
      errorMessage.includes("chave")
    ) {
      throw new Error(
        "API do Google Gemini não está configurada. Verifique a documentação para configurar a GEMINI_API_KEY."
      );
    }

    // Verificar se é um erro de resumo já em processamento
    if (errorMessage.includes("já existe um resumo sendo gerado")) {
      throw new Error("Resumo já está sendo gerado. Aguarde a conclusão.");
    }

    throw new Error(errorMessage);
  }

  const data = await res.json();

  // Verificar se a resposta está vazia ou malformada
  if (!data || typeof data.text !== "string" || data.text.trim() === "") {
    throw new Error(
      "A IA retornou uma resposta vazia. Verifique se a API está configurada corretamente."
    );
  }

  return {
    text: data.text,
    shortText: data.shortText,
    satisfactionScore: data.satisfactionScore,
    status: data.status || "completed",
  };
};

export const getAllClimateAISummaries = async () => {
  const res = await fetch(`${API_URL}/ai-climate-summary/all`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao buscar resumos de IA das pesquisas");
  return res.json();
};

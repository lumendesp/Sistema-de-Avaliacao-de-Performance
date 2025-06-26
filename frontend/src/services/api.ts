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

// Fetches all users with their associated evaluations
export const getUsersWithEvaluations = async () => {
  const response = await fetch(`${API_URL}/committee/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

// Creates a new final evaluation
export const createFinalEvaluation = async (data: { score: number; justification: string; evaluateeId: number; evaluatorId: number }) => {
  const response = await fetch(`${API_URL}/committee/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    console.log(data.score);
    console.log(data.justification);
    console.log(data.evaluateeId);
    console.log(data.evaluatorId);
    throw new Error('Failed to create final evaluation');
  }
  return response.json();
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
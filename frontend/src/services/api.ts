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
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

// Creates a new evaluation
export const createEvaluation = async (data: any) => {
  const response = await fetch(`${API_URL}/users/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create evaluation');
  }
  return response.json();
};

// Updates an existing evaluation
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
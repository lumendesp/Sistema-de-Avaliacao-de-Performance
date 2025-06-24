const API_URL = 'http://localhost:3000';

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
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000';

const GET = async (endpoint, headers = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    const data = await handleResponse(res);
    showToastIfMessage(data);
    return data;
  } catch (err) {
    handleError(err);
  }
};

const POST = async (endpoint, body = {}, headers = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    const data = await handleResponse(res);
    showToastIfMessage(data);
    return data;
  } catch (err) {
    handleError(err);
  }
};

const PUT = async (endpoint, body = {}, headers = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    const data = await handleResponse(res);
    showToastIfMessage(data);
    return data;
  } catch (err) {
    handleError(err);
  }
};

const DELETE = async (endpoint, headers = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const data = await handleResponse(res);
    showToastIfMessage(data);
    return data;
  } catch (err) {
    handleError(err);
  }
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP Error: ${res.status}`);
  }
  return data;
};

const handleError = (err) => {
  console.error('API Error:', err.message);
  toast.error(err.message || 'Something went wrong');
  throw err;
};

const showToastIfMessage = (data) => {
  if (data && typeof data === 'object' && data.message) {
    toast.success(data.message);
  }
};

export { GET, POST, PUT, DELETE };

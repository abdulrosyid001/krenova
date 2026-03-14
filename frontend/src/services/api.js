import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function predictFrame(imageBase64) {
  const body = { image: imageBase64 };
  const { data } = await axios.post(`${API_BASE}/predict`, body, { timeout: 12000 });
  return data;
}

export async function healthCheck() {
  const { data } = await axios.get(`${API_BASE}/`);
  return data;
}

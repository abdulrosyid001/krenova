import axios from "axios";

// URL backend
const API_BASE =
  import.meta.env.VITE_API_URL || "https://abdulrosyid-krenova.hf.space";


// axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000, // lebih lama karena HF Space kadang cold start
  headers: {
    "Content-Type": "application/json",
  },
});


// ==========================================
// PREDICT FRAME
// ==========================================
export async function predictFrame(imageBase64) {
  try {
    const body = { image: imageBase64 };

    const response = await api.post("/predict", body);

    return response.data;
  } catch (error) {
    console.error("Prediction error:", error);

    if (error.response) {
      throw new Error(error.response.data?.detail || "API Error");
    }

    throw new Error("Backend connection failed");
  }
}


// ==========================================
// HEALTH CHECK
// ==========================================
export async function healthCheck() {
  try {
    const response = await api.get("/");

    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "offline" };
  }
}
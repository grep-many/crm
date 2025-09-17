import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    response=>response,
    error=>{
        if(error.status===401){
            localStorage.clear();
            window.location.href="/";
        }
    }
)

export default api;

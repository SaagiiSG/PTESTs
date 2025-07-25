import axios from "axios";

const api = axios.create({
  baseURL: "", // leave empty if same domain
  withCredentials: true, // CRITICAL for cookies
});

export default api;
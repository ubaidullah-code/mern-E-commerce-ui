
import axios from "axios";

// const api = axios.create({
//   baseURL: window.location.href.split(":")[0] === "http"
//     ? "http://localhost:5000"
//     : "/api/v1", // fallback for production
//   withCredentials: true,
// });
const api = axios.create({
  baseURL: "https://mern-e-commerce-lac.vercel.app/",
  withCredentials: true, // if you are using cookies / sessions
});
export default api;

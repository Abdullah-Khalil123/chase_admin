import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://chase-bank-api.vercel.app/api",
  // baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

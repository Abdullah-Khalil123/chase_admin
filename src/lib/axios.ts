import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https:/chase-bank-api.vercel.app/api", // Replace with your backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

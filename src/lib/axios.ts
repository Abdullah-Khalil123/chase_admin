import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://chase-bank-api.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

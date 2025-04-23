// lib/auth.ts
import axios from "./axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role: boolean;
  [key: string]: string | boolean | number | undefined;
}

interface LoginResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

interface DecodedToken {
  exp: number;
  [key: string]: string | boolean | number | undefined;
}

// Set secure cookie options
const cookieOptions = {
  path: "/",
  secure: process.env.NODE_ENV === "production", // Secure in production
  sameSite: "strict" as const,
  expires: 7, // 7 days
};

// Login user
const login = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const response = await axios.post<LoginResponse>("/auth/login", {
      username,
      password,
    });

    // Check if user is admin
    if (response.data?.data?.user?.role !== true) {
      throw new Error("Access denied. Admin privileges required.");
    }

    const { token, data } = response.data;
    const user = data.user;

    // Store token and user data in cookies
    Cookies.set("token", token, cookieOptions);
    Cookies.set("userData", JSON.stringify(user), cookieOptions);

    // Set auth header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return user;
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Login failed. Please check your credentials.";
    throw new Error(errorMessage);
  }
};

// Logout user
const logout = (): void => {
  Cookies.remove("token", { path: "/" });
  Cookies.remove("userData", { path: "/" });
  delete axios.defaults.headers.common["Authorization"];
};

// Get current authenticated user
const getCurrentUser = (): User | null => {
  try {
    const userData = Cookies.get("userData");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  try {
    const token = Cookies.get("token");
    if (!token) return false;

    // Verify token expiration
    const decoded = jwtDecode<DecodedToken>(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    return !isExpired;
  } catch {
    return false;
  }
};

// Check if user is admin
const isAdmin = (): boolean => {
  try {
    const userData = Cookies.get("userData");
    if (!userData) return false;

    const user = JSON.parse(userData) as User;
    return user.role === true;
  } catch {
    return false;
  }
};

const AuthService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
};

export default AuthService;

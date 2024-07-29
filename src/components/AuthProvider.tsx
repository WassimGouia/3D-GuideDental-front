import React, { useState, useEffect } from "react";
import { AuthContext } from "@/components/AuthContext";
import { message } from "antd";
import { BEARER } from "@/components/Constant";
import { getToken, removeToken } from "@/components/Helpers";

const AuthProvider = ({ children }) => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(getToken());

  const fetchLoggedInUser = async (token) => {
    try {
      const response = await fetch(
        `${apiUrl}/users/me?populate=*`,
        {
          headers: { Authorization: `${BEARER} ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error(error);
      message.error("Error While Getting Logged In User Details");
      removeToken();
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUser = (user) => {
    setUserData(user);
  };

  useEffect(() => {
    if (authToken) {
      fetchLoggedInUser(authToken);
    } else {
      setIsLoading(false);
    }
  }, [authToken]);

  const contextValue = {
    user: userData,
    setUser: handleUser,
    isLoading,
    setToken: (token) => {
      setAuthToken(token);
    },
    logout: () => {
      removeToken();
      setAuthToken(null);
      setUserData(null);
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

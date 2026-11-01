import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('khatavani_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('khatavani_token') || null);

  const loginUser = (authResponse, extraDetails = {}) => {
    const userPayload = {
      email: authResponse.email,
      role: authResponse.role,
      plan: authResponse.plan,
      shopName: extraDetails.shopName || authResponse.shopName || authResponse.email.split('@')[0].toUpperCase() + " MART"
    };

    // 1. LocalStorage update
    localStorage.setItem('khatavani_token', authResponse.token);
    localStorage.setItem('khatavani_user', JSON.stringify(userPayload));

    // 2. React state instant update (taaki App.jsx turant detect kare)
    setToken(authResponse.token);
    setUser(userPayload);
  };

  const logoutUser = () => {
    localStorage.removeItem('khatavani_token');
    localStorage.removeItem('khatavani_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
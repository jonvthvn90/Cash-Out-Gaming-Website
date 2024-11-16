import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const[isAuthenticated, setIsAuthenticated] = useState(false);
    const[user, setUser] = useState(null);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const updateUserProfile = (updatedUser) => {
        setUser(prevUser => ({ ...prevUser, ...updatedUser }));
    };

    return (
        <UserContext.Provider value={{ isAuthenticated, user, login, logout, updateUserProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
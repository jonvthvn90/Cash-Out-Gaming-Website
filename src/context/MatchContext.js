import React, { createContext, useState, useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
const SOCKET_SERVER_URL = 'http://localhost:8000'; // Adjust this to your backend URL

export const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [matchUpdates, setMatchUpdates] = useState({});

    useEffect(() => {
        const newSocket = socketIOClient(SOCKET_SERVER_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    const joinMatchRoom = (matchId) => {
        if (socket) {
            socket.emit('joinMatchRoom', matchId);
            socket.on('matchUpdate', (update) => {
                setMatchUpdates(prev => ({ ...prev, [matchId]: update }));
            });
        }
    };

    return (
        <MatchContext.Provider value={{ socket, matchUpdates, joinMatchRoom }}>
            {children}
        </MatchContext.Provider>
    );
};
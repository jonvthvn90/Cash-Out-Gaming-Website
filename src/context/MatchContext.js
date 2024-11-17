import React, { createContext, useState, useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';

const SOCKET_SERVER_URL = 'http://localhost:8000'; // Adjust this to your backend URL

export const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [matchUpdates, setMatchUpdates] = useState({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize the socket connection
        const newSocket = socketIOClient(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        setSocket(newSocket);

        // Listen for connection events
        newSocket.on('connect', () => setConnected(true));
        newSocket.on('connect_error', (error) => {
            console.error('Failed to connect to socket:', error);
            setError('Failed to connect to the server. Please try again.');
        });
        newSocket.on('disconnect', () => setConnected(false));

        // Cleanup function to close the socket connection
        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            // Additional events that might be necessary
            socket.on('error', (error) => {
                console.error('Socket error:', error);
                setError('A socket error occurred');
            });

            // Cleanup for matchUpdate event
            return () => {
                socket.off('matchUpdate');
            };
        }
    }, [socket]);

    const joinMatchRoom = (matchId) => {
        if (socket && connected) {
            socket.emit('joinMatchRoom', matchId);
            socket.on('matchUpdate', (update) => {
                setMatchUpdates(prev => ({ ...prev, [matchId]: update }));
            });
        } else {
            console.error('Socket not connected or available for joining match room.');
        }
    };

    const leaveMatchRoom = (matchId) => {
        if (socket && connected) {
            socket.emit('leaveMatchRoom', matchId);
            // Optionally, clear the match updates for this match
            setMatchUpdates(prev => {
                const newMatchUpdates = { ...prev };
                delete newMatchUpdates[matchId];
                return newMatchUpdates;
            });
        }
    };

    return (
        <MatchContext.Provider value={{ 
            socket, 
            matchUpdates, 
            joinMatchRoom, 
            leaveMatchRoom,
            connected,
            error
        }}>
            {children}
        </MatchContext.Provider>
    );
};

MatchProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Custom hook to use the MatchContext
export const useMatch = () => {
    const context = useContext(MatchContext);
    if (context === undefined) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};
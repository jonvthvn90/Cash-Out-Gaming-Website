import React, { createContext, useState, useContext } from 'react';
import { useUser } from './UserContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useUser();
    const [chatMessages, setChatMessages] = useState({});

    const socket = useContext(MatchContext).socket; // Assuming MatchContext provides the socket

    const sendMessage = (matchId, message) => {
        if (socket && user) {
            socket.emit('chatMessage', { matchId, message, userId: user._id });
        }
    };

    const joinChatRoom = (matchId) => {
        if (socket) {
            socket.emit('joinChatRoom', matchId);
            socket.on('chatMessage', (data) => {
                setChatMessages(prevMessages => {
                    const messages = prevMessages[matchId] || [];
                    return { ...prevMessages, [matchId]: [...messages, data] };
                });
            });
        }
    };

    return (
        <ChatContext.Provider value={{ chatMessages, sendMessage, joinChatRoom }}>
            {children}
        </ChatContext.Provider>
    );
};
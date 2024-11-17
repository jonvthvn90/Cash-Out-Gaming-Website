import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useUser();
    const [chatMessages, setChatMessages] = useState({});
    const [currentMatchId, setCurrentMatchId] = useState(null);
    const [typingStatus, setTypingStatus] = useState({});
    const socket = useContext(MatchContext).socket; // Assuming MatchContext provides the socket

    useEffect(() => {
        // Cleanup function to remove event listeners when component unmounts
        return () => {
            if (socket) {
                socket.off('chatMessage');
                socket.off('typing');
                socket.off('stopTyping');
            }
        };
    }, [socket]);

    const sendMessage = (matchId, message) => {
        if (socket && user && matchId) {
            socket.emit('chatMessage', { matchId, message, userId: user._id, username: user.username });
        }
    };

    const joinChatRoom = (matchId) => {
        if (socket && matchId) {
            setCurrentMatchId(matchId); // Set the current match ID
            socket.emit('joinChatRoom', matchId);
            // Listen for new messages
            socket.on('chatMessage', (data) => {
                setChatMessages(prevMessages => {
                    const messages = prevMessages[matchId] || [];
                    return { ...prevMessages, [matchId]: [...messages, data] };
                });
            });
            // Listen for typing events
            socket.on('typing', (data) => {
                setTypingStatus(prevStatus => ({ ...prevStatus, [data.userId]: true }));
            });
            // Listen for stop typing events
            socket.on('stopTyping', (userId) => {
                setTypingStatus(prevStatus => {
                    const newStatus = { ...prevStatus };
                    delete newStatus[userId];
                    return newStatus;
                });
            });
        }
    };

    // Emit typing event
    const emitTyping = (matchId) => {
        if (socket && user && matchId) {
            socket.emit('typing', { matchId, userId: user._id });
        }
    };

    // Emit stop typing event
    const emitStopTyping = (matchId) => {
        if (socket && user && matchId) {
            socket.emit('stopTyping', { matchId, userId: user._id });
        }
    };

    return (
        <ChatContext.Provider value={{ 
            chatMessages, 
            sendMessage, 
            joinChatRoom,
            currentMatchId,
            typingStatus,
            emitTyping,
            emitStopTyping
        }}>
            {children}
        </ChatContext.Provider>
    );
};

ChatProvider.propTypes = {
    children: PropTypes.node.isRequired
};
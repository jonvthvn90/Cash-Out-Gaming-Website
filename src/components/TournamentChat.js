import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

// Update with your server URL
const socket = io('http://localhost:8080');

function TournamentChat({ tournamentId }) {
    const [chatMessages, setChatMessages] = useState([]);
    const { user } = useUser();
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        if (tournamentId) {
            socket.emit('joinTournament', tournamentId);

            socket.on('connect', () => setIsConnected(true));
            socket.on('disconnect', () => setIsConnected(false));

            socket.on('receiveMessage', (newMessage) => {
                setChatMessages(prevMessages => [...prevMessages, newMessage]);
            });

            socket.on('error', (errorMessage) => {
                setError(errorMessage);
            });

            // Cleanup on component unmount
            return () => {
                socket.emit('leaveTournament', tournamentId);
                socket.off('connect');
                socket.off('disconnect');
                socket.off('receiveMessage');
                socket.off('error');
            };
        }
    }, [tournamentId]);

    const handleSendMessage = useCallback(() => {
        if (message.trim() && user) {
            if (!isConnected) {
                setError('Not connected to the server. Please try again.');
                return;
            }

            socket.emit('sendMessage', { tournamentId, message: { user: user.username, text: message } });
            setMessage('');
        }
    }, [message, user, tournamentId, isConnected]);

    if (!user) {
        return <div>Please log in to participate in the chat.</div>;
    }

    return (
        <div className="tournament-chat">
            <h3>Tournament Chat</h3>
            {error && <p className="error-message">{error}</p>}
            <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <strong>{msg.user}: </strong>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input 
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={!isConnected}
                />
                <button 
                    onClick={handleSendMessage} 
                    className="send-button"
                    disabled={!isConnected || !message.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

TournamentChat.propTypes = {
    tournamentId: PropTypes.string.isRequired
};

export default TournamentChat;
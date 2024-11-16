import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';

const socket = io('http://localhost:8080'); // Update with your server URL

function TournamentChat({ tournamentId }) {
    const[chatMessages, setChatMessages] = useState([]);
    const { user } = useUser();
    const[message, setMessage] = useState('');

    const handleSendMessage = useCallback(() => {
        if (message.trim() && user) {
            socket.emit('sendMessage', { tournamentId, message: { user: user.username, text: message } });
            setMessage('');
        }
    }, [message, user, tournamentId]);

    useEffect(() => {
        if (tournamentId) {
            socket.emit('joinTournament', tournamentId);

            socket.on('receiveMessage', (newMessage) => {
                setChatMessages(prevMessages => [...prevMessages, newMessage]);
            });

            // Cleanup on component unmount
            return () => {
                socket.off('receiveMessage');
            };
        }
    },[tournamentId]);

    return (
        <div className="tournament-chat">
            <h3>Tournament Chat</h3>
            <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.user}: </strong>{msg.text}
                    </div>
                ))}
            </div>
            <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
}

export default TournamentChat;
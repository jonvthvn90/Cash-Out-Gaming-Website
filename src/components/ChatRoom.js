import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ChatRoom = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        fetchMessages();
    }, [roomId]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`/api/chat/rooms/${roomId}/messages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(response.data.messages);
        } catch (error) {
            setError('Failed to fetch messages');
        }
    };

    const sendMessage = async () => {
        if (!messageContent.trim()) return;

        try {
            await axios.post(`/api/chat/rooms/${roomId}/messages`, { content: messageContent }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMessageContent(''); // Clear input after sending
            fetchMessages(); // Refresh messages
        } catch (error) {
            setError('Failed to send message');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="chat-room">
            <h2>Chat Room</h2>
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg._id} className={msg.sender._id === user._id ? 'my-message' : 'other-message'}>
                        <p>{msg.content}</p>
                        <small>{msg.sender.username}</small>
                    </div>
                ))}
            </div>
            <div className="message-input">
                <input 
                    type="text" 
                    value={messageContent} 
                    onChange={(e) => setMessageContent(e.target.value)} 
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;
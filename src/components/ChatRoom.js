import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const ChatRoom = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (roomId) {
            fetchMessages();
        }
        return () => {
            // Cleanup function, e.g., disconnect from any real-time socket connections
        };
    }, [roomId]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`/api/chat/rooms/${roomId}/messages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(response.data.messages);
        } catch (error) {
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault(); // Prevent form submission behavior
        if (!messageContent.trim()) return; // Don't send empty messages

        try {
            await axios.post(`/api/chat/rooms/${roomId}/messages`, { content: messageContent }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMessageContent(''); // Clear input after sending
            await fetchMessages(); // Refresh messages
        } catch (error) {
            setError('Failed to send message');
        }
    };

    if (!user) return <div>Please log in to enter the chat room.</div>;
    if (error) return <div className="error">{error}</div>;
    if (loading) return <div>Loading messages...</div>;

    return (
        <div className="chat-room">
            <h2>Chat Room</h2>
            <div className="messages">
                {messages.map(msg => (
                    <div 
                        key={msg._id} 
                        className={msg.sender._id === user._id ? 'my-message' : 'other-message'}
                    >
                        <p>{msg.content}</p>
                        <small>{msg.sender.username} - {new Date(msg.createdAt).toLocaleTimeString()}</small>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="message-input">
                <input 
                    type="text" 
                    value={messageContent} 
                    onChange={(e) => setMessageContent(e.target.value)} 
                    placeholder="Type your message..."
                    required
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

ChatRoom.propTypes = {
    roomId: PropTypes.string.isRequired
};

export default ChatRoom;
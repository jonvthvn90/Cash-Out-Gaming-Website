import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const ChatList = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            const response = await axios.get('/api/chat/rooms', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setChatRooms(response.data.rooms);
        } catch (error) {
            setError('Failed to fetch chat rooms');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading chat rooms...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="chat-list">
            <h2>Chats</h2>
            {chatRooms.map(room => (
                <div key={room._id} onClick={() => /* Open chat for this room */}>
                    <h3>{room.name}</h3>
                    <p>{room.lastMessage ? room.lastMessage.content : 'No messages yet'}</p>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
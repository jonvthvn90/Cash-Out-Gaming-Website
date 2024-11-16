import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you're routing with react-router
import { useUser } from '../context/UserContext';

const ChatList = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

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
            console.error('Error fetching chat rooms:', error); // Log for debugging
            setError('Failed to fetch chat rooms');
        } finally {
            setLoading(false);
        }
    };

    const openChatRoom = (roomId) => {
        // Logic to open or navigate to the chat room, e.g., using React Router
        navigate(`/chat/${roomId}`); // Assuming you have a route setup for this
    };

    if (loading) return <div>Loading chat rooms...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="chat-list">
            <h2>Chats</h2>
            {chatRooms.map(room => (
                <div key={room._id} onClick={() => openChatRoom(room._id)}>
                    <h3>{room.name}</h3>
                    <p>{room.lastMessage ? room.lastMessage.content : 'No messages yet'}</p>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
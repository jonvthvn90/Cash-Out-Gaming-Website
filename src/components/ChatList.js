import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const ChatList = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchChatRooms();
        }
    }, [user]);

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
        navigate(`/chat/${roomId}`);
    };

    if (!user) return <div>Please log in to view chat rooms.</div>;
    if (loading) return <div>Loading chat rooms...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="chat-list">
            <h2>Chats</h2>
            {chatRooms.length === 0 ? (
                <p>No chat rooms available.</p>
            ) : (
                chatRooms.map(room => (
                    <div key={room._id} className="chat-room" onClick={() => openChatRoom(room._id)}>
                        <h3>{room.name}</h3>
                        <p className="last-message">{room.lastMessage ? room.lastMessage.content : 'No messages yet'}</p>
                    </div>
                ))
            )}
        </div>
    );
};

ChatList.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        // Include other user properties here as needed
    })
};

export default ChatList;
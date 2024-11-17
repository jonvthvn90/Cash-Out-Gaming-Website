import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ChatContext } from '../context/ChatContext';
import { UserContext } from '../context/UserContext';
import PropTypes from 'prop-types';

function MatchChat({ matchId }) {
    const { chatMessages, sendMessage, joinChatRoom, leaveChatRoom } = useContext(ChatContext);
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState('');

    useEffect(() => {
        joinChatRoom(matchId);

        // Cleanup function to leave the chat room when the component unmounts
        return () => {
            leaveChatRoom(matchId);
        };
    }, [matchId, joinChatRoom, leaveChatRoom]);

    const handleSendMessage = useCallback((e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(matchId, message);
            setMessage('');
        }
    }, [matchId, message, sendMessage]);

    if (!user) {
        return <div>Please log in to participate in the chat.</div>;
    }

    return (
        <div className="match-chat">
            <h3>Live Chat for Match {matchId}</h3>
            <div className="chat-messages">
                {chatMessages[matchId] && chatMessages[matchId].length > 0 ? (
                    chatMessages[matchId].map((msg, index) => (
                        <div key={index} className={msg.userId === user._id ? 'sent' : 'received'}>
                            <span className="username">{msg.username}: </span>
                            {msg.message}
                        </div>
                    ))
                ) : (
                    <p>No messages yet.</p>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..." 
                    required
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

MatchChat.propTypes = {
    matchId: PropTypes.string.isRequired
};

export default MatchChat;
import React, { useState, useContext, useEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { UserContext } from '../context/UserContext';

function MatchChat({ matchId }) {
    const { chatMessages, sendMessage, joinChatRoom } = useContext(ChatContext);
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState('');

    useEffect(() => {
        joinChatRoom(matchId);
    }, [matchId, joinChatRoom]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(matchId, message);
            setMessage('');
        }
    };

    return (
        <div className="match-chat">
            <h3>Live Chat for Match {matchId}</h3>
            <div className="chat-messages">
                {chatMessages[matchId] && chatMessages[matchId].map((msg, index) => (
                    <div key={index} className={msg.userId === user._id ? 'sent' : 'received'}>
                        {msg.message}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..." 
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default MatchChat;
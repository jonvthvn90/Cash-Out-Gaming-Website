import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function Reputation() {
    const[points, setPoints] = useState(1);
    const[reason, setReason] = useState('');
    const[error, setError] = useState(null);
    const { user } = useUser();

    const handleSubmit = async (userId) => {
        if (!points || !reason) {
            setError('Please provide points and a reason');
            return;
        }

        try {
            const response = await axios.post(`/api/reputation`, { 
                userId: userId, 
                points, 
                reason
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Reputation points given successfully');
            setReason('');
            setPoints(1);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred giving reputation');
        }
    };

    return (
        <div className="reputation">
            <h3>Give Reputation</h3>
            {error && <p>{error}</p>}
            <input 
                type="number" 
                value={points} 
                onChange={(e) => setPoints(Number(e.target.value))} 
                min="1" 
                max="5"
            />
            <input 
                type="text" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Reason" 
            />
            <button onClick={() => handleSubmit(user._id)}>Give</button>
        </div>
    );
}

export default Reputation;
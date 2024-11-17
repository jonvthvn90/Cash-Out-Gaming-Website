import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function Reputation() {
    const [points, setPoints] = useState(1);
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const handleSubmit = async (userId) => {
        if (!points || !reason.trim()) {
            setError('Please provide points and a reason');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/api/reputation`, { 
                userId: userId,
                points: Number(points),
                reason: reason.trim()
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                setSuccess(true);
                setReason('');
                setPoints(1);
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred giving reputation');
            console.error('Reputation update error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Please log in to give reputation points.</div>;
    }

    return (
        <div className="reputation">
            <h3>Give Reputation</h3>
            {success && <p className="success-message">Reputation points given successfully!</p>}
            {error && <p className="error-message">{error}</p>}
            <form className="reputation-form" onSubmit={(e) => {e.preventDefault(); handleSubmit(user._id);}}>
                <div className="form-group">
                    <label htmlFor="points">Points:</label>
                    <input 
                        id="points" 
                        type="number" 
                        value={points} 
                        onChange={(e) => setPoints(Number(e.target.value))} 
                        min="1" 
                        max="5"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reason">Reason:</label>
                    <input 
                        id="reason" 
                        type="text" 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="Enter reason" 
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    className="give-button"
                    disabled={loading}
                >
                    {loading ? 'Giving...' : 'Give'}
                </button>
            </form>
        </div>
    );
}

Reputation.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default Reputation;
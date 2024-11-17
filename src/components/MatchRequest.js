import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function RematchRequest({ originalChallengeId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestRematch = async () => {
        setLoading(true);
        setError(null); // Clear any previous errors

        try {
            const response = await axios.post(`/api/rematch/${originalChallengeId}/request`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Rematch requested successfully.');
        } catch (error) {
            console.error('Error requesting rematch:', error);
            setError(error.response?.data?.message || 'Failed to request rematch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rematch-request">
            {error && <p className="error-message">{error}</p>}
            <button onClick={requestRematch} disabled={loading} className="rematch-button">
                {loading ? 'Requesting...' : 'Request Rematch'}
            </button>
        </div>
    );
}

RematchRequest.propTypes = {
    originalChallengeId: PropTypes.string.isRequired
};

export default RematchRequest;
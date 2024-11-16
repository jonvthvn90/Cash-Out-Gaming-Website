import React, { useState } from 'react';
import axios from 'axios';

function RematchRequest({ originalChallengeId }) {
    const[loading, setLoading] = useState(false);

    const requestRematch = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/api/rematch/${originalChallengeId}/request`);
            alert('Rematch requested successfully.');
        } catch (error) {
            console.error('Error requesting rematch:', error);
            alert('Failed to request rematch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={requestRematch} disabled={loading}>
            {loading ? 'Requesting...' : 'Request Rematch'}
        </button>
    );
}

export default RematchRequest;
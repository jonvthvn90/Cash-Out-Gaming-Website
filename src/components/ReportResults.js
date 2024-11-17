import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function ReportResult({ challengeId, onResultReported }) {
    const [winnerId, setWinnerId] = useState('');
    const [loserId, setLoserId] = useState('');
    const [scores, setScores] = useState({ winnerScore: '', loserScore: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // You might want to pre-fill winnerId and loserId if possible or check if they are valid
    }, []);

    // Handler for score inputs
    const handleScoreChange = (key, value) => {
        setScores(prevScores => ({ ...prevScores, [key]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent form from traditional submit
        setLoading(true);

        if (!winnerId || !loserId) {
            setError('Please enter both winner and loser IDs');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`/api/challenges/${challengeId}/report`, 
                { winnerId, loserId, scores }, 
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            // Assuming the server responds with success
            if (response.status === 200) {
                onResultReported();
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while reporting the result. Please try again.');
            console.error('Error reporting result:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-result">
            <h3>Report Result</h3>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="winnerId">Winner ID:</label>
                    <input 
                        id="winnerId" 
                        type="text" 
                        value={winnerId} 
                        onChange={(e) => setWinnerId(e.target.value)} 
                        placeholder="Winner ID" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loserId">Loser ID:</label>
                    <input 
                        id="loserId" 
                        type="text" 
                        value={loserId} 
                        onChange={(e) => setLoserId(e.target.value)} 
                        placeholder="Loser ID" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="winnerScore">Winner's Score:</label>
                    <input 
                        id="winnerScore" 
                        type="number" 
                        value={scores.winnerScore} 
                        onChange={(e) => handleScoreChange('winnerScore', e.target.value)} 
                        placeholder="Winner's Score" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="loserScore">Loser's Score:</label>
                    <input 
                        id="loserScore" 
                        type="number" 
                        value={scores.loserScore} 
                        onChange={(e) => handleScoreChange('loserScore', e.target.value)} 
                        placeholder="Loser's Score" 
                        required 
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Reporting...' : 'Submit Result'}
                </button>
            </form>
        </div>
    );
}

ReportResult.propTypes = {
    challengeId: PropTypes.string.isRequired,
    onResultReported: PropTypes.func.isRequired
};

export default ReportResult;
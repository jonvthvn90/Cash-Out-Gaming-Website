import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function MatchResult({ match, tournamentId }) {
    const [winner, setWinner] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent form from traditional submit

        if (!winner) {
            setError('Please select a winner');
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

        try {
            await axios.post(`/api/tournaments/${tournamentId}/matches/${match._id}/result`, 
                { winnerId: winner },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                }
            );
            alert('Result submitted successfully');
            setWinner(''); // Clear form after success
        } catch (error) {
            console.error('Error submitting result:', error);
            setError('Failed to submit result. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="match-result-form">
            <h3>Submit Result for Match</h3>
            {error && <p className="error-message">{error}</p>}
            <select 
                value={winner} 
                onChange={(e) => setWinner(e.target.value)}
                required
            >
                <option value="">Select Winner</option>
                <option value={match.player1._id}>{match.player1.username}</option>
                <option value={match.player2._id}>{match.player2.username}</option>
            </select>
            <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Submitting...' : 'Submit Result'}
            </button>
        </form>
    );
}

MatchResult.propTypes = {
    match: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        player1: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired
        }).isRequired,
        player2: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    tournamentId: PropTypes.string.isRequired
};

export default MatchResult;
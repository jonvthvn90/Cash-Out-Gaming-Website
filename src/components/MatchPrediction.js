import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const MatchPrediction = () => {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [prediction, setPrediction] = useState('teamA');
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchUpcomingMatches();
        }
    }, [user]);

    const fetchUpcomingMatches = async () => {
        try {
            const response = await axios.get('/api/matches/upcoming', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMatches(response.data.matches);
        } catch (error) {
            setError('Failed to fetch upcoming matches');
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const makePrediction = async () => {
        if (!selectedMatch) {
            setError('Please select a match');
            return;
        }

        try {
            await axios.post(`/api/prediction/make/${selectedMatch._id}`, { predictedWinner: prediction }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Prediction made successfully!');
            setSelectedMatch(null);
            setPrediction('teamA'); // Reset to default prediction
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while making the prediction');
        }
    };

    if (!user) {
        return <div>Please log in to make predictions.</div>;
    }

    if (loading) return <div className="loading">Loading matches...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="match-prediction">
            <h2>Make Your Predictions</h2>
            <select 
                onChange={(e) => setSelectedMatch(JSON.parse(e.target.value))} 
                value={selectedMatch ? JSON.stringify(selectedMatch) : ""}
            >
                <option value="" disabled>Select a Match</option>
                {matches.map(match => (
                    <option key={match._id} value={JSON.stringify(match)}>{match.teamA.name} vs {match.teamB.name}</option>
                ))}
            </select>

            {selectedMatch && (
                <div className="prediction-form">
                    <h3>{selectedMatch.teamA.name} vs {selectedMatch.teamB.name}</h3>
                    <div>
                        <label>
                            <input 
                                type="radio" 
                                value="teamA" 
                                checked={prediction === 'teamA'} 
                                onChange={() => setPrediction('teamA')}
                            />
                            {selectedMatch.teamA.name} wins
                        </label>
                    </div>
                    <div>
                        <label>
                            <input 
                                type="radio" 
                                value="teamB" 
                                checked={prediction === 'teamB'} 
                                onChange={() => setPrediction('teamB')}
                            />
                            {selectedMatch.teamB.name} wins
                        </label>
                    </div>
                    <div>
                        <label>
                            <input 
                                type="radio" 
                                value="draw" 
                                checked={prediction === 'draw'} 
                                onChange={() => setPrediction('draw')}
                            />
                            Draw
                        </label>
                    </div>
                    <button onClick={makePrediction} disabled={!selectedMatch}>Make Prediction</button>
                </div>
            )}
        </div>
    );
};

MatchPrediction.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default MatchPrediction;
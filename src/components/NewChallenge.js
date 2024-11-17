import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function NewChallenge() {
    const [game, setGame] = useState('');
    const [opponent, setOpponent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            history.push('/login');
        }
    }, [user, history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!game || !opponent) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/challenges', {
                challenger: user._id,
                opponent: opponent,
                game: game
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 201) {
                alert('Challenge created successfully!');
                history.push('/ongoing-challenges');
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (err) {
            setError('An error occurred while creating the challenge. Please try again.');
            console.error('Challenge creation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-challenge">
            <h2>Create New Challenge</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="challenge-form">
                <label htmlFor="game">
                    Game:
                    <input 
                        type="text" 
                        id="game"
                        value={game} 
                        onChange={(e) => setGame(e.target.value)} 
                        placeholder="Enter game name" 
                        required 
                    />
                </label>
                <br />
                <label htmlFor="opponent">
                    Opponent's Username or ID:
                    <input 
                        type="text" 
                        id="opponent"
                        value={opponent} 
                        onChange={(e) => setOpponent(e.target.value)} 
                        placeholder="Enter opponent's username or ID" 
                        required 
                    />
                </label>
                <br />
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Creating Challenge...' : 'Create Challenge'}
                </button>
            </form>
        </div>
    );
}

NewChallenge.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default NewChallenge;
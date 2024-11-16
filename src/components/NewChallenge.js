import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function NewChallenge() {
    const[game, setGame] = useState('');
    const[opponent, setOpponent] = useState('');
    const[error, setError] = useState('');
    const history = useHistory();
    const { user } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!game || !opponent) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post('/api/challenges', {
                challenger: user._id, // Assuming user._id is available from context
                opponent: opponent,
                game: game
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 201) {
                alert('Challenge created successfully!');
                history.push('/ongoing-challenges'); // Redirect to ongoing challenges page
            }
        } catch (err) {
            setError('An error occurred while creating the challenge. Please try again.');
        }
    };

    return (
        <div>
            <h2>Create New Challenge</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Game:
                    <input type="text" value={game} onChange={(e) => setGame(e.target.value)} required />
                </label>
                <br />
                <label>
                    Opponent's Username:
                    <input type="text" value={opponent} onChange={(e) => setOpponent(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Create Challenge</button>
            </form>
        </div>
    );
}

export default NewChallenge;
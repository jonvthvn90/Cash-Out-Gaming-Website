import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

function TournamentCreate() {
    const [tournamentData, setTournamentData] = useState({
        name: '',
        game: '',
        entryFee: '0', // Changed to string for easier validation
        maxParticipants: 2,
        startDate: '',
        endDate: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const history = useHistory();

    useEffect(() => {
        if (!user) {
            history.push('/login');
        }
    }, [user, history]);

    const handleChange = (e) => {
        const value = e.target.type === 'number' ? e.target.valueAsNumber : e.target.value;
        setTournamentData({ ...tournamentData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please log in to create a tournament.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/tournaments', tournamentData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Tournament created:', response.data);
            alert('Tournament created successfully!');
            history.push('/tournaments'); // Redirect to tournaments list
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred creating the tournament');
            console.error('Error creating tournament:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tournament-create">
            <h2>Create New Tournament</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="tournament-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input 
                        id="name"
                        name="name" 
                        value={tournamentData.name} 
                        onChange={handleChange} 
                        placeholder="Tournament Name" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="game">Game:</label>
                    <input 
                        id="game"
                        name="game" 
                        value={tournamentData.game} 
                        onChange={handleChange} 
                        placeholder="Game" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="entryFee">Entry Fee:</label>
                    <input 
                        id="entryFee"
                        type="number" 
                        name="entryFee" 
                        value={tournamentData.entryFee} 
                        onChange={handleChange} 
                        placeholder="Entry Fee" 
                        min="0" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="maxParticipants">Max Participants:</label>
                    <input 
                        id="maxParticipants"
                        type="number" 
                        name="maxParticipants" 
                        value={tournamentData.maxParticipants} 
                        onChange={handleChange} 
                        placeholder="Max Participants" 
                        min="2" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="startDate">Start Date:</label>
                    <input 
                        id="startDate"
                        type="datetime-local" 
                        name="startDate" 
                        value={tournamentData.startDate} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">End Date:</label>
                    <input 
                        id="endDate"
                        type="datetime-local" 
                        name="endDate" 
                        value={tournamentData.endDate} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="create-button"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Tournament'}
                </button>
            </form>
        </div>
    );
}

TournamentCreate.propTypes = {
    user: PropTypes.shape({
        // Add relevant user properties here if needed
    })
};

export default TournamentCreate;
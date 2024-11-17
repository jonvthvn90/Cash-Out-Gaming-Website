import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchTournaments();
        } else {
            setLoading(false); // If there's no user, stop loading and show an error message
        }
    }, [user]);

    const fetchTournaments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/tournaments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setTournaments(response.data);
        } catch (error) {
            setError('Failed to fetch tournaments');
            console.error('Tournaments fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const joinTournament = async (tournamentId) => {
        if (!user) {
            alert('Please log in to join a tournament.');
            return;
        }

        try {
            const response = await axios.post(`/api/tournaments/${tournamentId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Successfully joined the tournament!');
            fetchTournaments(); // Refresh list after joining
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while joining the tournament');
            console.error('Join tournament error:', error);
        }
    };

    if (loading) return <div className="loading">Loading tournaments...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!user) return <div className="login-message">Please log in to view available tournaments.</div>;

    return (
        <div className="tournaments">
            <h2>Available Tournaments</h2>
            {tournaments.length === 0 ? (
                <p>No tournaments available at the moment.</p>
            ) : (
                tournaments.map(tournament => (
                    <div key={tournament._id} className="tournament-item">
                        <h3>{tournament.name}</h3>
                        <p>Game: {tournament.game}</p>
                        <p>Entry Fee: ${tournament.entryFee.toFixed(2)}</p>
                        <p>Prize Pool: ${tournament.prizePool.toFixed(2)}</p>
                        <p>Start Date: {new Date(tournament.startDate).toLocaleString()}</p>
                        <p>End Date: {new Date(tournament.endDate).toLocaleString()}</p>
                        <button 
                            onClick={() => joinTournament(tournament._id)} 
                            className="join-button"
                            disabled={tournament.status !== 'open'}
                        >
                            {tournament.status === 'open' ? 'Join' : 'Closed'}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

Tournaments.propTypes = {
    user: PropTypes.shape({
        // Add relevant user properties here if needed
    })
};

export default Tournaments;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import PropTypes from 'prop-types';

function TournamentList() {
    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetchTournaments();
        } else {
            setLoading(false); // If not logged in, we can stop loading.
        }
    }, [user]);

    const fetchTournaments = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/tournaments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            // Sort tournaments by start date if needed
            const sortedTournaments = response.data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            setTournaments(sortedTournaments);
        } catch (error) {
            setError('Failed to fetch tournaments');
            console.error('Tournament fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const joinTournament = async (tournamentId) => {
        if (!user) {
            alert('Please log in to join tournaments.');
            return;
        }

        try {
            await axios.post(`/api/tournaments/${tournamentId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Successfully joined the tournament!');
            fetchTournaments(); // Refresh the list after joining
        } catch (error) {
            setError(error.response?.data?.message || 'Could not join tournament');
            console.error('Join tournament error:', error);
        }
    };

    if (loading) return <div>Loading tournaments...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Please log in to view available tournaments.</div>;

    return (
        <div className="tournament-list">
            <h2>Available Tournaments</h2>
            <ul className="tournament-items">
                {tournaments.map(tournament => (
                    <li key={tournament._id} className="tournament-item">
                        <h3>{tournament.name} - {tournament.game}</h3>
                        <p>Entry Fee: ${tournament.entryFee} | Prize Pool: ${tournament.prizePool}</p>
                        <p>Players: {tournament.currentPlayers}/{tournament.maxPlayers}</p>
                        <p>Start Date: {new Date(tournament.startDate).toLocaleString()}</p>
                        {tournament.players.some(player => player._id === user._id) ? (
                            <span className="status-joined">Joined</span>
                        ) : (
                            <button 
                                onClick={() => joinTournament(tournament._id)} 
                                className="join-button"
                                disabled={tournament.status !== 'open'}
                            >
                                {tournament.status === 'open' ? 'Join' : 'Closed'}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

TournamentList.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    })
};

export default TournamentList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const response = await axios.get('/api/tournaments', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setTournaments(response.data);
        } catch (error) {
            setError('Failed to fetch tournaments');
        } finally {
            setLoading(false);
        }
    };

    const joinTournament = async (tournamentId) => {
        try {
            const response = await axios.post(`/api/tournaments/${tournamentId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Successfully joined the tournament!');
            fetchTournaments(); // Refresh list after joining
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while joining the tournament');
        }
    };

    if (loading) return <div>Loading tournaments...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="tournaments">
            <h2>Available Tournaments</h2>
            {tournaments.map(tournament => (
                <div key={tournament._id} className="tournament-item">
                    <h3>{tournament.name}</h3>
                    <p>Game: {tournament.game}</p>
                    <p>Entry Fee: ${tournament.entryFee.toFixed(2)}</p>
                    <p>Prize Pool: ${tournament.prizePool.toFixed(2)}</p>
                    <p>Start Date: {new Date(tournament.startDate).toLocaleString()}</p>
                    <p>End Date: {new Date(tournament.endDate).toLocaleString()}</p>
                    <button onClick={() => joinTournament(tournament._id)}>Join</button>
                </div>
            ))}
        </div>
    );
};

export default Tournaments;
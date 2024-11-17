import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import TournamentChat from './TournamentChat';
import PropTypes from 'prop-types';

function TournamentPage() {
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const history = useHistory();

    useEffect(() => {
        const fetchTournament = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/tournaments/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTournament(response.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch tournament data');
                console.error('Tournament fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTournament();
        }
    }, [id]);

    const handleJoinTournament = async () => {
        if (!user) {
            alert('Please log in to join a tournament');
            history.push('/login');
            return;
        }

        try {
            await axios.post(`/api/tournaments/${id}/join`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Successfully joined the tournament!');
            // Here you might want to refetch the tournament to update the status or other details
            setTournament(prev => ({
                ...prev,
                participants: [...prev.participants, user._id] // Optimistic update
            }));
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while joining the tournament');
            console.error('Join tournament error:', error);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (loading) return <div className="loading">Loading...</div>;
    if (!tournament) return <div className="not-found">Tournament not found</div>;

    return (
        <div className="tournament-page">
            <h2>{tournament.name}</h2>
            <p>Game: {tournament.game}</p>
            <p>Entry Fee: ${tournament.entryFee}</p>
            <p>Prize Pool: ${tournament.prizePool}</p>
            <p>Status: {tournament.status}</p>
            <p>Participants: {tournament.participants.length}</p>
            <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>

            {tournament.status === 'open' && (
                <button onClick={handleJoinTournament} disabled={!user}>
                    {user ? 'Join Tournament' : 'Log in to Join'}
                </button>
            )}

            <TournamentChat tournamentId={id} />
        </div>
    );
}

TournamentPage.propTypes = {
    match: PropTypes.object // Assuming router passes match object
};

export default TournamentPage;
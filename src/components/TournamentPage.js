import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import TournamentChat from './TournamentChat';

function TournamentPage() {
    const { id } = useParams();
    const[error, setError] = useState(null);
    const[tournament, setTournament] = useState(null);
    const { user } = useUser();
    const history = useHistory();

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await axios.get(`/api/tournaments/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setTournament(response.data);
            } catch (error) {
                setError('Failed to fetch tournament data');
                console.error(error);
            }
        };

        if (id) {
            fetchTournament();
        }
    }, [id]);

    if (error) return <div>{error}</div>;
    if (!tournament) return <div>Loading...</div>;

    return (
        <div>
            <h2>{tournament.name}</h2>
            <p>Game: {tournament.game}</p>
            <p>Entry Fee: ${tournament.entryFee}</p>
            <p>Prize Pool: ${tournament.prizePool}</p>
            <p>Status: {tournament.status}</p>
            {/* Add more tournament details here */}
            <TournamentChat tournamentId={id} />
        </div>
    );
}

export default TournamentPage;
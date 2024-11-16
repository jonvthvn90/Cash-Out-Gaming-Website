import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function TournamentList() {
    const[tournaments, setTournaments] = useState([]);
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
            console.error('Unable to fetch tournaments', error);
        }
    };

    const joinTournament = async (tournamentId) => {
        try {
            await axios.post(`/api/tournaments/${tournamentId}/join`, {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchTournaments(); // Refresh the list after joining
        } catch (error) {
            console.error('Could not join tournament', error);
        }
    };

    return (
        <div>
            <h2>Available Tournaments</h2>
            <ul>
                {tournaments.map(tournament => (
                    <li key={tournament._id}>
                        <h3>{tournament.name} - {tournament.game}</h3>
                        <p>Entry Fee: ${tournament.entryFee} | Prize Pool: ${tournament.prizePool}</p>
                        <p>Players: {tournament.currentPlayers}/{tournament.maxPlayers}</p>
                        {tournament.players.some(player => player._id === user._id) ? (
                            <span>Joined</span>
                        ) : (
                            <button onClick={() => joinTournament(tournament._id)}>Join</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TournamentList;
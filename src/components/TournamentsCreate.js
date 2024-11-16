import React, { useState } from 'react';
import axios from 'axios';

function TournamentCreate() {
    const[tournamentData, setTournamentData] = useState({
        name: '',
        game: '',
        entryFee: 0,
        maxParticipants: 2,
    });

    const handleChange = (e) => {
        setTournamentData({ ...tournamentData,[e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/tournaments', tournamentData);
            console.log('Tournament created:', response.data);
            // Here, you might want to redirect or update the list of tournaments
        } catch (error) {
            console.error('Error creating tournament:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" value={tournamentData.name} onChange={handleChange} placeholder="Tournament Name" />
            <input name="game" value={tournamentData.game} onChange={handleChange} placeholder="Game" />
            <input type="number" name="entryFee" value={tournamentData.entryFee} onChange={handleChange} placeholder="Entry Fee" />
            <input type="number" name="maxParticipants" value={tournamentData.maxParticipants} onChange={handleChange} placeholder="Max Participants" />
            <button type="submit">Create Tournament</button>
        </form>
    );
}

export default TournamentCreate;
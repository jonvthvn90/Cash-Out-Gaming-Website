import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PaginatedLeaderboard({ game }) {
    const[leaders, setLeaders] = useState([]);
    const[page, setPage] = useState(1);
    const[totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLeaderboard(game, page);
    },[game, page]);

    const fetchLeaderboard = async (gameName, pageNum) => {
        try {
            const response = await axios.get(`/api/leaderboard?game=${gameName}&page=${pageNum}`);
            setLeaders(response.data.leaderboard);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    return (
        <div>
            <h3>{game} Leaderboard</h3>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map(leader => (
                        <tr key={leader._id}>
                            <td>{leader.user}</td>
                            <td>{leader.wins}</td>
                            <td>{leader.losses}</td>
                            <td>{leader.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
            <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>Next</button>
        </div>
    );
}

export default PaginatedLeaderboard;
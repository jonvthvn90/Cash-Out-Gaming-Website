import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function PaginatedLeaderboard({ game }) {
    const [leaders, setLeaders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard(game, page);
    }, [game, page]);

    const fetchLeaderboard = async (gameName, pageNum) => {
        try {
            const response = await axios.get(`/api/leaderboard?game=${gameName}&page=${pageNum}`);
            setLeaders(response.data.leaderboard);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setError('Failed to fetch leaderboard');
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading leaderboard...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="leaderboard-container">
            <h3>{game} Leaderboard</h3>
            {leaders.length === 0 ? (
                <p>No leaders yet for this game.</p>
            ) : (
                <>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaders.map((leader, index) => (
                                <tr key={leader._id} className="leaderboard-row">
                                    <td>{index + 1}</td>
                                    <td>{leader.user}</td>
                                    <td>{leader.wins}</td>
                                    <td>{leader.losses}</td>
                                    <td>{leader.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-controls">
                        <button 
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                            disabled={page === 1 || loading}
                            className="pagination-button"
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button 
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={page === totalPages || loading}
                            className="pagination-button"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

PaginatedLeaderboard.propTypes = {
    game: PropTypes.string.isRequired
};

export default PaginatedLeaderboard;
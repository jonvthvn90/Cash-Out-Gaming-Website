import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RematchRequest from './RematchRequest';
import RematchResponse from './RematchResponse';
import PropTypes from 'prop-types';

function ChallengeItem({ challenge }) {
    return (
        <li className="challenge-item">
            <h4>{challenge.game} - {challenge.status}</h4>
            {challenge.status === 'completed' && (
                <RematchRequest challengeId={challenge._id} />
            )}
            {challenge.isRematch && challenge.status === 'pending' && (
                <RematchResponse rematchId={challenge._id} />
            )}
        </li>
    );
}

ChallengeItem.propTypes = {
    challenge: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        game: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        isRematch: PropTypes.bool
    }).isRequired
};

function MatchHistory({ userId }) {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatchAndChallengeHistory = async () => {
            try {
                const [matchResponse, challengeResponse] = await Promise.all([
                    axios.get(`/api/users/${userId}/matchHistory`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('/api/challenges', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                setMatches([...matchResponse.data, ...challengeResponse.data]);
            } catch (error) {
                setError('Failed to fetch match or challenge history.');
                console.error('Error fetching match or challenge history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchMatchAndChallengeHistory();
        }
    }, [userId]);

    if (loading) return <div>Loading match history...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="match-history">
            <h2>Match History</h2>
            <ul className="history-list">
                {matches.map(match => (
                    <li key={match._id} className={match.result ? 'completed-match' : 'challenge-item'}>
                        {match.game} - Status: {match.status}
                        {match.result && (
                            <span className="match-result">
                                , Winner: {match.result.winner}, Scores: {match.result.scores.player1} - {match.result.scores.player2}
                            </span>
                        )}
                        {match.status === 'completed' && (
                            <RematchRequest challengeId={match._id} />
                        )}
                        {match.isRematch && match.status === 'pending' && (
                            <RematchResponse rematchId={match._id} />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

MatchHistory.propTypes = {
    userId: PropTypes.string.isRequired
};

export default MatchHistory;
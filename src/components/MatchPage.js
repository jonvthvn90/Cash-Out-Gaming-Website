import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BettingInterface from './BettingInterface';
import PropTypes from 'prop-types';

const MatchPage = ({ matchId }) => {
    const [match, setMatch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await axios.get(`/api/matches/${matchId}`);
                setMatch(response.data);
            } catch (error) {
                setError('Failed to load match details');
                console.error('Error fetching match:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatch();
    }, [matchId]);

    if (isLoading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!match) return <div className="not-found">Match not found</div>;

    return (
        <div className="match-page">
            <h1>{match.title}</h1>
            {match.status === 'live' && (
                <iframe
                    title={`${match.title} Live Stream`}
                    src={`https://player.twitch.tv/?channel=${match.streamId}&parent=your-example-domain.com`}
                    frameBorder="0"
                    scrolling="no"
                    allowFullScreen={true}
                    height="378"
                    width="620"
                />
            )}
            <div className="match-info">
                <p>Status: {match.status}</p>
                <p>Participants: {match.participants.join(' vs ')}</p>
                <p>Scheduled to start: {new Date(match.startTime).toLocaleString()}</p>
            </div>
            {match.status === 'live' && <BettingInterface matchId={matchId} />}
            {match.status === 'completed' && (
                <div className="match-result">
                    <h3>Match Result:</h3>
                    <p>Winner: {match.winner || 'Not yet announced'}</p>
                </div>
            )}
        </div>
    );
};

MatchPage.propTypes = {
    matchId: PropTypes.string.isRequired
};

export default MatchPage;
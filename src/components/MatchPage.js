import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BettingInterface from './BettingInterface';

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

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!match) return <div>Match not found</div>;

    return (
        <div className="match-page">
            <h1>{match.title}</h1>
            {match.status === 'live' && (
                <iframe
                    title={match.title}
                    src={`https://player.twitch.tv/?channel=${match.streamId}&parent=YOUR_DOMAIN`}
                    height="378"
                    width="620"
                    allowFullScreen={true}
                />
            )}
            <p>Status: {match.status}</p>
            <p>Participants: {match.participants.join(' vs ')}</p>
            <p>Scheduled to start: {new Date(match.startTime).toLocaleString()}</p>
            {match.status === 'live' && <BettingInterface matchId={matchId} />}
            {match.status === 'completed' && (
                <p>Winner: {match.winner || 'Not yet announced'}</p>
            )}
        </div>
    );
};

export default MatchPage;
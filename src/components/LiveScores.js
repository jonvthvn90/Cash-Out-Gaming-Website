import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';

const socket = io('http://localhost:5000');

function LiveScores() {
    const [scores, setScores] = useState({});
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Listen for score updates
        socket.on('scoreUpdate', (data) => {
            console.log('Score updated:', data);
            setScores(prevScores => ({
                ...prevScores,
                [data.matchId]: data.score
            }));
        });

        // Listen for match results
        socket.on('matchResult', (data) => {
            console.log('Match result:', data);
            setResults(prevResults => [...prevResults, data]);

            // Optionally, we can remove the score of this match if it's completed
            setScores(prevScores => {
                const newScores = { ...prevScores };
                delete newScores[data.matchId];
                return newScores;
            });
        });

        // Cleanup listeners on unmount
        return () => {
            socket.off('scoreUpdate');
            socket.off('matchResult');
        };
    }, []);

    // Function to format the score display
    const displayScore = (matchId) => {
        const score = scores[matchId];
        return score ? `${score.homeTeam} - ${score.awayTeam}` : '0 - 0';
    };

    return (
        <div className="live-scores">
            <h3>Live Scores</h3>
            <ul className="live-matches">
                {Object.keys(scores).map(matchId => (
                    <li key={matchId} className="match-item">
                        <span>Match ID: {matchId}</span>
                        <span>Score: {displayScore(matchId)}</span>
                    </li>
                ))}
                {Object.keys(scores).length === 0 && (
                    <li>No live matches at the moment.</li>
                )}
            </ul>
            {results.length > 0 && (
                <>
                    <h3>Recent Match Results</h3>
                    <ul className="match-results">
                        {results.map((result, index) => (
                            <li key={index} className="result-item">
                                <span>Match ID: {result.matchId}</span>
                                <span>Winner: {result.winner}</span>
                                <span>Score: {result.score.homeTeam} - {result.score.awayTeam}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

LiveScores.propTypes = {
    // Prop types can be added here if passing down props to this component
};

export default LiveScores;
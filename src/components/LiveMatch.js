import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MatchContext } from '../context/MatchContext';

function LiveMatch({ match }) {
    const { matchUpdates, joinMatchRoom, leaveMatchRoom } = useContext(MatchContext);

    useEffect(() => {
        // Join the match room when the component mounts or when the match ID changes
        joinMatchRoom(match._id);

        // Cleanup function to leave the match room when the component unmounts
        return () => {
            leaveMatchRoom(match._id);
        };
    }, [match._id, joinMatchRoom, leaveMatchRoom]);

    const update = matchUpdates[match._id] || {};

    // Helper functions to display player names
    const player1Name = update.player1 || match.player1?.username || 'Player 1';
    const player2Name = update.player2 || match.player2?.username || 'Player 2';

    return (
        <div className="live-match">
            <h3>Live Match: {match.game}</h3>
            <p>Status: {update.status || match.status}</p>
            <p>Score: 
                {update.score ? 
                    `${player1Name}: ${update.score.player1} - ${update.score.player2} :${player2Name}` : 
                    'Not Started'
                }
            </p>
            {/* Add more live match information or controls here */}
        </div>
    );
}

LiveMatch.propTypes = {
    match: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        game: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        player1: PropTypes.shape({
            username: PropTypes.string
        }),
        player2: PropTypes.shape({
            username: PropTypes.string
        })
    }).isRequired
};

export default LiveMatch;
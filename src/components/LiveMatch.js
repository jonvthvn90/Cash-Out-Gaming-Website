import React, { useContext, useEffect } from 'react';
import { MatchContext } from '../context/MatchContext';

function LiveMatch({ match }) {
    const { matchUpdates, joinMatchRoom } = useContext(MatchContext);

    useEffect(() => {
        joinMatchRoom(match._id);
    }, [match._id, joinMatchRoom]);

    const update = matchUpdates[match._id] || {};

    return (
        <div>
            <h3>Live Match: {match.game}</h3>
            <p>Status: {update.status || match.status}</p>
            <p>Score: {update.score ? `${update.score.player1} - ${update.score.player2}` : 'Not Started'}</p>
        </div>
    );
}

export default LiveMatch;
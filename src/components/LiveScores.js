import React, { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function LiveScores() {
    useEffect(() => {
        socket.on('scoreUpdate', (data) => {
            console.log('Score updated:', data);
            // Here, update the UI with the new scores
        });

        socket.on('matchResult', (data) => {
            console.log('Match result:', data);
            // Handle match result update
        });

        return () => {
            socket.off('scoreUpdate');
            socket.off('matchResult');
        };
    }, []);

    return (
        <div>
            <h3>Live Scores</h3>
            {/* Display scores here */}
        </div>
    );
}

export default LiveScores;
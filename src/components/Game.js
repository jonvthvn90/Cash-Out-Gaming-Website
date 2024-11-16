import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const socket = io('http://localhost:8080'); // Update with your server URL

function Game({ challenge }) {
    const[gameState, setGameState] = useState(null);
    const[error, setError] = useState(null);
    const { user } = useUser();

    const createGame = useCallback(async () => {
        try {
            const response = await axios.post('/api/games/create', {
                player1: challenge.challenger,
                player2: challenge.opponent,
                gameType: challenge.game
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setGameState(response.data);
            socket.emit('joinGame', response.data._id);
        } catch (error) {
            setError('Failed to create game.');
        }
    },[challenge, user]);

    useEffect(() => {
        if (challenge.status === 'accepted' && !gameState) {
            createGame();
        }

        socket.on('gameStateUpdated', (newState) => {
            setGameState(newState);
        });

        return () => {
            socket.off('gameStateUpdated');
        };
    },[challenge, gameState, createGame]);

    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>{challenge.game} Game</h2>
            {gameState ? (
                <div>
                    <p>Game State: {gameState.status}</p>
                    {/* Render game board, pieces, etc., based on gameState */}
                </div>
            ) : (
                <p>Waiting for game to start...</p>
            )}
        </div>
    );
}

export default Game;
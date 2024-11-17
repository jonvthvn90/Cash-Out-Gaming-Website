import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import PropTypes from 'prop-types';

const socket = io('http://localhost:8080'); // Update with your server URL

function Game({ challenge }) {
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const [loading, setLoading] = useState(true);

    const createGame = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/games/create', {
                player1: challenge.challenger._id,
                player2: challenge.opponent._id,
                gameType: challenge.game
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setGameState(response.data);
            socket.emit('joinGame', response.data._id);
            setLoading(false);
        } catch (error) {
            setError('Failed to create game.');
            setLoading(false);
        }
    },[challenge]);

    useEffect(() => {
        if (challenge.status === 'accepted' && !gameState) {
            createGame();
        }

        // Socket listeners
        socket.on('gameStateUpdated', (newState) => {
            if (newState._id === gameState?._id) {
                setGameState(newState);
            }
        });

        socket.on('error', (errorMessage) => {
            setError(errorMessage);
        });

        // Cleanup socket listeners when unmounting or when gameState changes
        return () => {
            socket.off('gameStateUpdated');
            socket.off('error');
            if (gameState) {
                socket.emit('leaveGame', gameState._id);
            }
        };
    },[challenge, gameState, createGame]);

    // Check if the user is either the challenger or the opponent
    const isPlayer = challenge.challenger._id === user._id || challenge.opponent._id === user._id;

    if (!isPlayer) {
        return <div>You are not part of this game.</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (loading) {
        return <div>Starting game...</div>;
    }

    return (
        <div className="game-container">
            <h2>{challenge.game} Game</h2>
            {gameState ? (
                <div className="game-board">
                    <p>Game State: {gameState.status}</p>
                    {/* Render game board, pieces, etc., based on gameState */}
                    {/* Add your game-specific logic and UI here */}
                </div>
            ) : (
                <p>Waiting for game to start...</p>
            )}
        </div>
    );
}

Game.propTypes = {
    challenge: PropTypes.shape({
        challenger: PropTypes.shape({
            _id: PropTypes.string.isRequired
        }).isRequired,
        opponent: PropTypes.shape({
            _id: PropTypes.string.isRequired
        }).isRequired,
        status: PropTypes.string.isRequired,
        game: PropTypes.string.isRequired
    }).isRequired
};

export default Game;
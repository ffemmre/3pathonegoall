import React, { useState } from 'react';
import { GameState, Action, TeamId, ActionType, initializeGame, getOpponents } from './gameLogic';
import { resolveRound } from './roundResolution';
import Board from './components/Board';
import ActionSelector from './components/ActionSelector';
import RoundLog from './components/RoundLog';
import StartScreen from './components/StartScreen';
import './App.css';

function App() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());

  // Handle start game with team names
  const handleStartGame = (teamNames: Record<TeamId, string>) => {
    const newState = initializeGame();
    newState.gameStarted = true;
    newState.teams.A.name = teamNames.A;
    newState.teams.B.name = teamNames.B;
    newState.teams.C.name = teamNames.C;
    setGameState(newState);
  };

  // Handle action selection by a team
  const handleActionSelect = (action: Action) => {
    const newPendingActions = [...gameState.pendingActions, action];
    
    // Determine next team to choose
    let nextTeam: TeamId | null = null;
    if (action.team === 'A') nextTeam = 'B';
    else if (action.team === 'B') nextTeam = 'C';
    else if (action.team === 'C') {
      // All teams have chosen - resolve the round
      const newState = resolveRound(gameState, newPendingActions);
      setGameState(newState);
      return;
    }

    // Update state with pending action and next team
    setGameState({
      ...gameState,
      pendingActions: newPendingActions,
      currentlyChoosingTeam: nextTeam,
    });
  };

  // Reset game
  const handleReset = () => {
    setGameState(initializeGame());
  };

  // Show start screen if game hasn't started
  if (!gameState.gameStarted) {
    return (
      <div className="app">
        <header className="header">
          <h1>Three Paths One Goal</h1>
          <p className="subtitle">Turn-based strategy game for 3 players</p>
        </header>
        <StartScreen onStartGame={handleStartGame} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Three Paths One Goal</h1>
        <p className="subtitle">Turn-based strategy game for 3 players</p>
      </header>

      <main className="main-content">
        {/* Game Board */}
        <Board gameState={gameState} />

        {/* Action Selection */}
        {!gameState.gameOver && gameState.currentlyChoosingTeam && (
          <ActionSelector
            gameState={gameState}
            currentTeam={gameState.currentlyChoosingTeam}
            onActionSelect={handleActionSelect}
          />
        )}

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <div className="game-over">
            <h2>🎉 Game Over! 🎉</h2>
            <p className="winner-text">{gameState.teams[gameState.winner!].name} Wins!</p>
            <button onClick={handleReset} className="reset-button">
              Play Again
            </button>
          </div>
        )}

        {/* Round Log */}
        {gameState.roundLog.length > 0 && (
          <RoundLog logs={gameState.roundLog} />
        )}
      </main>

      <footer className="footer">
        <button onClick={handleReset} className="reset-button-small">
          Reset Game
        </button>
      </footer>
    </div>
  );
}

export default App;

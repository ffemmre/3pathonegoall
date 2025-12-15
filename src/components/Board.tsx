import React from 'react';
import { GameState, TeamId, ALL_TEAMS } from '../gameLogic';

interface BoardProps {
  gameState: GameState;
}

const Board: React.FC<BoardProps> = ({ gameState }) => {
  const renderPath = (team: TeamId) => {
    const teamState = gameState.teams[team];
    const steps = Array.from({ length: 8 }, (_, i) => i); // 0 to 7

    return (
      <div className="path" key={team}>
        <div className="path-header">
          <h3 className={`team-label team-${team.toLowerCase()}`}>
            {teamState.name}
          </h3>
          <div className="team-status">
            {teamState.stunCooldown && (
              <span className="status-badge cooldown">STUN on cooldown</span>
            )}
            {teamState.shieldUsedLastTurn && (
              <span className="status-badge no-shield">Cannot SHIELD</span>
            )}
          </div>
        </div>
        <div className="track">
          {steps.map(step => (
            <div
              key={step}
              className={`step ${step === 7 ? 'goal' : ''} ${
                teamState.position === step ? 'active' : ''
              }`}
            >
              <div className="step-number">{step}</div>
              {teamState.position === step && (
                <div className={`pawn pawn-${team.toLowerCase()}`}>
                  {team}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="board">
      <div className="round-info">
        <h2>Round {gameState.currentRound}</h2>
        {gameState.currentlyChoosingTeam && (
          <p className="current-turn">
            {gameState.teams[gameState.currentlyChoosingTeam].name}'s turn to choose
          </p>
        )}
      </div>
      <div className="paths-container">
        {ALL_TEAMS.map(team => renderPath(team))}
      </div>
    </div>
  );
};

export default Board;

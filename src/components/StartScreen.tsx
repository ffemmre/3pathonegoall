import React, { useState } from 'react';
import { GameState, TeamId, ALL_TEAMS } from '../gameLogic';

interface StartScreenProps {
  onStartGame: (teamNames: Record<TeamId, string>) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [teamNames, setTeamNames] = useState<Record<TeamId, string>>({
    A: '',
    B: '',
    C: '',
  });

  const handleNameChange = (team: TeamId, name: string) => {
    setTeamNames(prev => ({
      ...prev,
      [team]: name,
    }));
  };

  const handleStart = () => {
    // Use default names if empty
    const finalNames: Record<TeamId, string> = {
      A: teamNames.A.trim() || 'Team A',
      B: teamNames.B.trim() || 'Team B',
      C: teamNames.C.trim() || 'Team C',
    };
    onStartGame(finalNames);
  };

  const getTeamColor = (team: TeamId) => {
    switch (team) {
      case 'A': return 'var(--neon-pink)';
      case 'B': return 'var(--neon-blue)';
      case 'C': return 'var(--neon-green)';
    }
  };

  return (
    <div className="start-screen">
      <div className="start-screen-container">
        <div className="arcade-frame">
          <div className="insert-coin">
            <span className="coin-text">INSERT COIN</span>
            <span className="coin-blink">▼</span>
          </div>

          <h2 className="start-title">ENTER PLAYER NAMES</h2>
          <p className="start-subtitle">Leave blank for default names</p>

          <div className="team-inputs">
            {ALL_TEAMS.map((team, index) => (
              <div key={team} className="team-input-row" style={{ animationDelay: `${index * 0.1}s` }}>
                <label 
                  className="team-label-input"
                  style={{ color: getTeamColor(team) }}
                >
                  PLAYER {index + 1}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder={`Team ${team}`}
                  value={teamNames[team]}
                  onChange={(e) => handleNameChange(team, e.target.value)}
                  className="team-name-input"
                  style={{ borderColor: getTeamColor(team) }}
                />
              </div>
            ))}
          </div>

          <button 
            className="start-game-button"
            onClick={handleStart}
          >
            START GAME
          </button>

          <div className="game-instructions">
            <p>🎮 LOCAL MULTIPLAYER - 3 PLAYERS</p>
            <p>🏁 FIRST TO REACH STEP 7 WINS!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;

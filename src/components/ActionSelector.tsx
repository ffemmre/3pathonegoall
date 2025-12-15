import React, { useState } from 'react';
import { GameState, Action, TeamId, ActionType, getOpponents } from '../gameLogic';

interface ActionSelectorProps {
  gameState: GameState;
  currentTeam: TeamId;
  onActionSelect: (action: Action) => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({
  gameState,
  currentTeam,
  onActionSelect,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<TeamId | null>(null);

  const teamState = gameState.teams[currentTeam];
  const opponents = getOpponents(currentTeam);

  // Check if STUN is available (not on cooldown)
  const canUseStun = !teamState.stunCooldown;

  // Check if SHIELD is available (not used last turn)
  const canUseShield = !teamState.shieldUsedLastTurn;

  const handleActionClick = (action: ActionType) => {
    setSelectedAction(action);
    setSelectedTarget(null); // Reset target when changing action
  };

  const handleTargetClick = (target: TeamId) => {
    setSelectedTarget(target);
  };

  const handleConfirm = () => {
    if (!selectedAction) return;

    if (selectedAction === 'STUN' && !selectedTarget) {
      alert('Please select a target for STUN');
      return;
    }

    const action: Action = {
      team: currentTeam,
      type: selectedAction,
      target: selectedAction === 'STUN' ? selectedTarget! : undefined,
    };

    onActionSelect(action);
    
    // Reset selections
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  return (
    <div className="action-selector">
      <div className="selector-header">
        <h3>{gameState.teams[currentTeam].name} - Choose Your Action</h3>
        <p className="instruction">Select your action secretly</p>
      </div>

      <div className="action-buttons">
        <button
          className={`action-button move ${selectedAction === 'MOVE' ? 'selected' : ''}`}
          onClick={() => handleActionClick('MOVE')}
        >
          <span className="action-name">MOVE</span>
          <span className="action-description">Move forward +1 step</span>
        </button>

        <button
          className={`action-button stun ${selectedAction === 'STUN' ? 'selected' : ''} ${
            !canUseStun ? 'disabled' : ''
          }`}
          onClick={() => canUseStun && handleActionClick('STUN')}
          disabled={!canUseStun}
        >
          <span className="action-name">STUN</span>
          <span className="action-description">
            {canUseStun ? 'Prevent opponent from moving' : '⚠️ On cooldown'}
          </span>
        </button>

        <button
          className={`action-button shield ${selectedAction === 'SHIELD' ? 'selected' : ''} ${
            !canUseShield ? 'disabled' : ''
          }`}
          onClick={() => canUseShield && handleActionClick('SHIELD')}
          disabled={!canUseShield}
        >
          <span className="action-name">SHIELD</span>
          <span className="action-description">
            {canUseShield ? 'Block all stuns + move forward' : '⚠️ Used last turn'}
          </span>
        </button>
      </div>

      {selectedAction === 'STUN' && (
        <div className="target-selector">
          <p className="target-instruction">Select target team:</p>
          <div className="target-buttons">
            {opponents.map(opponent => (
              <button
                key={opponent}
                className={`target-button ${selectedTarget === opponent ? 'selected' : ''}`}
                onClick={() => handleTargetClick(opponent)}
              >
                Team {opponent}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="confirm-button"
        onClick={handleConfirm}
        disabled={!selectedAction || (selectedAction === 'STUN' && !selectedTarget)}
      >
        Confirm Action
      </button>
    </div>
  );
};

export default ActionSelector;

// Round resolution logic

import {
  GameState,
  Action,
  TeamId,
  TeamState,
  RoundLog,
  ALL_TEAMS,
  getRemainingSteps,
  isStunInRange,
} from './gameLogic';

/**
 * Resolves a complete round after all three teams have chosen their actions.
 * Implements the exact resolution order from the rules.
 */
export function resolveRound(state: GameState, actions: Action[]): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const events: string[] = [];
  const positionsBefore: Record<TeamId, number> = {
    A: newState.teams.A.position,
    B: newState.teams.B.position,
    C: newState.teams.C.position,
  };

  // Store which teams are shielded, stunned, and double-stunned
  const shielded = new Set<TeamId>();
  const stunned = new Set<TeamId>();
  const stunnedBy: Record<TeamId, TeamId[]> = { A: [], B: [], C: [] };

  // Step 1: Apply Shield status first
  actions.forEach(action => {
    if (action.type === 'SHIELD') {
      shielded.add(action.team);
      events.push(`Team ${action.team} used SHIELD (protected from stuns)`);
    }
  });

  // Step 2: Apply Stun attempts (respecting shield only - range restriction removed)
  actions.forEach(action => {
    if (action.type === 'STUN' && action.target) {
      const attacker = action.team;
      const target = action.target;

      // Check if target is shielded
      if (shielded.has(target)) {
        events.push(`Team ${attacker} tried to STUN Team ${target} but it was SHIELDED`);
      } else {
        // Stun is successful
        stunned.add(target);
        stunnedBy[target].push(attacker);
        events.push(`Team ${attacker} successfully STUNNED Team ${target}`);
      }

      // Track total stuns used for tiebreaker
      newState.teams[attacker].totalStunsUsed++;
    }
  });

  // Step 3: Apply Move for teams that chose Move and are not stunned
  // UPDATED: Teams with SHIELD also move forward now
  actions.forEach(action => {
    if (action.type === 'MOVE') {
      if (stunned.has(action.team)) {
        events.push(`Team ${action.team} tried to MOVE but was STUNNED`);
      } else {
        const currentPos = newState.teams[action.team].position;
        if (currentPos < 7) {
          newState.teams[action.team].position = currentPos + 1;
          events.push(`Team ${action.team} moved forward to step ${newState.teams[action.team].position}`);
        } else {
          events.push(`Team ${action.team} is already at goal`);
        }
      }
    } else if (action.type === 'SHIELD') {
      // SHIELD now also allows movement
      const currentPos = newState.teams[action.team].position;
      if (currentPos < 7) {
        newState.teams[action.team].position = currentPos + 1;
        events.push(`Team ${action.team} moved forward with SHIELD to step ${newState.teams[action.team].position}`);
      } else {
        events.push(`Team ${action.team} used SHIELD at goal`);
      }
    }
  });

  // Step 4: Apply Double stun rule
  ALL_TEAMS.forEach(team => {
    if (stunnedBy[team].length === 2) {
      // Double stunned!
      const currentPos = newState.teams[team].position;
      
      if (currentPos === 6) {
        // Exception: on step 6, don't move backward, just lose the move
        events.push(`Team ${team} was DOUBLE STUNNED (by ${stunnedBy[team].join(' and ')}) but at step 6 - no backward move`);
      } else if (currentPos > 0) {
        // Move backward by 1
        newState.teams[team].position = currentPos - 1;
        events.push(`Team ${team} was DOUBLE STUNNED (by ${stunnedBy[team].join(' and ')}) - moved BACKWARD to step ${newState.teams[team].position}`);
      } else {
        // Already at position 0
        events.push(`Team ${team} was DOUBLE STUNNED (by ${stunnedBy[team].join(' and ')}) but already at start`);
      }
    }
  });

  // Step 5: Update cooldown flags
  actions.forEach(action => {
    if (action.type === 'STUN') {
      // This team cannot use STUN next round
      newState.teams[action.team].stunCooldown = true;
    } else {
      // Clear stun cooldown if they didn't use stun this round
      newState.teams[action.team].stunCooldown = false;
    }

    if (action.type === 'SHIELD') {
      // Mark that shield was used this turn, so it cannot be used next turn
      newState.teams[action.team].shieldUsedLastTurn = true;
    } else {
      // Clear shield restriction if they didn't use shield this round
      newState.teams[action.team].shieldUsedLastTurn = false;
    }
  });

  // Step 6: Check for winner
  const teamsAtGoal = ALL_TEAMS.filter(team => newState.teams[team].position >= 7);
  
  if (teamsAtGoal.length > 0) {
    if (teamsAtGoal.length === 1) {
      // Single winner
      newState.winner = teamsAtGoal[0];
      newState.gameOver = true;
      events.push(`🏆 TEAM ${teamsAtGoal[0]} WINS! 🏆`);
    } else {
      // Multiple teams at goal - apply tiebreaker rules
      // First: check who wasn't stunned
      const notStunned = teamsAtGoal.filter(team => !stunned.has(team));
      
      if (notStunned.length === 1) {
        newState.winner = notStunned[0];
        newState.gameOver = true;
        events.push(`🏆 TEAM ${notStunned[0]} WINS (reached goal and not stunned)! 🏆`);
      } else if (notStunned.length > 1) {
        // Both not stunned - check who used fewer stuns
        const withStuns = notStunned.map(team => ({
          team,
          stuns: newState.teams[team].totalStunsUsed,
        }));
        withStuns.sort((a, b) => a.stuns - b.stuns);
        
        if (withStuns[0].stuns < withStuns[1].stuns) {
          newState.winner = withStuns[0].team;
          newState.gameOver = true;
          events.push(`🏆 TEAM ${withStuns[0].team} WINS (fewer total stuns: ${withStuns[0].stuns} vs ${withStuns[1].stuns})! 🏆`);
        } else {
          // Complete tie - pick first one
          newState.winner = withStuns[0].team;
          newState.gameOver = true;
          events.push(`🏆 TEAM ${withStuns[0].team} WINS (tie - same stuns used)! 🏆`);
        }
      } else {
        // All were stunned - pick the one with fewer total stuns
        const withStuns = teamsAtGoal.map(team => ({
          team,
          stuns: newState.teams[team].totalStunsUsed,
        }));
        withStuns.sort((a, b) => a.stuns - b.stuns);
        newState.winner = withStuns[0].team;
        newState.gameOver = true;
        events.push(`🏆 TEAM ${withStuns[0].team} WINS (all stunned, fewer total stuns)! 🏆`);
      }
    }
  }

  // Create round log
  const positionChanges: Record<TeamId, { from: number; to: number }> = {
    A: { from: positionsBefore.A, to: newState.teams.A.position },
    B: { from: positionsBefore.B, to: newState.teams.B.position },
    C: { from: positionsBefore.C, to: newState.teams.C.position },
  };

  const roundLog: RoundLog = {
    round: state.currentRound,
    actions,
    events,
    positionChanges,
  };

  newState.roundLog = [...state.roundLog, roundLog];
  newState.currentRound = state.currentRound + 1;
  newState.pendingActions = [];
  
  // If game is not over, set up next round's action selection
  if (!newState.gameOver) {
    newState.currentlyChoosingTeam = 'A';
  } else {
    newState.currentlyChoosingTeam = null;
  }

  return newState;
}

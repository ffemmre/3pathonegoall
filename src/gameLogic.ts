// Game types and state definitions

export type TeamId = 'A' | 'B' | 'C';

export type ActionType = 'MOVE' | 'STUN' | 'SHIELD';

export interface Action {
  team: TeamId;
  type: ActionType;
  target?: TeamId; // For STUN actions
}

export interface TeamState {
  position: number; // 0 to 7
  stunCooldown: boolean; // Cannot use STUN next turn
  shieldUsedLastTurn: boolean; // Cannot use SHIELD this turn
  totalStunsUsed: number; // For tiebreaker
  name: string; // Custom team name
}

export interface GameState {
  teams: Record<TeamId, TeamState>;
  currentRound: number;
  winner: TeamId | null;
  gameOver: boolean;
  gameStarted: boolean; // Track if game has started
  roundLog: RoundLog[];
  // For action selection phase
  currentlyChoosingTeam: TeamId | null;
  pendingActions: Action[];
}

export interface RoundLog {
  round: number;
  actions: Action[];
  events: string[];
  positionChanges: Record<TeamId, { from: number; to: number }>;
}

// Initialize a fresh game state
export function initializeGame(): GameState {
  return {
    teams: {
      A: { position: 0, stunCooldown: false, shieldUsedLastTurn: false, totalStunsUsed: 0, name: 'Team A' },
      B: { position: 0, stunCooldown: false, shieldUsedLastTurn: false, totalStunsUsed: 0, name: 'Team B' },
      C: { position: 0, stunCooldown: false, shieldUsedLastTurn: false, totalStunsUsed: 0, name: 'Team C' },
    },
    currentRound: 1,
    winner: null,
    gameOver: false,
    gameStarted: false,
    roundLog: [],
    currentlyChoosingTeam: 'A',
    pendingActions: [],
  };
}

// Get all team IDs
export const ALL_TEAMS: TeamId[] = ['A', 'B', 'C'];

// Get opponent teams
export function getOpponents(team: TeamId): TeamId[] {
  return ALL_TEAMS.filter(t => t !== team);
}

// Calculate remaining steps to goal
export function getRemainingSteps(position: number): number {
  return 7 - position;
}

// Check if a stun is in range
export function isStunInRange(attackerPos: number, targetPos: number): boolean {
  const attackerRemaining = getRemainingSteps(attackerPos);
  const targetRemaining = getRemainingSteps(targetPos);
  return Math.abs(attackerRemaining - targetRemaining) <= 2;
}

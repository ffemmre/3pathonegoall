# Three Paths One Goal

A turn-based strategy board game for 3 players where three teams race on separate paths toward a shared goal.

## Game Overview

**Goal:** Be the first team to reach step 7 on your path!

**Players:** 3 human players (local multiplayer on the same device)

**Teams:** Team A (Red), Team B (Blue), Team C (Green)

## How to Play

### Game Flow

1. Each round, all three teams secretly choose one action
2. In the app, teams take turns selecting their action (Team A → Team B → Team C)
3. Once all teams have chosen, all actions are revealed and resolved simultaneously
4. The game continues until one team reaches the goal (step 7)

### Actions

Each team can choose one of three actions per round:

#### 1. **MOVE**
- Move your pawn forward by 1 step
- Cannot move if you're stunned this round
- Cannot move beyond step 7

#### 2. **STUN**
- Target one opponent team
- If successful, prevents them from moving this round
- **Range Limit:** Only works if the difference between your remaining steps and the target's remaining steps is ≤ 2
  - Remaining steps = 7 - current position
- **Cooldown:** Cannot use STUN in the round immediately after using it
- **Double Stun:** If a team is stunned by BOTH opponents in the same round:
  - They move 1 step backward (unless they're at step 6 or step 0)
  - At step 6: No backward movement (just lose their move)
  - At step 0: Already at start, can't go back

#### 3. **SHIELD**
- Blocks all stun attempts targeting you this round
- **You still move forward by +1 step** (defensive movement)
- **Restriction:** Cannot use Shield in two consecutive rounds

### Winning

The first team to reach step 7 wins!

**Tiebreaker (if multiple teams reach step 7 in the same round):**
1. If only one team wasn't stunned → They win
2. If multiple teams weren't stunned → Team with fewer total STUNs used wins
3. If still tied → First team in order (A, B, C) wins

## Strategy Tips

- **Timing is key:** Choose when to move aggressively vs. defensively
- **Watch positions:** STUN only works within range (2 steps difference in remaining distance)
- **Plan ahead:** Remember cooldowns - you can't STUN twice in a row or SHIELD twice in a row
- **Double stun coordination:** If both opponents target you, you'll move backward!
- **Shield wisely:** Use it when you expect to be stunned, but remember the cooldown

## Installation & Running

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── gameLogic.ts          # Core game types and utilities
├── roundResolution.ts    # Round resolution logic
├── App.tsx              # Main game component
├── App.css              # Main styles
├── main.tsx             # Entry point
└── components/
    ├── Board.tsx        # Game board display
    ├── ActionSelector.tsx  # Action selection UI
    └── RoundLog.tsx     # Round history display
```

## Technical Details

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** React useState
- **Game Logic:** Pure functions separated from UI components
- **Local Multiplayer:** Sequential action selection on the same device

## Game Rules Implementation

The resolution order for each round is:

1. All three teams choose their actions (stored but not revealed)
2. Apply Shield status to teams that chose SHIELD
3. Process all STUN attempts (checking range and shields)
4. Apply MOVE for teams that chose it and aren't stunned
5. Apply Double Stun penalty (backward movement)
6. Update cooldown flags for next round
7. Check for winner

All game logic is implemented in pure TypeScript functions for testability and clarity.

## License

MIT

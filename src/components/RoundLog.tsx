import React, { useState } from 'react';
import { RoundLog as RoundLogType } from '../gameLogic';

interface RoundLogProps {
  logs: RoundLogType[];
}

const RoundLog: React.FC<RoundLogProps> = ({ logs }) => {
  const [expanded, setExpanded] = useState(true);

  if (logs.length === 0) return null;

  const latestLog = logs[logs.length - 1];

  return (
    <div className="round-log">
      <div className="log-header" onClick={() => setExpanded(!expanded)}>
        <h3>Last Round Summary</h3>
        <button className="toggle-button">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="log-content">
          <div className="log-round">
            <h4>Round {latestLog.round}</h4>

            {/* Actions taken */}
            <div className="log-section">
              <strong>Actions:</strong>
              <ul>
                {latestLog.actions.map((action, idx) => (
                  <li key={idx}>
                    Team {action.team}: {action.type}
                    {action.target && ` → Team ${action.target}`}
                  </li>
                ))}
              </ul>
            </div>

            {/* Events */}
            <div className="log-section">
              <strong>What happened:</strong>
              <ul>
                {latestLog.events.map((event, idx) => (
                  <li key={idx}>{event}</li>
                ))}
              </ul>
            </div>

            {/* Position changes */}
            <div className="log-section">
              <strong>Positions:</strong>
              <ul>
                {Object.entries(latestLog.positionChanges).map(([team, change]) => (
                  <li key={team}>
                    Team {team}: {change.from} → {change.to}
                    {change.to > change.from && ' ✓'}
                    {change.to < change.from && ' ✗'}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Show all previous rounds in collapsed view */}
          {logs.length > 1 && (
            <details className="previous-rounds">
              <summary>View all {logs.length - 1} previous rounds</summary>
              {logs.slice(0, -1).reverse().map(log => (
                <div key={log.round} className="log-round previous">
                  <h5>Round {log.round}</h5>
                  <div className="log-section-compact">
                    <strong>Actions:</strong>
                    {log.actions.map((a, i) => (
                      <span key={i}>
                        {' '}Team {a.team}: {a.type}
                        {a.target && ` → ${a.target}`};
                      </span>
                    ))}
                  </div>
                  <div className="log-section-compact">
                    <strong>Result:</strong> 
                    {Object.entries(log.positionChanges).map(([team, change]) => (
                      <span key={team}>
                        {' '}{team}: {change.from}→{change.to};
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default RoundLog;

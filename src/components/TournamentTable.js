import React from 'react';

function TournamentTable({ teams, tournamentResults }) {
  return (
    <div>
      <h3>Tournament Standings</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Teams</th>
            <th>Wins</th>
            <th>Draws</th>
            <th>Losses</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team}>
              <td>{index + 1}.</td>
              <td>{team}</td>
              <td>{tournamentResults[team] ? tournamentResults[team].wins : 0}</td>
              <td>{tournamentResults[team] ? tournamentResults[team].draws : 0}</td>
              <td>{tournamentResults[team] ? tournamentResults[team].losses : 0}</td>
              <td>{tournamentResults[team] ? tournamentResults[team].points : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TournamentTable;

import React, { useState } from 'react';

function Tournaments() {
  const [tournamentName, setTournamentName] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [scoringSystem, setScoringSystem] = useState('3/1/0');

  const createTournament = () => {
    const competitorsList = competitors.split(/,|\n/).map((competitor) => competitor.trim());

    const tournamentData = {
      name: tournamentName,
      competitors: competitorsList,
      scoringSystem: scoringSystem,
    };

    // Ovdje pozovite funkciju za spremanje turnira u Firestore ili izvedite druge radnje
    console.log('Tournament data:', tournamentData);

    // Reset the form fields
    setTournamentName('');
    setCompetitors('');
    setScoringSystem('3/1/0');
  };

  return (
    <div className="Tournaments">
      <h2>Create a New Tournament</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Tournament Name:</label>
          <input type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
        </div>
        <div>
          <label>Competitors (separated by comma or newline):</label>
          <textarea rows="4" value={competitors} onChange={(e) => setCompetitors(e.target.value)} />
        </div>
        <div>
          <label>Scoring System (e.g., 3/1/0):</label>
          <input type="text" value={scoringSystem} onChange={(e) => setScoringSystem(e.target.value)} />
        </div>
        <button onClick={createTournament}>Create Tournament</button>
      </form>
    </div>
  );
}

export default Tournaments;

import './App.css';
import React, { useRef, useState, useEffect } from 'react';
import { firestore } from "./firebase";
import { addDoc, collection, updateDoc, doc, setDoc, increment } from "@firebase/firestore";
import LoginButton from './components/login';
import LogoutButton from './components/logout';
import Profile from './components/Profile';
import { useAuth0 } from '@auth0/auth0-react';
import Tournaments from './components/Tournaments';
import TournamentTable from './components/TournamentTable';


function generateMatchSchedule(numTeams, numRounds) {
  const matchSchedule = [];
  const teams = Array.from({ length: numTeams }, (_, index) => index + 1);

  for (let round = 1; round <= numRounds; round++) {
    const roundMatches = [];

    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        roundMatches.push([teams[i], teams[j]]);
      }
    }

    matchSchedule.push(roundMatches);
    teams.push(teams.shift());
  }

  return matchSchedule;
}


function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [appIsLoading, setIsLoading] = useState(true);
  const userMessageRef = useRef();
  const tournamentMessageRef = useRef();
  const competitorsRef = useRef();
  const [userAdded, setUserAdded] = useState(false);
  const [tournamentAdded, setTournamentAdded] = useState(false);
  const [numCompetitors, setNumCompetitors] = useState(4);
  const [competitorNames, setCompetitorNames] = useState(Array.from({ length: 4 }, () => ''));
  const [currentStep, setCurrentStep] = useState("step1");
  const [selectedSport, setSelectedSport] = useState("Football");
  const [showSportSelection, setShowSportSelection] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [updateClicked, setUpdateClicked] = useState(false);
  const [teams, setTeams] = useState([]);
  const [tournamentResults, setTournamentResults] = useState({});
  const [isFieldsFilled, setIsFieldsFilled] = useState(true);


  const numTeams = 4; 
  const numRounds = numTeams - 1; 

  const matchSchedule = generateMatchSchedule(numTeams, numRounds);

  const [matchPairs, setMatchPairs] = useState(['Match 1', 'Match 2', 'Match 3']);
  const [matchResults, setMatchResults] = useState(
    matchPairs.map(() => ({ competitor1Goals: '', competitor2Goals: '' }))
  );


  const [teamScores, setTeamScores] = useState(
  competitorNames.map((_, index) => 0)
);

  const handleAddResult = (index) => {

    console.log(`Adding result for match ${index + 1}:`);
    console.log(`Competitor 1 Goals: ${matchResults[index].competitor1Goals}`);
    console.log(`Competitor 2 Goals: ${matchResults[index].competitor2Goals}`);
  };

  const [scoringSystem, setScoringSystem] = useState({
    win: 3,
    draw: 1,
    loss: 0,
  });
  
  const [tournamentData, setTournamentData] = useState({
    name: '', 
    numTeams: 0, 
    teamNames: Array.from({ length: 8 }, () => '')
  });
  
  
  const handleTournamentNameChange = (e) => {
    const newName = e.target.value;
    setTournamentData({
      ...tournamentData,
      name: newName,
    });
  };
  
  const handleNumTeamsChange = (e) => {
    const newNumTeams = parseInt(e.target.value, 10);
    setTournamentData({
      ...tournamentData,
      numTeams: newNumTeams,
    });
  };
  
  const handleTeamNameChange = (index, newName) => {
    const updatedTeamNames = [...tournamentData.teamNames];
    updatedTeamNames[index] = newName;
    setTournamentData({
      ...tournamentData,
      teamNames: updatedTeamNames,
    });
  };
  
  const tournamentObject = {
    name: tournamentData.name,
    numTeams: tournamentData.numTeams,
    teamNames: tournamentData.teamNames.filter((name, index) => index < tournamentData.numTeams),
  };
  
  const resetCompetitors = () => {
    setNumCompetitors(4);
    setCompetitorNames(Array.from({ length: 4 }, () => ''));
    setScoringSystem({
      win: 3,
      draw: 1,
      loss: 0,
    });
  };

  const [currentTournament, setCurrentTournament] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchResult, setMatchResult] = useState({
    competitor1: '',
    competitor2: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      saveUserDataToFirebase(user);
    }
  }, [isAuthenticated, user]);

  const saveUserDataToFirebase = async (userData) => {
    try {
      const usersCollection = collection(firestore, "Users");
      const userRef = await addDoc(usersCollection, userData);
      console.log("Korisnikovi podaci su uspješno spremljeni u Firebase bazu podataka!");
    } catch (error) {
      console.error("Greška prilikom spremanja korisnikovih podataka:", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (isAuthenticated) {
      setIsLoading(false); 
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (competitorsRef.current) {
      setNumCompetitors(Number(competitorsRef.current.value));
      const updatedCompetitorNames = Array.from(
        { length: numCompetitors },
        (_, i) => competitorNames[i]
      );
      setCompetitorNames(updatedCompetitorNames);
    }
  }, [competitorsRef.current, numCompetitors, competitorNames]);

  useEffect(() => {
    if (numCompetitors >= 2) {
      const pairs = [];
      const initialResults = []; 
  
      for (let i = 0; i < numCompetitors; i++) {
        for (let j = i + 1; j < numCompetitors; j++) {
          const pair = `${competitorNames[i]} - ${competitorNames[j]}`;
          pairs.push(pair);
          initialResults.push({
            competitor1Goals: '',
            competitor2Goals: '',
          });
        }
      }
  
      setMatchPairs(pairs);
      setMatchResults(initialResults); 
    }
  }, [numCompetitors, competitorNames]);
  

  const handleAddUser = async (e) => {
    e.preventDefault();
    let userData = {
      name: userMessageRef.current.value
    }

    if (isAuthenticated) {
      try {
        const userRef = collection(firestore, "Users");
        await addDoc(userRef, userData);
        setUserAdded(true);
      } catch (error) {
        console.error('Error adding user data:', error);
      }
    } else {
      console.error('User is not authenticated.');
    }
  };

  const handleSportChange = (e) => {
    const sport = e.target.value;
    setSelectedSport(sport);
    let updatedScoringSystem = {};
    if (sport === "Football" || sport === "Water Polo") {
      updatedScoringSystem = {
        win: 3,
        draw: 1,
        loss: 0,
      };
    } else if (sport === "Basketball" || sport === "Handball") {
      updatedScoringSystem = {
        win: 2,
        draw: sport === "Handball" ? 1 : 0,
        loss: sport === "Handball" ? 0 : 1,
      };
    } 
    setScoringSystem(updatedScoringSystem);
  };

  const handleUpdateResult = async (index) => {
    const result = matchResults[index];
  
    if (currentTournament) {
      const tournamentId = currentTournament.id;
      const matchData = matchSchedule[currentRound - 1][index];
  
      const matchResultData = {
        competitor1Goals: parseInt(result.competitor1Goals, 10),
        competitor2Goals: parseInt(result.competitor2Goals, 10),
      };
  
      try {
        const gamesRef = collection(firestore, "Games");
        const gameData = {
          tournamentId,
          round: currentRound,
          match: index + 1,
          result: matchResultData,
        };
        await addDoc(gamesRef, gameData);
  
        console.log(`Result for Match ${index + 1} updated.`);
      } catch (error) {
        console.error("Error updating match result:", error);
      }
    }
  };
  
  
  const handleAddTournament = async (e) => {
    e.preventDefault();
    const tournamentName = tournamentMessageRef.current.value;
  
    if (
      tournamentName &&
      numCompetitors &&
      isAuthenticated &&
      competitorNames.every((name) => name.trim() !== '')
    ) {

      setIsFieldsFilled(true);
  
      let points;
      setTeams(competitorNames);
      setTournamentResults({});
  
      if (selectedSport === 'Football' || selectedSport === 'Water Polo') {
        points = {
          win: 3,
          draw: 1,
          loss: 0,
        };
      } else if (selectedSport === 'Basketball' || selectedSport === 'Handball') {
        points = {
          win: 2,
          draw: selectedSport === 'Handball' ? 1 : 0,
          loss: 0,
        };
      }
  
      let tournamentData = {
        sport: selectedSport,
        points: scoringSystem,
        name: tournamentName,
        competitors: competitorNames,
      };
  
      if (isAuthenticated) {
        try {
          const tournamentRef = collection(firestore, 'Tournaments');
          const tournamentDocRef = await addDoc(tournamentRef, tournamentData);
  
          if (tournamentDocRef.id) {
            const userRef = collection(
              tournamentRef.doc(tournamentDocRef.id),
              'Users'
            );
            const userData = {
              name: userMessageRef.current.value,
            };
            await addDoc(userRef, userData);
          }

          setTournamentAdded(true);
          setCompetitorNames(Array.from({ length: numCompetitors }, () => ''));
          setCurrentStep('step1');
          setSelectedSport('Football'); 
  
          tournamentMessageRef.current.value = '';
  
          setIsFormValid(false);
        } catch (error) {
          console.error('Error adding tournament and user data:', error);
        }
      } else {
        console.error('User is not authenticated.');
      }
    } else {
      setIsFieldsFilled(false);
    }
  };
  
  
  const handleMatchResultChange = (matchId, field, value) => {
    setMatchResults((prevResults) => ({
      ...prevResults,
      [matchId]: {
        ...prevResults[matchId],
        [field]: value,
      },
    }));
  };
  

  if (isLoading) return <div>Loading ...</div>;

  const viewTournament = async (tournamentId) => {
    const tournamentDocRef = firestore.collection("Tournaments").doc(tournamentId);
    const tournamentDoc = await tournamentDocRef.get();
  
    if (tournamentDoc.exists) {
      setCurrentTournament({
        id: tournamentId,
        ...tournamentDoc.data(),
      });
  
      setCurrentRound(1);
      setMatchResult({
        competitor1: '',
        competitor2: '',
      });
    }
  };


  return (
    <div className="App">
      {appIsLoading ? (
        <div>Loading ...</div>
      ) : isAuthenticated ? (
        <div>
          <LogoutButton onClick={logout} />
          <div style={{ height: '30px' }}></div>
          {showSportSelection && (
            <div>
              <h3>Select Sport</h3>
              <select value={selectedSport} onChange={handleSportChange}>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Handball">Handball</option>
                <option value="Water Polo">Water Polo</option>
              </select>
              <p>Scoring System: Win - {scoringSystem.win}, Draw - {scoringSystem.draw}, Loss - {scoringSystem.loss}</p>
              <div style={{ height: '30px' }}></div>
            </div>
          )}
  
      {selectedSport && currentStep === "step1" && (
        <div>
          <h3>Add Tournament</h3>
          <input type="text" id="tournament-name-input" ref={tournamentMessageRef} placeholder="Tournament Name" />
          <select ref={competitorsRef}>
            <option value="4">4 Teams</option>
            <option value="5">5 Teams</option>
            <option value="6">6 Teams</option>
            <option value="7">7 Teams</option>
            <option value="8">8 Teams</option>
          </select>
          {competitorNames.map((name, index) => (
            <input
              key={index}
              type="text"
              value={name}
              onChange={(e) => {
                const updatedNames = [...competitorNames];
                updatedNames[index] = e.target.value;
                setCompetitorNames(updatedNames);
              }}
              placeholder={`Team ${index + 1} Name`}
            />
          ))}
          <button onClick={(e) => {
            handleAddTournament(e);
            setCurrentStep("step2");
            setShowSportSelection(false); 
          }}>Add</button>
          <div style={{ height: '30px' }}></div>
        </div>
      )}
  
      {currentStep === "step2" && (
        <div>
          <button onClick={() => {
            setCurrentStep("step1");
            resetCompetitors();
            setSelectedSport("Football");
            setShowSportSelection(true); 
          }}>Go Back</button>
          {!isFieldsFilled && <p style={{ color: 'red' }}>Please fill in all the required fields.</p>}
          {isFieldsFilled && <p style={{ color: 'green' }}>Tournament added successfully!</p>}
          <div style={{ height: '30px' }}></div>
        </div>
      )}


        
      {matchPairs.length > 0 && (
        <div>
          <h3>Games and Results</h3>
          {matchPairs.map((pair, index) => (
            <div key={index}>
              {pair}
              {updateClicked ? (
                <button
                  id="small-button"
                  onClick={() => {
                    setCurrentStep("step1");
                    setUpdateClicked(false); 
                  }}
                >
                  Go Back
                </button>
              ) : (
                <div>
                  <select
                    value={matchResults[index].competitor1Goals}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const newResults = [...matchResults];
                      newResults[index].competitor1Goals = selectedValue;
                      setMatchResults(newResults);
                    }}
                  >
                    {Array.from({ length: 301 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <select
                    value={matchResults[index].competitor2Goals}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      const newResults = [...matchResults];
                      newResults[index].competitor2Goals = selectedValue;
                      setMatchResults(newResults);
                    }}
                  >
                    {Array.from({ length: 301 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <button
                    id="small-button"
                    onClick={() => handleUpdateResult(index)}
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
      ) : (
        <div className="login-container">
          <img src="sports-var.png" alt="Log In" className="login-icon" />
          <div style={{ height: '30px' }}></div>
          <h2 className="login-title">Tournaments</h2>
          <button onClick={() => loginWithRedirect()}>Log in</button>
    
        </div>
      )}

      <div style={{ height: '30px' }}></div>
      <div id="table-container">
        <TournamentTable teams={teams} tournamentResults={tournamentResults} />
      </div>
    </div>
  );
}

export default App;

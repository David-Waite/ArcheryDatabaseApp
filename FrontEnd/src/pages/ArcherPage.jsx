import HomeTemplate from "../components/UI/HomeTemplate/HomeTemplate.jsx";
import { GiArcheryTarget } from "react-icons/gi";
import { FaTrophy } from "react-icons/fa6";
import { IoMdTrendingUp } from "react-icons/io";
import { GiPodiumWinner } from "react-icons/gi";
import { useEffect, useState } from "react";
import NewRoundForm from "../components/home/enterRound/newRoundForm.jsx";
import ViewChampionship from "../components/home/ViewChampionship.jsx";
import ViewCompetitions from "../components/home/ViewCompetitions/ViewCompetitions.jsx";
import NewRoundSummary from "../components/UI/RoundSummary/RoundSummary.jsx";
import ViewMyScores from "../components/home/ViewMyScores/ViewMyScores.jsx";
import { useParams } from "react-router-dom";
import EndForm from "../components/home/enterRound/endForm.js";

const overViewCardsDUMMY = {
  cardOne: {
    mainStat: "7",
    desc: "Round shot",
  },
  cardTwo: {
    mainStat: "7",
    desc: "Round shot",
  },
  cardThree: {
    mainStat: "7",
    desc: "Round shot",
  },
};

const profileDUMMY = "David Waite";

const sideNavDUMMY = [
  { icon: <GiArcheryTarget size={36} />, desc: "New round", id: "newRound" },
  { icon: <FaTrophy size={36} />, desc: "Competitions", id: "competitions" },
  { icon: <IoMdTrendingUp size={36} />, desc: "My scores", id: "myScores" },
  {
    icon: <GiPodiumWinner size={36} />,
    desc: "Championship",
    id: "championship",
  },
];

function ArcherPage() {
  const [selectedSideNav, setSelectedSideNav] = useState("newRound");

  const [newRoundShotId, setNewRoundShotId] = useState(null);
  const [currentRoundName, setCurrentRoundName] = useState("");
  const [newRoundEnds, setNewRoundEnds] = useState(null);
  const [currentEnd, setCurrentEnd] = useState(0);
  const [arrows, setArrows] = useState(Array(6).fill(""));
  const [summray, setSummary] = useState(false);
  const [archerName, setArcherName] = useState("");
  const [overViewStats, setOverViewStats] = useState();

  const [viewScoreID, setViewScoreID] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchArcherDetails = async () => {
      try {
        const response = await fetch(`/api/archers/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const archerDetails = await response.json();
        setArcherName(
          archerDetails[0].firstName + " " + archerDetails[0].lastName
        );
      } catch (error) {
        console.error("Error fetching archer details:", error);
      }
    };

    const fetchTotalRoundShots = async () => {
      try {
        const response = await fetch(
          `/api/archers/${id}/stats/total-roundshots`
        );
        if (!response.ok) throw new Error("Failed to fetch total round shots");
        const data = await response.json();
        return data.totalRoundShots;
      } catch (error) {
        console.error("Error fetching total round shots:", error);
        return null;
      }
    };

    const fetchMostFrequentRound = async () => {
      try {
        const response = await fetch(
          `/api/archers/${id}/stats/most-frequent-round`
        );
        if (!response.ok)
          throw new Error("Failed to fetch most frequent round");
        const data = await response.json();
        return { round: data.mostFrequentRoundName, frequency: data.frequency };
      } catch (error) {
        console.error("Error fetching most frequent round:", error);
        return { round: null, frequency: null };
      }
    };

    const fetchRoundShotsThisYear = async () => {
      try {
        const response = await fetch(
          `/api/archers/${id}/stats/roundshots-this-year`
        );
        if (!response.ok)
          throw new Error("Failed to fetch round shots this year");
        const data = await response.json();
        return data.roundShotsThisYear;
      } catch (error) {
        console.error("Error fetching round shots this year:", error);
        return null;
      }
    };

    const setupOverviewStats = async () => {
      const [totalShots, mostFrequentData, shotsThisYear] = await Promise.all([
        fetchTotalRoundShots(),
        fetchMostFrequentRound(),
        fetchRoundShotsThisYear(),
      ]);

      const overViewStatsData = {
        cardOne: {
          mainStat: totalShots,
          desc: "Rounds shot",
        },
        cardTwo: {
          mainStat: mostFrequentData.frequency,
          desc: "Favourite round: " + mostFrequentData.round,
        },
        cardThree: {
          mainStat: shotsThisYear,
          desc: "Rounds shot this year",
        },
      };

      return overViewStatsData;
    };

    const initializeStats = async () => {
      await fetchArcherDetails();
      const stats = await setupOverviewStats();
      setOverViewStats(stats);
    };

    initializeStats();
  }, [id, summray]);

  useEffect(() => {
    setArrows(Array(6).fill(""));

    console.log("setting new arrows");
  }, [currentEnd]);

  function handleGoBack() {
    switch (selectedSideNav) {
      case "newRound":
        setNewRoundShotId(null);
        setCurrentRoundName("");
        setNewRoundEnds(null);
        setCurrentEnd(0);
        setArrows(Array(6).fill(""));
        setSummary(false);
        break;

      case "myScores":
        setViewScoreID(null);
        break;
      default:
        break;
    }
  }

  function handleUpdateArrows(arrowID, arrowValue) {
    setArrows((prev) => {
      const cleanedValue = arrowValue.replace(/\D/g, "");
      let finalValue = cleanedValue;
      if (cleanedValue !== "") {
        const numericValue = parseInt(cleanedValue, 10);
        if (numericValue > 10) {
          finalValue = "10";
        }
      }
      const newArrows = [...prev];
      newArrows[arrowID] = parseInt(finalValue) || "";
      console.log(newArrows);
      return newArrows;
    });
  }

  function handleEndSubmit() {
    for (let i = 0; i < arrows.length; i++) {
      if (!arrows[i]) {
        return;
      }
    }

    handleSaveEnd({
      roundShotID: newRoundShotId,
      endPosition: currentEnd,
      score1: arrows[0],
      score2: arrows[1],
      score3: arrows[2],
      score4: arrows[3],
      score5: arrows[4],
      score6: arrows[5],
    });
  }

  const handleSaveEnd = async (endData) => {
    try {
      const response = await fetch("/api/ends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(endData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server responded with ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Successfully created end:", result);

      // This logic is now correct
      if (currentEnd + 1 >= newRoundEnds.length) {
        setSummary(true);
      } else {
        setCurrentEnd((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to save end:", error);
      alert(`Error saving end: ${error.message}`);
    }
  };

  const handleCreateRoundShot = async (formData) => {
    const roundShotData = {
      archerID: formData.archerID,
      competitionID: formData.competitionID ? formData.competitionID : null,
      equipmentID: formData.equipmentID,
      categoryID: formData.categoryID,
      dateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
      roundID: formData.roundID,
    };

    try {
      const response = await fetch("/api/roundshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roundShotData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server responded with ${response.status}`
        );
      }

      const result = await response.json();

      setNewRoundShotId(result.newRecordId);
      setCurrentRoundName(formData.roundName);

      await fetchRoundDetails(formData.roundID);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const fetchRoundDetails = async (roundId) => {
    if (!roundId) return;
    try {
      const response = await fetch(`/api/rounds/${roundId}/details`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const roundDetails = await response.json();
      let ends = [];
      for (let p = 0; p < roundDetails.length; p++) {
        for (
          let e = 0;
          e < roundDetails[p].Number_Of_6_Arrow_Ends_At_This_Range;
          e++
        ) {
          // No change needed here, this logic is fine
          ends.push({
            distance: roundDetails[p].Distance,
            facesize: roundDetails[p].Target_Face_Size,
          });
        }
      }
      setNewRoundEnds(ends);
      setCurrentEnd(0); // FIX: Start at index 0
    } catch (error) {
      console.error("Error fetching round details:", error);
    }
  };

  function handleSelectSideNav(id) {
    if (newRoundShotId) {
      alert("Finish new round before navigating off");
      return;
    }
    setSelectedSideNav(id);
  }

  let mainContent;

  switch (selectedSideNav) {
    case "newRound":
      if (summray) {
        mainContent = <NewRoundSummary roundShotID={newRoundShotId} />;
      } else if (newRoundEnds) {
        mainContent = (
          <EndForm
            setState={handleUpdateArrows}
            arrows={arrows}
            handleNextEndButtonPress={handleEndSubmit}
            title={`${currentRoundName} | End ${currentEnd + 1} / ${
              newRoundEnds.length
            } | Distance: ${newRoundEnds[currentEnd].distance} | Target face: ${
              newRoundEnds[currentEnd].facesize
            }`}
          />
        );
      } else {
        mainContent = (
          <NewRoundForm archerId={id} createRoundShot={handleCreateRoundShot} />
        );
      }

      break;

    case "competitions":
      mainContent = <ViewCompetitions />;
      break;
    case "myScores":
      mainContent = (
        <ViewMyScores
          archerId={id}
          viewScoreID={viewScoreID}
          setViewScoreID={setViewScoreID}
        />
      );
      break;
    default:
      mainContent = <ViewChampionship />;
  }

  if (!overViewStats) {
    return;
  }

  return (
    <HomeTemplate
      profile={archerName}
      overViewCards={overViewStats}
      sideNav={sideNavDUMMY}
      mainContent={mainContent}
      selectedSideNav={selectedSideNav}
      handleSelectSideNav={handleSelectSideNav}
      goBack={handleGoBack}
    />
  );
}

export default ArcherPage;

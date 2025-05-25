import HomeTemplate from "../components/UI/HomeTemplate/HomeTemplate.jsx";
import { GiArcheryTarget } from "react-icons/gi";
import { FaTrophy } from "react-icons/fa6";
import { IoMdTrendingUp } from "react-icons/io";
import { GiPodiumWinner } from "react-icons/gi";
import { useState } from "react";
import NewRoundForm from "../components/home/newRoundForm.jsx";
import ViewChampionship from "../components/home/ViewChampionship.jsx";
import ViewCompetitions from "../components/home/ViewCompetitions.jsx";
import ViewMyScores from "../components/home/ViewMyScores.jsx";
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

const profileDUMMY = "Archer 1";

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

  function handleSelectSideNav(id) {
    console.log(id);
    setSelectedSideNav(id);
  }
  let mainContent;
  switch (selectedSideNav) {
    case "newRound":
      mainContent = <NewRoundForm />;
      break;

    case "competitions":
      mainContent = <ViewCompetitions />;
      break;
    case "myScores":
      mainContent = <ViewMyScores />;
      break;
    default:
      mainContent = <ViewChampionship />;
  }

  return (
    <HomeTemplate
      profile={profileDUMMY}
      overViewCards={overViewCardsDUMMY}
      sideNav={sideNavDUMMY}
      mainContent={mainContent}
      selectedSideNav={selectedSideNav}
      handleSelectSideNav={handleSelectSideNav}
    />
  );
}

export default ArcherPage;

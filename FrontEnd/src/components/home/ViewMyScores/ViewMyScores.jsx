import { useEffect, useState } from "react";
import SelectInput from "../../UI/SelectInput/SelectInput";
import NewRoundSummary from "../../UI/RoundSummary/RoundSummary";
import styles from "./ViewMyScores.module.css";

export default function ViewMyScores({
  archerId,
  viewScoreID,
  setViewScoreID,
}) {
  const [scores, setScores] = useState(null);
  const [round, setRound] = useState("");
  const [allRounds, setAllRounds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formattedRoundBase, setFormattedRoundBase] = useState();

  const [formattedRounds, setFormattedRounds] = useState(null);

  useEffect(() => {
    const fetchAllRounds = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/allRounds");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const formattedRounds = data.map((item) => ({
          id: item.ID,
          value: item.name,
        }));

        setAllRounds(formattedRounds);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRounds();
  }, []);

  useEffect(() => {
    fetchArcherScores(archerId);
  }, [archerId]);

  useEffect(() => {
    if (!scores || !allRounds) {
      return;
    }

    if (!formattedRounds) {
      let forMap = {};

      allRounds.forEach((round) => {
        forMap[round.value] = [];
      });

      scores.forEach((score) => {
        forMap[score.roundName].push(score);
      });

      console.log(forMap);

      setFormattedRounds(forMap);
      setFormattedRoundBase(forMap);
    }

    if (!round) {
      setFormattedRounds(formattedRoundBase);
      return;
    } else {
      let forMap = {};
      forMap[round.value] = formattedRoundBase[round.value];

      setFormattedRounds(forMap);
    }
  }, [round, scores, allRounds]);

  const fetchArcherScores = async (archerId) => {
    if (!archerId) {
      console.error("No archerId provided.");
      return;
    }

    try {
      const response = await fetch(`/api/archers/${archerId}/scores`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server responded with ${response.status}`
        );
      }

      const scores = await response.json();
      setScores(scores);
    } catch (error) {
      console.error("Failed to fetch archer scores:", error);
    }
  };

  function formatTimestampLocal(isoTimestamp) {
    const date = new Date(isoTimestamp);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? "0" + day : day;
    const formattedMonth = month < 10 ? "0" + month : month;

    return `${formattedDay}/${formattedMonth}/${year}`;
  }

  if (!formattedRounds) {
    return;
  }

  if (viewScoreID) {
    return <NewRoundSummary roundShotID={viewScoreID} />;
  }

  return (
    <div>
      <h2>Personal Scores</h2>
      <div className={styles["roundContainer"]}>
        <SelectInput
          state={round}
          setState={setRound}
          placeholder="All Rounds"
          options={allRounds}
          optional={true}
        />
      </div>

      {isLoading && <div>loading</div>}

      {Object.entries(formattedRounds).map(([roundName, roundScores]) => (
        <div key={roundName}>
          {roundScores.length > 0 && (
            <h3 className={styles["roundName"]}>{roundName}</h3>
          )}
          <div className={styles["roundsShotContainer"]}>
            {roundScores.length > 0 &&
              roundScores.map((score) => {
                return (
                  <div
                    style={
                      score.status == "Pending"
                        ? {
                            backgroundColor: "#eed202",
                          }
                        : { backgroundColor: "white" }
                    }
                    className={styles["roundShotContainer"]}
                    key={score.roundshotID}
                    onClick={() => setViewScoreID(score.roundshotID)}
                  >
                    <p>
                      {score.competitionName && `${score.competitionName} |`}{" "}
                      {score.categoryName} | {formatTimestampLocal(score.date)}{" "}
                      | {score.totalScore}pt
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

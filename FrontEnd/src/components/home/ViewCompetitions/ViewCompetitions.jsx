import { useState, useEffect } from "react";
import styles from "./ViewCompetitions.module.css";
import SelectInput from "../../UI/SelectInput/SelectInput"; // Assuming this UI component exists
import TextInput from "../../UI/TextInput/TextInput";
import DateInput from "../../UI/DateInput/DateInput";

/**
 * A simple component to display a dropdown of all available rounds.
 */
export default function ViewCompetitions() {
  const [round, setRound] = useState("");
  const [allRounds, setAllRounds] = useState([]);

  const [orderBy, setOrderBy] = useState("Latest");

  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchAllRounds = async () => {
      setIsLoading(true);
      setError(null);
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
        setError("Failed to fetch rounds. Please try again later.");
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRounds();
  }, []);

  if (isLoading) {
    return <p>Loading rounds...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles["container"]}>
      <h2>Competitions</h2>
      <div className={styles["filtersContainer"]}>
        <div></div>
        <TextInput
          state={name}
          setState={setName}
          placeholder={`Search`}
          error={error}
        />
        <SelectInput
          state={round}
          setState={setRound}
          placeholder="All Rounds"
          options={allRounds}
          optional={true}
        />
        <SelectInput
          state={orderBy}
          setState={setOrderBy}
          options={[
            { id: 2, value: "Latest first" },
            { id: 1, value: "Oldest first" },
          ]}
          optional={false}
        />
        <div className={styles["dateContainer"]}>
          <div>
            <p>Start Date:</p>
            <DateInput
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <p>End Date:</p>
            <DateInput
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

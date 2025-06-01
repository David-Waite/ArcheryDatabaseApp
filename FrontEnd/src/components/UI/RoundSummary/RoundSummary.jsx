import { useEffect, useState } from "react";
import styles from "./RoundSummary.module.css";

export default function NewRoundSummary({ roundShotID }) {
  const [roundShotSummary, setRoundShotSummary] = useState(null);
  const [roundDetails, setRoundDetails] = useState(null);
  const [shotByShot, setShotByShot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDate(roundShotID);
  }, [roundShotID]);

  if (!roundShotID) {
    return;
  }
  async function loadDate(id) {
    const roundShotSummaryRes = await fetchRoundShotSummary(id);

    const roundDetailsRes = await fetchRoundDetails(
      roundShotSummaryRes.roundID
    );

    const shotByShotRes = await fetchScoresheetData(id);

    setRoundShotSummary(roundShotSummaryRes);
    setRoundDetails(roundDetailsRes);

    setShotByShot(shotByShotRes);
    setLoading(false);
  }

  const fetchRoundShotSummary = async (roundShotId) => {
    if (!roundShotId) {
      console.error("No roundShotId provided.");
      return;
    }

    try {
      const response = await fetch(`/api/roundshots/${roundShotId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server responded with ${response.status}`
        );
      }

      const summaryData = await response.json();

      return summaryData;
    } catch (error) {
      console.error("Failed to fetch round shot summary:", error);
    }
  };

  const fetchScoresheetData = async (roundShotId) => {
    if (!roundShotId) {
      console.error("No roundShotId provided.");
      return;
    }

    try {
      const response = await fetch(`/api/roundshots/${roundShotId}/ends`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || `Server responded with ${response.status}`
        );
      }

      const endsData = await response.json();
      console.log("Fetched scoresheet data:", endsData);
      return endsData;
    } catch (error) {
      console.error("Failed to fetch scoresheet data:", error);
      // Set an error state to display a message to the user
      // setErrorMessage(error.message);
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
      console.log(roundDetails);
      return roundDetails;
    } catch (error) {
      console.error("Error fetching round details:", error);
    }
  };

  function formatTimestampLocal(isoTimestamp) {
    const date = new Date(isoTimestamp);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedHours = hours < 10 ? "0" + hours : hours;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedDay = day < 10 ? "0" + day : day;
    const formattedMonth = month < 10 ? "0" + month : month;

    return `${formattedHours}:${formattedMinutes} ${ampm} ${formattedDay}/${formattedMonth}/${year}`;
  }

  if (loading) {
    return <div>loading</div>;
  }

  return (
    <div className={styles["container"]}>
      <h1>Round Summary</h1>
      <h2>
        Name: {`${roundShotSummary.firstName} ${roundShotSummary.lastName}`}
      </h2>

      <h2>Category: {roundShotSummary.categoryName}</h2>

      <h2>Round: {roundShotSummary.roundName}</h2>

      <h2>
        Competition:
        {` ${roundShotSummary.competitionName} `}
        {`${
          roundShotSummary.championshipYear &&
          "| " + roundShotSummary.championshipYear + " Championship "
        }`}
      </h2>

      <h2>Date: {formatTimestampLocal(roundShotSummary.dateTime)}</h2>

      <h2>{`Total score: ${roundShotSummary.totalScore}`}</h2>

      <h2>{`Status: ${roundShotSummary.status}`}</h2>

      <h3>Shot by Shot</h3>
      <div>
        {roundDetails.map((range, index) => {
          let ends = [];
          let rangeTotal = 0;

          for (let i = 0; i < range.Number_Of_6_Arrow_Ends_At_This_Range; i++) {
            const endTotal =
              shotByShot[i + index * 6]?.score1 +
              shotByShot[i + index * 6]?.score2 +
              shotByShot[i + index * 6]?.score3 +
              shotByShot[i + index * 6]?.score4 +
              shotByShot[i + index * 6]?.score5 +
              shotByShot[i + index * 6]?.score6;
            rangeTotal += endTotal;

            const arrows = [
              <tr key={`${index}${i}`}>
                <td>#{i + 1 + index * 6}</td>
                <td>{shotByShot[i + index * 6]?.score1}</td>
                <td>{shotByShot[i + index * 6]?.score2}</td>
                <td>{shotByShot[i + index * 6]?.score3}</td>
                <td>{shotByShot[i + index * 6]?.score4}</td>
                <td>{shotByShot[i + index * 6]?.score5}</td>
                <td>{shotByShot[i + index * 6]?.score6}</td>
                <td>{endTotal}</td>
              </tr>,
            ];

            ends.push(arrows);
          }

          return (
            <div key={range.Position_In_Round}>
              <h4>
                Distance: {range.Distance} | Target Face Size:{" "}
                {range.Target_Face_Size}
              </h4>
              <table>
                <thead>
                  <tr>
                    <td>End</td>
                    <td>Arrow 1</td>
                    <td>Arrow 2</td>
                    <td>Arrow 3</td>
                    <td>Arrow 4</td>
                    <td>Arrow 5</td>
                    <td>Arrow 6</td>
                    <td>End Total</td>
                  </tr>
                </thead>
                <tbody>{ends}</tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan="7">
                      Range total
                    </th>
                    <td>{rangeTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

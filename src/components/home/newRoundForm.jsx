import { useState, useEffect } from "react";
import SelectInput from "../UI/SelectInput/SelectInput";
import FormContainer from "../UI/FormContainer/FormContainer";

export default function NewRoundForm({ archerId }) {
  const [competition, setCompetition] = useState("");
  const [bowType, setBowType] = useState("");
  const [shootingClass, setShootingClass] = useState("");
  const [round, setRound] = useState("");
  const [allEquipment, setAllEquipment] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allCurrentCompetitions, setAllCurrentCompetitions] = useState([]);
  const [allRounds, setAllRounds] = useState([]);
  const [competitionRounds, setCompetitionRounds] = useState([]);
  const [category, setCategory] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllFormData = async () => {
      if (!archerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const defaultClassResponse = await fetch(
          `/api/class/${archerId}/class`
        );
        if (!defaultClassResponse.ok) {
          throw new Error("Failed to fetch default class");
        }
        const defaultClassData = await defaultClassResponse.json();

        let defaultClass = null;
        if (defaultClassData.length > 0) {
          defaultClass = {
            id: defaultClassData[0].classID,
            value: defaultClassData[0].determinedClassName,
          };
          setShootingClass(defaultClass);
        }

        if (!defaultClass) {
          throw new Error(
            "Could not determine a default class for this archer."
          );
        }

        const [
          possibleClassesResponse,
          defaultEquipmentResponse,
          allEquipmentResponse,
          currentCompetitionsResponse,
          allRoundsResponse,
        ] = await Promise.all([
          fetch(`/api/archers/${defaultClass.id}/possibleclass`),
          fetch(`/api/archers/${archerId}/equipment`),
          fetch("/api/allEquipment"),
          fetch("/api/currentCompetitions"),
          fetch("/api/allRounds"),
        ]);

        if (!possibleClassesResponse.ok)
          throw new Error("Failed to fetch possible classes");
        if (!defaultEquipmentResponse.ok)
          throw new Error("Failed to fetch default equipment");
        if (!allEquipmentResponse.ok)
          throw new Error("Failed to fetch all equipment");
        if (!currentCompetitionsResponse.ok)
          throw new Error("Failed to fetch current Competitions");
        if (!allRoundsResponse.ok)
          throw new Error("Failed to fetch all rounds");

        const possibleClassesData = await possibleClassesResponse.json();
        const defaultEquipmentData = await defaultEquipmentResponse.json();
        const allEquipmentData = await allEquipmentResponse.json();
        const currentCompetitionsData =
          await currentCompetitionsResponse.json();
        const allRoundsData = await allRoundsResponse.json();

        const allClassArray = possibleClassesData.map((item) => ({
          id: item.class_ID,
          value: item.class_Name,
        }));
        setAllClasses(allClassArray);

        if (defaultEquipmentData.length > 0) {
          setBowType({
            id: defaultEquipmentData[0].defaultEquipmentID,
            value: defaultEquipmentData[0].defaultEquipmentName,
          });
        }

        const allEquipmentArray = allEquipmentData.map((item) => ({
          id: item.ID,
          value: item.type,
        }));
        setAllEquipment(allEquipmentArray);

        const currentCompetitionsArray = currentCompetitionsData.map(
          (item) => ({
            id: item.competition,
            value: item.competitionName,
          })
        );
        setAllCurrentCompetitions(currentCompetitionsArray);

        const allRoundsArray = allRoundsData.map((item) => ({
          id: item.ID,
          value: item.name,
        }));

        setAllRounds(allRoundsArray);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFormData();
  }, [archerId]);

  // get categoy when class and bow are selected
  useEffect(() => {
    if (!shootingClass || !bowType) {
      setCategory("");
      return;
    }
    fetch(`/api/category?equipmentId=${bowType.id}&classId=${shootingClass.id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((category) => {
        setCategory({
          id: category[0].categoryID,
          value: category[0].categoryName,
        });
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [shootingClass, bowType]);

  // get new possible rounds when competition and class are selected

  useEffect(() => {
    if (!category.id || !competition) {
      console.log("setting to null");

      setCompetitionRounds(null);

      return;
    }

    const fetchCompetitionRoundData = async () => {
      setIsLoading(true);

      try {
        const [defaultRoundsResponse, competitionRoundsResponse] =
          await Promise.all([
            fetch(
              `/api/defaultCompetitionRounds?competitionId=${competition.id}&categoryId=${category.id}`
            ),
            fetch(
              `/api/competitionRounds?competitionId=${competition.id}&categoryId=${category.id}`
            ),
          ]);

        if (!defaultRoundsResponse.ok) {
          throw new Error(
            `Failed to fetch default rounds: Server responded with ${defaultRoundsResponse.status}`
          );
        }
        if (!competitionRoundsResponse.ok) {
          throw new Error(
            `Failed to fetch competition rounds: Server responded with ${competitionRoundsResponse.status}`
          );
        }

        const [defaultRoundData, allRoundsData] = await Promise.all([
          defaultRoundsResponse.json(),
          competitionRoundsResponse.json(),
        ]);

        if (defaultRoundData && defaultRoundData.length > 0) {
          setRound({
            id: defaultRoundData[0].finalRoundID,
            value: defaultRoundData[0].finalRoundName,
          });
        }

        const allCompetitionRounds = allRoundsData.map((item) => ({
          id: item.round_ID,
          value: item.round_Name,
          extra: item.round_Type_Description,
        }));
        setCompetitionRounds(allCompetitionRounds);
      } catch (error) {
        console.error("Error fetching round data:", error);
      } finally {
        setIsLoading(false); // Set loading to false
      }
    };

    fetchCompetitionRoundData();
  }, [category.id, competition]); // Dependencies are correct

  return (
    <>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <FormContainer
          header={<h2>New Round Details </h2>}
          main={
            <>
              <SelectInput
                state={competition}
                setState={setCompetition}
                placeholder={"No Competition"}
                optional={true}
                options={allCurrentCompetitions}
              />
              <SelectInput
                state={round}
                setState={setRound}
                placeholder={"Round"}
                optional={false}
                options={competitionRounds ? competitionRounds : allRounds}
              />
              <SelectInput
                state={bowType}
                setState={setBowType}
                options={allEquipment}
              />
              <SelectInput
                state={shootingClass}
                setState={setShootingClass}
                options={allClasses}
              />
            </>
          }
          bottom={
            <div>
              <p>You will be shooting under {category.value}</p>
              <button>Start new round</button>
            </div>
          }
        ></FormContainer>
      )}
    </>
  );
}

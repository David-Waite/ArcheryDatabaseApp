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

  const [isLoading, setIsLoading] = useState(true);

  const competitionDUMMY = [
    { id: 1, value: "comp1" },
    { id: 2, value: "comp2" },
  ];

  const roundDummy = [
    { id: 1, value: "WA70/1440" },
    { id: 2, value: "WA90/1440" },
  ];

  // In your NewRoundForm.jsx component

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
        ] = await Promise.all([
          fetch(`/api/archers/${defaultClass.id}/possibleclass`),

          fetch(`/api/archers/${archerId}/equipment`),
          fetch("/api/allEquipment"),
        ]);

        if (!possibleClassesResponse.ok)
          throw new Error("Failed to fetch possible classes");
        if (!defaultEquipmentResponse.ok)
          throw new Error("Failed to fetch default equipment");
        if (!allEquipmentResponse.ok)
          throw new Error("Failed to fetch all equipment");

        const possibleClassesData = await possibleClassesResponse.json();
        const defaultEquipmentData = await defaultEquipmentResponse.json();
        const allEquipmentData = await allEquipmentResponse.json();

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
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFormData();
  }, [archerId]);

  return (
    <>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <FormContainer
          header={<h2>New Round Details</h2>}
          main={
            <>
              <SelectInput
                state={competition}
                setState={setCompetition}
                defaultValue={"Competition"}
                options={competitionDUMMY}
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
              <SelectInput
                state={round}
                setState={setRound}
                defaultValue={"Round"}
                options={roundDummy}
              />
            </>
          }
          bottom={
            <div>
              {bowType.value}
              <p>You will be shooting under category</p>
              <button>Start new round</button>
            </div>
          }
        ></FormContainer>
      )}
    </>
  );
}

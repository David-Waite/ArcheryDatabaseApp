import { useState } from "react";
import SelectInput from "../UI/SelectInput/SelectInput";
import FormContainer from "../UI/FormContainer/FormContainer";
import TextInput from "../UI/TextInput/TextInput";
export default function NewRoundForm() {
  const [competition, setCompetition] = useState("");
  const [bowType, setBowType] = useState("");
  const [shootingClass, setShootingClass] = useState("");
  const [round, setRound] = useState("");

  const competitionDUMMY = [
    { id: 1, value: "comp1" },
    { id: 2, value: "comp2" },
  ];

  const bowDUMMY = [
    { id: 1, value: "Recurve" },
    { id: 2, value: "bow2" },
  ];

  const shootingClassDUMMY = [
    { id: 1, value: "Open Female" },
    { id: 2, value: "50+ Female" },
  ];

  const roundDummy = [
    { id: 1, value: "WA70/1440" },
    { id: 2, value: "WA90/1440" },
  ];

  return (
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
            defaultValue={"Bow"}
            options={bowDUMMY}
          />
          <SelectInput
            state={shootingClass}
            setState={setShootingClass}
            defaultValue={"Class"}
            options={shootingClassDUMMY}
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
          <p>You will be shooting under category</p>
          <button>Start new round</button>
        </div>
      }
    ></FormContainer>
  );
}

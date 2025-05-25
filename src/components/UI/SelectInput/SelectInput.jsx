// src/UI/SelectInput/SelectInput.jsx

import styles from "./SelectInput.module.css";
import { FaChevronDown } from "react-icons/fa";

export default function SelectInput({
  state,
  setState,
  defaultValue,
  options,
}) {
  const handleChange = (e) => {
    const selectedId = e.target.value;
    const selectedOption = options.find(
      (option) => option.id.toString() === selectedId
    );
    setState(selectedOption);
  };

  const availableOptions = Array.isArray(options) ? options : [];

  return (
    <div className={styles["wrapper"]}>
      <select
        className={`${styles["container"]} ${!state && styles["disabled"]}`}
        value={state ? state.id : ""}
        onChange={handleChange}
      >
        {defaultValue && (
          <option value="" disabled>
            {defaultValue}
          </option>
        )}

        {availableOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.value}
          </option>
        ))}
      </select>
      <FaChevronDown className={styles["dropdownBtn"]} />
    </div>
  );
}

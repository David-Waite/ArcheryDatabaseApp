// src/UI/SelectInput/SelectInput.jsx

import styles from "./SelectInput.module.css";
import { FaChevronDown } from "react-icons/fa";

export default function SelectInput({
  state,
  setState,

  options,
  optional,
  placeholder,
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
        {placeholder && !optional && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {placeholder && optional && <option value="">{placeholder}</option>}

        {availableOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option?.extra}
            {option?.extra && " Round:"} {option.value}
          </option>
        ))}
      </select>
      <FaChevronDown className={styles["dropdownBtn"]} />
    </div>
  );
}

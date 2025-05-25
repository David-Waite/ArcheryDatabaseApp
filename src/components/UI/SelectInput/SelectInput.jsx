import styles from "./SelectInput.module.css";
import { FaChevronDown } from "react-icons/fa";
export default function SelectInput({
  state,
  setState,
  defaultValue,
  options,
}) {
  return (
    <div className={styles["wrapper"]}>
      <select
        className={`${styles["container"]} ${
          state === "" && styles["disabled"]
        }`}
        value={state}
        onChange={(e) => setState(e.target.value)}
      >
        <option value="" disabled>
          {defaultValue}
        </option>
        {options.map((option) => {
          return (
            <option key={option.id} value={option.value}>
              {option.value}
            </option>
          );
        })}
      </select>
      <FaChevronDown className={styles["dropdownBtn"]} />
    </div>
  );
}

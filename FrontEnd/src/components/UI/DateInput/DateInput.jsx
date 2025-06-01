import styles from "./DateInput.module.css";

const DateInput = ({ value, onChange, required = false }) => {
  return (
    <div className={styles["container"]}>
      <input
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        className={styles["Input"]}
      />
    </div>
  );
};

export default DateInput;

import styles from "./TextInput.module.css";

export default function TextInput({
  arrowID,
  state,
  setState,
  placeholder,
  error,
  arrow,
}) {
  return (
    <div className="container">
      {error && <p className={styles["error"]}>{error}</p>}

      <input
        type="text"
        className={`${styles["input"]} ${error && styles["inputError"]}`}
        value={state}
        placeholder={placeholder}
        onChange={
          arrow
            ? (e) => setState(arrowID, e.target.value)
            : (e) => setState(e.target.value)
        }
      ></input>
    </div>
  );
}

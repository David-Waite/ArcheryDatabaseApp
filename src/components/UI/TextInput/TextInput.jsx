import styles from "./TextInput.module.css";

export default function TextInput({ state, setState, defaultValue, error }) {
  return (
    <div className="container">
      {error && <p className={styles["error"]}>{error}</p>}

      <input
        type="text"
        className={`${styles["input"]} ${error && styles["inputError"]}`}
        value={state}
        placeholder={defaultValue}
        onChange={(e) => setState(e.target.value)}
      ></input>
    </div>
  );
}

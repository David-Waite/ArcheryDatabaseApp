import styles from "./FormContainer.module.css";

export default function FormContainer({ header, main, bottom }) {
  return (
    <div className={styles["container"]}>
      <div className={styles["header"]}>{header}</div>
      <div className={styles["main"]}>{main}</div>
      <div className={styles["bottom"]}>{bottom}</div>
    </div>
  );
}

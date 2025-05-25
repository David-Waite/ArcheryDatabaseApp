import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/LoginPage.module.css";
function LoginPage() {
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedValue = inputValue.trim();

    if (trimmedValue.toLowerCase() === "admin") {
      navigate("/admin");
    } else if (!isNaN(Number(trimmedValue)) && trimmedValue !== "") {
      const id = Number(trimmedValue);
      if (id >= 1 && id <= 500) {
        navigate(`/archer/${inputValue}`);
      } else {
        alert("ArcheryID must be a number between 1 and 500.");
      }
    } else {
      alert("Invalid input. Please enter 'admin' or an ArcherID (1-500).");
    }
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-form-container"]}>
        <form className={styles["login-form"]} onSubmit={handleSubmit}>
          {/* I've added a class to the label from the CSS Module */}
          <label htmlFor="login-input" className={styles["login-label"]}>
            Username
          </label>
          <input
            className={styles["login-input"]}
            id="login-input"
            type="text"
            placeholder="ArcheryID (1-500) or “admin”"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className={styles["login-btn"]}>
            Login
          </button>
        </form>
      </div>
      <div className={styles["login-message-container"]}>
        <div>
          <h1 className={styles["message-title"]}>Archery by David</h1>
          <div>
            <h2 className={styles["message-subtitle"]}>Welcome back!</h2>
            <p className={styles["message-text"]}>
              Enter your archery ID to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

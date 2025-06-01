import styles from "./HomeTemplate.module.css";
import { useNavigate } from "react-router-dom";
function OverViewCard({ mainStat, desc }) {
  return (
    <div className={styles["OverViewCardContainer"]}>
      <h2>{mainStat}</h2>
      <p>{desc}</p>
    </div>
  );
}

export default function HomeTemplate({
  profile,
  overViewCards,
  sideNav,
  mainContent,
  selectedSideNav,
  handleSelectSideNav,
  goBack,
}) {
  const navigate = useNavigate();
  function handleLogout() {
    navigate(`/`);
  }

  return (
    <div className={styles["container"]}>
      <nav className={styles["nav"]}>
        <h1>Archery by David</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <section className={styles["topOverView"]}>
        <div className={styles["leftTopOverView"]}>
          <div className={styles["archerProfile"]}>
            <div>{profile}</div>
          </div>
        </div>
        <div className={styles["mainTopOverView"]}>
          <OverViewCard
            mainStat={overViewCards.cardOne.mainStat}
            desc={overViewCards.cardOne.desc}
          />
          <OverViewCard
            mainStat={overViewCards.cardTwo.mainStat}
            desc={overViewCards.cardTwo.desc}
          />
          <OverViewCard
            mainStat={overViewCards.cardThree.mainStat}
            desc={overViewCards.cardThree.desc}
          />
        </div>
      </section>
      <section className={styles["mainContent"]}>
        <div className={styles["leftMainNav"]}>
          {sideNav.map((item) => {
            return (
              <div
                className={`${styles["sideNavComponentContainer"]} ${
                  item.id === selectedSideNav && styles["sideNavSelected"]
                }
  `}
                onClick={() => handleSelectSideNav(item.id)}
                key={item.desc}
              >
                {item.icon}
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
        <div className={styles["middleMainContent"]}>
          <button className={styles["goBackBtn"]} onClick={goBack}>
            Back
          </button>
          {mainContent}
        </div>
      </section>
    </div>
  );
}

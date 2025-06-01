// my-project-backend/server.js
const express = require("express");
const mysql = require("mysql2");
// const cors = require('cors'); // You can comment this out or remove it

const app = express();
// app.use(cors()); // Not needed if using Vite proxy
app.use(express.json());

// --- Database connection code remains the same ---
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "archery database",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// get all equipment

app.get("/api/allEquipment", (req, res) => {
  const sql = "SELECT * FROM equipment";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

app.get("/api/archers/:archerId", (req, res) => {
  const archerId = req.params.archerId;
  const sql = "SELECT * FROM archer WHERE ID = ?";

  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No archer found with ID ${archerId}` });
    }
    return res.json(data);
  });
});

// 1.number of approved round shots for a given archer
app.get("/api/archers/:archerId/stats/total-roundshots", (req, res) => {
  const { archerId } = req.params;
  const sql = `
    SELECT
      COUNT(*) AS totalRoundShots
    FROM
      \`roundshot\`
    WHERE
      archerID = ?
  `;
  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error (total roundshots):", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    res.json(data[0]);
  });
});

app.get("/api/archers/:archerId/stats/most-frequent-round", (req, res) => {
  const { archerId } = req.params;
  const sql = `
    SELECT
      r.name AS mostFrequentRoundName,
      COUNT(rs.roundID) AS frequency
    FROM
      \`roundshot\` rs
    JOIN
      \`round\` r ON rs.roundID = r.ID
    WHERE
      rs.archerID = ?
    GROUP BY
      rs.roundID, r.name
    ORDER BY
      frequency DESC
    LIMIT 1;
  `;
  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error (most frequent round):", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    res.json(
      data.length > 0 ? data[0] : { mostFrequentRoundName: null, frequency: 0 }
    );
  });
});

app.get("/api/archers/:archerId/stats/roundshots-this-year", (req, res) => {
  const { archerId } = req.params;
  const sql = `
    SELECT
      COUNT(*) AS roundShotsThisYear
    FROM
      \`roundshot\`
    WHERE
      archerID = ?
      AND YEAR(dateTime) = YEAR(CURDATE());
  `;
  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error (roundshots this year):", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    res.json(data[0]);
  });
});

// get default equipment

app.get("/api/archers/:archerId/equipment", (req, res) => {
  const archerId = req.params.archerId;

  const sql = `
    SELECT
      a.defaultEquipmentID,
      eq.type AS defaultEquipmentName
    FROM
      archer a
    JOIN
      equipment eq ON a.defaultEquipmentID = eq.ID
    WHERE
      a.ID = ?;`;

  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No archer found with ID ${archerId}` });
    }
    return res.json(data);
  });
});

// get default class
app.get("/api/class/:archerId/class", (req, res) => {
  const archerId = req.params.archerId;

  const sql = `
    WITH ArcherAgeInfo AS (
    SELECT
        a.ID AS archerID,
        a.firstName,
        a.lastName,
        a.Gender,
        (YEAR(CURDATE()) - a.birthYear) AS calculatedAge, 
        CASE
            WHEN (YEAR(CURDATE()) - a.birthYear) < 14 THEN 'Under 14'
            WHEN (YEAR(CURDATE()) - a.birthYear) < 16 THEN 'Under 16' -- Ages 14-15
            WHEN (YEAR(CURDATE()) - a.birthYear) < 18 THEN 'Under 18' -- Ages 16-17
            WHEN (YEAR(CURDATE()) - a.birthYear) < 21 THEN 'Under 21' -- Ages 18-20
            WHEN (YEAR(CURDATE()) - a.birthYear) >= 70 THEN '70+'
            WHEN (YEAR(CURDATE()) - a.birthYear) >= 60 THEN '60+'     -- Ages 60-69
            WHEN (YEAR(CURDATE()) - a.birthYear) >= 50 THEN '50+'     -- Ages 50-59
            ELSE 'Open'  -- 21-49
        END AS calculatedAgeGroup
    FROM
        archer a
    WHERE
        a.ID = ?
)
SELECT
    c.ID AS classID,
    CONCAT(aai.Gender, ' ', aai.calculatedAgeGroup) AS determinedClassName 
FROM
    ArcherAgeInfo aai
JOIN
    class c ON aai.Gender = c.gender AND aai.calculatedAgeGroup = c.ageGroup;
    `;

  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No archer found with ID ${archerId}` });
    }
    return res.json(data);
  });
});

// get possible classes
app.get("/api/archers/:archerId/possibleclass", (req, res) => {
  const archerId = req.params.archerId;

  const sql = `
        SELECT
            c1.ID AS class_ID,
            CONCAT(c1.gender, ' ', c1.ageGroup) AS class_Name
        FROM
            class c1
        WHERE
            c1.ID = ?

        UNION 

        SELECT
            c2.ID AS class_ID,
            CONCAT(c2.gender, ' ', c2.ageGroup) AS class_Name
        FROM
            class c2
        WHERE
            c2.ageGroup = 'Open'
            AND c2.gender = (SELECT cl.gender FROM class cl WHERE cl.ID = ?); 
    `;

  db.query(sql, [archerId, archerId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No archer found with ID ${archerId}` });
    }
    return res.json(data);
  });
});

// get current competitions

app.get("/api/currentCompetitions", (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  const sql = `
  SELECT
    ID AS competition,  
    name AS competitionName
  FROM
    competition
  WHERE
    date = "${formattedDate}"`;

  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// get all rounds

app.get("/api/allRounds", (req, res) => {
  const sql = "SELECT * FROM round ORDER BY ID;";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });
});

// get shooting category

app.get("/api/category", (req, res) => {
  const { equipmentId, classId } = req.query;
  if (!equipmentId || !classId) {
    return res.status(400).json({
      error: "Both equipmentId and classId are required query parameters.",
    });
  }

  const sql = `
    SELECT
      ID AS categoryID,
      name AS categoryName
    FROM
      category
    WHERE
      equipmentID = ? AND classID = ?;
  `;

  db.query(sql, [equipmentId, classId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    return res.json(data);
  });
});

// get default (easy) round for competition

app.get("/api/defaultCompetitionRounds", (req, res) => {
  const { competitionId, categoryId } = req.query;

  if (!competitionId || !categoryId) {
    return res
      .status(400)
      .json({ error: "Both competitionId and categoryId are required." });
  }

  const sql = `
    SELECT
      COALESCE(eq_round.ID, main_r.ID) AS finalRoundID,
      COALESCE(eq_round.name, main_r.name) AS finalRoundName
    FROM
      competition c
    JOIN
      round main_r ON c.roundID = main_r.ID
    LEFT JOIN
      equivalentrounds er ON c.roundID = er.baseRoundID
        AND er.equivalentCategoryID = ?
        AND CURDATE() >= er.startDate
        AND (er.endDate IS NULL OR CURDATE() <= er.endDate)
    LEFT JOIN
      round eq_round ON er.equivalentRoundID = eq_round.ID
    WHERE
      c.ID = ?; 
  `;

  db.query(sql, [categoryId, competitionId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    return res.json(data);
  });
});

// get all rounds for competition
app.get("/api/competitionRounds", (req, res) => {
  const { competitionId, categoryId } = req.query;

  if (!competitionId || !categoryId) {
    return res
      .status(400)
      .json({ error: "Both competitionId and categoryId are required." });
  }

  const sql = `
    SELECT
      main_r.ID AS round_ID,
      main_r.name AS round_Name,
      'Main' AS round_Type_Description
    FROM
      competition c
    JOIN
      round main_r ON c.roundID = main_r.ID
    WHERE
      c.ID = ?  -- First placeholder: competitionId

    UNION ALL

    SELECT
      eq_r.ID AS round_ID,
      eq_r.name AS round_Name,
      'Equivalent' AS round_Type_Description
    FROM
      competition c
    JOIN
      equivalentrounds er ON c.roundID = er.baseRoundID
    JOIN
      round eq_r ON er.equivalentRoundID = eq_r.ID
    WHERE
      c.ID = ?                     -- Second placeholder: competitionId
      AND er.equivalentCategoryID = ?  -- Third placeholder: categoryId
      AND CURDATE() >= er.startDate
      AND (er.endDate IS NULL OR CURDATE() <= er.endDate)
      AND er.equivalentRoundID <> c.roundID;
  `;

  db.query(sql, [competitionId, competitionId, categoryId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    return res.json(data);
  });
});

// add new roundShot

app.post("/api/roundshots", (req, res) => {
  const {
    archerID,
    competitionID,
    equipmentID,
    categoryID,
    dateTime,
    roundID,
  } = req.body;

  if (!archerID || !equipmentID || !categoryID || !dateTime || !roundID) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO roundshot (
      archerID,
      competitionID,
      equipmentID,
      categoryID,
      dateTime,
      status,
      roundID
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    archerID,
    competitionID,
    equipmentID,
    categoryID,
    dateTime,
    "Pending",
    roundID,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database INSERT error:", err);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.status(201).json({
      message: "Round shot created successfully",
      newRecordId: result.insertId,
    });
  });
});

// round details

app.get("/api/rounds/:roundId/details", (req, res) => {
  const { roundId } = req.params;

  const sql = `
    SELECT
      rnd.name AS Round_Name,
      rr.rangePosition AS Position_In_Round,
      rg.distance AS Distance,
      rg.faceSize AS Target_Face_Size,
      rg.ends AS Number_Of_6_Arrow_Ends_At_This_Range
    FROM
      \`round\` AS rnd
    JOIN
      \`roundrange\` AS rr ON rnd.ID = rr.roundID
    JOIN
      \`range\` AS rg ON rr.rangeID = rg.ID -- <-- THE FIX IS HERE
    WHERE
      rnd.id = ?
    ORDER BY
      rr.rangePosition ASC;
  `;

  db.query(sql, [roundId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No details found for round with ID ${roundId}` });
    }
    return res.json(data);
  });
});

// new end
app.post("/api/ends", (req, res) => {
  const {
    roundShotID,
    endPosition,
    score1,
    score2,
    score3,
    score4,
    score5,
    score6,
  } = req.body;

  if (
    roundShotID === undefined ||
    endPosition === undefined ||
    score1 === undefined ||
    score2 === undefined ||
    score3 === undefined ||
    score4 === undefined ||
    score5 === undefined ||
    score6 === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields for the end." });
  }

  const sql = `
    INSERT INTO \`end\` (
      roundShotID,
      endPosition,
      score1,
      score2,
      score3,
      score4,
      score5,
      score6
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    roundShotID,
    endPosition,
    score1,
    score2,
    score3,
    score4,
    score5,
    score6,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database INSERT error (end):", err);
      return res
        .status(500)
        .json({ error: "Database error inserting end", details: err.message });
    }
    res.status(201).json({
      message: "End created successfully",
      newEndId: result.insertId,
    });
  });
});

// get round summary

app.get("/api/roundshots/:roundShotId", (req, res) => {
  const { roundShotId } = req.params;

  const sql = `
    SELECT
      a.firstName,
      a.lastName,
      c.ID AS competitionID,
      c.name AS competitionName,
      ch.ID AS championshipID,  
      ch.Year AS championshipYear,  
      eq.ID AS equipmentID,
      eq.type AS equipmentName,
      cat.ID AS categoryID,
      cat.name AS categoryName,
      rs.dateTime,
      rs.status,
      r.ID AS roundID,
      r.name AS roundName,
      SUM(e.score1 + e.score2 + e.score3 + e.score4 + e.score5 + e.score6) AS totalScore
    FROM
      \`roundshot\` rs
    JOIN
      \`archer\` a ON rs.archerID = a.ID
    JOIN
      \`equipment\` eq ON rs.equipmentID = eq.ID
    JOIN
      \`category\` cat ON rs.categoryID = cat.ID
    JOIN
      \`round\` r ON rs.roundID = r.ID
    JOIN
      \`end\` e ON rs.ID = e.roundShotID
    LEFT JOIN
      \`competition\` c ON rs.competitionID = c.ID
    LEFT JOIN
    \`championship\` ch ON c.championshipID = ch.ID
    WHERE
      rs.ID = ?
    GROUP BY
      a.firstName,
      a.lastName,
      c.ID,
      c.name,
      ch.ID,   
      ch.Year,
      eq.ID,
      eq.type,
      cat.ID,
      cat.name,
      rs.dateTime,
      rs.status,
      r.ID,
      r.name;
  `;

  db.query(sql, [roundShotId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: `No round shot found with ID ${roundShotId}` });
    }
    return res.json(data[0]);
  });
});

// Get shot by shot
app.get("/api/roundshots/:roundShotId/ends", (req, res) => {
  const { roundShotId } = req.params;

  const sql = `
    SELECT
      e.endPosition AS endPosition,
      round_structure.distance,
      round_structure.faceSize,
      e.score1,
      e.score2,
      e.score3,
      e.score4,
      e.score5,
      e.score6
    FROM
      \`end\` e
    JOIN
      (SELECT
          r_def.distance,
          r_def.faceSize,
          COALESCE(SUM(r_def.ends) OVER (ORDER BY rr.rangePosition ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS overallEndPositionStart,
          COALESCE(SUM(r_def.ends) OVER (ORDER BY rr.rangePosition ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) + r_def.ends - 1 AS overallEndPositionEnd
      FROM
          \`roundrange\` rr
      JOIN
          \`range\` r_def ON rr.rangeID = r_def.ID
      WHERE
          rr.roundID = (SELECT rs.roundID FROM \`roundshot\` rs WHERE rs.ID = ?) -- First placeholder
      ) AS round_structure
      ON e.endPosition >= round_structure.overallEndPositionStart
      AND e.endPosition <= round_structure.overallEndPositionEnd
    WHERE
      e.roundShotID = ? -- Second placeholder
    ORDER BY
      e.endPosition ASC;
  `;

  db.query(sql, [roundShotId, roundShotId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({
        error: "Database query failed",
        details: err.sqlMessage || err.message,
      });
    }
    return res.json(data);
  });
});

// In your my-project-backend/server.js file

// ... (other routes)

// API endpoint to get all approved round scores for a specific archer
// In your my-project-backend/server.js file

// Find your existing "/api/archers/:archerId/scores" endpoint and replace it with this one.

app.get("/api/archers/:archerId/scores", (req, res) => {
  // 1. Extract the archerId from the URL's route parameters (unchanged)
  const { archerId } = req.params;

  // 2. The UPDATED SQL query with the new fields and joins
  const sql = `
    SELECT
      rs.ID AS roundshotID,
      c.name AS competitionName,
      rs.competitionID,
      cat.name AS categoryName,
      rs.dateTime AS date,
      r.name AS roundName,
      rs.status AS status,
      SUM(e.score1 + e.score2 + e.score3 + e.score4 + e.score5 + e.score6) AS totalScore
    FROM
      \`roundshot\` rs
    JOIN
      \`round\` r ON rs.roundID = r.ID
    JOIN
      \`end\` e ON rs.ID = e.roundShotID
    JOIN
      \`category\` cat ON rs.categoryID = cat.ID
    LEFT JOIN
      \`competition\` c ON rs.competitionID = c.ID
    WHERE
      rs.archerID = ?
    GROUP BY
      rs.ID,
      c.name,
      rs.competitionID,
      cat.name,
      rs.dateTime,
      r.name
    ORDER BY
      rs.dateTime DESC;
  `;

  // 3. Execute the query (unchanged)
  db.query(sql, [archerId], (err, data) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }
    return res.json(data);
  });
});

// ... (your app.listen code)

// ... (your app.listen code)

const port = 5000;
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

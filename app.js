const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//api 1
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray);
});

// API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
       cricket_team (player_Name, jersey_Number, role)
    VALUES
      (
         ${playerName},
         ${jerseyNumber},
         ${role}        
      );`;

  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send({ player_id: playerId });
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuary = `
select * from cricket_team where player_id= ${playerId};`;
  let playerresult = await db.get(playerQuary);
  response.send(playerresult);
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuary = ` update cricket_team set 
  player_Name = ${playerName}, 
  jersey_Number = ${jerseyNumber}, 
  role = ${role}
  where player_id = ${playerId};`;
  await db.run(updatePlayerQuary);
  response.send("Book Updated Successfully");
});

// API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletPlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletPlayerQuery);
  response.send("Book Deleted Successfully");
});

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

// convert database object to respose object

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

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
  const aftermodify = playerArray.map((playerarray) => {
    return convertDbObjectToResponseObject(playerarray);
  });
  response.send(aftermodify);
});

//Post Player API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
        '${role}'         
      );`;

  const dbResponse = await db.run(addPlayerQuery);
  //const playerID = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuary = `
select * from cricket_team where player_id= ${playerId};`;
  let playerresult = await db.get(playerQuary);

  const aftermodify = convertDbObjectToResponseObject(playerresult);

  response.send(aftermodify);
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuary = ` update cricket_team set 
  player_Name = '${playerName}', 
  jersey_Number = ${jerseyNumber}, 
  role = '${role}'
  where player_id = ${playerId};`;
  await db.run(updatePlayerQuary);
  response.send("Player Details Updated");
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
  response.send("Player Removed");
});

module.exports = initializeDBAndServer;

const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dataBasePath = path.join(__dirname, "covid19India.db");

let dataBase = null;

const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000);
  } catch (e) {
    console.log(`Database Error: ${e.message}`);
  }
};

initializeDBAndServer();

app.get("/states/", async (request, response) => {
  const setQuery = "SELECT * FROM state";
  const responseData = await dataBase.all(setQuery);
  response.send(
    responseData.map((eachObj) => ({
      stateId: eachObj.state_id,
      stateName: eachObj.state_name,
      population: eachObj.population,
    }))
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const setQuery = `SELECT * FROM state WHERE state_id = ${stateId}`;
  const responseData = await dataBase.get(setQuery);
  response.send({
    stateId: responseData.state_id,
    stateName: responseData.state_name,
    population: responseData.population,
  });
});

app.post("/districts/", async (request, response) => {
  const responseBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = responseBody;
  const setQuery = `INSERT INTO district
  (district_name, state_id, cases, cured, active, deaths)
  VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await dataBase.run(setQuery);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const setQuery = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const responseData = await dataBase.get(setQuery);
  response.send({
    districtId: responseData.district_id,
    districtName: responseData.district_id,
    stateId: responseData.state_id,
    cases: responseData.cases,
    cured: responseData.cured,
    active: responseData.active,
    deaths: responseData.deaths,
  });
});

module.exports = app;

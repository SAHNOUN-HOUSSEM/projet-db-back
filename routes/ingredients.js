const express = require("express");
const oracledb = require("oracledb");

const router = express.Router();

/*
this the ingredient create table

CREATE TABLE ingredient (
ID_ing NUMBER(8) CONSTRAINT PK_ingredient PRIMARY KEY,
nom_ing VARCHAR2 (50) CONSTRAINT NN_nom_ing NOT NULL,
typee VARCHAR2(80),
quantite NUMBER(8)
);
use this as a reference for the routes
*/

router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM hr.ingredient");
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { nom_ing, typee, quantite } = req.body;
    const connection = await oracledb.getConnection();
    //fetch the database to get the last id
    const IdResult = await connection.execute(
      "SELECT MAX(ID_ing) FROM hr.ingredient"
    );
    //get the last id and increment it by one
    const id = IdResult.rows[0][0] + 1;
    const result = await connection.execute(
      "INSERT INTO hr.ingredient (ID_ing, nom_ing, typee, quantite) VALUES (:id ,:nom_ing, :typee, :quantite)",
      [id, nom_ing, typee, quantite],
      { autoCommit: true }
    );
    await connection.close();
    //return the created ingredient
    res.json({
      id,
      nom_ing,
      typee,
      quantite,
    });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;

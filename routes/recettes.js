const express = require("express");
const oracledb = require("oracledb");

const router = express.Router();

/*
this the recette create table:
CREATE TABLE recette (
ID_recette NUMBER(8)CONSTRAINT  PK_recette  PRIMARY KEY ,
nom_recette VARCHAR2(50)CONSTRAINT NN_nom_recette NOT NULL,
origine  VARCHAR2(50),
calorie VARCHAR2(50),
ID_ing NUMBER(8),
niveau_difficulte VARCHAR2(50),
temps_de_prep VARCHAR2(2),

CONSTRAINT FK_recette_ingredient FOREIGN KEY (ID_ing)REFERENCES ingredient (ID_ing),
CONSTRAINT CHK_ing CHECK ((niveau_difficulte) IN ('super_easy','easy','medium','Hard','super hard')));

*/

router.get("/", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute("SELECT * FROM hr.recette");
    await connection.close();

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

/*
generate the corresponding routes for this:
--AFFICHER LA RECEETE CORESSPONDANTE AU MIN TEMPS DE PREPARATION 
SELECT nom_recette 
FROM recette
WHERE temps_de_prep =(SELECT MIN(temps_de_prep) AS duree_minimale FROM recette  );
*/
router.get("/min", async (req, res) => {
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      "SELECT nom_recette FROM recette WHERE temps_de_prep =(SELECT MIN(temps_de_prep) AS duree_minimale FROM recette  )"
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get the recette by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      "SELECT r.nom_recette, i.nom_ing, i.typee, i.quantite FROM recette r ,ingredient i WHERE  r.ID_ing = i.ID_ing AND r.ID_recette = :id",
      [id]
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//create a recette
router.post("/", async (req, res) => {
  try {
    const {
      nom_recette,
      origine,
      calorie,
      ID_ing,
      niveau_difficulte,
      temps_de_prep,
    } = req.body;
    const connection = await oracledb.getConnection();
    //fetch the database to get the last id
    const IdResult = await connection.execute(
      "SELECT MAX(ID_recette) FROM hr.recette"
    );
    //get the last id and increment it by one
    const id = IdResult.rows[0][0] + 1;
    const result = await connection.execute(
      "INSERT INTO hr.recette (ID_recette, nom_recette, origine, calorie, ID_ing, niveau_difficulte, temps_de_prep) VALUES (:id ,:nom_recette, :origine, :calorie, :ID_ing, :niveau_difficulte, :temps_de_prep)",
      [
        id,
        nom_recette,
        origine,
        calorie,
        ID_ing,
        niveau_difficulte,
        temps_de_prep,
      ],
      { autoCommit: true }
    );
    await connection.close();
    //return the created recette
    res.json({
      id,
      nom_recette,
      origine,
      calorie,
      ID_ing,
      niveau_difficulte,
      temps_de_prep,
    });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;

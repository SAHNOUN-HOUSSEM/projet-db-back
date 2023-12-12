const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the plat create table:

CREATE TABLE plat (
ID_plat NUMBER(8)CONSTRAINT PK_plat PRIMARY KEY ,
nom_plat VARCHAR(50)  CONSTRAINT NN_nom_plat NOT NULL,
nb_personne NUMBER(2),
prix NUMBER  CONSTRAINT NN_prix NOT NULL,
descriptions VARCHAR2(50)
);
*/

//create a route to get all the plats
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const result = await connection.execute("SELECT * FROM plat");
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
    }
  })
);

//create a route to add a plat
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const { nom_plat, nb_personne, prix, descriptions } = req.body;
      //find the greatest id_plat
      const result1 = await connection.execute("SELECT MAX(ID_plat) FROM plat");
      const id_plat = result1.rows[0][0] + 1;
      const result = await connection.execute(
        "INSERT INTO plat (ID_plat,nom_plat, nb_personne, prix, descriptions) VALUES (:ID_plat,:nom_plat, :nb_personne, :prix, :descriptions)",
        [id_plat, nom_plat, nb_personne, prix, descriptions]
      );
      //return a response to the client with status 201
      //return the id of the plat and the plat
      res
        .status(201)
        .json([id_plat, nom_plat, nb_personne, prix, descriptions]);
    } catch (err) {
      console.error(err.message);
    }
  })
);

//create a route to get the plat by id with the corresponding recette
//use the join to get the corresponding recette
//use the ../databaseCreate.txt as a reference
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const { id } = req.params;
      const result = await connection.execute(
        "SELECT p.nom_plat, p.nb_personne, p.prix, p.descriptions, r.nom_recette, i.nom_ing, i.typee, i.quantite FROM plat p, recette r, ingredient i WHERE p.ID_plat = r.ID_recette AND r.ID_ing = i.ID_ing AND p.ID_plat = :id",
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
    }
  })
);

module.exports = router;

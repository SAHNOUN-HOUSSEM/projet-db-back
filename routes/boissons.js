const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the boisson create table:
CREATE TABLE boisson (
ID_boisson NUMBER(8)CONSTRAINT PK_boisson PRIMARY KEY ,
nom_boisson VARCHAR2(50),
contenace_mL NUMBER (3),
prix_unitaire NUMBER 
);
*/

//create a route to show all the boissons
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute("SELECT * FROM boisson");

    return res.status(200).json(result.rows);
  })
);

//create a route to add a boisson
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const { nom_boisson, contenace_mL, prix_unitaire } = req.body;
    //find the greatest id_boisson
    const result1 = await connection.execute(
      "SELECT MAX(ID_boisson) FROM boisson"
    );
    const id_boisson = result1.rows[0][0] + 1;
    const result = await connection.execute(
      "INSERT INTO boisson (ID_boisson,nom_boisson, contenace_mL, prix_unitaire) VALUES (:ID_boisson,:nom_boisson, :contenace_mL, :prix_unitaire)",
      [id_boisson, nom_boisson, contenace_mL, prix_unitaire]
    );
    //return a response to the client with status 201
    //return the id of the boisson and the boisson
    res
      .status(201)
      .json([id_boisson, nom_boisson, contenace_mL, prix_unitaire]);
  })
);

//create a route to show a boisson by id
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "SELECT * FROM boisson WHERE ID_boisson = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

module.exports = router;

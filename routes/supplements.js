const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the supplementaire create table:
CREATE TABLE supplementaire (
ID_supp NUMBER(8)CONSTRAINT PK_supp PRIMARY KEY ,
nom_supp VARCHAR2(50),
price NUMBER 
);
*/

//create a route to show all the supplementaires
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute("SELECT * FROM supplementaire");

    return res.status(200).json(result.rows);
  })
);

//create a route to show a supplementaire by id
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "SELECT * FROM supplementaire WHERE ID_supp = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to add a supplementaire
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const supplementaire = req.body;
    const result = await connection.execute(
      "INSERT INTO supplementaire VALUES (seq_supp.nextval, :nom_supp, :price)",
      supplementaire
    );

    return res.status(200).json(result.rows);
  })
);

module.exports = router;

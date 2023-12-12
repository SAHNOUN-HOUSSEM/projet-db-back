const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the fournisseur create table:
CREATE TABLE fournisseur (
ID_fournisseur NUMBER (8)CONSTRAINT  PK_fournisseur PRIMARY KEY ,
nom_fournisseur VARCHAR2(50)CONSTRAINT NN_nom_fournisseur NOT NULL,
prenom_fournisseur VARCHAR2 (50),
mail VARCHAR2(50)CONSTRAINT UN_add_mail UNIQUE ,
num_tel NUMBER (8),
adresse VARCHAR2(100)
);
*/

//create a route to show all the fournisseurs
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute("SELECT * FROM fournisseur");

    return res.status(200).json(result.rows);
  })
);

//create a route to add a fournisseur
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const { nom_fournisseur, prenom_fournisseur, mail, num_tel, adresse } =
      req.body;
    //find if there is a fournisseur with the same mail
    const result2 = await connection.execute(
      "SELECT * FROM fournisseur WHERE mail = :mail",
      [mail]
    );
    if (result2.rows.length > 0) {
      return res
        .status(400)
        .json("fournisseur with the same email already exists");
    }

    //find the greatest id_fournisseur
    const result1 = await connection.execute(
      "SELECT MAX(ID_fournisseur) FROM fournisseur"
    );
    const id_fournisseur = result1.rows[0][0] + 1;

    const result = await connection.execute(
      "INSERT INTO fournisseur (ID_fournisseur,nom_fournisseur, prenom_fournisseur, mail, num_tel, adresse) VALUES (:ID_fournisseur,:nom_fournisseur, :prenom_fournisseur, :mail, :num_tel, :adresse)",
      [
        id_fournisseur,
        nom_fournisseur,
        prenom_fournisseur,
        mail,
        num_tel,
        adresse,
      ]
    );
    //return a response to the client with status 201
    //return the id of the fournisseur and the fournisseur
    return res
      .status(201)
      .json([
        id_fournisseur,
        nom_fournisseur,
        prenom_fournisseur,
        mail,
        num_tel,
        adresse,
      ]);
  })
);

//create a route to show a fournisseur by id
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "SELECT * FROM fournisseur WHERE ID_fournisseur = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to delete a fournisseur
router.delete(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "DELETE FROM fournisseur WHERE ID_fournisseur = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

module.exports = router;

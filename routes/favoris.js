const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the client create table:
CREATE TABLE favoris (
ID_client NUMBER (8),
ID_plat NUMBER(8),
CONSTRAINT PK_favoris PRIMARY KEY (ID_client,ID_plat),
CONSTRAINT FK_favoris_client FOREIGN KEY (ID_client) REFERENCES client (ID_client),
CONSTRAINT FK_favoris_plat FOREIGN KEY (ID_plat) REFERENCES plat (ID_plat));
*/

/*
this the client create table:
CREATE TABLE client (
ID_client NUMBER (8)CONSTRAINT  PK_client PRIMARY KEY ,
nom_client VARCHAR2(50)CONSTRAINT NN_nom_client NOT NULL,
prenom_client VARCHAR2 (50),
passwordd VARCHAR2(50)CONSTRAINT NN_mot_de_passe NOT NULL,
mail VARCHAR2(50)CONSTRAINT UN_e_mail UNIQUE ,
maladie_allergie VARCHAR2(50),
tel NUMBER (8),
date_naiss DATE DEFAULT SYSDATE );
*/

/*this the plat create table:

CREATE TABLE plat (
ID_plat NUMBER(8)CONSTRAINT PK_plat PRIMARY KEY ,
nom_plat VARCHAR(50)  CONSTRAINT NN_nom_plat NOT NULL,
nb_personne NUMBER(2),
prix NUMBER  CONSTRAINT NN_prix NOT NULL,
descriptions VARCHAR2(50)
); 
*/

//create a route to show all the favoris of a client
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    //retrieve all ids of plat that are in the favoris of the client and their data
    //use join to get the data of the plats that are in the favoris of the client
    const result = await connection.execute(
      "SELECT plat.ID_plat, plat.nom_plat, plat.nb_personne, plat.prix, plat.descriptions FROM plat JOIN favoris ON plat.ID_plat = favoris.ID_plat WHERE favoris.ID_client = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to add a plat to the favoris of a client
router.post(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const platID = req.body.platID;
    //add the plat to the favoris of the client
    const result = await connection.execute(
      "INSERT INTO favoris (ID_client, ID_plat) VALUES (:id, :platID)",
      [id, platID]
    );
    return res.status(200).json({ id, platID });
  })
);

//create a route that delete a plat from the favoris of a client
router.delete(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const platID = req.body.platID;
    //delete the plat from the favoris of the client
    const result = await connection.execute(
      "DELETE FROM favoris WHERE ID_client = :id AND ID_plat = :platID",
      [id, platID]
    );
    return res.status(200).json({ id, platID });
  })
);

module.exports = router;

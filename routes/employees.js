const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the employee create table:
CREATE TABLE employee(
ID_employee NUMBER (8)CONSTRAINT  PK_employee PRIMARY KEY ,
nom_employee VARCHAR2(50)CONSTRAINT NN_nom_employee NOT NULL,
prenom_employee VARCHAR2 (50),
passworrd VARCHAR2(50)CONSTRAINT NN_PASS NOT NULL,
specialite VARCHAR2(50),
mail VARCHAR2(50)CONSTRAINT UN_mail UNIQUE ,
adresse VARCHAR2 (50),
diplome VARCHAR2(50),
date_naiss DATE DEFAULT SYSDATE,
date_recurutement  DATE DEFAULT SYSDATE ,
salaire NUMBER ,
telephone NUMBER(9));
*/

//create a route to show all the employees
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute("SELECT * FROM employee");

    return res.status(200).json(result.rows);
  })
);

//create a route to show a employee by id
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "SELECT * FROM employee WHERE ID_employee = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to add a employee
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const employee = req.body;
    const result = await connection.execute(
      "INSERT INTO employee VALUES (seq_employee.nextval, :nom_employee, :prenom_employee, :passworrd, :specialite, :mail, :adresse, :diplome, :date_naiss, :date_recurutement, :salaire, :telephone)",
      employee
    );

    return res.status(200).json(result.rows);
  })
);

module.exports = router;

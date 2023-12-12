const express = require("express");
const asyncHandler = require("../utilities/asyncHandler");

const router = express.Router();

/*
this the staff create table:

CREATE TABLE STAFF (
ID_staff NUMBER(8) CONSTRAINT  PK_staff PRIMARY KEY , 
nom_staff VARCHAR2(10),
ID_employee NUMBER (8),
CONSTRAINT FK_staff_employee FOREIGN KEY (ID_employee)REFERENCES employee (ID_employee),
CONSTRAINT CHK_staff CHECK ((nom_staff) IN ('chef','serveurs','securite'))
);

*/

//create a route to show all the staffs
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute("SELECT * FROM staff");

    return res.status(200).json(result.rows);
  })
);

//create a route to show all the chefs and their corresponding employees
router.get(
  "/chefs",
  asyncHandler(async (req, res, next, connection) => {
    const result = await connection.execute(
      "SELECT * FROM staff WHERE nom_staff = 'chef'"
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to add a staff
router.post(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    const { nom_staff, ID_employee } = req.body;
    //find the greatest id_staff
    const result1 = await connection.execute("SELECT MAX(ID_staff) FROM staff");
    const id_staff = result1.rows[0][0] + 1;
    const result = await connection.execute(
      "INSERT INTO staff (ID_staff,nom_staff, ID_employee) VALUES (:ID_staff,:nom_staff, :ID_employee)",
      [id_staff, nom_staff, ID_employee]
    );
    //return a response to the client with status 201
    //return the id of the staff and the staff
    res.status(201).json([id_staff, nom_staff, ID_employee]);
  })
);

//create a route to show a staff by id
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "SELECT * FROM staff WHERE ID_staff = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

//create a route to delete a staff by id
router.delete(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    const id = req.params.id;
    const result = await connection.execute(
      "DELETE FROM staff WHERE ID_staff = :id",
      [id]
    );

    return res.status(200).json(result.rows);
  })
);

module.exports = router;

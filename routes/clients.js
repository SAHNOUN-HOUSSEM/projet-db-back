require("dotenv").config();

const bcrypt = require("bcrypt");
const express = require("express");
const oracledb = require("oracledb");
const asyncHandler = require("../utilities/asyncHandler");
const AppError = require("../utilities/AppError");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/authMiddlewares");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const router = express.Router();

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
date_naiss DATE DEFAULT SYSDATE ,
refreshToken VARCHAR2(100));

*/

//register a client
router.post(
  "/register",
  asyncHandler(async (req, res, next, connection) => {
    const email = req.body.client.mail;
    //find client with a specific email
    const clientExistsResult = await connection.execute(
      "SELECT * FROM client WHERE mail = :email",
      [email]
    );

    if (clientExistsResult.rows.length !== 0) {
      throw new AppError("A client already exists with the entered email", 401);
    }
    //find the greatest client id
    const clientResult = await connection.execute(
      "SELECT MAX(ID_client) FROM client"
    );
    const clientId = clientResult.rows[0][0] + 1;

    const client = req.body.client;

    const result = await connection.execute(
      `INSERT INTO hr.client (ID_client, nom_client, prenom_client, passwordd, mail, maladie_allergie, tel, date_naiss) VALUES (:id, :nom_client, :prenom_client, :passwordd, :mail, :maladie_allergie, :tel, :date_naiss)`,
      [
        clientId,
        client.nom_client,
        client.prenom_client,
        client.passwordd,
        client.mail,
        client.maladie_allergie,
        client.tel,
        client.date_naiss,
      ]
    );
    return res.status(200).json({ clientId, ...client });
  })
);

//login a client
router.post(
  "/login",
  asyncHandler(async (req, res, next, connection) => {
    const { email, password } = req.body;
    //find a client with a specific email
    const result = await connection.execute(
      "SELECT * FROM client WHERE mail = :email",
      [email]
    );
    const client = result.rows[0];

    if (!client) {
      throw new AppError("Invalid credentials. Admin does not exist.", 400);
    }

    const isValid = password === client[3];

    if (!isValid) {
      throw new AppError("Invalid credentials.", 400);
    }
    const accessToken = jwt.sign({ clientId: client[0] }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { clientId: client[0] },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    //update the refresh token of the specific client in the database
    // i have updated the client schema
    const updateResult = await connection.execute(
      "UPDATE hr.client SET refreshToken= :refreshToken WHERE ID_client = :id",
      [refreshToken, client[0]]
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken, clientId: client[0] });
  })
);

//refresh token
router.post(
  "/refreshToken",
  asyncHandler(async (req, res, next, connection) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;

    // find a client with a specific refreshToken
    const result = await connection.execute(
      "select * from hr.client where refreshToken= :refreshToken",
      [refreshToken]
    );

    const client = result.rows[0];

    if (!client) return res.sendStatus(403); //Forbidden

    // evaluate jwt
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || client[0] !== decoded.clientId) return res.sendStatus(403);

      const accessToken = jwt.sign(
        {
          clientId: decoded.clientId,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.status(200).json({ accessToken, clientId: client[0] });
    });
  })
);

//logout a client
router.post(
  "/logout",
  asyncHandler(async (req, res, next, connection) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204); //No content
    }
    const refreshToken = cookies.jwt;

    //find the client with a specific refreshToken
    const result = await connection.execute(
      "select * from hr.client where refreshToken= :refreshToken",
      [refreshToken]
    );

    const client = result.rows[0];

    if (!client) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const updateResult = await connection.execute(
      "UPDATE hr.client SET refreshToken= :refreshToken WHERE ID_client = :id",
      ["", client[0]]
    );

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.sendStatus(204);
  })
);

//get all clients
router.get(
  "/",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const result = await connection.execute("SELECT * FROM hr.client");

      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
    }
  })
);

//details of a specific client
router.get(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const { id } = req.params;
      const result = await connection.execute(
        "SELECT * FROM client WHERE ID_client = :id",
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
    }
  })
);

//update a client
router.put(
  "/:id",
  asyncHandler(async (req, res, next, connection) => {
    try {
      const { id } = req.params;
      const {
        nom_client,
        prenom_client,
        passwordd,
        mail,
        maladie_allergie,
        tel,
        date_naiss,
      } = req.body;
      const result = await connection.execute(
        "UPDATE client SET nom_client = :nom_client, prenom_client = :prenom_client, passwordd = :passwordd, mail = :mail, maladie_allergie = :maladie_allergie, tel = :tel, date_naiss = :date_naiss WHERE ID_client = :id",
        [
          nom_client,
          prenom_client,
          passwordd,
          mail,
          maladie_allergie,
          tel,
          date_naiss,
          id,
        ]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
    }
  })
);

module.exports = router;

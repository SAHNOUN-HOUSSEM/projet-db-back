const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const initOracle = require("./database/initOracle");
const corsOptions = require("./config/corsOptions");
const cors = require("cors");
const credentialsMiddleware = require("./middlewares/credentialsMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Oracle DB connection pool
initOracle();

app.use(credentialsMiddleware);

app.use(cors(corsOptions));

//add a logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use(cookieParser());

// Your Express.js routes and middleware go here
app.use("/ingredients", require("./routes/ingredients"));
app.use("/recettes", require("./routes/recettes"));
app.use("/clients", require("./routes/clients"));
app.use("/plats", require("./routes/plats"));
app.use("/favoris", require("./routes/favoris"));
app.use("/fournisseurs", require("./routes/fournisseurs"));
app.use("/boissons", require("./routes/boissons"));
app.use("/supplements", require("./routes/supplements"));
app.use("/employees", require("./routes/employees"));
app.use("/staffs", require("./routes/staffs"));

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

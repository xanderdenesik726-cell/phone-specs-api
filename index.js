require("dotenv").config();

// Default the scrape target when BASE_URL isn't provided via env (e.g. on a
// fresh Vercel deploy). All v2 controllers read process.env.BASE_URL, so
// setting it here once fixes /search, /brands, /latest, /top-by-* together.
// Still overridable by setting BASE_URL in the environment.
process.env.BASE_URL = process.env.BASE_URL || "https://www.gsmarena.com";

const express = require("express");
const app = express();
// require("./src/db/connection");

const indexRoutes = require("./src/routes/v2/index");
const errorRoutes = require("./src/routes/error");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/", indexRoutes);
app.use("*", errorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App running on PORT ${PORT}`));

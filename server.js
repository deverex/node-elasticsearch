const express = require("express");
const body_parser = require("body-parser");
const routes = require("./routes");

const PORT = process.env.PORT || 5000;

const app = express();

// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});

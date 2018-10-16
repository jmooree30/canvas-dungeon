const express = require("express");
const app = express();
const cors = require("cors");
const map = require("./rpg-map.json");

app.options("/map", cors());
app.get("/map", cors(), (req, res) => {
  return res.send(map);
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on port ${port}`);

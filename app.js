const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 3000;

// setup view engine (ejs)
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// require connection ke database
require("./utils/db");

// require model Users
const { Users } = require("./model/users");

app.get("/", async (req, res) => {
  const users = await Users.find();
  res.render("index", {
    layout: "layouts/main-layout",
    title: "Home Page",
    users: users,
  });
});

app.post("/add-users", async (req, res) => {
  Users.insertMany(req.body).then((result) => {
    res.redirect("/");
  });
});

// listen port
app.listen(port, () => {
  console.log(
    `FreshShop (Express,MongoDB) App listening at : http://localhost:${port}`
  );
});

const express = require("express");
const bcrypt = require("bcrypt");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 3000;

// session
const session = require("express-session");
// Menggunakan express-session middleware
app.use(
  session({
    secret: "+3n3r9y+",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Atur ke true jika menggunakan HTTPS saja
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 hari dalam milidetik
    },
  })
);

// cookie and flash
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");

// require connection ke database
require("./utils/db");

// konfigurasi flash, memanfaatkan middlewarenya
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 3000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(connectFlash());

// setup view engine (ejs)
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// require model Users
const { Users } = require("./model/users");
const { Products } = require("./model/products");

// ===== USER ROUTES
app.get("/", async (req, res) => {
  let logged = "";
  let userData = "";
  if (req.session.user) {
    logged = "true";
    const userId = req.session.user;
    userData = await Users.findOne({ _id: userId });
  }
  res.render("index", {
    layout: "layouts/main-layout",
    title: "Home Page",
    msgRegisterSuccess: req.flash("msgRegisterSuccess"),
    msgRegisterFailed: req.flash("msgRegisterFailed"),
    msgLoginSuccess: req.flash("msgLoginSuccess"),
    msgLoginFailed: req.flash("msgLoginFailed"),
    msgLogoutSuccess: req.flash("msgLogoutSuccess"),
    logged: logged,
    userData: userData ? userData : null,
  });
});

app.post("/signup", async (req, res) => {
  const duplikat = await Users.findOne({ username: req.body.username });
  if (duplikat) {
    req.flash("msgRegisterFailed", "Register Failed");
    res.redirect("/");
  } else {
    // enkripsi
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Angka 10 adalah salt rounds (tingkat keamanan)

    const newUser = {
      username: req.body.username,
      role: req.body.role,
      password: hashedPassword, // Simpan kata sandi yang telah dienkripsi
    };

    Users.insertMany(newUser).then((result) => {
      req.flash("msgRegisterSuccess", "Register Success");
      res.redirect("/");
    });
  }
});

app.post("/signin", async (req, res) => {
  const find = await Users.findOne({
    username: req.body.username,
    role: "user",
  });

  if (find) {
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      find.password
    );
    if (passwordMatch) {
      // Jika otentikasi berhasil, atur cookie sesi
      req.session.user = find._id; // Menggunakan find sebagai data pengguna sesi
      req.flash("msgLoginSuccess", "Register Success");
      res.redirect("/");
      return;
    }
  } else {
    req.flash("msgLoginFailed", "Register Failed");
  }
  res.redirect("/");
});

app.post("/signout", (req, res) => {
  // Menghapus session pengguna
  req.session.user = null;
  req.flash("msgLogoutSuccess", "Logout Success");
  res.redirect("/");
});

// ========== ADMIN ROUTES ==========
app.get("/admin", async (req, res) => {
  let adminLogged = "";
  if (req.session.admin) {
    adminLogged = "true";
  }
  res.render("admin-signin", {
    layout: "admin-layouts-sign/main-layout",
    title: "Admin Home Page",
    adminLogged: adminLogged,
  });
});

app.post("/admin-signin", async (req, res) => {
  // cari document
  const findAdmin = await Users.findOne({
    username: req.body.username,
    role: "admin",
  });

  // jika document ketemu, check dengan bcrypt
  if (findAdmin) {
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      findAdmin.password
    );

    // jika password nya match,
    if (passwordMatch) {
      req.session.admin = true;
      res.redirect("/admin-product");
      return;
    }
  }
  res.redirect("/admin");
});

app.get("/admin-product", async (req, res) => {
  let adminLogged = "";
  if (req.session.admin) {
    adminLogged = "true";
  }
  res.render("admin-product", {
    layout: "admin-layouts/main-layout",
    title: "Home Page Admin",
    adminLogged: adminLogged,
  });
});

app.post("/admin-signout", (req, res) => {
  // Menghapus session admin
  req.session.admin = null;
  res.redirect("/admin");
});
// listen port
app.listen(port, () => {
  console.log(
    `FreshShop (Express,MongoDB) App listening at : http://localhost:${port}`
  );
});

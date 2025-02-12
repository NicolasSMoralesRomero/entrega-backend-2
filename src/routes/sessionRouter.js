import { userModel } from "../dao/models/userModel.js";
import { Router } from "express";
import { comparePassword, hashPassword } from "../utils/hash.js";
import passport from "passport";

export const sessionRoutes = Router();

//endpoints register y login "local"

sessionRoutes.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/fail-login"
  }),
  async (req, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ message: "Unauthorized", details: req.authInfo });

        const token = req.token;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role
    };

    //res.status(200).json({ message: "User logged in", user: req.session.user });
    //Si inicia sesión redirect a ruta raíz
    res
    .redirect("/")
  }
);

// Endpoint "current"
sessionRoutes.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      message: "Current user",
      token: {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
      },
    });
  }
);

sessionRoutes.get("/fail-login", (req, res) => {
  return res.status(500).json({
    message: "Internal server error",
  });
});

sessionRoutes.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/api/sessions/fail-register" }),
  (req, res) => {
    if (!req.user)
      return res
        .status(500)
        .json({ message: "Internal server error", details: req.authInfo });

    // return res.status(201).json({ message: "User created", user: req.user });
    return res.redirect("/")
  }
);

sessionRoutes.get("/fail-register", (req, res) => {
  return res.status(500).json({ message: "Internal server error" });
});

sessionRoutes.get("/logout", (req, res) => {
  req.session.destroy();
  //return res.status(200).json({ message: "User logged out" });
  //Si cierra sesión redirect a ruta raíz
  res.redirect("/")
});

// Endpoint login con Github

sessionRoutes.get("/github", passport.authenticate("github"));

sessionRoutes.get(
  "/github-callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    console.log(req.user);

    if (req.user) {
      req.session.user = req.user;
      return res.redirect("/");
    }

    res.redirect("/login");
  }
);

// Rutas para login y register local

sessionRoutes.get("/login", (req, res) => {
    const isSession = req.session.user ? true : false;
  
    if (isSession) {
      return res.redirect("/");
    }
  
    res.render("login", { title: "Login" });
  });
  
  sessionRoutes.get("/register", (req, res) => {
    const isSession = req.session.user ? true : false;
  
    if (isSession) {
      return res.redirect("/");
    }
  
    res.render("register", { title: "Register" });
  });
  
  sessionRoutes.get("/profile", (req, res) => {
    const isSession = req.session.user ? true : false;
  
    if (!isSession) {
      return res.redirect("/api/sessions/login");
    }
    res.render("profile", { title: "Profile", user: req.session.user, isSession });
  });
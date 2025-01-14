import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { userModel } from "../dao/models/userModel.js";
import { comparePassword, hashPassword } from "../utils/hash.js";


import { createToken, SECRET } from "../utils/jwtUtil.js";


//Pasar a archivo .env despues de pre entrega
const GITHUB_CLIENT_ID = "";
const GITHUB_CLIENT_SECRET = "";


const LocalStrategy = local.Strategy;

export function initializePassport() {
    // Estrategia local
  
  passport.use(
    "register",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;

        try {
          const userExists = await userModel.findOne({ email });

          if (userExists)
            return done(null, false, { message: "User already exists" });

          const hashedPassword = await hashPassword(password);

          const user = await userModel.create({
            first_name,
            last_name,
            age,
            email,
            password: hashedPassword,
          });

          return done(null, user);
        } catch (error) {
          return done(`Hubo un error: ${error}`);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async ( req, email, password, done) => {
        try {
          const user = await userModel.findOne({ email });

          if (!user)
            return done(null, false, { message: "User does not exist" });

          const isPasswordValid = await comparePassword(
            password,
            user.password
          );

          if (!isPasswordValid)
            return done(null, false, { message: "Invalid password" });

          const token = createToken({
            id: user.id,
            email: user.email,
            role: user.role,
          });

          req.token = token;


          return done(null, user);
        } catch (error) {
          return done(`Hubo un error: ${error}`);
        }
      }
    )
  );

  //JWT
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        secretOrKey: SECRET,
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      },
      async (payload, done) => {
        try {
          const user = await userModel.findById(payload.id);

          if (!user) return done(null, false);

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

   // Estrategia Github
   passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/github-callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {

        try {
          const email = profile.emails[0].value;

          const user = await userModel.findOne({ email });

          if (user) {
            done(null, user);
            return;
          }

          const newUser = await userModel.create({
            first_name: profile.displayName,
            email,
            age: profile.age || 18,
            githubId: profile.id,
          });

          done(null, newUser);
        } catch (error) {
          done(error);
        }
      }
    )
  );


  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);

    done(null, user);
  });
}

function cookieExtractor(req) {
  return req && req.cookies ? req.cookies.token : null;
}
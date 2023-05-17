const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GOOGLE_CLIENT_ID =
  "868304532839-bm1vs4orclqnst1ahvg0mrqq9rm6s2sb.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

FACEBOOK_APP_ID = "947854302923824";
FACEBOOK_APP_SECRET = "c1126c13d100c97cd8d24de2a1e0828c";

var mysqlConn = require("../config");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(profile.id);

      const Googleid = profile.emails[0].value;

      const queryString = "SELECT * FROM tb_user WHERE id = ?";
      const queryValues = [Googleid];

      mysqlConn.query(queryString, queryValues, async (error, results) => {
        if (error) {
          done(error, null);
        } else if (results.length > 0) {
          done(null, results[0]);
        } else {
          const insertQuery = "INSERT INTO tb_user (id,password) VALUES (?,123)";
          const insertValues = [Googleid];

          try {
            await mysqlConn.query(insertQuery, insertValues);
            const newUser = { id: Googleid };
            done(null, newUser);
          } catch (err) {
            console.error(err);
            done(err, null);
          }
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email", "gender", "name"],
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(profile.id);

      const Facebookid = profile.id;

      const queryString = "SELECT * FROM tb_user WHERE id = ?";
      const queryValues = [Facebookid];

      mysqlConn.query(queryString, queryValues, async (error, results) => {
        if (error) {
          done(error, null);
        } else if (results.length > 0) {
          done(null, results[0]);
        } else {
          const insertQuery = "INSERT INTO tb_user (id) VALUES (?)";
          const insertValues = [Facebookid];

          try {
            await mysqlConn.query(insertQuery, insertValues);
            const newUser = { id: Facebookid };
            done(null, newUser);
          } catch (err) {
            console.error(err);
            done(err, null);
          }
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user);
});
passport.deserializeUser((user, done) => {
  return done(null, user);
});

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { generateToken } = require('./auth');

let db;

const initPassport = (database) => {
  db = database;

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/callback/google`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const imageUrl = profile.photos[0].value;

      // Check if user already exists
      let user = await db.collection('users').findOne({ email });

      if (user) {
        // Update user with Google info if not already set
        if (user.provider !== 'google') {
          await db.collection('users').updateOne(
            { email },
            { 
              $set: { 
                provider: 'google',
                googleId: profile.id,
                imageUrl: imageUrl || user.imageUrl
              }
            }
          );
          user = await db.collection('users').findOne({ email });
        }
      } else {
        // Create new user
        const newUser = {
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          provider: 'google',
          googleId: profile.id,
          imageUrl,
          createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/callback/github`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName || profile.username;
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      const imageUrl = profile.photos[0].value;

      // Check if user already exists
      let user = await db.collection('users').findOne({ email });

      if (user) {
        // Update user with GitHub info if not already set
        if (user.provider !== 'github') {
          await db.collection('users').updateOne(
            { email },
            { 
              $set: { 
                provider: 'github',
                githubId: profile.id,
                imageUrl: imageUrl || user.imageUrl
              }
            }
          );
          user = await db.collection('users').findOne({ email });
        }
      } else {
        // Create new user
        const newUser = {
          email,
          firstName,
          lastName,
          name,
          provider: 'github',
          githubId: profile.id,
          imageUrl,
          createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.collection('users').findOne({ _id: id });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = { initPassport };

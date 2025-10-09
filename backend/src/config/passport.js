const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { supabaseAdmin } = require('./supabase');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('google_id', profile.id)
          .single();

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user
        const newUser = {
          google_id: profile.id,
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          profile_image_url: profile.photos[0]?.value || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdUser, error } = await supabaseAdmin
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (error) throw error;

        done(null, createdUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;

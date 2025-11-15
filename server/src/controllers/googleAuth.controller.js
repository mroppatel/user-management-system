const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { signAccessToken, signRefreshToken } = require("../utils/generateToken");

// Create OAuth2 client with client ID, client secret, and redirect URI
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1 — Frontend will hit this URL to get Google Login Page
exports.getGoogleAuthURL = (req, res) => {
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "profile email",
      access_type: "offline",
      prompt: "consent",
    }).toString();

  res.json({ url });
};

// Step 2 — Google callback
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) return res.status(400).send("No code provided by Google");

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleUser = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ where: { email: googleUser.email } });

    if (!user) {
      // New user → create account
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        isVerified: true,
        profileImage: googleUser.picture,
      });
    }

    // Create JWT tokens
    const accessToken = signAccessToken({ id: user.id });
    const refreshToken = signRefreshToken({ id: user.id });

    // Redirect to frontend with access token
    return res.redirect(
      `${process.env.CLIENT_URL}/profile`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Google Login Failed");
  }
};

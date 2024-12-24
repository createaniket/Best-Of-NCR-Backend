const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); // Adjust path
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // If not, create a new user
            user = new User({
                name,
                email,
                googleId,
                profilePicture: picture,
            });
        }

        // Generate auth token
        const token = jwt.sign({ _id: user._id }, process.env.UserTokenKey);

        // Save token to user
        user.tokens = user.tokens.concat({ token });
        await user.save();

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid Google Token' });
    }
};

module.exports = { googleLogin };

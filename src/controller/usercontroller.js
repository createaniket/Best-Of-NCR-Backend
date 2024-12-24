
const User = require("../models/User");

// Register with email and password
exports.registerWithEmail = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await new User({
      name,
      email,
      password,
    });

    await user.save();

    // sendWelcomeMail(user.email, user.name)
    const token = await user.generateAuthToken();
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: user,
        token: token,
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.UserLogin = async(req, res) => {

    try {


        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})
        
    } catch (error) {

        res.status(500).json({ message: "Server error", error: error.message });
        
    }
}
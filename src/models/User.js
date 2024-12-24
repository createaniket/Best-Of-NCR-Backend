const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false }, // Optional for email/password
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Only for email/password
    facebookId: { type: String, required: false }, // Only for Facebook
    googleId: { type: String, required: false }, // Only for Google
    profilePicture: { type: String, required: false },

    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Method for generating the Auth Token which is being called by the function of login and signup from Router files
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.UserTokenKey);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    console.log(token); // consoling the token
    return token;
  };
  
  // Finding the user by its credentials and checking the password with our hashed one
  userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error(
        "Looks like you're not registered yet! Ready to join us? Sign up now and Expand Your Brand Demand!"
      );
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      throw new Error("Password didn't Match");
    }
    return user;
  };
  
  userSchema.pre("save", async function (next) {
    const User = this;
    if (User.isModified("password")) {
      User.password = await bcrypt.hash(User.password, 8);
    }
    next();
  });
  
  const User = mongoose.model("User", userSchema);
  module.exports = User;

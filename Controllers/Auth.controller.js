const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/User.model");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const Notifications = require("../Models/Notification.model");
const cloudinary = require("../Configuration/Cloudinary");
// const { Resend } = require('resend');
// const resend = new Resend('re_ebZwohzh_JJcDA7PWetDuC6JXpZqdeEkq');

// Generate JWT Token
const generateToken = (userProfileId, role) => {
  const accessToken = jwt.sign(
    { profileID: userProfileId, role: role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { profileID: userProfileId, role: role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "24h" }
  );

  return { accessToken, refreshToken };
};

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check password format (at least 8 characters, containing letters and numbers)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
    if (password.length < 8) {
      return res.status(400).send("Password must be at least 8 characters long");
    }
    if (!passwordRegex.test(password)) {
      return res.status(400).send("Invalid password format");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already exists. Please login.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    if (role === "Teacher" || role === "Student") {
      const {
        firstName,
        lastName,
        profilePicture,
        personality,
        aboutMe,
        educationalCredential,
        educationalLevel,
      } = req.body;

      if (!profilePicture) {
        return res.status(400).json({ message: "Please upload a profile picture" });
      }

      const profileData = {
        firstName,
        lastName,
        profilePicture, // Assuming profilePicture is the URL of the profile picture from Firebase Storage
        personality,
        aboutMe,
      };

      if (role === "Teacher") {
        profileData.educationalCredential = educationalCredential;
      } else if (role === "Student") {
        profileData.educationalLevel = educationalLevel;
      }

      let profile;
      if (role === "Teacher") {
        profile = await Teacher.create(profileData);
      } else if (role === "Student") {
        profile = await Student.create(profileData);
      }

      // Link the profile to the user
      user.profileID = profile._id;

      // Create and link notifications
      const notifications = new Notifications({
        profileID: profile._id,
        role,
      });
      profile.notificationsID = notifications._id;

      // Save everything
      await notifications.save();
      await profile.save();
    }

    // Save the user
    const finalResult = await user.save();

    res.status(201).json(finalResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup };


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "email does not exist" });
    }

    if (user.role === "Teacher") {
      const teacher = await Teacher.findById(user.profileID);
      if (!teacher.isApproved) {
        return res.status(403).json({ message: "Your account is awaiting approval" });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const { accessToken, refreshToken } = generateToken(
      user.profileID,
      user.role
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error, Please Try again" });
  }
};

const getAccessToken = async (req, res) => {
  const accessToken = jwt.sign(
    { profileID: req.user.profileID, role: req.user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ accessToken: accessToken });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken === null) return res.sendStatus(400);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });

  return res.status(200).send("Logged out successfully");
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message: "An account with this email does not exist!"})
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + user.password;
    const token = jwt.sign({email: user.email, id: user._id}, secret, {expiresIn: "5m"});
    const link = `${process.env.BASE_URL_BACKEND}/api/auth/reset-password/${user._id}/${token}`;
    // await resend.emails.send({
    //   from: "Learn and Track <onboarding@resend.dev>",
    //   to: [email],
    //   subject: "Learn and Track - Password Reset",
    //   html: `<p>Click the link below to reset your password:</p><a href="${link}">Reset Password</a>`
    // });
    res.status(200).json(link)
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error, Please Try again" });
  }
}

const resetPasswordVerify = async (req, res) => {
  try {
    const {id, token} = req.params;
    console.log(req.params)
    const user = await User.findOne({_id: id});
    if (!user) {
      return res.status(404).json({message: "An account with this email does not exist!"})
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + user.password;
    const verify = jwt.verify(token, secret);
    if (verify) {
      console.log(process.env.BASE_URL_FRONTEND)
      res.render("passwordReset", {email: verify.email,status: "Not Verified", BASE_URL_FRONTEND: process.env.BASE_URL_FRONTEND});
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error, Please Try again" });
  }
}

const resetPassword = async (req, res) => {
  try {
    const {id, token} = req.params;
    const user = await User.findOne({_id: id});
    const {password} = req.body
    if (!user) {
      return res.status(404).json({message: "An account with this email does not exist!"})
    }
    const secret = process.env.ACCESS_TOKEN_SECRET + user.password;
    const verify = jwt.verify(token, secret);
    if (verify) {
      const encryptedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, {password: encryptedPassword});
      res.render("passwordReset", {email: verify.email,status: "Verified", BASE_URL_FRONTEND: process.env.BASE_URL_FRONTEND});
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error, Please Try again" });
  }
}

module.exports = {
  signup,
  login,
  getAccessToken,
  logout,
  forgotPassword,
  resetPasswordVerify,
  resetPassword
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User.model");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const Notifications = require("../Models/Notification.model");
const cloudinary = require("../Configuration/Cloudinary");

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
      return res
        .status(501)
        .send("Password must be at least 8 characters long");
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).send("Invalid password format");
    }

    const result = await User.findOne({ email });

    if (result != null) {
      res.status(400).send("Email already exist, Please login.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    if (role === "Teacher") {
      const {
        firstName,
        lastName,
        profilePicture,
        educationalCredential,
        personality,
        aboutMe,
        credentialFiles,
      } = req.body;

      if (profilePicture === "") {
        res.status(404).json({ message: "Pls upload Image" });
      } else {
        const result = await cloudinary.uploader.upload(profilePicture, {
          upload_preset: "ml_default",
          resource_type: "auto",
        });

        const profile = await Teacher.create({
          firstName,
          lastName,
          profilePicture: result.secure_url,
          educationalCredential,
          personality,
          aboutMe,
          credentialFiles,
        });
        user.profileID = profile._id;

        notifications = new Notifications({
          profileID: profile._id,
          role: "Teacher",
        });
        profile.notificationsID = notifications._id;
        await notifications.save();
        await profile.save();
      }
    } else if (role === "Student") {
      const {
        firstName,
        lastName,
        profilePicture,
        educationalLevel,
        personality,
        aboutMe,
      } = req.body;

      if (profilePicture === "") {
        res.status(404).json({ message: "Pls upload Image" });
      } else {
        const result = await cloudinary.uploader.upload(profilePicture, {
          upload_preset: "ml_default",
          resource_type: "auto",
        });

        const profile = await Student.create({
          firstName,
          lastName,
          profilePicture: result.secure_url,
          educationalLevel,
          personality,
          aboutMe,
        });
        user.profileID = profile._id;

        notifications = new Notifications({
          profileID: profile._id,
          role: "Student",
        });

        profile.notificationsID = notifications._id;
        await notifications.save();
        await profile.save();
      }
    }

    const finalResult = await user.save();

    res.status(201).json(finalResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

module.exports = {
  signup,
  login,
  getAccessToken,
  logout,
};

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function sendAuthResponse(res, user, statusCode = 200) {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    ok: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

export async function registerUser(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Name, email and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      message: "Password must be at least 6 characters",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      ok: false,
      message: "Email is already registered",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  sendAuthResponse(res, user, 201);
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password",
    });
  }

  sendAuthResponse(res, user);
}

export async function getMe(req, res) {
  res.status(200).json({
    ok: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
}
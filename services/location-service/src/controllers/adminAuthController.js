import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const TOKEN_COOKIE_NAME = "token";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn(
    "ACCESS_TOKEN_SECRET is not set. Falling back to an insecure development secret."
  );
}

const TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "dev-admin-secret";

function buildCustomerPayload(admin) {
  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
  };
}

function createSessionToken(admin) {
  const payload = {
    sub: admin._id.toString(),
    email: admin.email,
    name: admin.name,
  };

  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: "7d" });
}

const baseCookieOptions = {
  httpOnly: true,
  sameSite: IS_PRODUCTION ? "strict" : "lax",
  secure: IS_PRODUCTION,
  path: "/",
};

const adminAuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required." });
      }

      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const token = createSessionToken(admin);

      res.cookie(TOKEN_COOKIE_NAME, token, {
        ...baseCookieOptions,
        maxAge: TOKEN_TTL_MS,
      });

      return res
        .status(200)
        .json({ customer: buildCustomerPayload(admin) });
    } catch (error) {
      console.error("Failed to process login request.", error);
      return res
        .status(500)
        .json({ message: "An unexpected error occurred." });
    }
  },

  logout: (req, res) => {
    res.clearCookie(TOKEN_COOKIE_NAME, baseCookieOptions);
    return res.sendStatus(204);
  },

  profile: async (req, res) => {
    try {
      const adminId = req.user?.id ?? req.user?.sub;

      if (!adminId) {
        return res.status(401).json({ message: "Session is invalid." });
      }

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(404).json({ message: "Account not found." });
      }

      return res.json({ customer: buildCustomerPayload(admin) });
    } catch (error) {
      console.error("Failed to load profile.", error);
      return res
        .status(500)
        .json({ message: "An unexpected error occurred." });
    }
  },

  addAdmin: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Name, email, and password are required." });
      }

      const existingUser = await Admin.findOne({
        $or: [{ name }, { email }],
      });

      if (existingUser) {
        return res.status(409).json({ message: "Account already exists." });
      }

      const newAdmin = new Admin({ name, email, password });
      await newAdmin.save();

      return res.status(201).json({
        message: "Account created successfully.",
        name: newAdmin.name,
        email: newAdmin.email,
      });
    } catch (error) {
      console.error("Failed to create account.", error);
      return res
        .status(500)
        .json({ message: "An unexpected error occurred." });
    }
  },
};

export default adminAuthController;

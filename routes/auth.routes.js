import { Router } from "express";
import { supabase } from "../supabase-client.js";
import { authenticatedUser } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     description: Registers a new user with Supabase Auth.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             email: "test@example.com"
 *             password: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request (missing fields or Supabase error)
 *       500:
 *         description: Internal server error
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(201).json({ user: data.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return tokens
 *     description: Logs in a user and returns a JWT access token and refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             email: "test@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       400:
 *         description: Bad request (missing fields)
 *       401:
 *         description: Invalid login credentials
 *       500:
 *         description: Internal server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Bad Request",
      });
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out the user
 *     description: Logged out an authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Not content
 */
router.post("/logout", authenticatedUser, async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.sendStatus(204);
});

export default router;

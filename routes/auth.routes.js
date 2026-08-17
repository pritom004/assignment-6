import { Router } from "express";
import { supabase } from "../supabase-client.js";

const router = Router();

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

    return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  });

    if (error) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

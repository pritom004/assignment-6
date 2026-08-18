import { supabase } from "../supabase-client.js";

export const authenticatedUser = async (req, res, next) => {
  const header = req.headers.authorization;
  let token;

  if (header && header.startsWith("Bearer")) {
    token = header.split(" ")[1];
  } else {
    res.status(401).json({ error: "Access token required" });
  }

  const {error, data} = await supabase.auth.getUser(token)

  if(error){
    return res.status(401).json({error: error.message})
  }

  req.user = data.user;
  next()
};

import { Request, Response } from "express";
import { getUser } from "../DTO/user_db";
import { signJWT, verifyJWT } from "../Utils/JWTUtils";

// login handler
export function createSessionHandler(req: Request, res: Response){
  const {email, password} = req.body

  const user = getUser(email)

  if(!user || user.password !== password) {
    return res.status(401).send('Invalid email or password');
  }

  // create access token
  const accessToken = signJWT({email: user.email, name: user.name}, "1h");

  // save token to cookie
  res.cookie("accessToken", accessToken, {
    maxAge: 3000000,
    httpOnly: true,
  })

  // send user back
  console.log(verifyJWT(accessToken).payload);
  return res.send(verifyJWT(accessToken).payload);
}

// get session handler
export function getSessionHandler(req: Request, res: Response) {
  // @ts-ignore
  return res.send(req.user);
}

// logout handler 
export function deleteSessionHandler(req: Request, res: Response) {
  res.cookie("accessToken", "", {
    maxAge: 0,
    httpOnly: true,
  });

  console.log({success: true});
  return res.send({success: true});
}
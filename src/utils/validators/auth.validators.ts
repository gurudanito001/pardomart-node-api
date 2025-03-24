import { Request, Response } from "express";
import { decodeToken } from "../../services/tokenService";
import { updateUser } from "../../models/user.models";

async function authValidation (req: any , res: any, next: any){
  try {
    const {authorization} = req.headers;
    let token = authorization?.split(" ")[1]
    let user: any = decodeToken(token || "")
    let date = new Date().toISOString();
    req.user = user;
    await updateUser(user.userId, {lastLogin: date})
    next();
  } catch (error) {
    return res.status(401).json({
      message: `UnAuthorized!! ${error}`,
      status: "error",
      statusCode: 401,
    })
  }
  
}

export default authValidation
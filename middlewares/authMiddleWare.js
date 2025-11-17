import {
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { verifyJWT } from "../utils/jwtUtils.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; //for flutter
    if (!token) throw new UnauthenticatedError("unable to access");
    const { userId, role } = verifyJWT(token); // need to add role later
    req.user = { userId, role };
    next();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("invalid authorization");
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "Admin") throw new UnauthorizedError("Not Authorised");
    next();
  } catch (error) {
    next(error);
  }
};

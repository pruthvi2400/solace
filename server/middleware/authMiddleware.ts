import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorResponse } from "../utils/errorResponse";
import User from "../models/User";

interface CustomRequest extends Request {
  user?: { id: string };
}

// Protect routes
export const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("No user found with this ID", 404));
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("Not authorized to access this route (no user info)", 403));
    }

    // In a real application, you would fetch user roles from the database
    // For now, we'll assume the user object includes roles if it were extended
    // const user = await User.findById(req.user.id); // Re-fetch user to get roles if not already populated
    // if (!user || !roles.includes(user.role)) {
    //   return next(new ErrorResponse(`User role ${user?.role} is not authorized to access this route`, 403));
    // }

    next();
  };
};

import { Request, Response, NextFunction } from "express";
// Use the same custom request type that includes the authenticated user id
interface CustomRequest extends Request {
  user?: { id: string };
}
import { UserState } from "../models/UserState";
import { DEFAULT_STATE } from "../config/defaultState";

/**
 * Get the state for the authenticated user. If a UserState document does not exist,
 * it will be created with DEFAULT_STATE.
 */
export const getState = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    let userState = await UserState.findOne({ user: userId });
    if (!userState) {
      userState = await UserState.create({ user: userId, ...DEFAULT_STATE });
    }
      // Return the state object directly without wrapping it in a 'state' property
      res.json(userState);
  } catch (err) {
    next(err);
  }
};

/**
 * Update the onboarding and privacy fields for the authenticated user.
 * The request body may contain partial onboarding or privacy objects.
 */
export const updateState = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    let userState = await UserState.findOne({ user: userId });
    if (!userState) {
      userState = await UserState.create({ user: userId, ...DEFAULT_STATE });
    }

    // Merge incoming fields with existing ones, preserving defaults for missing keys
    const { onboarding = {}, privacy = {} } = req.body;
    userState.onboarding = { ...DEFAULT_STATE.onboarding, ...userState.onboarding, ...onboarding };
    userState.privacy = { ...DEFAULT_STATE.privacy, ...userState.privacy, ...privacy };

    await userState.save();
      // Return the updated state directly, matching the expected frontend shape
      res.json(userState);
  } catch (err) {
    next(err);
  }
};

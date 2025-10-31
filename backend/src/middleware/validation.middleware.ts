import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { sendError } from "@/utils/response.util";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error: ValidationError) => error.msg);
    return sendError(res, "Validation failed", 400, errorMessages.join(", "));
  }

  next();
};

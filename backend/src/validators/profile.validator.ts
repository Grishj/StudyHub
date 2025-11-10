import { body, param } from "express-validator";

export const updateProfileValidator = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage("Invalid phone number format"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error("Invalid age");
      }
      return true;
    }),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address must not exceed 200 characters"),

  body("targetExam")
    .optional()
    .trim()
    .isIn(["NRB", "NTC", "NEA", "Federal"])
    .withMessage("Invalid target exam"),
];

export const updateAvatarValidator = [
  body("avatar")
    .notEmpty()
    .withMessage("Avatar URL is required")
    .isURL()
    .withMessage("Invalid avatar URL"),
];

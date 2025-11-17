import { body, validationResult } from "express-validator";
import { BadRequestError } from "../errors/customErrors.js";
import User from "../models/User.js";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

//Auth validation
export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required"),
  body("clientId")
    .notEmpty()
    .withMessage("Client Id is required")
    .custom(async (clientId) => {
      const user = await User.findOne({ clientId: clientId });
      if (user) throw new BadRequestError("Client Id already exists");
    }),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format")
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) throw new BadRequestError("Email already exists");
    }),
  body("password").notEmpty().withMessage("Password field is required"),
  body("address").notEmpty().withMessage("Address is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format"),
  body("password").notEmpty().withMessage("Password field is required"),
]);

export const validateForgotPassword = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format"),
]);

export const validateVerifyOTP = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format"),
  body("code").notEmpty().withMessage("Code is required"),
]);

export const validateResetPassword = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format"),
  body("code").notEmpty().withMessage("Code is required"),
  body("password").notEmpty().withMessage("Password field is required"),
]);

//USER VALIDATION

export const validateUpdateProfile = withValidationErrors([
  body("firstName").notEmpty().withMessage("First Name is required"),
  body("lastName").notEmpty().withMessage("Last Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email format")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && user._id.toString() !== req.user.userId.toString())
        throw new BadRequestError("Email already exists");
    }),
  body("phone").notEmpty().withMessage("Phone Number is required"),
  body("company").notEmpty().withMessage("company Name is required"),
]);

export const validateUpdateAddress = withValidationErrors([
  body("street").notEmpty().withMessage("Street is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("zip").notEmpty().withMessage("Zip is required"),
  body("country").notEmpty().withMessage("Country is required"),
]);

//MINER VALIDATION

export const validateAddMiner = withValidationErrors([
  body("client")
    .notEmpty()
    .withMessage("Client is required")
    .isMongoId()
    .withMessage("Client should be Proper mongodb Id"),
  body("workerId").notEmpty().withMessage("Worker Id is required"),
  body("serialNumber").notEmpty().withMessage("Serial Number is required"),
  body("model").notEmpty().withMessage("Model is required"),
  body("status").notEmpty().withMessage("Status is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("warranty").notEmpty().withMessage("Warranty is required"),
  body("poolAddress").notEmpty().withMessage("Pool Address is required"),
  body("connectionDate").notEmpty().withMessage("Connection Date is required"),
  body("serviceProvider")
    .notEmpty()
    .withMessage("Service Provider is required"),
  body("hashRate").notEmpty().withMessage("Hash Rate is required"),
  body("power").notEmpty().withMessage("power is required"),
  body("macAddress").notEmpty().withMessage("Mac Address is required"),
]);

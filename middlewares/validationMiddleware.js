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
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isMongoId()
    .withMessage("Location must be in MongoDB ID"),
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

//Issues Validation
export const validateAddIssueType = withValidationErrors([
  body("issueType").notEmpty().withMessage("Issue Type is required"),
]);

export const validateEditIssueType = withValidationErrors([
  body("issueType").notEmpty().withMessage("Issue Type is required"),
  body("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Invalid Id"),
]);

export const validateAddIssue = withValidationErrors([
  body("issue")
    .notEmpty()
    .withMessage("Issue is required")
    .isMongoId()
    .withMessage("Invalid Issue Id"),
  body("miner")
    .notEmpty()
    .withMessage("miner is required")
    .isMongoId()
    .withMessage("Invalid miner Id"),
  body("user")
    .notEmpty()
    .withMessage("user is required")
    .isMongoId()
    .withMessage("Invalid user Id"),
  body("workerAddress").notEmpty().withMessage("Worker Address is required"),
  body("offline").notEmpty().withMessage("Is Offline is required"),
]);

export const validateAddIssueByClient = withValidationErrors([
  body("issue")
    .notEmpty()
    .withMessage("Issue is required")
    .isMongoId()
    .withMessage("Invalid Issue Id"),
  body("miner")
    .notEmpty()
    .withMessage("miner is required")
    .isMongoId()
    .withMessage("Invalid miner Id"),
  body("workerAddress").notEmpty().withMessage("Worker Address is required"),
  body("description").notEmpty().withMessage("Description is required"),
]);

export const validatePoolChangeRequest = withValidationErrors([
  body("miner")
    .notEmpty()
    .withMessage("Unable to access the current miner")
    .isMongoId()
    .withMessage("Invalid miner Id"),
  body("workerAddress")
    .notEmpty()
    .withMessage("Unable to access current workerId"),
  body("pool").notEmpty().withMessage("New Pool id is required"),
  body("worker").notEmpty().withMessage("New Worker Address is required"),
]);

export const validateStatusChange = withValidationErrors([
  body("status").notEmpty().withMessage("Status is required"),
]);

export const validateDahabReminder = withValidationErrors([
  body("issue").notEmpty().withMessage("Issue is required"),
  body("issueId")
    .notEmpty()
    .withMessage("Issue Id is required")
    .isMongoId()
    .withMessage("Issue Id must be in MongoId"),
  body("model").notEmpty().withMessage("Model is required"),
  body("serialNumber").notEmpty().withMessage("Serial Number is required"),
  body("serviceProvider")
    .notEmpty()
    .withMessage("Service provider is required"),
]);

export const validateSendResponse = withValidationErrors([
  body("message").notEmpty().withMessage("Message is required"),
  body("issueId")
    .notEmpty()
    .withMessage("Issue Id is required")
    .isMongoId()
    .withMessage("Issue Id needs to be MoongoId"),
]);

//ADMIN CLIENT VALIDATION
export const validateAddInternalNote = withValidationErrors([
  body("note").notEmpty().withMessage("Note is required"),
  body("user")
    .notEmpty()
    .withMessage("User is required")
    .isMongoId()
    .withMessage("User must be in MongoDB Id format"),
]);

//AGREEMENT VALIDATION
export const validateSendAgreement = withValidationErrors([
  body("type").notEmpty().withMessage("Type is required"),
  body("user")
    .notEmpty()
    .withMessage("User is required")
    .isMongoId()
    .withMessage("User must be in MongoDB Id format"),
]);

export const validateSignAgreement = withValidationErrors([
  body("agreementId")
    .notEmpty()
    .withMessage("Agreement Id is required")
    .isMongoId()
    .withMessage("Invalid Agreement Id"),
  body("signature").notEmpty().withMessage("Signature is required"),
]);

//MINING FARM
export const validateAddMiningFarm = withValidationErrors([
  body("farm").notEmpty().withMessage("Farm Name is required"),
  body("capacity").notEmpty().withMessage("Capacity is required"),
]);

export const validateUpdateMiningFarm = withValidationErrors([
  body("farm").notEmpty().withMessage("Farm Name is required"),
  body("capacity").notEmpty().withMessage("Capacity is required"),
  body("farmId").notEmpty().withMessage("Farm Id is required"),
]);

//Warranty Validation
export const validateUpdateWarranty = withValidationErrors([
  body("type").notEmpty().withMessage("Warranty type is required"),
  body("startDate").notEmpty().withMessage("Start Date is required"),
  body("endDate").notEmpty().withMessage("End Date is required"),
  body("warrantyId")
    .notEmpty()
    .withMessage("Warranty Id is required")
    .isMongoId()
    .withMessage("Invalid Warranty Id"),
]);

//SERVICE PROVIDER
export const validateRecieveMessage = withValidationErrors([
  body("issueId").notEmpty().withMessage("Issue ID is required"),
  body("message").notEmpty().withMessage("message is required"),
  body("serviceProvider")
    .notEmpty()
    .withMessage("Service Provider is required"),
]);

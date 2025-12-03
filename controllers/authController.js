import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Agreement from "../models/Agreement.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createJWT } from "../utils/jwtUtils.js";
import { sendMail, transporter } from "../utils/nodeMailer.js";
import jwt from "jsonwebtoken";

export const registerClient = async (req, res) => {
  try {
    const { name, clientId, email, password, address, isAgreement } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      clientName: name,
      firstName: name,
      clientId: clientId,
      email: email.toLowerCase(),
      password: hashedPassword,
      address: {
        street: address,
      },
    });
    if (isAgreement) {
      const agreement = await Agreement.create({
        agreementType: "Mining",
        user: user._id,
        issuedOn: new Date(),
        content: "Content 1",
      });
      user.miningAgreement = agreement._id;
      await user.save();
    }
    res.status(200).json({ message: "success", user });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!user) throw new NotFoundError("No user found");
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) throw new BadRequestError("Invalid Credentials");
    const token = createJWT({ userId: user._id, role: user.role });
    const tenDay = 1000 * 60 * 60 * 24 * 10;
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + tenDay),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (!user) throw new NotFoundError("No user found");
    const code = Math.floor(1000 + Math.random() * 9000);
    user.verification = code.toString();
    const mailOptions = {
      from: {
        name: "Intermine",
        address: process.env.NODEMAILER_EMAIL,
      },
      to: user.email,
      subject: "Forgot Password",
      text: `We recieved a request for password reset. Please enter the verification code given. Your verification code is ${code}`,
    };
    await sendMail(transporter, mailOptions);
    await user.save();
    res.status(200).json({ message: "Verification code sent to mail" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { code, email } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
    });
    if (!user) throw new NotFoundError("No user found");
    if (user.verification.toString() !== code.toString())
      throw new BadRequestError("Invalid verification code");
    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, code, email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError("No user found");
    if (user.verification.toString() !== code.toString())
      throw new BadRequestError("Something went wrong with the verification");
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been resetted" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = jwt.sign({ userId: "logout" }, process.env.JWT_SECRET, {
      expiresIn: "1s",
    });
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "successfully logged out" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//update Admin settings
export const updateAdmninSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) throw new NotFoundError("No user found");
    const { companyName, companyAddress, email } = req.body;
    if (email && email !== "") {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user.userId.toString()
      )
        throw new BadRequestError("email already exists");
    }

    if (companyName && companyName !== "") {
      user.companyName = companyName;
    }
    if (companyAddress && companyAddress !== "") {
      user.address = { ...(user.address || {}), street: companyAddress };
    }
    if (email && email !== "") {
      user.email = email.toLowerCase();
    }

    await user.save();
    res.status(200).json({ message: "updated" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

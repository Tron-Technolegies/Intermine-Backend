import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Agreement from "../models/Agreement.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { createJWT } from "../utils/jwtUtils.js";

export const registerClient = async (req, res) => {
  try {
    const { name, clientId, email, password, address, isAgreement } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      clientName: name,
      clientId: clientId,
      email: email,
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
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) throw new NotFoundError("No user found");
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) throw new BadRequestError("Invalid Credentials");
    const token = createJWT({ userId: user._id });
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

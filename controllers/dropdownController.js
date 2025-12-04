import User from "../models/User.js";

export const getAllUsersDropdown = async (req, res) => {
  try {
    const users = await User.find({ role: "Client" })
      .select("clientName clientId")
      .lean();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

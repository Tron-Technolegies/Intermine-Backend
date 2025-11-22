import { NotFoundError } from "../errors/customErrors.js";
import Issue from "../models/Issue.js";
import Miner from "../models/Miner.js";
import User from "../models/User.js";

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) throw new NotFoundError("No user has been found");
    res.status(200).json(user);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) throw new NotFoundError("No user has been found");
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.companyName = company;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const updateUserAddress = async (req, res) => {
  try {
    const { street, city, state, zip, country } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) throw new NotFoundError("No user found");
    user.address.street = street;
    user.address.city = city;
    user.address.state = state;
    user.address.zip = zip;
    user.address.country = country;
    await user.save();
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get User stats for dashboard
export const getUserStats = async (req, res) => {
  try {
    const miners = await Miner.find({ client: req.user.userId });
    const totalMiners = miners.length;
    const totalHashRate = miners.reduce(
      (sum, item) => sum + (item.hashRate || 0),
      0
    );
    const totalPower = miners.reduce((sum, item) => sum + (item.power || 0), 0);
    const onlineMiners = miners.filter((item) => item.status === "online");
    const onlineHash = onlineMiners.reduce(
      (sum, item) => sum + (item.hashRate || 0),
      0
    );
    const onlinePower = onlineMiners.reduce(
      (sum, item) => sum + (item.power || 0),
      0
    );
    const offlineMiners = miners.filter((item) => item.status === "offline");
    const offlineHash = offlineMiners.reduce(
      (sum, item) => sum + (item.hashRate || 0),
      0
    );
    const offlinePower = offlineMiners.reduce(
      (sum, item) => sum + (item.power || 0),
      0
    );
    const repairs = await Issue.countDocuments({
      user: req.user.userId,
      type: "repair",
    });
    res.status(200).json({
      totalMiners,
      totalHashRate,
      totalPower,
      onlineHash,
      onlinePower,
      repairs,
      offlineHash,
      offlinePower,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

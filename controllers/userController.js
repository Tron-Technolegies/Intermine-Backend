import { NotFoundError } from "../errors/customErrors.js";
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

export const getAllClients = async (req, res) => {
  try {
    const { currentPage, query, status } = req.query;
    const queryObject = {
      role: "Client",
    };
    if (query && query !== "") {
      queryObject.$or = [
        { clientName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { companyName: { $regex: query, $options: "i" } },
      ];
    }
    if (status && status !== "ALL") {
      queryObject.status = status;
    }
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const clients = await User.find(queryObject)
      .populate("owned", "power hashRate status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    if (clients.length < 1) throw new NotFoundError("No Clients found");
    const totalClients = await User.countDocuments(queryObject);
    const totalPages = Math.ceil(totalClients / limit);
    res.status(200).json({ clients, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

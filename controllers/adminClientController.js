import { NotFoundError } from "../errors/customErrors.js";
import User from "../models/User.js";

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

export const getSingleClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await User.findById(id).populate("owned");
    if (!client) throw new NotFoundError("No client found");
    res.status(200).json(client);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//add note for client

export const addClientNote = async (req, res) => {
  try {
    const { note, user } = req.body;
    const client = await User.findById(user);
    if (!client) throw new NotFoundError("No user found");
    client.internalNote.push(note);
    await client.save();
    res.status(200).json({ message: "Note added successfully", client });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

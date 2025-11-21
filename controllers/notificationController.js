import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Notification from "../models/Notification.js";

//Get All Notifications
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      client: req.user.userId,
      status: "unread",
      isForAdmin: false,
    }).populate("miner", "model workerId location serviceProvider");
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//clear one Notification
export const clearSingleNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) throw new NotFoundError("No notification found");
    if (!notification.isForAdmin) {
      if (req.user.userId.toString() !== notification.client.toString())
        throw new BadRequestError("Not Allowed to do this operation");
    }
    notification.status = "read";
    await notification.save();
    res.status(200).json({ message: "Cleared", notification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//clear all notification
export const clearAllNotificationByClient = async (req, res) => {
  try {
    const notifications = await Notification.countDocuments({
      client: req.user.userId,
      status: "unread",
      isForAdmin: false,
    });
    if (notifications === 0)
      throw new NotFoundError("No unread notifications found");
    await Notification.updateMany(
      {
        client: req.user.userId,
        status: "unread",
        isForAdmin: false,
      },
      { $set: { status: "read" } }
    );
    res.status(200).json({ message: "Notifications cleared", notifications });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get All admin Notifications
export const getAllAdminNotification = async (req, res) => {
  try {
    const { currentPage, status, query } = req.query;
    const matchStage = { isForAdmin: true };
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    if (status && status !== "ALL") {
      matchStage.status = status;
    }
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query, "i");
      matchStage.$or = [
        { problem: searchRegex },
        { "client.clientName": searchRegex },
        { "miner.model": searchRegex },
        { "miner.workerId": searchRegex },
      ];
    }
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          let: { clientId: "$client" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$clientId"] } } },
            { $project: { clientName: 1, clientId: 1 } },
          ],
          as: "client",
        },
      },
      { $unwind: "$client" },
      {
        $lookup: {
          from: "miners",
          let: { minerId: "$miner" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$minerId"] } } },
            {
              $project: {
                model: 1,
                workerId: 1,
                location: 1,
                serviceProvider: 1,
              },
            },
          ],
          as: "miner",
        },
      },
      { $unwind: "$miner" },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const notifications = await Notification.aggregate(pipeline);
    if (notifications.length < 1)
      throw new NotFoundError("No notifications found");
    const countPipeLine = [...pipeline.slice(0, -2), { $count: "total" }];
    const countResult = await Notification.aggregate(countPipeLine);
    const totalNotifications = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalNotifications / limit);
    res.status(200).json({ notifications, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//mark all as read by admin
export const markAllAsReadByAdmin = async (req, res) => {
  try {
    const notifications = await Notification.countDocuments({
      isForAdmin: true,
      status: "unread",
    });
    if (notifications === 0)
      throw new NotFoundError("No unread notifications found");
    await Notification.updateMany(
      { isForAdmin: true, status: "unread" },
      { $set: { status: "read" } }
    );
    res.status(200).json({ message: "cleared", notifications });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

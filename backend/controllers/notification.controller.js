import Notification from "../models/notification.model.js"
export const getNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        // Find all notifications for the user and populate 'from' field with 'username' and 'profileImg'
        const notifications = await Notification.find({ to: userId }).populate({
            path: 'from',
            select: 'username profileImg'
        });

        // Mark all notifications for the user as read
        await Notification.updateMany({ to: userId }, { read: true });

        // Send the notifications back to the client
        res.status(200).json(notifications);

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in getNotifications function", error);
    }
};

export const deleteNotifications = async(req, res) => {
    try {
        const userId = req.user._id;

        // Delete all notifications for the user
        await Notification.deleteMany({ to: userId });

        // Send a success message back to the client
        res.status(200).json({ message: "Notifications deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in deleteNotifications function", error);
    }
};

export const deleteOneNotifications = async(req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        // Find the notification by its ID
        const notification = await Notification.findById(notificationId);

        // If notification not found, send a 404 error
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        // Check if the user is authorized to delete this notification
        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this notification" });
        }

        // Delete the notification
        await Notification.findByIdAndDelete(notificationId);

        // Send a success message back to the client
        res.status(200).json({ message: "Notification deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log("Error in deleteOneNotifications function", error);
    }
};

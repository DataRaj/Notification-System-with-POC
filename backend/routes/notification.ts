// routes/notifications.js
import express from 'express';

const router = express.Router();

// Get user's notifications
router.get('/user/:userId', async (req, res) => {
  try {
    const { notification } = req.app.locals.services;
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await notification.getNotifications(
      userId, 
      parseInt(page as string) || 1, 
      parseInt(limit as string) || 20
    );

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const { notification } = req.app.locals.services;
    const { userId } = req.params;

    const count = await notification.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notification } = req.app.locals.services;
    const { notificationId } = req.params;

    const updatedNotification = await notification.markAsRead(notificationId);

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const { notification } = req.app.locals.services;
    const { userId } = req.params;

    const result = await notification.markAllAsRead(userId);

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.count 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

export default router;
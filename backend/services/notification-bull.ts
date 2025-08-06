// services/notification.service.js
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  prisma: any;
    io: any;
    redis: any;
    notificationQueue: Queue<any, any, string, any, any, string>;
  constructor(prisma, io, redis) {
    this.prisma = prisma;
    this.io = io;
    this.redis = redis;
    this.notificationQueue = new Queue('notifications', { 
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    });
  }

  async queueNotification(jobData) {
    try {
      const job = await this.notificationQueue.add('processNotification', jobData, {
        priority: this.getPriority(jobData.type),
      });
      console.log(`Notification job queued: ${job.id}`);
      return job;
    } catch (error) {
      console.error('Error queuing notification:', error);
      throw error;
    }
  }

  async processNotification(jobData) {
    const { type, userId, data } = jobData;

    try {
      switch (type) {
        case 'FOLLOW':
          return await this.handleFollowNotification(userId, data);
        case 'POST':
          return await this.handlePostNotification(userId, data);
        case 'BULK_POST':
          return await this.handleBulkPostNotification(data);
        default:
          console.warn(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      throw error;
    }
  }

  async handleFollowNotification(userId, data) {
    const { followerId, followerUsername } = data;

    // Create notification in database
    const notification = await this.prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: userId,
        type: 'FOLLOW',
        title: 'New Follower',
        message: `${followerUsername} started following you`,
        data: JSON.stringify({ followerId, followerUsername })
      }
    });

    // Send real-time notification
    this.sendRealTimeNotification(userId, notification);

    return notification;
  }

  async handlePostNotification(userId, data) {
    const { postId, authorId, authorUsername, title } = data;

    const notification = await this.prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: userId,
        type: 'POST',
        title: 'New Post',
        message: `${authorUsername} created a new post: ${title}`,
        data: JSON.stringify({ postId, authorId, authorUsername })
      }
    });

    this.sendRealTimeNotification(userId, notification);

    return notification;
  }

  async handleBulkPostNotification(data) {
    const { postId, authorId, authorUsername, title, followerIds } = data;

    // Create notifications in batch
    const notifications = followerIds.map(followerId => ({
      id: uuidv4(),
      userId: followerId,
      type: 'POST',
      title: 'New Post',
      message: `${authorUsername} created a new post: ${title}`,
      data: JSON.stringify({ postId, authorId, authorUsername })
    }));

    // Batch insert notifications
    await this.prisma.notification.createMany({
      data: notifications
    });

    // Send real-time notifications to all followers
    notifications.forEach(notification => {
      this.sendRealTimeNotification(notification.userId, notification);
    });

    return notifications;
  }

  sendRealTimeNotification(userId, notification) {
    try {
      this.io.to(userId).emit('notification', notification);
      console.log(`Real-time notification sent to user: ${userId}`);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  getPriority(type) {
    const priorities = {
      'FOLLOW': 1,
      'POST': 2,
      'LIKE': 3,
      'COMMENT': 1
    };
    return priorities[type] || 5;
  }

  async getNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
  }

  async markAsRead(notificationId) {
    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  async markAllAsRead(userId) {
    return await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  async getUnreadCount(userId) {
    return await this.prisma.notification.count({
      where: { userId, read: false }
    });
  }
}
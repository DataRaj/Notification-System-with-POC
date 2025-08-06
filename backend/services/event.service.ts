// services/event.service.js
export class EventService {
  notificationService: any;
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  async emitFollowEvent(userId, followerId, followerUsername) {
    try {
      await this.notificationService.queueNotification({
        type: 'FOLLOW',
        userId,
        data: {
          followerId,
          followerUsername
        }
      });
    } catch (error) {
      console.error('Error emitting follow event:', error);
      throw error;
    }
  }

  async emitPostEvent(postId, authorId, authorUsername, title, followerIds) {
    try {
      // For bulk notifications, use a single job to handle all followers
      if (followerIds.length > 0) {
        await this.notificationService.queueNotification({
          type: 'BULK_POST',
          data: {
            postId,
            authorId,
            authorUsername,
            title,
            followerIds
          }
        });
      }
    } catch (error) {
      console.error('Error emitting post event:', error);
      throw error;
    }
  }

  async emitLikeEvent(postId, likerId, likerUsername, postAuthorId) {
    try {
      await this.notificationService.queueNotification({
        type: 'LIKE',
        userId: postAuthorId,
        data: {
          postId,
          likerId,
          likerUsername
        }
      });
    } catch (error) {
      console.error('Error emitting like event:', error);
      throw error;
    }
  }

  async emitCommentEvent(postId, commenterId, commenterUsername, postAuthorId, comment) {
    try {
      await this.notificationService.queueNotification({
        type: 'COMMENT',
        userId: postAuthorId,
        data: {
          postId,
          commenterId,
          commenterUsername,
          comment
        }
      });
    } catch (error) {
      console.error('Error emitting comment event:', error);
      throw error;
    }
  }
}
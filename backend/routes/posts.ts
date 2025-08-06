// routes/posts.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { prisma, event } = req.app.locals.services;
    const { userId, title, content } = req.body;

    // Create the post
    const post = await prisma.post.create({
      data: {
        id: uuidv4(),
        userId,
        title,
        content
      }
    });

    // Get user details and followers in parallel
    const [user, followers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      }),
      prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true }
      })
    ]);

    // Extract follower IDs
    const followerIds = followers.map(follow => follow.followerId);

    // Emit post event (this will queue notifications for all followers)
    if (followerIds.length > 0) {
      await event.emitPostEvent(
        post.id,
        userId,
        user?.username,
        title,
        followerIds
      );
    }

    res.json({ 
      post, 
      notificationsSent: followerIds.length,
      message: `Post created and ${followerIds.length} notifications queued`
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Delete a post
router.delete('/:postId', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { postId } = req.params;
    const { userId } = req.body; // User requesting deletion

    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
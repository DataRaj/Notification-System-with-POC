// routes/users.js
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { username, email } = req.body;
    
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        email
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Follow a user
router.post('/:userId/follow', async (req, res) => {
  try {
    const { prisma, event } = req.app.locals.services;
    const { userId } = req.params;
    const { followerId } = req.body;

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        id: uuidv4(),
        followerId,
        followingId: userId
      }
    });

    // Get follower details
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true }
    });

    // Emit follow event (this will queue the notification)
    await event.emitFollowEvent(userId, followerId, follower?.username);

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:userId/follow', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { userId } = req.params;
    const { followerId } = req.body;

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's following list
router.get('/:userId/following', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { userId } = req.params;
    
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(following.map(f => f.following));
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ error: 'Failed to fetch following list' });
  }
});

// Get user's followers list
router.get('/:userId/followers', async (req, res) => {
  try {
    const { prisma } = req.app.locals.services;
    const { userId } = req.params;
    
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(followers.map(f => f.follower));
  } catch (error) {
    console.error('Error fetching followers list:', error);
    res.status(500).json({ error: 'Failed to fetch followers list' });
  }
});

export default router;
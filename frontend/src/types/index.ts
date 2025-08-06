export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'FOLLOW' | 'POST' | 'LIKE' | 'COMMENT';
  title: string;
  message: string;
  data?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationData {
  followerId?: string;
  followerUsername?: string;
  postId?: string;
  authorId?: string;
  authorUsername?: string;
}

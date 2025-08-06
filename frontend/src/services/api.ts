import { User, Post, Notification } from '@/types';

// Use environment variable or fallback to localhost
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

class ApiService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createUser(userData: { username: string; email: string }): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async followUser(userId: string, followerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ followerId }),
    });
  }

  async unfollowUser(userId: string, followerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/follow`, {
      method: 'DELETE',
      body: JSON.stringify({ followerId }),
    });
  }

  async getUserFollowing(userId: string): Promise<User[]> {
    return this.request<User[]>(`/users/${userId}/following`);
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return this.request<Post[]>('/posts');
  }

  async createPost(postData: { userId: string; title: string; content: string }): Promise<{ post: Post; notificationsSent: number }> {
    return this.request<{ post: Post; notificationsSent: number }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.request<Notification[]>(`/users/${userId}/notifications`);
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }
}

export const apiService = new ApiService();

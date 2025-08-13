// Environment-aware API configuration
import { API_BASE_URL, isDevelopment } from '@/config';

console.log('🌐 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  apiUrl: API_BASE_URL,
  hostname: window.location.hostname,
  port: window.location.port
});

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  }

  async register(userData: { email: string; password: string; full_name: string; phone?: string; address?: string; role?: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return response.json();
  }

  // Chat endpoints
  async getChatRooms() {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }
    
    return response.json();
  }

  async getChatMessages(roomId: string) {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat messages');
    }
    
    return response.json();
  }

  async getChatRoomDetails(roomId: string) {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat room details');
    }
    
    return response.json();
  }

  async sendMessage(roomId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
    
    return response.json();
  }

  async markMessageAsRead(roomId: string) {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/read`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark messages as read');
    }
    
    return response.json();
  }

  async getUnreadCount() {
    const response = await fetch(`${API_BASE_URL}/chat/unread-count`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    return response.json();
  }

  // Booking endpoints
  async getBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    return response.json();
  }

  async createMovingBooking(bookingData: any) {
    const response = await fetch(`${API_BASE_URL}/bookings/moving`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create moving booking');
    }
    
    return response.json();
  }

  async createDisposalBooking(bookingData: any) {
    const response = await fetch(`${API_BASE_URL}/bookings/disposal`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create disposal booking');
    }
    
    return response.json();
  }

  async createTransportBooking(bookingData: any) {
    const response = await fetch(`${API_BASE_URL}/bookings/transport`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transport booking');
    }
    
    return response.json();
  }

  // Company endpoints
  async getAllCompanies() {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    
    return response.json();
  }

  async createCompanyProfile(companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create company profile');
    }
    
    return response.json();
  }

  // Profile endpoints
  async updateUserProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return response.json();
  }

  // Quote/Invoice endpoints
  async getQuoteDocuments() {
    const response = await fetch(`${API_BASE_URL}/quotes`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote documents');
    }
    
    return response.json();
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    
    return response.json();
  }

  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin users');
    }
    
    return response.json();
  }

  async getAdminCompanies() {
    const response = await fetch(`${API_BASE_URL}/admin/companies`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin companies');
    }
    
    return response.json();
  }

  async getAdminBookings() {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin bookings');
    }
    
    return response.json();
  }

  async getAdminDisposalBookings() {
    const response = await fetch(`${API_BASE_URL}/admin/disposal-bookings`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin disposal bookings');
    }
    
    return response.json();
  }

  async getAdminTransportBookings() {
    const response = await fetch(`${API_BASE_URL}/admin/transport-bookings`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin transport bookings');
    }
    
    return response.json();
  }

  async getAdminInvoices() {
    const response = await fetch(`${API_BASE_URL}/admin/invoices`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin invoices');
    }
    
    return response.json();
  }

  async getAdminBookingsByType(type: string) {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${type}`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch admin ${type} bookings`);
    }
    
    return response.json();
  }

  async updateBookingStatus(bookingType: string, bookingId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingType}/${bookingId}/status`, {
      method: 'PATCH',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update ${bookingType} booking status`);
    }
    
    return response.json();
  }

  async getAdminChatRooms() {
    const response = await fetch(`${API_BASE_URL}/admin/chat/rooms`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin chat rooms');
    }
    
    return response.json();
  }

  // Company dashboard endpoints
  async getCompanyBookings() {
    const response = await fetch(`${API_BASE_URL}/company/bookings`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company bookings');
    }
    
    return response.json();
  }

  async getCompanyChatRooms() {
    const response = await fetch(`${API_BASE_URL}/company/chat-rooms`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company chat rooms');
    }
    
    return response.json();
  }

  async getCompanyInvoices() {
    const response = await fetch(`${API_BASE_URL}/company/invoices`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch company invoices');
    }
    
    return response.json();
  }

  async approveCompanyBooking(bookingId: string, bookingType: string) {
    const response = await fetch(`${API_BASE_URL}/company/bookings/${bookingId}/approve`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve booking');
    }
    
    return response.json();
  }

  async rejectCompanyBooking(bookingId: string, bookingType: string) {
    const response = await fetch(`${API_BASE_URL}/company/bookings/${bookingId}/reject`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject booking');
    }
    
    return response.json();
  }

  async fixCompanyChatRooms() {
    const response = await fetch(`${API_BASE_URL}/company/fix-chat-rooms`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fix chat rooms');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();

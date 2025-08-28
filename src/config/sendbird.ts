// SendBird Configuration
export const SENDBIRD_CONFIG = {
  // Get these from your SendBird dashboard
  APP_ID: import.meta.env.VITE_SENDBIRD_APP_ID || '8D3AB381-B5B2-4DAA-B7E8-5309741EABF3',
  API_TOKEN: import.meta.env.VITE_SENDBIRD_API_TOKEN,
  DEBUG: import.meta.env.VITE_SENDBIRD_DEBUG === 'true',
  
  // API endpoints
  API_ENDPOINTS: {
    USERS: `https://api-${import.meta.env.VITE_SENDBIRD_APP_ID || '8D3AB381-B5B2-4DAA-B7E8-5309741EABF3'}.sendbird.com/v3/users`,
    CHANNELS: `https://api-${import.meta.env.VITE_SENDBIRD_APP_ID || '8D3AB381-B5B2-4DAA-B7E8-5309741EABF3'}.sendbird.com/v3/group_channels`,
    MESSAGES: `https://api-${import.meta.env.VITE_SENDBIRD_APP_ID || '8D3AB381-B5B2-4DAA-B7E8-5309741EABF3'}.sendbird.com/v3/group_channels/{channel_url}/messages`
  },
  
  // Platform API configuration
  PLATFORM_API: {
    headers: {
      'Api-Token': import.meta.env.VITE_SENDBIRD_API_TOKEN || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Default user settings
  DEFAULT_USER_SETTINGS: {
    profileUrl: '/default-avatar.png',
    nickname: 'User',
    issueAccessToken: true
  },
  
  // Default channel settings
  DEFAULT_CHANNEL_SETTINGS: {
    name: 'Chat Room',
    coverUrl: '/channel-cover.png',
    data: '',
    customType: 'booking_chat'
  },
  
  // User roles and their display names
  USER_ROLES: {
    user: 'Customer',
    admin: 'Admin Support',
    company: 'Company Representative'
  },
  
  // Avatar fallbacks for different user types
  AVATAR_FALLBACKS: {
    user: '/user-avatar.png',
    admin: '/admin-avatar.png',
    company: '/company-avatar.png'
  },
  
  // Message types
  MESSAGE_TYPES: {
    TEXT: 'MESG',
    FILE: 'FILE',
    ADMIN: 'ADMN'
  }
};

// Helper function to generate consistent SendBird user IDs
export const generateSendBirdUserId = (user: any): string => {
  if (user.role === 'company' && user.companyId) {
    return `company_${user.companyId}`;
  } else if (user.role === 'admin') {
    return `admin_${user.id}`;
  } else {
    return user.id;
  }
};

// Helper function to create SendBird user object
export const createSendBirdUser = (user: any) => {
  const userId = generateSendBirdUserId(user);
  
  return {
    userId,
    nickname: user.full_name || user.email || user.name || 'User',
    profileUrl: user.avatar || SENDBIRD_CONFIG.AVATAR_FALLBACKS[user.role as keyof typeof SENDBIRD_CONFIG.AVATAR_FALLBACKS] || SENDBIRD_CONFIG.DEFAULT_USER_SETTINGS.profileUrl,
    issueAccessToken: true,
    metadata: {
      role: user.role,
      email: user.email,
      companyId: user.companyId,
      userId: user.id
    }
  };
};

// Helper function to build complete channel participant list
export const buildChannelParticipants = (room: any, currentUser: any): string[] => {
  const participants = new Set<string>();
  
  // Always include current user
  participants.add(generateSendBirdUserId(currentUser));
  
  // Include the customer (room.userId)
  if (room.userId) {
    participants.add(room.userId);
  }
  
  // Include company if assigned
  if (room.companyId) {
    participants.add(`company_${room.companyId}`);
  }
  
  // Include admin support for oversight
  if (currentUser.role === 'admin') {
    // Admin can see all chats
    participants.add('admin_support');
  } else if (currentUser.role === 'company') {
    // Company representatives can see their assigned chats
    participants.add('admin_support');
  }
  
  return Array.from(participants);
};

// Helper function to create SendBird channel
export const createSendBirdChannel = (room: any, participants: any[]) => {
  return {
    name: `${room.bookingType} Booking #${room.bookingId}`,
    channelUrl: `booking_${room._id}`,
    coverUrl: SENDBIRD_CONFIG.DEFAULT_CHANNEL_SETTINGS.coverUrl,
    data: JSON.stringify({
      bookingId: room.bookingId,
      bookingType: room.bookingType,
      roomId: room._id
    }),
    customType: 'booking_chat',
    operatorUserIds: participants
      .filter(p => p.role === 'admin')
      .map(p => p.userId),
    userIds: participants.map(p => p.userId)
  };
};

// Helper function to format SendBird message
export const formatSendBirdMessage = (message: any) => {
  return {
    messageId: message.messageId,
    message: message.message,
    sender: {
      userId: message.sender?.userId,
      nickname: message.sender?.nickname,
      profileUrl: message.sender?.profileUrl
    },
    createdAt: message.createdAt,
    messageType: message.messageType,
    data: message.data
  };
};

// SendBird error types and helpers
export interface SendBirdError {
  code: number;
  message: string;
  details?: any;
}

export const SENDBIRD_ERRORS = {
  USER_NOT_FOUND: { code: 400201, message: 'User not found' },
  CHANNEL_NOT_FOUND: { code: 400201, message: 'Channel not found' },
  INVALID_USER_ID: { code: 400400, message: 'Invalid user ID' },
  RATE_LIMIT_EXCEEDED: { code: 429, message: 'Rate limit exceeded' },
  INTERNAL_ERROR: { code: 500, message: 'Internal server error' },
  NETWORK_ERROR: { code: 0, message: 'Network error' }
};

export const parseSendBirdError = (error: any): SendBirdError => {
  if (error.code && error.message) {
    return {
      code: error.code,
      message: error.message,
      details: error
    };
  }
  
  if (error.name === 'NetworkError') {
    return SENDBIRD_ERRORS.NETWORK_ERROR;
  }
  
  return {
    code: 500,
    message: error.message || 'Unknown error occurred',
    details: error
  };
};

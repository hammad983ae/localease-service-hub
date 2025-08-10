// Simple in-memory pub/sub system for real-time messaging
class PubSub {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
    
    console.log(`Subscriber added to channel: ${channel}`);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        console.log(`Subscriber removed from channel: ${channel}`);
        if (callbacks.size === 0) {
          this.subscribers.delete(channel);
          console.log(`Channel ${channel} deleted (no more subscribers)`);
        }
      }
    };
  }

  publish(channel, data) {
    const callbacks = this.subscribers.get(channel);
    console.log(`Publishing to channel: ${channel}`, {
      subscribers: callbacks?.size || 0,
      dataType: typeof data,
      dataId: data?.id || 'unknown'
    });
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
          console.log(`Message delivered to subscriber on channel: ${channel}`);
        } catch (error) {
          console.error('Error in pub/sub callback:', error);
        }
      });
    } else {
      console.log(`No subscribers for channel: ${channel}`);
    }
  }

  // Subscribe to all chat rooms
  subscribeToAllChats(callback) {
    return this.subscribe('chat:*', callback);
  }

  // Subscribe to specific chat room
  subscribeToChat(chatRoomId, callback) {
    const channel = `chat:${chatRoomId}`;
    console.log(`Subscribing to chat room: ${chatRoomId}`);
    return this.subscribe(channel, callback);
  }

  // Publish message to specific chat room
  publishMessage(chatRoomId, message) {
    const channel = `chat:${chatRoomId}`;
    console.log(`Publishing message to chat room: ${chatRoomId}`, {
      messageId: message.id,
      senderId: message.senderId,
      content: message.content.substring(0, 50) + '...'
    });
    this.publish(channel, message);
    
    // Also publish to general chat room updates
    this.publish('CHAT_ROOM_UPDATED', { id: chatRoomId, updatedAt: new Date() });
  }
}

const pubsub = new PubSub();

module.exports = { pubsub }; 
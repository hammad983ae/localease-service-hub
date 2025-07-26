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
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  publish(channel, data) {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in pub/sub callback:', error);
        }
      });
    }
  }

  // Subscribe to all chat rooms
  subscribeToAllChats(callback) {
    return this.subscribe('chat:*', callback);
  }

  // Subscribe to specific chat room
  subscribeToChat(chatRoomId, callback) {
    return this.subscribe(`chat:${chatRoomId}`, callback);
  }

  // Publish message to specific chat room
  publishMessage(chatRoomId, message) {
    this.publish(`chat:${chatRoomId}`, message);
  }
}

const pubsub = new PubSub();

module.exports = { pubsub }; 
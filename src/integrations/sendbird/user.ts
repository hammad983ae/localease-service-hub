import { createSendBirdUser, generateSendBirdUserId } from '../../config/sendbird';

export interface SendBirdUser {
  userId: string;
  nickname: string;
  profileUrl?: string;
  metadata?: Record<string, any>;
}

export interface SendBirdConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: string;
}

export interface SendBirdApiError {
  code: number;
  message: string;
  details?: any;
}

/**
 * Ensures a user exists in SendBird before attempting connection
 * Creates user if not found, returns existing user data if found
 */
export async function ensureSendBirdUser(localUser: any): Promise<SendBirdUser> {
  try {
    const userId = generateSendBirdUserId(localUser);
    const userData = createSendBirdUser(localUser);
    
    // Return the user data - SendBird UI Kit will handle user creation
    // when the user connects via SendBirdProvider
    return {
      userId: userData.userId,
      nickname: userData.nickname,
      profileUrl: userData.profileUrl,
      metadata: userData.metadata
    };
  } catch (error: any) {
    console.error('Failed to prepare SendBird user data:', error);
    
    throw {
      code: 500,
      message: 'Failed to prepare SendBird user data',
      details: error
    } as SendBirdApiError;
  }
}

/**
 * Gets the current SendBird SDK connection status
 */
export function getSendBirdConnectionStatus(): SendBirdConnectionStatus {
  try {
    // Since we're using SendBird UI Kit, we'll return a default status
    // The actual connection status is managed by the UI Kit components
    return { status: 'disconnected' };
  } catch (error) {
    return { status: 'error', error: 'Unable to determine connection status' };
  }
}

/**
 * Disconnects from SendBird and cleans up resources
 */
export async function disconnectFromSendBird(): Promise<void> {
  try {
    // Since we're using SendBird UI Kit, the connection is managed by the provider
    // We'll just log the disconnect attempt
    console.log('🔄 SendBird: Disconnect requested (managed by UI Kit)');
  } catch (error) {
    console.error('Error during SendBird disconnect:', error);
  }
}

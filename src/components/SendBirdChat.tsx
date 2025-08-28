import React, { useState, useEffect } from 'react';
import { SendBirdProvider, useSendbird } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';
import { useAuth } from '../contexts/AuthContext';
import { SENDBIRD_CONFIG } from '../config/sendbird';
import { apiClient } from '../api/client';
import { buildChannelParticipants } from '../config/sendbird';

interface SendBirdChatProps {
  selectedChatRoomId?: string;
  chatRoomId?: string;
  chatRoomData?: any;
}

const SendBirdChatInner: React.FC<SendBirdChatProps> = ({ selectedChatRoomId, chatRoomId, chatRoomData }) => {
  const { user } = useAuth();
  const { state, actions } = useSendbird();
  const { userStore, sdkStore } = state.stores;
  const { user: sendbirdUser } = userStore;
  const { sdk } = sdkStore;
  
  // Try alternative SDK access paths
  const alternativeSdk = (sdkStore as any)?.client || (sdkStore as any)?.chat;
  const finalSdk = sdk || alternativeSdk;
  
  // Try to find GroupChannel through different paths
  const groupChannelModule = 
    finalSdk?.GroupChannel || 
    (sdkStore as any)?.GroupChannel || 
    (sdkStore as any)?.groupChannel ||
    (sdkStore as any)?.modules?.GroupChannel;
  
  // Debug what we found
  console.log('🔍 GroupChannel Module Search:', {
    finalSdkGroupChannel: !!finalSdk?.GroupChannel,
    sdkStoreGroupChannel: !!(sdkStore as any)?.GroupChannel,
    sdkStoreGroupChannelLower: !!(sdkStore as any)?.groupChannel,
    sdkStoreModulesGroupChannel: !!(sdkStore as any)?.modules?.GroupChannel,
    foundModule: !!groupChannelModule,
    moduleType: groupChannelModule ? typeof groupChannelModule : 'undefined'
  });
  
  // Check connection state from the stores
  const connectionStatus = (sdkStore as any)?.connectionStatus;
  const isConnected = connectionStatus === 'OPEN' || connectionStatus === 'CONNECTED';
  const isConnecting = connectionStatus === 'CONNECTING';
  const isDisconnected = connectionStatus === 'CLOSED' || connectionStatus === 'DISCONNECTED';
  
  // Safety check for SendBird context initialization
  // Wait for SDK to have actual modules loaded AND be connected
  // Add a timeout to prevent infinite waiting
  const [initTimeout, setInitTimeout] = useState(false);
  
  // Debug SDK structure
  console.log('🔍 SDK structure debug:', {
    sdkStore: !!sdkStore,
    sdk: !!sdk,
    finalSdk: !!finalSdk,
    sdkKeys: sdk ? Object.keys(sdk) : [],
    finalSdkKeys: finalSdk ? Object.keys(finalSdk) : [],
    groupChannel: finalSdk?.GroupChannel ? Object.keys(finalSdk.GroupChannel) : [],
    userStore: !!userStore,
    sendbirdUser: !!sendbirdUser,
    connectionStatus,
    isConnected,
    isConnecting,
    isDisconnected,
    envAppId: import.meta.env.VITE_SENDBIRD_APP_ID,
    configAppId: SENDBIRD_CONFIG.APP_ID
  });
  
  // Deep debug of SDK store structure
  console.log('🔍 Deep SDK Store Debug:', {
    sdkStoreKeys: sdkStore ? Object.keys(sdkStore) : [],
    sdkStoreValues: sdkStore ? Object.entries(sdkStore).map(([key, value]) => ({
      key,
      type: typeof value,
      hasKeys: value && typeof value === 'object' ? Object.keys(value).length : 0,
      isArray: Array.isArray(value)
    })) : [],
    sdkType: sdk ? typeof sdk : 'undefined',
    sdkConstructor: sdk ? sdk.constructor?.name : 'undefined'
  });
  
  if (!state || !sdkStore || !finalSdk || Object.keys(finalSdk).length === 0 || !groupChannelModule || (!isConnected && !initTimeout)) {
    console.log('🔄 Waiting for SendBird SDK to be ready...', {
      state: !!state,
      sdkStore: !!sdkStore,
      sdk: !!sdk,
      finalSdk: !!finalSdk,
      sdkKeys: sdk ? Object.keys(sdk).length : 0,
      finalSdkKeys: finalSdk ? Object.keys(finalSdk).length : 0,
              groupChannel: !!groupChannelModule,
      sdkStoreKeys: sdkStore ? Object.keys(sdkStore) : [],
      stateKeys: state ? Object.keys(state) : []
    });
    
    // Check if we need to wait for connection
    if (finalSdk && Object.keys(finalSdk).length === 0) {
      console.log('⚠️ Final SDK exists but has no modules - waiting for connection...');
    }
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing SendBird...</p>
          <div className="text-xs text-muted-foreground mt-2">
            Waiting for SDK modules to be ready ({finalSdk ? Object.keys(finalSdk).length : 0} modules loaded)
            <br />
            Connection: {connectionStatus || 'unknown'} - {isConnected ? '✅ Connected' : isConnecting ? '🔄 Connecting' : '❌ Disconnected'}
            <br />
            SDK Store Keys: {sdkStore ? Object.keys(sdkStore).length : 0}
            {initTimeout && (
              <div className="text-orange-500 mt-1">
                ⏰ Timeout reached - attempting to continue anyway
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  const providedRoomId = selectedChatRoomId || chatRoomId;
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<any>(null);
  const [chatState, setChatState] = useState<'initializing' | 'loading_rooms' | 'creating_channel' | 'ready' | 'error'>('initializing');
  const [currentChannelUrl, setCurrentChannelUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Simple effect to test if useEffect is working at all
  useEffect(() => {
    console.log('🔍 Simple effect test - this should run immediately');
    console.log('🔍 Component mounted');
  }, []);
  
  // Handle SendBird connection
  useEffect(() => {
    console.log('🔍 Connection effect triggered:', {
      hasSdk: !!finalSdk,
      sdkKeys: finalSdk ? Object.keys(finalSdk).length : 0,
      hasActions: !!actions,
      hasConnect: !!actions?.connect,
      isConnected,
      isConnecting,
      connectionStatus,
      userStore: !!userStore,
      sendbirdUser: !!sendbirdUser
    });
    
    console.log('🔍 Effect dependencies check:', {
      finalSdk: !!finalSdk,
      actions: !!actions,
      isConnected,
      isConnecting,
      user: !!user,
      connectionStatus: !!connectionStatus,
      userStore: !!userStore,
      sendbirdUser: !!sendbirdUser
    });

    // Try multiple connection strategies
    if (finalSdk && Object.keys(finalSdk).length === 0) {
      console.log('🔄 SDK exists but empty - trying connection strategies...');
      
      // Strategy 1: Try actions.connect
      if (actions?.connect && !isConnected && !isConnecting) {
        console.log('🔄 Strategy 1: Attempting to connect via actions...');
        try {
          actions.connect({
            userId: user.id,
            nickname: user.full_name || user.email,
            profileUrl: user.avatar || '/default-avatar.png'
          });
        } catch (error) {
          console.log('⚠️ Actions connect failed:', error);
        }
      }
      
      // Strategy 2: Check if we need to wait for user store
      if (!sendbirdUser && userStore) {
        console.log('🔄 Strategy 2: Waiting for user store to initialize...');
      }
      
      // Strategy 3: Check if we need to wait for SDK store
      if (sdkStore && Object.keys(sdkStore).length > 0) {
        console.log('🔄 Strategy 3: SDK store has data, checking for modules...');
        console.log('🔍 SDK store keys:', Object.keys(sdkStore));
      }
      
      // Strategy 4: Force re-render after a delay to trigger re-initialization
      if (!isConnected && !isConnecting) {
        console.log('🔄 Strategy 4: Scheduling re-initialization attempt...');
        setTimeout(() => {
          console.log('🔄 Strategy 4: Re-initialization attempt triggered');
          // Force a re-render by updating a state
          setChatState(prev => prev === 'initializing' ? 'loading_rooms' : 'initializing');
        }, 2000);
      }
    }
  }, [finalSdk, actions, isConnected, isConnecting, user.id, user.full_name, user.email, user.avatar, connectionStatus, userStore, sendbirdUser]);
  
  // Timeout effect
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ Initialization timeout reached - forcing continue');
      setInitTimeout(true);
    }, 5000); // 5 second timeout - reduced since we now have proper env vars
    
    return () => clearTimeout(timer);
  }, []);
  
  // Only go into embedded mode if we have actual chat room data to display
  // Having just a roomId in the URL doesn't mean we should hide the sidebar
  const isEmbedded = Boolean(chatRoomData && providedRoomId && providedRoomId !== 'null' && providedRoomId !== '');
  
  // Debug logging for embedded state
  console.log('🔍 Embedded state debug:', {
    selectedChatRoomId,
    chatRoomId,
    providedRoomId,
    chatRoomData: !!chatRoomData,
    isEmbedded,
    roomIdType: typeof providedRoomId
  });
  
  // Simplified connection check - just wait for the user to be ready
  const isUserConnecting = !sendbirdUser;

  // Create or get SendBird channel
  const createOrGetChannel = async (room: any) => {
    // Check if SDK and GroupChannel are available
    if (!finalSdk || !groupChannelModule) {
      console.error('❌ SDK or GroupChannel not available:', { finalSdk: !!finalSdk, groupChannel: !!groupChannelModule });
      setError('SendBird SDK not ready');
      setChatState('error');
      return null;
    }
    
    try {
      setChatState('creating_channel');
      setError(null);
      const channelUrl = `booking_${room._id || room.id}`;
      
      console.log('🔍 Creating channel with URL:', channelUrl);
      console.log('🔍 SDK state:', { finalSdk: !!finalSdk, groupChannel: !!groupChannelModule });
      
      // Try to get existing channel first
      try {
        const existingChannel = await groupChannelModule.getChannel(channelUrl);
        console.log('✅ Found existing channel:', existingChannel.url);
        setCurrentChannelUrl(channelUrl);
        setChatState('ready');
        return existingChannel;
      } catch (error) {
        console.log('Channel not found, creating new one...');
      }
      
      // Build complete participant list
      const participants = buildChannelParticipants(room, user);
      console.log('🔍 Participants for channel:', participants);
      
      // Create new channel using the correct method
      const channelParams = {
        name: `${room.bookingType} Booking #${room.bookingId}`,
        channelUrl: channelUrl,
        data: JSON.stringify({
          bookingId: room.bookingId,
          bookingType: room.bookingType,
          roomId: room._id || room.id
        }),
        customType: 'booking_chat',
        userIds: participants,
        operatorUserIds: user.role === 'admin' ? [sendbirdUser.userId] : ['admin_support']
      };
      
      console.log('🔍 Channel params:', channelParams);
      
      // Try to create channel using SDK
      let channel;
      try {
        channel = await groupChannelModule.createChannel(channelParams);
        console.log('✅ Created new channel using SDK:', channel.url);
      } catch (sdkError) {
        console.warn('⚠️ SDK channel creation failed, trying alternative method:', sdkError);
        
        throw new Error('SDK channel creation failed: ' + sdkError.message);
      }
      
      setCurrentChannelUrl(channelUrl);
      setChatState('ready');
      return channel;
      
    } catch (error) {
      console.error('❌ Failed to create/get channel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat channel';
      setError(errorMessage);
      setChatState('error');
      return null;
    }
  };

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setChatState('loading_rooms');
        let response;
        
        console.log('🔍 API call debug:', { userRole: user?.role });
        
        if (user.role === 'admin') {
          response = await apiClient.getAdminChatRooms();
        } else if (user.role === 'company') {
          response = await apiClient.getCompanyChatRooms();
        } else {
          response = await apiClient.getChatRooms();
        }
        
        const rooms = Array.isArray(response) ? response : (response.chatRooms || []);
        
        // Debug logging to see room structure
        console.log('📋 Raw chat rooms response:', response);
        console.log('🏠 Processed rooms array:', rooms);
        console.log('🔍 Room structure example:', rooms[0]);
        
        // Show all rooms for now - we can add filtering later
        const activeRooms = rooms;
        console.log('✅ All rooms loaded:', activeRooms.length);
        console.log('✅ Active rooms after filtering:', activeRooms);
        console.log('📊 Filtering stats:', {
          total: rooms.length,
          active: activeRooms.length,
          inactive: rooms.length - activeRooms.length
        });
        
        setChatRooms(activeRooms);
        
        if (providedRoomId) {
          const room = activeRooms.find((r: any) => r._id === providedRoomId || r.id === providedRoomId);
          if (room) {
            setSelectedChatRoom(room);
            // Create channel for this room
            await createOrGetChannel(room);
          }
        }
        
        setChatState('ready');
        console.log('✅ Chat state set to ready, rooms loaded:', activeRooms.length);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat rooms';
        setError(errorMessage);
        setChatState('error');
      }
    };

    if (!chatRoomData) {
      fetchChatRooms();
    } else {
      setSelectedChatRoom(chatRoomData);
      createOrGetChannel(chatRoomData);
    }
  }, [providedRoomId, chatRoomData, user.role]);

  // Cleanup effect to reset states
  useEffect(() => {
    return () => {
      setChatState('initializing');
      setError(null);
      setCurrentChannelUrl('');
    };
  }, []);

  // Handle chat room selection
  const handleChatRoomClick = async (room: any) => {
    try {
      setSelectedChatRoom(room);
      setError(null);
      
      // Create or get channel for this room
      const channel = await createOrGetChannel(room);
      if (channel) {
        console.log('✅ Channel ready for room:', room.bookingId);
      }
    } catch (error) {
      console.error('❌ Failed to handle chat room click:', error);
      setError('Failed to open chat room');
    }
  };

  // Show connection status and loading states
  if (isUserConnecting) {
    console.log('🔄 Early return: Connecting state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to SendBird...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (chatState === 'loading_rooms' || chatState === 'creating_channel') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {chatState === 'loading_rooms' ? 'Loading chat rooms...' : 'Creating chat channel...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {!isEmbedded && (
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Chat Rooms</h2>
            <p className="text-sm text-gray-500">
              {chatRooms.length} active conversations
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatRooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No chat rooms available
              </div>
            ) : (
              chatRooms.map((room: any) => (
                <div
                  key={room._id || room.id}
                  onClick={() => handleChatRoomClick(room)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChatRoom?._id === room._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {room.bookingType} Booking
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Booking #{room.bookingId}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground text-lg mb-2">Select a chat room</div>
              <p className="text-sm text-muted-foreground">
                Choose a chat room from the sidebar to start messaging
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {selectedChatRoom ? (
                <>
                  <div className="text-muted-foreground text-lg mb-2">💬 Select a conversation</div>
                  <p className="text-sm text-muted-foreground">
                    Choose a chat room from the sidebar to start messaging
                  </p>
                </>
              ) : (
                <>
                  <div className="text-muted-foreground text-lg mb-2">💬 Select a conversation</div>
                  <p className="text-sm text-muted-foreground">
                    Choose an approved chat room from the sidebar to start messaging
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component that provides the SendBird context
const SendBirdChat: React.FC<SendBirdChatProps> = (props) => {
  const { user } = useAuth();

  // Check if SendBird is properly configured
  if (!SENDBIRD_CONFIG.APP_ID || SENDBIRD_CONFIG.APP_ID === 'YOUR_SENDBIRD_APP_ID') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ SendBird not configured</div>
          <p className="text-muted-foreground mb-2">
            Please set REACT_APP_SENDBIRD_APP_ID in your environment variables
          </p>
          <button 
            onClick={() => window.open('https://dashboard.sendbird.com/', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Get SendBird App ID
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ Please log in</div>
          <p className="text-muted-foreground">You need to be logged in to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <SendBirdProvider
      appId={SENDBIRD_CONFIG.APP_ID}
      userId={user.id}
      nickname={user.full_name || user.email}
      profileUrl={user.avatar || '/default-avatar.png'}
      theme="light"
    >
      <SendBirdChatInner {...props} />
    </SendBirdProvider>
  );
};

export default SendBirdChat;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLScalarType, Kind } = require('graphql');
const GraphQLJSON = require('graphql-type-json');
const { User } = require('../models/User.js');
const { MovingBooking } = require('../models/MovingBooking.js');
const { Company } = require('../models/Company.js');
const { UserProfile } = require('../models/UserProfile.js');
const { DisposalBooking } = require('../models/DisposalBooking.js');
const { TransportBooking } = require('../models/TransportBooking.js');
const { ChatRoom } = require('../models/ChatRoom.js');
const { Message } = require('../models/Message.js');
const { pubsub } = require('../pubsub.js');

const JWT_SECRET = 'your_jwt_secret'; // Should match your main config

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) { return new Date(value); },
    serialize(value) { return value instanceof Date ? value.toISOString() : value; },
    parseLiteral(ast) { return ast.kind === Kind.STRING ? new Date(ast.value) : null; }
  }),
  JSON: GraphQLJSON,
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return await User.findById(user.userId);
    },
    myBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await MovingBooking.find({ userId: user.userId }).sort({ createdAt: -1 });
    },
    booking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await MovingBooking.findOne({ _id: id, userId: user.userId });
    },
    allBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await MovingBooking.find({}).sort({ createdAt: -1 });
    },
    approvedBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await MovingBooking.find({ status: 'approved' }).sort({ createdAt: -1 });
    },
    rejectedBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await MovingBooking.find({ status: 'rejected' }).sort({ createdAt: -1 });
    },
    myProfile: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      let profile = await UserProfile.findOne({ userId: user.userId });
      if (!profile) {
        // Create a blank profile if not exists
        profile = new UserProfile({ userId: user.userId });
        await profile.save();
      }
      return profile;
    },
    allCompanies: async () => {
      return await Company.find({});
    },
    companyBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      // Find the company profile for this user
      const company = await Company.findOne({ userId: user.userId });
      if (!company) throw new Error('Company profile not found');
      // Find all bookings where the company.id matches the booking's company.id
      return await MovingBooking.find({ 'company.id': company._id.toString() }).sort({ createdAt: -1 });
    },
    myDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await DisposalBooking.find({ userId: user.userId }).sort({ createdAt: -1 });
    },
    myTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await TransportBooking.find({ userId: user.userId }).sort({ createdAt: -1 });
    },
    disposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await DisposalBooking.findOne({ _id: id, userId: user.userId });
    },
    transportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await TransportBooking.findOne({ _id: id, userId: user.userId });
    },
    allDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await DisposalBooking.find().sort({ createdAt: -1 });
    },
    approvedDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await DisposalBooking.find({ status: 'approved' }).sort({ createdAt: -1 });
    },
    rejectedDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await DisposalBooking.find({ status: 'rejected' }).sort({ createdAt: -1 });
    },
    allTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await TransportBooking.find().sort({ createdAt: -1 });
    },
    approvedTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await TransportBooking.find({ status: 'approved' }).sort({ createdAt: -1 });
    },
    rejectedTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      return await TransportBooking.find({ status: 'rejected' }).sort({ createdAt: -1 });
    },
    companyDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      const company = await Company.findOne({ userId: user.userId });
      if (!company) throw new Error('Company profile not found');
      
      return await DisposalBooking.find({ 'company.id': company._id.toString() }).sort({ createdAt: -1 });
    },
    companyTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      const company = await Company.findOne({ userId: user.userId });
      if (!company) throw new Error('Company profile not found');
      
      return await TransportBooking.find({ 'company.id': company._id.toString() }).sort({ createdAt: -1 });
    },
    myChatRooms: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await ChatRoom.find({ userId: user.userId, isActive: true }).sort({ updatedAt: -1 });
    },
    companyChatRooms: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      const company = await Company.findOne({ userId: user.userId });
      if (!company) throw new Error('Company profile not found');
      
      return await ChatRoom.find({ companyId: company._id, isActive: true }).sort({ updatedAt: -1 });
    },
    chatRoom: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const chatRoom = await ChatRoom.findById(id);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Check if user has access to this chat room
      const dbUser = await User.findById(user.userId);
      if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
          throw new Error('Not authorized');
        }
      } else {
        if (chatRoom.userId.toString() !== user.userId) {
          throw new Error('Not authorized');
        }
      }
      
      return chatRoom;
    },
    chatMessages: async (_, { chatRoomId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Check if user has access to this chat room
      const dbUser = await User.findById(user.userId);
      if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
          throw new Error('Not authorized');
        }
      } else {
        if (chatRoom.userId.toString() !== user.userId) {
          throw new Error('Not authorized');
        }
      }
      
      return await Message.find({ chatRoomId }).sort({ createdAt: 1 });
    }
  },
  Mutation: {
    register: async (_, { email, password, full_name, phone, address, role }) => {
      console.log('REGISTER mutation args:', { email, password, full_name, phone, address, role });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, full_name, phone, address, role: role || 'user' });
      await user.save();
      console.log('REGISTER created user:', user);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials');
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return { token, user };
    },
    updateProfile: async (_, { full_name, phone, address }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const updated = await User.findByIdAndUpdate(
        user.userId,
        { full_name, phone, address },
        { new: true }
      );
      return updated;
    },
    updateUserProfile: async (_, { full_name, phone, address }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      let profile = await UserProfile.findOne({ userId: user.userId });
      if (!profile) {
        profile = new UserProfile({ userId: user.userId, full_name, phone, address });
      } else {
        if (full_name !== undefined) profile.full_name = full_name;
        if (phone !== undefined) profile.phone = phone;
        if (address !== undefined) profile.address = address;
      }
      await profile.save();
      return profile;
    },
    createMovingBooking: async (
      _,
      { rooms, items, dateTime, dateTimeFlexible, addresses, contact, company },
      { user }
    ) => {
      if (!user) throw new Error('Not authenticated');
      const booking = new MovingBooking({
        userId: user.userId,
        rooms,
        items,
        dateTime,
        dateTimeFlexible,
        addresses,
        contact,
        company
      });
      await booking.save();
      return booking;
    },
    createDisposalBooking: async (_, { serviceType, items, dateTime, dateTimeFlexible, pickupAddress, contact, company }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      // check if the company is already in the database
      
      const booking = new DisposalBooking({
        userId: user.userId,
        serviceType,
        items,
        dateTime,
        dateTimeFlexible,
        pickupAddress,
        contact,
        company
      });
      
      return await booking.save();
    },
    createTransportBooking: async (_, { serviceType, items, dateTime, dateTimeFlexible, pickupLocation, dropoffLocation, contact, company }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const booking = new TransportBooking({
        userId: user.userId,
        serviceType,
        items,
        dateTime,
        dateTimeFlexible,
        pickupLocation,
        dropoffLocation,
        contact,
        company
      });
      
      return await booking.save();
    },
    approveBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await MovingBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      return booking;
    },
    approveDisposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await DisposalBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      return booking;
    },
    approveTransportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await TransportBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      return booking;
    },
    rejectBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await MovingBooking.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      return booking;
    },
    rejectDisposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await DisposalBooking.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      return booking;
    },
    rejectTransportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await TransportBooking.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      return booking;
    },
    companyApproveBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await MovingBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await MovingBooking.findByIdAndUpdate(
        id, 
        { status: 'approved' }, 
        { new: true }
      );
      
      // Create chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'moving',
            userId: updatedBooking.userId,
            companyId: companyProfile._id,
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
      return updatedBooking;
    },
    companyRejectBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await MovingBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await MovingBooking.findByIdAndUpdate(
        id, 
        { status: 'rejected' }, 
        { new: true }
      );
      return updatedBooking;
    },
    companyApproveDisposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await DisposalBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await DisposalBooking.findByIdAndUpdate(
        id, 
        { status: 'approved' }, 
        { new: true }
      );
      
      // Create chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'disposal',
            userId: updatedBooking.userId,
            companyId: companyProfile._id,
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
      return updatedBooking;
    },
    companyRejectDisposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await DisposalBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await DisposalBooking.findByIdAndUpdate(
        id, 
        { status: 'rejected' }, 
        { new: true }
      );
      return updatedBooking;
    },
    companyApproveTransportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await TransportBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await TransportBooking.findByIdAndUpdate(
        id, 
        { status: 'approved' }, 
        { new: true }
      );
      
      // Create chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'transport',
            userId: updatedBooking.userId,
            companyId: companyProfile._id,
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
      return updatedBooking;
    },
    companyRejectTransportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      // Find the company profile for this user
      const companyProfile = await Company.findOne({ userId: user.userId });
      if (!companyProfile) throw new Error('Company profile not found');
      
      // Check if the booking is assigned to this company
      const booking = await TransportBooking.findOne({ 
        _id: id, 
        'company.id': companyProfile._id.toString() 
      });
      if (!booking) throw new Error('Booking not found or not assigned to this company');
      
      // Update the booking status
      const updatedBooking = await TransportBooking.findByIdAndUpdate(
        id, 
        { status: 'rejected' }, 
        { new: true }
      );
      return updatedBooking;
    },
    createCompanyProfile: async (_, { name, email, phone, address, description, services, priceRange, companyType }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      const company = new Company({
        name,
        email,
        phone,
        address,
        description,
        services,
        priceRange,
        companyType,
        userId: dbUser._id
      });
      await company.save();
      return company;
    },
    createChatRoom: async (_, { bookingId, bookingType }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Get booking details based on type
      let booking;
      let companyId;
      
      if (bookingType === 'moving') {
        booking = await MovingBooking.findById(bookingId);
      } else if (bookingType === 'disposal') {
        booking = await DisposalBooking.findById(bookingId);
      } else if (bookingType === 'transport') {
        booking = await TransportBooking.findById(bookingId);
      }
      
      if (!booking) throw new Error('Booking not found');
      if (booking.status !== 'approved') throw new Error('Booking must be approved to create chat room');
      
      // Get company ID from booking
      if (booking.company && booking.company.id) {
        companyId = booking.company.id;
      } else {
        throw new Error('Company information not found in booking');
      }
      
      // Check if chat room already exists
      const existingChatRoom = await ChatRoom.findOne({ 
        bookingId, 
        isActive: true 
      });
      
      if (existingChatRoom) {
        return existingChatRoom;
      }
      
      // Create new chat room
      const chatRoom = new ChatRoom({
        bookingId,
        bookingType,
        userId: booking.userId,
        companyId,
        isActive: true
      });
      
      await chatRoom.save();
      return chatRoom;
    },
    sendMessage: async (_, { chatRoomId, content, messageType = 'text' }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Check if user has access to this chat room
      const dbUser = await User.findById(user.userId);
      let senderType;
      
      if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
          throw new Error('Not authorized');
        }
        senderType = 'company';
      } else {
        if (chatRoom.userId.toString() !== user.userId) {
          throw new Error('Not authorized');
        }
        senderType = 'user';
      }
      
      const message = new Message({
        chatRoomId,
        senderId: user.userId,
        senderType,
        content,
        messageType,
        isRead: false
      });
      
      await message.save();
      
      // Update chat room's updatedAt timestamp
      await ChatRoom.findByIdAndUpdate(chatRoomId, { updatedAt: new Date() });
      
      // Publish message to subscribers
      pubsub.publishMessage(chatRoomId, message);
      
      return message;
    },
    markMessageAsRead: async (_, { messageId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');
      
      // Check if user has access to this message
      const chatRoom = await ChatRoom.findById(message.chatRoomId);
      const dbUser = await User.findById(user.userId);
      
      if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
          throw new Error('Not authorized');
        }
      } else {
        if (chatRoom.userId.toString() !== user.userId) {
          throw new Error('Not authorized');
        }
      }
      
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { isRead: true },
        { new: true }
      );
      
      return updatedMessage;
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: async (_, { chatRoomId }, { user }) => {
        if (!user) throw new Error('Not authenticated');
        
        // Check if user has access to this chat room
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) throw new Error('Chat room not found');
        
        const dbUser = await User.findById(user.userId);
        if (dbUser.role === 'company') {
          const company = await Company.findOne({ userId: user.userId });
          if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
            throw new Error('Not authorized');
          }
        } else {
          if (chatRoom.userId.toString() !== user.userId) {
            throw new Error('Not authorized');
          }
        }
        
        return {
          [Symbol.asyncIterator]: () => {
            const iterator = {
              next: async () => {
                return new Promise((resolve) => {
                  const unsubscribe = pubsub.subscribeToChat(chatRoomId, (message) => {
                    unsubscribe();
                    resolve({ value: { messageAdded: message }, done: false });
                  });
                });
              }
            };
            return iterator;
          }
        };
      }
    },
    messageRead: {
      subscribe: (_, { messageId }, { user }) => {
        if (!user) throw new Error('Not authenticated');
        
        return {
          [Symbol.asyncIterator]: () => {
            const iterator = {
              next: async () => {
                return { done: true };
              }
            };
            return iterator;
          }
        };
      }
    }
  }
};

module.exports = { resolvers }; 
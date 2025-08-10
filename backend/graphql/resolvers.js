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
const { Quote } = require('../models/Quote.js');
const { QuoteDocument } = require('../models/QuoteDocument.js');
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
  Message: {
    quote: async (parent) => {
      if (parent.quote) {
        return await Quote.findById(parent.quote);
      }
      return null;
    }
  },
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
      
      // Check if user is admin
      const dbUser = await User.findById(user.userId);
      if (dbUser && dbUser.role === 'admin') {
        // Admin can access any booking
        return await MovingBooking.findById(id);
      } else {
        // Regular users can only access their own bookings
        return await MovingBooking.findOne({ _id: id, userId: user.userId });
      }
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
    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await User.findById(id);
    },
    userProfile: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      let profile = await UserProfile.findOne({ userId });
      if (!profile) {
        // Create a blank profile if not exists
        profile = new UserProfile({ userId });
        await profile.save();
      }
      return profile;
    },
    company: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await Company.findById(id);
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
      
      // Check if user is admin
      const dbUser = await User.findById(user.userId);
      if (dbUser && dbUser.role === 'admin') {
        // Admin can access any disposal booking
        return await DisposalBooking.findById(id);
      } else {
        // Regular users can only access their own disposal bookings
        return await DisposalBooking.findOne({ _id: id, userId: user.userId });
      }
    },
    transportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if user is admin
      const dbUser = await User.findById(user.userId);
      if (dbUser && dbUser.role === 'admin') {
        // Admin can access any transport booking
        return await TransportBooking.findById(id);
      } else {
        // Regular users can only access their own transport bookings
        return await TransportBooking.findOne({ _id: id, userId: user.userId });
      }
    },
    bookingById: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await MovingBooking.findById(id);
    },
    disposalBookingById: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await DisposalBooking.findById(id);
    },
    transportBookingById: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return await TransportBooking.findById(id);
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
    adminChatRooms: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await ChatRoom.find({ adminId: user.userId, isActive: true }).sort({ updatedAt: -1 });
    },
    chatRoom: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const chatRoom = await ChatRoom.findById(id);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Check if user has access to this chat room
      const dbUser = await User.findById(user.userId);
      if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company || chatRoom.companyId?.toString() !== company._id.toString()) {
          throw new Error('Not authorized');
        }
      } else if (dbUser.role === 'admin') {
        if (chatRoom.adminId?.toString() !== user.userId) {
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
      
      if (dbUser.role === 'admin') {
        // Admin can access any chat room
        return await Message.find({ chatRoomId }).sort({ createdAt: 1 });
      } else if (dbUser.role === 'company') {
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
    },
    myQuoteDocuments: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (dbUser.role === 'company') {
        // For companies, get quote documents from their bookings
        const company = await Company.findOne({ userId: user.userId });
        if (!company) throw new Error('Company profile not found');
        
        // Get bookings for this company
        const bookings = await MovingBooking.find({ 'company.id': company._id.toString() });
        const disposalBookings = await DisposalBooking.find({ 'company.id': company._id.toString() });
        const transportBookings = await TransportBooking.find({ 'company.id': company._id.toString() });
        
        const bookingIds = [
          ...bookings.map(b => b._id.toString()),
          ...disposalBookings.map(b => b._id.toString()),
          ...transportBookings.map(b => b._id.toString())
        ];
        
        return await QuoteDocument.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 });
      } else {
        // For users, get quote documents from their bookings
        const bookings = await MovingBooking.find({ userId: user.userId });
        const disposalBookings = await DisposalBooking.find({ userId: user.userId });
        const transportBookings = await TransportBooking.find({ userId: user.userId });
        
        const bookingIds = [
          ...bookings.map(b => b._id.toString()),
          ...disposalBookings.map(b => b._id.toString()),
          ...transportBookings.map(b => b._id.toString())
        ];
        
        return await QuoteDocument.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 });
      }
    },
    companyQuoteDocuments: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'company') throw new Error('Not authorized');
      
      const company = await Company.findOne({ userId: user.userId });
      if (!company) throw new Error('Company not found');
      
      console.log('CompanyQuoteDocuments Debug:');
      console.log('- User ID:', user.userId);
      console.log('- DB User Role:', dbUser.role);
      console.log('- Company Found:', company);
      console.log('- Company ID:', company._id);
      
      const quotes = await QuoteDocument.find({ companyId: company._id }).sort({ createdAt: -1 });
      console.log('- Quotes Found:', quotes.length);
      console.log('- Quote IDs:', quotes.map(q => q.id));
      
      return quotes;
    },
    allQuoteDocuments: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await QuoteDocument.find({}).sort({ createdAt: -1 });
    },
    quoteDocument: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const quoteDocument = await QuoteDocument.findById(id);
      if (!quoteDocument) throw new Error('Quote document not found');
      
      // Check if user has access to this quote document
      const dbUser = await User.findById(user.userId);
      if (dbUser.role === 'admin') {
        return quoteDocument;
      } else if (dbUser.role === 'company') {
        const company = await Company.findOne({ userId: user.userId });
        if (!company) throw new Error('Company profile not found');
        
        // Check if this quote document belongs to a booking from this company
        const booking = await MovingBooking.findById(quoteDocument.bookingId) ||
                       await DisposalBooking.findById(quoteDocument.bookingId) ||
                       await TransportBooking.findById(quoteDocument.bookingId);
        
        if (!booking || booking.company?.id !== company._id.toString()) {
          throw new Error('Not authorized');
        }
        
        return quoteDocument;
      } else {
        // For users, check if this quote document belongs to their booking
        const booking = await MovingBooking.findById(quoteDocument.bookingId) ||
                       await DisposalBooking.findById(quoteDocument.bookingId) ||
                       await TransportBooking.findById(quoteDocument.bookingId);
        
        if (!booking || booking.userId.toString() !== user.userId) {
          throw new Error('Not authorized');
        }
        
        return quoteDocument;
      }
    },
    
    // Admin Analytics resolvers
    adminStats: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      // Helper function to calculate date ranges
      const getDateRange = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return { startDate, endDate };
      };
      
      try {
        // Get all data
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeCompanies = await Company.countDocuments({});
        const totalBookings = await MovingBooking.countDocuments({}) + 
                             await DisposalBooking.countDocuments({}) + 
                             await TransportBooking.countDocuments({});
        const totalInvoices = await QuoteDocument.countDocuments({});
        
        // Calculate revenue from accepted quote documents
        const quoteDocuments = await QuoteDocument.find({ status: 'accepted' });
        const totalRevenue = quoteDocuments.reduce((sum, doc) => sum + doc.amount, 0);
        
        // Calculate monthly revenue (last 30 days)
        const { startDate: monthStart, endDate: monthEnd } = getDateRange(30);
        const monthlyQuoteDocs = await QuoteDocument.find({
          status: 'accepted',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        });
        const monthlyRevenue = monthlyQuoteDocs.reduce((sum, doc) => sum + doc.amount, 0);
        
        // Calculate growth rate (compare this month vs last month)
        const { startDate: lastMonthStart, endDate: lastMonthEnd } = getDateRange(60);
        const lastMonthQuoteDocs = await QuoteDocument.find({
          status: 'accepted',
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const lastMonthRevenue = lastMonthQuoteDocs.reduce((sum, doc) => sum + doc.amount, 0);
        const growthRate = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
        
        // Calculate pending approvals
        const pendingBookings = await MovingBooking.countDocuments({ status: 'pending' }) +
                               await DisposalBooking.countDocuments({ status: 'pending' }) +
                               await TransportBooking.countDocuments({ status: 'pending' });
        
        // Calculate average booking value
        const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        
        // Calculate user satisfaction (based on completed bookings vs total)
        const completedBookings = await MovingBooking.countDocuments({ status: 'completed' }) +
                                 await DisposalBooking.countDocuments({ status: 'completed' }) +
                                 await TransportBooking.countDocuments({ status: 'completed' });
        const userSatisfaction = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
        
        // Calculate response time (average time from booking to first company response)
        const bookingsWithCompany = await MovingBooking.find({ 
          company: { $exists: true, $ne: null },
          createdAt: { $gte: getDateRange(30).startDate }
        });
        let totalResponseTime = 0;
        let responseCount = 0;
        
        for (const booking of bookingsWithCompany) {
          const chatRoom = await ChatRoom.findOne({ bookingId: booking._id });
          if (chatRoom) {
            const firstMessage = await Message.findOne({ 
              chatRoomId: chatRoom._id,
              sender: { $ne: booking.userId }
            }).sort({ createdAt: 1 });
            
            if (firstMessage) {
              const responseTime = firstMessage.createdAt - booking.createdAt;
              totalResponseTime += responseTime;
              responseCount++;
            }
          }
        }
        
        const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60 * 60) : 2.3; // in hours
        
        // Calculate completion rate
        const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
        
        return {
          totalUsers,
          activeCompanies,
          totalBookings,
          totalRevenue,
          monthlyRevenue,
          growthRate,
          pendingApprovals: pendingBookings,
          totalInvoices,
          averageBookingValue,
          userSatisfaction,
          responseTime: averageResponseTime,
          completionRate
        };
      } catch (error) {
        console.error('Error calculating admin stats:', error);
        throw new Error('Failed to calculate admin statistics');
      }
    },
    
    adminUsers: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await User.find({ role: 'user' }).sort({ createdAt: -1 });
    },
    
    adminCompanies: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await Company.find({}).sort({ createdAt: -1 });
    },
    
    adminBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await MovingBooking.find({}).sort({ createdAt: -1 });
    },
    
    adminDisposalBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await DisposalBooking.find({}).sort({ createdAt: -1 });
    },
    
    adminTransportBookings: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await TransportBooking.find().populate('userId company').sort({ createdAt: -1 });
    },

    allQuoteDocuments: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      return await QuoteDocument.find().sort({ createdAt: -1 });
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
      
      // Create admin chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          chatType: 'admin_user',
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'moving',
            userId: booking.userId,
            adminId: user.userId,
            chatType: 'admin_user',
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating admin chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
      return booking;
    },
    approveDisposalBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await DisposalBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      
      // Create admin chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          chatType: 'admin_user',
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'disposal',
            userId: booking.userId,
            adminId: user.userId,
            chatType: 'admin_user',
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating admin chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
      return booking;
    },
    approveTransportBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await TransportBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      
      // Create admin chat room for approved booking
      try {
        const existingChatRoom = await ChatRoom.findOne({ 
          bookingId: id, 
          chatType: 'admin_user',
          isActive: true 
        });
        
        if (!existingChatRoom) {
          const chatRoom = new ChatRoom({
            bookingId: id,
            bookingType: 'transport',
            userId: booking.userId,
            adminId: user.userId,
            chatType: 'admin_user',
            isActive: true
          });
          await chatRoom.save();
        }
      } catch (error) {
        console.error('Error creating admin chat room:', error);
        // Don't fail the approval if chat room creation fails
      }
      
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
    createAdminChatRoom: async (_, { bookingId, bookingType }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      // Get booking details based on type
      let booking;
      
      if (bookingType === 'moving') {
        booking = await MovingBooking.findById(bookingId);
      } else if (bookingType === 'disposal') {
        booking = await DisposalBooking.findById(bookingId);
      } else if (bookingType === 'transport') {
        booking = await TransportBooking.findById(bookingId);
      }
      
      if (!booking) throw new Error('Booking not found');
      
      // Check if admin chat room already exists
      const existingChatRoom = await ChatRoom.findOne({ 
        bookingId, 
        chatType: 'admin_user',
        isActive: true 
      });
      
      if (existingChatRoom) {
        return existingChatRoom;
      }
      
      // Create new admin chat room
      const chatRoom = new ChatRoom({
        bookingId,
        bookingType,
        userId: booking.userId,
        adminId: user.userId,
        chatType: 'admin_user',
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
      
      // Also publish chat room update
      pubsub.publish('CHAT_ROOM_UPDATED', {
        id: chatRoomId,
        bookingId: chatRoom.bookingId,
        bookingType: chatRoom.bookingType,
        userId: chatRoom.userId,
        companyId: chatRoom.companyId,
        adminId: chatRoom.adminId,
        chatType: chatRoom.chatType,
        isActive: chatRoom.isActive,
        createdAt: chatRoom.createdAt,
        updatedAt: new Date()
      });
      
      return message;
    },
    sendAdminMessage: async (_, { chatRoomId, content, messageType = 'text' }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom || chatRoom.chatType !== 'admin_user') throw new Error('Chat room not found');
      
      const message = new Message({
        chatRoomId,
        senderId: user.userId,
        senderType: 'admin',
        content,
        messageType: messageType || 'text'
      });
      
      await message.save();
      
      // Publish to subscription
      pubsub.publish('MESSAGE_ADDED', {
        messageAdded: message
      });
      
      // Also publish chat room update
      pubsub.publish('CHAT_ROOM_UPDATED', {
        id: chatRoomId,
        bookingId: chatRoom.bookingId,
        bookingType: chatRoom.bookingType,
        userId: chatRoom.userId,
        companyId: chatRoom.companyId,
        adminId: chatRoom.adminId,
        chatType: chatRoom.chatType,
        isActive: chatRoom.isActive,
        createdAt: chatRoom.createdAt,
        updatedAt: new Date()
      });
      
      return message;
    },
    generateInvoice: async (_, { bookingId, companyId, amount }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Find the booking
      const movingBooking = await MovingBooking.findById(bookingId);
      const disposalBooking = await DisposalBooking.findById(bookingId);
      const transportBooking = await TransportBooking.findById(bookingId);
      
      const booking = movingBooking || disposalBooking || transportBooking;
      if (!booking) throw new Error('Booking not found');
      
      // Find the company
      const company = await Company.findById(companyId);
      if (!company) throw new Error('Company not found');
      
      // Create quote document (which serves as an invoice)
      const quoteDocument = new QuoteDocument({
        bookingId,
        amount: amount || 0,
        currency: 'USD',
        status: 'pending',
        documentUrl: null, // Will be generated later
        bookingDetails: {
          bookingType: movingBooking ? 'moving' : disposalBooking ? 'disposal' : 'transport',
          companyName: company.name,
          companyEmail: company.email,
          companyPhone: company.phone
        }
      });
      
      await quoteDocument.save();
      
      return quoteDocument;
    },

    createInvoice: async (_, { bookingId, companyId, amount }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      
      // Find the booking
      const movingBooking = await MovingBooking.findById(bookingId).populate('userId');
      const disposalBooking = await DisposalBooking.findById(bookingId).populate('userId');
      const transportBooking = await TransportBooking.findById(bookingId).populate('userId');
      
      const booking = movingBooking || disposalBooking || transportBooking;
      if (!booking) throw new Error('Booking not found');
      
      // Find the company
      const company = await Company.findById(companyId);
      if (!company) throw new Error('Company not found');
      
      // Get user profile for complete details
      const userProfile = await UserProfile.findOne({ userId: booking.userId });
      
      console.log('Debug - User Profile:', userProfile);
      console.log('Debug - Booking User:', booking.userId);
      console.log('Debug - DB User:', dbUser);
      
      // Get the actual user who made the booking
      const bookingUser = await User.findById(booking.userId);
      console.log('Debug - Booking User Data:', bookingUser);
      
      // Determine booking type and extract relevant details
      let bookingType = 'unknown';
      let serviceDetails = {};
      
      if (movingBooking) {
        bookingType = 'moving';
        serviceDetails = {
          addresses: movingBooking.addresses,
          rooms: movingBooking.rooms,
          items: movingBooking.items
        };
      } else if (disposalBooking) {
        bookingType = 'disposal';
        serviceDetails = {
          serviceType: disposalBooking.serviceType,
          pickupAddress: disposalBooking.pickupAddress,
          items: disposalBooking.items
        };
      } else if (transportBooking) {
        bookingType = 'transport';
        serviceDetails = {
          serviceType: transportBooking.serviceType,
          pickupLocation: transportBooking.pickupLocation,
          dropoffLocation: transportBooking.dropoffLocation,
          items: transportBooking.items
        };
      }
      
      console.log('Debug - Service Details:', serviceDetails);
      
      // Create comprehensive booking details
      const bookingDetails = {
        bookingType,
        invoiceNumber: `INV-${Date.now()}`,
        generatedAt: new Date(),
        acceptedAt: new Date(),
        bookingStatus: booking.status,
        userDetails: {
          name: userProfile?.full_name || bookingUser?.full_name || 'N/A',
          email: bookingUser?.email || 'N/A',
          phone: userProfile?.phone || bookingUser?.phone || 'N/A',
          address: userProfile?.address || bookingUser?.address || 'N/A'
        },
        companyDetails: {
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          services: company.services,
          description: company.description
        },
        contact: booking.contact,
        dateTime: booking.dateTime,
        dateTimeFlexible: booking.dateTimeFlexible,
        ...serviceDetails
      };
      
      console.log('Debug - Final Booking Details:', bookingDetails);
      
      // Create quote document (which serves as an invoice)
      const quoteDocument = new QuoteDocument({
        bookingId,
        companyId,
        createdBy: 'admin',
        amount: amount || 0,
        currency: 'USD',
        status: 'accepted', // Invoice is automatically accepted
        documentUrl: null, // Will be generated later
        bookingDetails
      });
      
      console.log('Creating invoice with details:', {
        bookingId,
        companyId,
        createdBy: 'admin',
        amount,
        bookingDetails
      });
      
      await quoteDocument.save();
      
      console.log('Invoice created successfully:', quoteDocument);
      
      return quoteDocument;
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
    },
    sendQuote: async (_, { chatRoomId, amount, currency = 'USD' }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Only companies can send quotes
      const dbUser = await User.findById(user.userId);
      if (dbUser.role !== 'company') {
        throw new Error('Only companies can send quotes');
      }
      
      const company = await Company.findOne({ userId: user.userId });
      if (!company || chatRoom.companyId.toString() !== company._id.toString()) {
        throw new Error('Not authorized');
      }
      
      // Create quote
      const quote = new Quote({
        chatRoomId,
        amount,
        currency,
        status: 'pending'
      });
      
      await quote.save();
      
      // Create message with quote
      const message = new Message({
        chatRoomId,
        senderId: user.userId,
        senderType: 'company',
        content: `Quote sent: $${amount}`,
        messageType: 'quote',
        isRead: false,
        quote: quote._id
      });
      
      await message.save();
      
      // Update chat room's updatedAt timestamp
      await ChatRoom.findByIdAndUpdate(chatRoomId, { updatedAt: new Date() });
      
      // Publish message to subscribers
      pubsub.publishMessage(chatRoomId, message);
      
      return message;
    },
    respondToQuote: async (_, { quoteId, response, counterOffer }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const quote = await Quote.findById(quoteId);
      if (!quote) throw new Error('Quote not found');
      
      const chatRoom = await ChatRoom.findById(quote.chatRoomId);
      if (!chatRoom) throw new Error('Chat room not found');
      
      // Check if user has access to this quote
      const dbUser = await User.findById(user.userId);
      let senderType;
      let content;
      
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
      
      // Update quote status
      let newStatus;
      switch (response) {
        case 'accept':
          newStatus = 'accepted';
          content = 'Quote accepted';
          break;
        case 'reject':
          newStatus = 'rejected';
          content = 'Quote rejected';
          break;
        case 'counter':
          newStatus = 'countered';
          content = `Counter offer: $${counterOffer}`;
          quote.counterOffer = counterOffer;
          break;
        default:
          throw new Error('Invalid response');
      }
      
      quote.status = newStatus;
      await quote.save();
      
      // Create response message
      const message = new Message({
        chatRoomId: quote.chatRoomId,
        senderId: user.userId,
        senderType,
        content,
        messageType: 'quote_response',
        isRead: false,
        quote: quote._id
      });
      
      await message.save();
      
      // Update chat room's updatedAt timestamp
      await ChatRoom.findByIdAndUpdate(quote.chatRoomId, { updatedAt: new Date() });
      
      // Publish message to subscribers
      pubsub.publishMessage(quote.chatRoomId, message);
      
      return message;
    },
    generateQuoteDocument: async (_, { bookingId, finalAmount, currency = 'USD' }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Find the booking
      let booking = await MovingBooking.findById(bookingId);
      let bookingType = 'moving';
      if (!booking) {
        booking = await DisposalBooking.findById(bookingId);
        bookingType = 'disposal';
      }
      if (!booking) {
        booking = await TransportBooking.findById(bookingId);
        bookingType = 'transport';
      }
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Get user and company details
      const userDetails = await User.findById(booking.userId);
      const companyDetails = booking.company ? await Company.findById(booking.company.id) : null;
      
      // Extract companyId from the booking's company field
      const companyId = booking.company?.id || companyDetails?._id;
      if (!companyId) {
        throw new Error('Company ID is required for quote document generation');
      }
      
      // Create comprehensive quote document with all booking details
      const quoteDocument = new QuoteDocument({
        bookingId,
        companyId, // Add the missing companyId field
        createdBy: 'company',
        amount: finalAmount,
        currency,
        status: 'accepted',
        bookingDetails: {
          ...booking.toObject(),
          bookingType,
          // Service details
          serviceType: booking.serviceType || bookingType,
          // User details
          userDetails: userDetails ? {
            id: userDetails._id,
            name: userDetails.full_name,
            email: userDetails.email,
            phone: userDetails.phone,
            address: userDetails.address
          } : null,
          // Company details
          companyDetails: companyDetails ? {
            id: companyDetails._id,
            name: companyDetails.name,
            email: companyDetails.email,
            phone: companyDetails.phone,
            address: companyDetails.address,
            services: companyDetails.services
          } : null,
          // Address details (for moving)
          addresses: booking.addresses || null,
          // Pickup details (for disposal)
          pickupAddress: booking.pickupAddress || null,
          // Transport details
          pickupLocation: booking.pickupLocation || null,
          dropoffLocation: booking.dropoffLocation || null,
          // Room details (for moving)
          rooms: booking.rooms || null,
          // Item details
          items: booking.items || null,
          // Contact details
          contact: booking.contact || null,
          // Date and time
          dateTime: booking.dateTime,
          dateTimeFlexible: booking.dateTimeFlexible,
          // Invoice details
          invoiceNumber: `INV-${Date.now()}`,
          generatedAt: new Date(),
          acceptedAt: new Date(),
          // Booking status
          bookingStatus: booking.status || 'completed'
        }
      });
      
      await quoteDocument.save();
      
      // Update booking status to completed
      if (bookingType === 'moving') {
        await MovingBooking.findByIdAndUpdate(bookingId, { status: 'completed' });
      } else if (bookingType === 'disposal') {
        await DisposalBooking.findByIdAndUpdate(bookingId, { status: 'completed' });
      } else if (bookingType === 'transport') {
        await TransportBooking.findByIdAndUpdate(bookingId, { status: 'completed' });
      }
      
      return quoteDocument;
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: async (_, { chatRoomId }, { user }) => {
        console.log('Subscription attempt:', { chatRoomId, userId: user?.userId });
        
        if (!user) {
          console.error('Subscription failed: Not authenticated');
          throw new Error('Not authenticated');
        }
        
        // Check if user has access to this chat room
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          console.error('Subscription failed: Chat room not found', { chatRoomId });
          throw new Error('Chat room not found');
        }
        
        const dbUser = await User.findById(user.userId);
        if (!dbUser) {
          console.error('Subscription failed: User not found', { userId: user.userId });
          throw new Error('User not found');
        }
        
        let hasAccess = false;
        
        if (dbUser.role === 'company') {
          const company = await Company.findOne({ userId: user.userId });
          if (company && chatRoom.companyId?.toString() === company._id.toString()) {
            hasAccess = true;
          }
        } else if (dbUser.role === 'admin') {
          if (chatRoom.adminId?.toString() === user.userId) {
            hasAccess = true;
          }
        } else {
          if (chatRoom.userId.toString() === user.userId) {
            hasAccess = true;
          }
        }
        
        if (!hasAccess) {
          console.error('Subscription failed: Not authorized', { 
            userId: user.userId, 
            userRole: dbUser.role,
            chatRoomId,
            chatRoomUserId: chatRoom.userId,
            chatRoomCompanyId: chatRoom.companyId,
            chatRoomAdminId: chatRoom.adminId
          });
          throw new Error('Not authorized');
        }
        
        console.log('Subscription successful:', { 
          chatRoomId, 
          userId: user.userId, 
          userRole: dbUser.role 
        });
        
        return {
          [Symbol.asyncIterator]: () => {
            const iterator = {
              next: async () => {
                return new Promise((resolve) => {
                  const unsubscribe = pubsub.subscribeToChat(chatRoomId, (message) => {
                    console.log('Message published to subscription:', { 
                      chatRoomId, 
                      messageId: message.id,
                      senderId: message.senderId,
                      content: message.content.substring(0, 50) + '...'
                    });
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
    },
    chatRoomUpdated: {
      subscribe: (_, __, { user }) => {
        if (!user) throw new Error('Not authenticated');
        
        console.log('Chat room update subscription started for user:', user.userId);
        
        return {
          [Symbol.asyncIterator]: () => {
            const iterator = {
              next: async () => {
                return new Promise((resolve) => {
                  const unsubscribe = pubsub.subscribe('CHAT_ROOM_UPDATED', (chatRoom) => {
                    console.log('Chat room update published to subscription:', chatRoom.id);
                    unsubscribe();
                    resolve({ value: { chatRoomUpdated: chatRoom }, done: false });
                  });
                });
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
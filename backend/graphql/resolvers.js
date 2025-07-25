import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLScalarType, Kind } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { User } from '../models/User.js';
import { MovingBooking } from '../models/MovingBooking.js';

const JWT_SECRET = 'your_jwt_secret'; // Should match your main config

export const resolvers = {
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
    }
  },
  Mutation: {
    register: async (_, { email, password, full_name, phone, address }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, full_name, phone, address });
      await user.save();
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
    approveBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await MovingBooking.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
      return booking;
    },
    rejectBooking: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authorized');
      const dbUser = await User.findById(user.userId);
      if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
      const booking = await MovingBooking.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
      return booking;
    }
  }
}; 
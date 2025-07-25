import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ApolloServer, gql } from 'apollo-server-express';
import { GraphQLScalarType, Kind } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const app = express();
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/localease', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// --- Mongoose Schemas ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: String,
  phone: String,
  address: String,
});
const User = mongoose.model('User', userSchema);

const RoomSchema = new mongoose.Schema({
  floor: String,
  room: String,
  count: Number
}, { _id: false });

const CompanySchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  rating: Number,
  total_reviews: Number,
  location: String,
  services: [String],
  price_range: String,
  image_url: String,
  contact_phone: String,
  contact_email: String
}, { _id: false });

const MovingBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rooms: [RoomSchema],
  items: { type: Map, of: Number },
  dateTime: Date, // for specific date/time
  dateTimeFlexible: String, // for flexible options (stringified object)
  addresses: {
    from: String,
    to: String
  },
  contact: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  company: CompanySchema,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const MovingBooking = mongoose.model('MovingBooking', MovingBookingSchema);

// --- JWT Secret ---
const JWT_SECRET = 'your_jwt_secret'; // Change this in production

// --- GraphQL Type Definitions ---
const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    full_name: String
    phone: String
    address: String
  }

  type Room {
    floor: String
    room: String
    count: Int
  }

  type Company {
    id: String
    name: String
    description: String
    rating: Float
    total_reviews: Int
    location: String
    services: [String]
    price_range: String
    image_url: String
    contact_phone: String
    contact_email: String
  }

  type MovingBooking {
    id: ID!
    userId: ID!
    rooms: [Room]
    items: JSON
    dateTime: Date
    dateTimeFlexible: String
    addresses: Address
    contact: Contact
    company: Company
    status: String
    createdAt: Date
  }

  type Address {
    from: String
    to: String
  }

  type Contact {
    name: String
    email: String
    phone: String
    notes: String
  }

  scalar JSON

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    myBookings: [MovingBooking]
    booking(id: ID!): MovingBooking
  }

  type Mutation {
    register(email: String!, password: String!, full_name: String, phone: String, address: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(full_name: String, phone: String, address: String): User
    createMovingBooking(
      rooms: [RoomInput],
      items: JSON,
      dateTime: Date,
      dateTimeFlexible: String,
      addresses: AddressInput,
      contact: ContactInput,
      company: CompanyInput
    ): MovingBooking
  }

  input RoomInput {
    floor: String
    room: String
    count: Int
  }

  input AddressInput {
    from: String
    to: String
  }

  input ContactInput {
    name: String
    email: String
    phone: String
    notes: String
  }

  input CompanyInput {
    id: String
    name: String
    description: String
    rating: Float
    total_reviews: Int
    location: String
    services: [String]
    price_range: String
    image_url: String
    contact_phone: String
    contact_email: String
  }
`;

// --- GraphQL Resolvers ---
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
    }
  }
};

// --- JWT Auth Context ---
const getUserFromToken = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      return jwt.verify(auth.split(' ')[1], JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
};

// --- Apollo Server Setup ---
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: getUserFromToken(req) })
  });
  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      origin: 'http://localhost:8080',
      credentials: true,
    }
  });
}

startApolloServer();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
}); 
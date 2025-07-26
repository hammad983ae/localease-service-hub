const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { User } = require('./models/User.js');
const { MovingBooking } = require('./models/MovingBooking.js');
const { Company } = require('./models/Company.js');
const { UserProfile } = require('./models/UserProfile.js');
const { DisposalBooking } = require('./models/DisposalBooking.js');
const { TransportBooking } = require('./models/TransportBooking.js');
const { typeDefs } = require('./graphql/typeDefs.js');
const { resolvers } = require('./graphql/resolvers.js');
const { getUserFromToken } = require('./graphql/context.js');

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

// Create HTTP server
const httpServer = createServer(app);

// --- Apollo Server Setup ---
async function startApolloServer() {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  
  const server = new ApolloServer({
    schema,
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

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: (ctx) => {
        // Extract token from WebSocket connection
        const token = ctx.connectionParams?.authorization?.replace('Bearer ', '');
        return { user: getUserFromToken({ headers: { authorization: token } }) };
      },
    },
    wsServer
  );

  console.log('WebSocket server ready');
}

startApolloServer();

const PORT = process.env.PORT || 5002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
  console.log(`WebSocket endpoint at ws://localhost:${PORT}/graphql`);
}); 
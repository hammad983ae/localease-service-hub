const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/localease', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { User } = require('./models/User');

async function listUsers() {
  try {
    const users = await User.find({}).select('-password');
    
    console.log('All users in database:');
    console.log('======================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.full_name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();

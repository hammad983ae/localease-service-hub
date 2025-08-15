const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://mongo:bomgIVKQxBvDazjNOecSPsxTywtBAOdO@shinkansen.proxy.rlwy.net:21344', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { User } = require('./models/User');

async function makeUserAdmin() {
  try {
    // Find Hammad by email
    const user = await User.findOne({ email: 'hammad@gmail.com' });
    
    if (!user) {
      console.log('User not found. Please check the email address.');
      return;
    }

    // Update the user's role to admin
    user.role = 'admin';
    await user.save();

    console.log(`User ${user.email} is now an admin!`);
    console.log('User details:', {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
}

makeUserAdmin();

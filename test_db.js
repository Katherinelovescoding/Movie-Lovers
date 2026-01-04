const mongoose = require('mongoose');
require('dotenv').config();

const Watchlist = require('./models/Watchlist');
const User = require('./models/User');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // Check all watchlists
    const allWatchlists = await Watchlist.find({}).populate('owner', 'username');
    console.log(`\n📋 Total watchlists: ${allWatchlists.length}`);
    
    allWatchlists.forEach((list, index) => {
      console.log(`${index + 1}. "${list.name}" by ${list.owner?.username || 'Unknown'} (Public: ${list.isPublic})`);
    });

    // Check public watchlists
    const publicWatchlists = await Watchlist.find({ isPublic: true }).populate('owner', 'username');
    console.log(`\n🌐 Public watchlists: ${publicWatchlists.length}`);
    
    publicWatchlists.forEach((list, index) => {
      console.log(`${index + 1}. "${list.name}" by ${list.owner?.username || 'Unknown'}`);
    });

    // Check users
    const users = await User.find({});
    console.log(`\n👥 Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.type})`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

checkDatabase(); 
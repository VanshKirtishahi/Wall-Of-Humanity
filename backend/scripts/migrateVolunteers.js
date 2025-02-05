const mongoose = require('mongoose');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

async function migrateVolunteers() {
  try {
    // Get all volunteers without userId
    const volunteers = await Volunteer.find({ userId: { $exists: false } });
    
    console.log(`Found ${volunteers.length} volunteers to migrate`);

    for (const volunteer of volunteers) {
      // Create user for each volunteer
      const user = new User({
        name: volunteer.name,
        email: volunteer.email,
        password: 'defaultPassword', // You should set a proper password
        role: 'volunteer'
      });
      await user.save();

      // Update volunteer with userId
      volunteer.userId = user._id;
      await volunteer.save();

      console.log(`Migrated volunteer: ${volunteer.email}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the migration
migrateVolunteers(); 
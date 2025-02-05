const mongoose = require('mongoose');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');
require('dotenv').config();

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate NGOs
    const ngos = await NGO.find();
    console.log(`Found ${ngos.length} NGOs to migrate`);
    
    for (const ngo of ngos) {
      const existingUser = await User.findOne({ email: ngo.organizationEmail });
      if (!existingUser) {
        const user = new User({
          name: ngo.organizationName,
          email: ngo.organizationEmail,
          password: 'defaultPassword',
          role: 'ngo',
          ngoId: ngo._id
        });
        await user.save();
        console.log(`Created user for NGO: ${ngo.organizationEmail}`);
      } else if (existingUser.role !== 'ngo') {
        existingUser.role = 'ngo';
        existingUser.ngoId = ngo._id;
        await existingUser.save();
        console.log(`Updated user role for NGO: ${ngo.organizationEmail}`);
      }
    }

    // Migrate Volunteers
    const volunteers = await Volunteer.find();
    console.log(`Found ${volunteers.length} volunteers to migrate`);

    for (const volunteer of volunteers) {
      const existingUser = await User.findOne({ email: volunteer.email });
      if (!existingUser) {
        const user = new User({
          name: volunteer.name,
          email: volunteer.email,
          password: 'defaultPassword',
          role: 'volunteer'
        });
        await user.save();
        
        // Update volunteer with userId
        volunteer.userId = user._id;
        await volunteer.save();
        console.log(`Created user for volunteer: ${volunteer.email}`);
      } else if (existingUser.role !== 'volunteer') {
        existingUser.role = 'volunteer';
        await existingUser.save();
        console.log(`Updated user role for volunteer: ${volunteer.email}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateRoles(); 
const { verifyAndFixPasswords, resetUserPassword } = require('../utils/passwordManager');
const connectDB = require('../config/db');

const runPasswordOperation = async (operation, ...args) => {
  try {
    await connectDB();
    
    switch(operation) {
      case 'verify':
        await verifyAndFixPasswords();
        break;
      case 'reset':
        const [email, password] = args;
        await resetUserPassword(email, password);
        break;
      default:
        console.error('Invalid operation');
    }
    
    await mongoose.connection.close();
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Operation failed:', error);
  } finally {
    process.exit();
  }
};

const [operation, ...args] = process.argv.slice(2);
runPasswordOperation(operation, ...args); 
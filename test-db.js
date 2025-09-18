require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://ssayanmjhi204_db_user:sayan@cluster0.ir4mlkl.mongodb.net/quick-polls?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB successfully');
  mongoose.connection.close();
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
}); 

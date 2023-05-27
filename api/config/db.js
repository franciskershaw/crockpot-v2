// Connection function to MongoDb, called on server.js

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connectDb = () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((db) => {
        console.log('-------------------------------------------------------------'.cyan);
        console.log(`MongoDB Connected: ${db.connection.host}`.cyan);
        resolve(db);
      })
      .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`.red.underline.bold);
        reject(err);
      });
  });
};

module.exports = connectDb;

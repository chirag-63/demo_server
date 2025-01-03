const mongoose = require('mongoose')
require("dotenv").config();

const connectToDB = async () => {
  if (process.env.DATABASE_URL) {
    try {
      await mongoose.connect(process.env.DATABASE_URL);
      console.log("Database connected");
    } catch (error) {
      console.error("Database connection error:", error);
    }
  } else {
    console.error("Cant connect to database, DATABASE_URL not set");
  }
};

module.exports = connectToDB;

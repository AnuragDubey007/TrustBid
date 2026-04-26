const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
  family: 4, // 🔥 FORCE IPv4
});

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
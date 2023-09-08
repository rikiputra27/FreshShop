const mongoose = require("mongoose");

// membuat schema (struktur)
const Users = mongoose.model("Users", {
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

module.exports = {
  Users: Users,
};

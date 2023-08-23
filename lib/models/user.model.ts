import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, requires: true, unique: true },
  name: { type: String, requires: true},
  image: String, //! the same as {type: String}
  bio: String,
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threads", //! One user can have multiple refs to spacific threads stored in DB
    },
  ], //! one user can create many threads, and they are objects.
  onboarded: {
    type: Boolean,
    default: false,
  }, //! once we sigup we have to do onbording? entering username, bio and photo
    communities: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
        }
    ]//! one user can belong to many communities
});

const User = mongoose.models.User || mongoose.model('User', userSchema)//! сначала это mongoose.models.User не будет существовать, и тогда будет создата модель mongoose.model('User', userSchema) на основе схемы userSchema, но последующие разы когда будет вызван User он уже будет иметь модель в БД

export default User;
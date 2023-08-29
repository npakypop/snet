import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, requires: true, unique: true },
  name: { type: String, requires: true },
  image: String, //! the same as {type: String}
  bio: String,
  creatredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threads", //! One user can have multiple refs to spacific threads stored in DB
    },
  ], //! one user can create many threads, and they are objects.
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ], //! множество разных пользователей могут быть членами одного сообщества
});

const Community =
  mongoose.models.Community || mongoose.model("Community", communitySchema); //! сначала это mongoose.models.Community не будет существовать, и тогда будет создата модель mongoose.model('Community', CommunitySchema) на основе схемы CommunitySchema, но последующие разы когда будет вызван Community он уже будет иметь модель в БД

export default Community;

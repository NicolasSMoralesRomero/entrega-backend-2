import { Schema, model } from "mongoose";

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  githubId: { type: String },
   cartId: {
     type: Schema.Types.ObjectId,
    ref: "cart",
   },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export const userModel = model("user", userSchema);
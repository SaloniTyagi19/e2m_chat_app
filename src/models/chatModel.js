import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })
const chatModel = mongoose.model('Chat', chatSchema)
export default chatModel;
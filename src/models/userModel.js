import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    },
    token: {
        type: String
    },
}, { timestamps: true })
const userModel = mongoose.model('User', userSchema)
export default userModel;
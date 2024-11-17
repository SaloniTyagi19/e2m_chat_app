import userModel from '../models/userModel.js'
import chatModel from '../models/chatModel.js';
import message from '../utils/messages.js';
import appError from '../utils/appError.js';
import httpStatus from 'http-status';
import getQueryOptions from '../utils/queryParams.js';
import messageModel from '../models/messageModel.js';

const checkExisting = async (name) => {
    const checkChat = await chatModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    return checkChat;
}
export const chatCreate = async (body) => {
    try {
        const { name, members } = body
        const alreadyChat = await checkExisting(name);
        if (alreadyChat) {
            throw new appError(httpStatus.BAD_REQUEST, message.SIGNUP_ERROR.replace('#', 'chat'));
        } else {
            const users = await userModel.find({ userName: { $in: members } })
            const userIds = users.map((user) => user._id);
            const membersList = [...new Set([...userIds])];
            const chat = await chatModel.create({ name, members: membersList })
            return {
                chatId: chat._id,
                name,
                members
            }
        }
    } catch (error) {
        throw new appError(error.statusCode, error.message)
    }
}

export const inviteToChat = async (chatId, body) => {
    try {
        const { usernames } = body
        const users = await userModel.find({ userName: { $in: usernames } })
        if (users.length === 0){
            throw new appError(httpStatus.BAD_REQUEST, message.VALID_INPUT.replace('#', 'user id'));
        }
        const chat = await chatModel.findById(chatId)
        if(!chat) {
            throw new appError(httpStatus.BAD_REQUEST, message.VALID_INPUT.replace('#', 'chat id'));
        }
        const userIds = users.map((user) => user._id);
        const membersList = [...new Set([...chat.members, ...userIds])];
        await chatModel.findByIdAndUpdate(chatId, {members: membersList })
        return {
            name: chatId,
            members: membersList
        }
    } catch (error) {
        throw new appError(error.statusCode, error.message)
    }
}

export const getChatList = async (query, userId) => {
    const { page, limit, sort, skip } = getQueryOptions(query);
    const chat = await chatModel.find({members: userId}).select('name members').sort(sort)
        .skip(skip).limit(limit).exec()
    const totalPages = Math.ceil(chat.length / limit)
    return { chat, total: chat.length, totalPages };
        
}

export const getMessageList = async (query) => {
    const { chatId } = query;
    if (!chatId) {
        throw new appError(httpStatus.BAD_REQUEST, message.VALID_INPUT.replace('#', 'Chat id'));
    }
    const chat = await chatModel.findById(chatId);
    if (!chat) {
        throw new appError(httpStatus.BAD_REQUEST, message.VALID_INPUT.replace('#', 'Chat id'));
    }
    const messages = await messageModel
    .find({ chatId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('sender', 'userName')
    .exec();    
    const totalPages = Math.ceil(chat.length / 10)
    return { messages: messages.reverse(), total: message.length, totalPages };
        
}
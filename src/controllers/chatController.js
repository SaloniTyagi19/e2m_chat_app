import httpStatus from 'http-status';
import { chatCreate, inviteToChat, getChatList } from '../services/chatService.js';
import createResponse from './../utils/response.js';
import message from './../utils/messages.js';

export const createChat = async (req, res, next) => {
    try {
        if(req?.loggedUserDetails?.id) {
            req.body.members = req.body.members || []
            req.body.members = [...req.body.members, req.loggedUserDetails.id]
        }
        const chatCreated = await chatCreate(req.body);
        return await createResponse(res, httpStatus.CREATED, message.CREATED.replace('#', 'Chat'), chatCreated)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}

export const chatInvite = async (req, res, next) => {
    try {
        if(req?.loggedUserDetails?.id) {
            req.body.usernames = [...req.body.usernames, req.loggedUserDetails.id]
        }
        const chatInvited = await inviteToChat(req.params.id, req.body)
        return await createResponse(res, httpStatus.OK, message.UPDATED.replace('#', 'chat'), chatInvited)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}

export const getChats = async (req, res, next) => {
    try {
        const getChats = await getUsers(req.query, req?.loggedUserDetails?.id);
        return await createResponse(res, httpStatus.OK, message.FOUND.replace('#', 'Chat'), getChats)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}
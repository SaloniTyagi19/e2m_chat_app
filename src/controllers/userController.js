import httpStatus from 'http-status';
import { userCreate, login, getUsers } from '../services/userService.js';
import createResponse from '../utils/response.js';
import message from '../utils/messages.js';

export const registerUser = async (req, res, next) => {
    try {
        const userCreated = await userCreate(req.body);
        return await createResponse(res, httpStatus.CREATED, message.USER_CREATED, userCreated)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const Login = await login(req.body);
        return await createResponse(res, httpStatus.CREATED, message.USER_LOGIN.replace('#', 'user'), Login)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}

export const getUser = async (req, res, next) => {
    try {
        const getUser = await getUsers(req.query);
        return await createResponse(res, httpStatus.OK, message.UPDATED.replace('#', 'User'), getUser)
    } catch (error) {
        return await createResponse(res, error.statusCode ? error.statusCode : httpStatus.SERVICE_UNAVAILABLE, error.message, {})
    }
}
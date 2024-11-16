import bcrypt from 'bcryptjs'
import userModel from '../models/userModel.js'
import message from '../utils/messages.js';
import appError from '../utils/appError.js';
import httpStatus from 'http-status';
import moment from 'moment'
import jwt from 'jsonwebtoken'
import getQueryOptions from '../utils/queryParams.js';

const checkExisting = async (userName) => {
    const checkUser = await userModel.findOne({ userName });
    return checkUser;
}

export const userCreate = async (body) => {
    let user
    try {
        const { userName, password } = body
        const alreadyUser = await checkExisting(userName)
        if (alreadyUser) {
            throw new appError(httpStatus.BAD_REQUEST, message.SIGNUP_ERROR.replace('#', 'User'));
        } else {
            const salt = await bcrypt.genSalt(10)
            const encryptedPass = await bcrypt.hash(password, salt)
            user = await userModel.create({ userName, password: encryptedPass, salt })
        }
        const token = await generateToken(user.userName, user._id)
        await userModel.findByIdAndUpdate(user._id, {token})
        const result = {
            userName,
            id: user._id,
            token
        }
        return result
    } catch (error) {
        throw new appError(error.statusCode, error.message)
    }
}

export const login = async (body) => {
    try {
        const { userName, password } = body
        const user = await checkExisting(userName);
        if (!user) {
            throw new appError(httpStatus.BAD_REQUEST, message.LOGIN_ERROR);
        } else {
            const pass = await bcrypt.compare(password, user.password)
            if(!pass){
                throw new appError(httpStatus.BAD_REQUEST, message.INVALID_PASSWORD);
            }
            const token = await generateToken(user.userName, user._id)
            await userModel.findByIdAndUpdate(user._id, {token})
            return {
                userName,
                password,
                id: user._id,
                token
            }
        }
    } catch (error) {
        throw new appError(error.statusCode, error.message)
    }
}

export const getUsers = async (query) => {
    const { page, limit, sort, skip } = getQueryOptions(query);
    const users = await userModel.find().select('userName _id').sort(sort)
        .skip(skip).limit(limit).exec()
    const totalPages = Math.ceil(users.length / limit)
    return { users, total: users.length, totalPages };
        
}

const generateToken = async (userName, _id) => {
    const expirationSeconds = Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES) * 60;
    const payload = {
        sub: _id,
        userName,
        iat: moment().unix()
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expirationSeconds })
}

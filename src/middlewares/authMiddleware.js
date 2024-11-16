import jwt from 'jsonwebtoken';
import httpStatus from "http-status";
import createResponse from "../utils/response.js";
import message from "../utils/messages.js";

const auth = () => {
    return async (req, res, next) => {
        try {
            const secretKey = process.env.JWT_SECRET;
            const token = req.header('Authorization') || req.header('authorization');
            if (!token) {
                return await createResponse(res, httpStatus.UNAUTHORIZED, message.AUTHENTICATE, {});
            }
            const decoded = jwt.verify(token, secretKey);
            req.loggedUserDetails = {id: decoded?.sub, userName: decoded?.userName};
            return await next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return await createResponse(res, httpStatus.UNAUTHORIZED, message.TOKEN_EXPIRED, {});
            }
            return await createResponse(res, httpStatus.UNAUTHORIZED, message.AUTHENTICATE, {});
        }
    };
};

export default auth;

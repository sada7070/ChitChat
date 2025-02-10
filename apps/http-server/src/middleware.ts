import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    userId: string
}

export const middleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];
    if(!token) {
        res.status(401).json({
            message: "Unauthorized."
        })
        return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if(decoded) {
        req.userId = decoded.userId
        next();
    } else {
        res.status(401).json({
            message: "Unauthorized. Invalid token."
        });
    }
}

export default AuthenticatedRequest;
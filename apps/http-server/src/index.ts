import "dotenv/config"
import { createRoomSchema, signinSchema, signupSchema } from "@repo/common/zod";
import express from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./middleware";
import AuthenticatedRequest from "./middleware";

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedData = signupSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect format."
        })
        return;
    }

    try{
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 5);

        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                userName: parsedData.data.userName
            }
        });
        // generating jwt
        const token = jwt.sign({
            userId: user.id
        }, process.env.JWT_SECRET!);

        res.status(200).json({
            message: "Signup succussful.",
            token: token
        })
    } catch {
        res.status(409).json({
            message: "Email already exist."
        })
    }
})

app.post("/signin", async (req, res) => {
    const parsedData = signinSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect format."
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email
        }
    })

    if(!user) {
        res.status(401).json({
            message: "Email does not exist."
        })
        return;
    }

    const passwordMatched = await bcrypt.compare(parsedData.data.password, user.password);

    if(!passwordMatched) {
        res.status(401).json({
            message: "Incorrect password."
        })
        return;
    } else {
        const token = jwt.sign({
            userId: user.id
        }, process.env.JWT_SECRET!);

        res.status(200).json({
            message: "Signin succussful.",
            token: token
        })
    }
})

// to create room
app.post("/room", userMiddleware, async(req: AuthenticatedRequest, res) => {
    const parsedData = createRoomSchema.safeParse(req.body);

    if(!parsedData.success) {
        res.status(411).json({
            message: "Incorrect input."
        })
        return;
    }

    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.roomName,
                adminId: userId!
            }
        });
    
        res.status(200).json({
            roomId: room.id,
            message: "Room created succussfully."
        });
    } catch {
        res.status(409).json({
            message: "Room name already exist."
        });
    }
});

app.listen(3001);
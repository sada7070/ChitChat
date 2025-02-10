import "dotenv/config"
import { signupSchema } from "@repo/common/zod";
import express from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/prismaClient";
import jwt from "jsonwebtoken";

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
            token: token,
            message: "Signup succussful."
        })
    } catch {
        res.status(409).json({
            message: "Email already exist."
        })
    }
})

app.listen(3001);
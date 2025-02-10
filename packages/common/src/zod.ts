import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4).max(20),
    userName: z.string().min(4).max(20)
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const createRoomSchema = z.object({
    roomName: z.string().max(20)
});
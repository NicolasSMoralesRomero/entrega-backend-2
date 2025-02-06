import { config } from "dotenv";

config();

export const CONFIG = {
    PORT: process.env.PORT || 5000,
    MONGO: {
        URL: process.env.MONGO_URL,
        SECRET: process.env.MONGO_SECRET
    },
    JWT_SECRET: process.env.JWT_SECRET,
    GITHUB: {
        CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        CALLBACK_URL: process.env.CALLBACK_URL
    },

}
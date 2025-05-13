import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const genAI = new GoogleGenerativeAI("AIzaSyAa880E97wd_NjWNc-VJcS6O1jvx2goaJs");

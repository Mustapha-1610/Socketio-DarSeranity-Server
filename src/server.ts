import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import renterNameSpaceLogic from "../src/renter/renterSocketLogic";
import landlordNameSpaceLogic from "../src/landlord/landlordSocketLogic";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://dar-seranity.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

// Simple GET route
app.get("/", (req, res) => {
  res.send("Hello, Server!");
});

const serverApp = http.createServer(app);
const io = new Server(serverApp, {
  cors: {
    origin: ["http://localhost:3000", "https://dar-seranity.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 80;
serverApp.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}!`);
});

const renterNameSpace = io.of("/renter");
const landlordNameSpace = io.of("/landlord");

renterNameSpaceLogic(renterNameSpace);
landlordNameSpaceLogic(landlordNameSpace);

export { renterNameSpace, landlordNameSpace };

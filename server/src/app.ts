import express from "express";
import "dotenv/config";
import itemRoutes from "./routes/item.js";

const app = express();

app.use(express.json());
app.use("/items", itemRoutes);

app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.listen(3333, () => {
    console.log("Server started");
});

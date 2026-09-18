import express from "express";
import "dotenv/config";
import itemRoutes from "./routes/item.js";
import { createItem } from "./db/queries/itemQueries.js";

const app = express();

app.use(express.json());
app.use("/items", itemRoutes);

app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.listen(3000, () => {
    console.log("Server started");
});

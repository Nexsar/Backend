import express from "express";
import cors from "cors";

import workerRouter from "./routes/workerRouter";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/worker", workerRouter);

app.listen(7000, () => {
  console.log("worker listening at port 7000");
});

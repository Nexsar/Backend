import express, { urlencoded } from "express";
import cors from "cors";

import distributorRouter from "./router/distributorRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/distributor", distributorRouter);

app.listen(8000, () => {
  console.log("Server up at port 8000");
});

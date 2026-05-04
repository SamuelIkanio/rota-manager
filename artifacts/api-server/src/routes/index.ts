import { Router, type IRouter } from "express";
import healthRouter from "./health";
import rotaRouter from "./rota";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/rota", rotaRouter);

export default router;

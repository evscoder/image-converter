import { Router } from 'express';
import { appRouter } from '../modules/app/app.routes';
import { healthRouter } from './health';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(appRouter);

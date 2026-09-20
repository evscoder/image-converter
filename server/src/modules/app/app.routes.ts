import { Router } from 'express';
import { readAppData, writeAppData } from './app.repository';

export const appRouter = Router();

appRouter.get('/app', async (_req, res, next) => {
  try {
    const appData = await readAppData();

    res.json(appData);
  } catch (error) {
    next(error);
  }
});

appRouter.put('/app/title', async (req, res, next) => {
  try {
    const { title } = req.body;

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        message: 'title must be a non-empty string',
      });
    }

    const appData = await writeAppData({
      title: title.trim(),
    });

    return res.json(appData);
  } catch (error) {
    return next(error);
  }
});

appRouter.delete('/app/title', async (_req, res, next) => {
  try {
    const appData = await writeAppData({
      title: '',
    });

    return res.json(appData);
  } catch (error) {
    return next(error);
  }
});

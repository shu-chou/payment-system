import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createGlobalErrorHandler } from './handlers/global/error.handler';
import { setupSwagger } from './configs/swagger.config';
import { container } from './configs/inversify.config';
import { TYPES } from './types/types';
import { createApiErrorHandler } from './handlers/error/error.handler';
import { Logger } from 'pino';
import paymentRouter from './routers/payment.router';
import statusRouter from './routers/status.router';
import metricsRouter from './routers/metrics.router';

export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running');
});


//Routes
app.use('/api', paymentRouter); 
app.use('/api', statusRouter);
app.use('/api', metricsRouter);

const logger = container.get<Logger>(TYPES.Logger);
app.use(createApiErrorHandler(logger));
app.use(createGlobalErrorHandler(logger));

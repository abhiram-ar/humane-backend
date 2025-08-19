import express from 'express';
import authRouter from './routes/userAuth.router';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middeware';
import cookieParse from 'cookie-parser';
import cors from 'cors';
import adminAuthRouter from './routes/adminAuth.router';
import globalRefreshRouter from './routes/globalRefresh.router';
import adminUserManagementRouter from './routes/adminUserManagement.router';
import userProfileRouter from './routes/userProfile.router';
import { seedUser } from 'test/seedController';
import userRelationshipRouter from './routes/userRelationship.router';
import { sendBulkFriendReq } from 'test/sendBulkFriendReq';
import internalRouter from './routes/internal.router';
import { authorizedRoles, isAuthenticatedV2 } from 'humane-common';

const app = express();

app.use(
   cors({
      origin: ['http://localhost:5173', 'http://humanedevfe.abhiram-ar.com:5173'],
      credentials: true,
   })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParse());

app.get('/api/v1/user/health', (req, res) => {
   res.status(200).json({ status: 'OK' });
});

app.use('/api/v1/internal', internalRouter);

app.post('/api/v1/user/seed', seedUser);
app.post('/api/v1/user/test/send-friend-req', sendBulkFriendReq);

app.use('/api/v1/global/auth/refresh', globalRefreshRouter);
app.use('/api/v1/user/auth', authRouter);
app.use('/api/v1/admin/auth', adminAuthRouter);

app.use('/api/v1/user/social', userRelationshipRouter);

app.use('/api/v1/user/profile', isAuthenticatedV2, authorizedRoles('user'), userProfileRouter);

app.use(
   '/api/v1/admin/manage/user',
   isAuthenticatedV2,
   authorizedRoles('admin'),
   adminUserManagementRouter
);

app.use(errorHandler);
export default app;

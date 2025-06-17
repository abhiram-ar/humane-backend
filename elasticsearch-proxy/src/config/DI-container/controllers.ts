import { InternalQueryController } from 'controllers/InternalUserQuery.controller';
import { commentServices, externalUserServices, postServices, userServices } from './services';
import { PublicUserQueryController } from 'controllers/PublicUserQuery.controller';
import { PublicPostQueryControllet } from 'controllers/PublicPostQuery.controller';
import { PublicCommentController } from 'controllers/PublicCommentQuery.controller';

export const internalQueryController = new InternalQueryController(
   userServices,
   postServices
);
export const publicUserQueryController = new PublicUserQueryController(userServices);
export const publicPostQueryController = new PublicPostQueryControllet(
   postServices,
   userServices,
   externalUserServices
);

export const publicCommentController = new PublicCommentController(commentServices, userServices);

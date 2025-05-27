import { UserAuthController } from '@presentation/controllers/user.controller';
import {
   forgotPassoword,
   generatePresignedURL,
   getCurrentUserProfile,
   recoverPassword,
   refreshUserAccessToken,
   singupUser,
   updateUserAvatar,
   updateUserCoverPhoto,
   updateUserProfile,
   userEmailLogin,
   userGooglgAuth,
   verifyUser,
} from '@di/usecase/userUsercase.container';
import { googleOAuth2Client } from '@infrastructure/service/GoogleOAuth2Service';
import { UserProfileController } from '@presentation/controllers/userProfile.controller';
import { UserRelationshipController } from '@presentation/controllers/userRelationship.controller';
import {
   getFriendList,
   getFriendRequestList,
   sendFriendRequest,
} from '@di/usecase/friendshipUsercase.container';

export const userAuthController = new UserAuthController(
   singupUser,
   verifyUser,
   userEmailLogin,
   refreshUserAccessToken,
   forgotPassoword,
   recoverPassword,
   googleOAuth2Client,
   userGooglgAuth
);

export const userProfileController = new UserProfileController(
   getCurrentUserProfile,
   updateUserProfile,
   generatePresignedURL,
   updateUserAvatar,
   updateUserCoverPhoto
);

export const userRelationshipController = new UserRelationshipController(
   sendFriendRequest,
   getFriendRequestList,
   getFriendList
);

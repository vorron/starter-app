import { SessionUser } from './session-types';
import { User } from '@/entities/user/model/types';

export function sessionUserToUser(
  sessionUser: SessionUser,
  additionalFields: {
    createdAt: string;
    updatedAt: string;
  }
): User {
  return {
    ...sessionUser,
    ...additionalFields,
  };
}

export function userToSessionUser(user: User): SessionUser {
  const { ...sessionUser } = user;
  return sessionUser;
}

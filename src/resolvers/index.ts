import { UserService } from '../database/userService.js';
import { User, CreateUserInput, UpdateUserInput } from '../types/index.js';

export const resolvers = {
  Query: {
    users: async (): Promise<User[]> => {
      const userService = new UserService();
      return await userService.getAllUsers();
    },

    user: async (_: unknown, { id }: { id: string }): Promise<User | null> => {
      const userService = new UserService();
      return await userService.getUserById(id);
    },
  },

  Mutation: {
    createUser: async (
      _: unknown,
      { name, email, age }: CreateUserInput
    ): Promise<User> => {
      const userService = new UserService();
      return await userService.createUser({ name, email, age });
    },

    updateUser: async (
      _: unknown,
      { id, name, email, age }: UpdateUserInput
    ): Promise<User | null> => {
      const userService = new UserService();
      return await userService.updateUser({ id, name, email, age });
    },

    deleteUser: async (_: unknown, { id }: { id: string }): Promise<boolean> => {
      const userService = new UserService();
      return await userService.deleteUser(id);
    },
  },
};
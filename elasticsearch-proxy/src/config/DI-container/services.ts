import { UserServices } from "@services/user.services";
import { userRepository } from "./repository";

export const userServices = new UserServices(userRepository)
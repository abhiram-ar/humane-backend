import { CreateAnonymousUser } from "@application/useCases/anonymous/CreateAnonymousUser.usercase";
import { mongoAnonUserRepository } from "../repository.container";
import { cryptoUUIDService } from "../services.container";
import { ResolveAnoymousUser } from "@application/useCases/anonymous/ResolveAnonymousUser.usecase";



export const creataAnonUser = new CreateAnonymousUser(mongoAnonUserRepository, cryptoUUIDService);
export const resolveAnonUser = new ResolveAnoymousUser(mongoAnonUserRepository);
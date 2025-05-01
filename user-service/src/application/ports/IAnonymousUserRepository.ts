import { Anonymous } from "@domain/entities/anon.entity";

interface IAnonymousUserRepository{
    create(userId: string, anonId: string): Anonymous
}
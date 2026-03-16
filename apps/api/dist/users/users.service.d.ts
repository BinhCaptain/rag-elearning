import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<Omit<User, 'passwordHash'> | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
}

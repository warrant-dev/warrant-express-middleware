import { Client } from "@warrantdev/warrant-node";
import { Request, Response, NextFunction } from "express";

export type GetUserIdFunc = () => string | number | null;

export interface WarrantConfig {
    clientId: string;
    clientKey: string;
    getUserId: GetUserIdFunc;
}

function createAuthorizeRoute(client: Client, getUserId: GetUserIdFunc) {
    return (objectType: string, objectIdParam: string, relation: string) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const objectId = req.params[objectIdParam];
            const userId = getUserId();

            if (userId === null) {
                res.sendStatus(401);
            }

            if (await client.isAuthorized(objectType, objectId, relation, userId.toString())) {
                next();
                return;
            }

            res.sendStatus(401);
        };
    };
}

export function createMiddleware(config: WarrantConfig) {
    const client = new Client(config.clientKey);

    return createAuthorizeRoute(client, config.getUserId);
}

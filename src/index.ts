import { Client } from "@warrantdev/warrant-node";
import { Request, Response, NextFunction } from "express";

export { WARRANT_IGNORE_ID } from "@warrantdev/warrant-node";

export type GetObjectIdFunc = (req: Request) => string;

export type GetUserIdFunc = (req: Request) => string | number | null;

export type OnAuthorizeFailure = (req: Request, res: Response) => any;

export type HasPermissionMiddleware = (permissionId: string) => (req: Request, res: Response, next?: NextFunction) => void;

export type HasAccessMiddleware = (objectType: string, getObjectId: GetObjectIdFunc, relation: string) => (req: Request, res: Response, next?: NextFunction) => void;

export interface WarrantConfig {
    clientKey: string;
    getUserId: GetUserIdFunc;
    getObjectId?: GetObjectIdFunc;
    onAuthorizeFailure?: OnAuthorizeFailure;
}

export interface WarrantMiddleware {
    hasPermission: HasPermissionMiddleware;
    hasAccess: HasAccessMiddleware;
}

function createHasAccessMiddleware(client: Client, getUserId: GetUserIdFunc, onAuthorizeFailure: OnAuthorizeFailure) {
    return (objectType: string, getObjectId: GetObjectIdFunc, relation: string) => {
        return async (req: Request, res: Response, next?: NextFunction) => {
            const objectId = getObjectId(req);
            const userId = getUserId(req);

            if (userId === null) {
                onAuthorizeFailure(req, res);
                return;
            }

            if (await client.isAuthorized(objectType, objectId, relation, userId.toString())) {
                if (next) {
                    next();
                }

                return;
            }

            onAuthorizeFailure(req, res);
        };
    };
}

function createHasPermissionMiddleware(client: Client, getUserId: GetUserIdFunc, onAuthorizeFailure: OnAuthorizeFailure) {
    return (permissionId: string) => {
        return async (req: Request, res: Response, next?: NextFunction) => {
            const userId = getUserId(req);

            if (userId === null) {
                onAuthorizeFailure(req, res);
                return;
            }

            if (await client.hasPermission(permissionId, userId.toString())) {
                if (next) {
                    next();
                }

                return;
            }

            onAuthorizeFailure(req, res);
        };
    };
}

export function createMiddleware(config: WarrantConfig): WarrantMiddleware {
    const client = new Client(config.clientKey);
    let onAuthorizeFailure = (req: Request, res: Response) => res.sendStatus(401);

    if (config.onAuthorizeFailure) {
        onAuthorizeFailure = config.onAuthorizeFailure;
    }

    return {
        hasPermission: createHasPermissionMiddleware(client, config.getUserId, onAuthorizeFailure),
        hasAccess: createHasAccessMiddleware(client, config.getUserId, onAuthorizeFailure),
    };
}

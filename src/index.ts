import { Client } from "@warrantdev/warrant-node";
import { Request, Response, NextFunction } from "express";

export type GetObjectIdFunc = (req: Request, res: Response) => string;

export type GetUserIdFunc = (req: Request, res: Response) => string | number | null;

export type OnAuthorizeFailure = (req: Request, res: Response) => any;

export type HasPermissionMiddleware = (permissionId: string) => (req: Request, res: Response, next?: NextFunction) => void;

export type HasAccessMiddleware = (objectType: string, getObjectId: GetObjectIdFunc, relation: string) => (req: Request, res: Response, next?: NextFunction) => void;

export interface WarrantConfig {
    client: Client;
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
            const objectId = getObjectId(req, res);
            const userId = getUserId(req, res);

            if (userId === null) {
                onAuthorizeFailure(req, res);
                return;
            }

            const hasAccess = await client.isAuthorized({
                warrants: [{
                    objectType,
                    objectId,
                    relation,
                    subject: {
                        objectType: "user",
                        objectId: userId.toString(),
                    },
                }],
            });
            if (hasAccess) {
                if (next) next();
                return;
            }

            onAuthorizeFailure(req, res);
        };
    };
}

function createHasPermissionMiddleware(client: Client, getUserId: GetUserIdFunc, onAuthorizeFailure: OnAuthorizeFailure) {
    return (permissionId: string) => {
        return async (req: Request, res: Response, next?: NextFunction) => {
            const userId = getUserId(req, res);

            if (userId === null) {
                onAuthorizeFailure(req, res);
                return;
            }

            const hasPermission = await client.hasPermission({
                permissionId,
                userId: userId.toString(),
            });
            if (hasPermission) {
                if (next) next();
                return;
            }

            onAuthorizeFailure(req, res);
        };
    };
}

export function createMiddleware(config: WarrantConfig): WarrantMiddleware {
    let onAuthorizeFailure = (req: Request, res: Response) => res.sendStatus(401);

    if (config.onAuthorizeFailure) {
        onAuthorizeFailure = config.onAuthorizeFailure;
    }

    return {
        hasPermission: createHasPermissionMiddleware(config.client, config.getUserId, onAuthorizeFailure),
        hasAccess: createHasAccessMiddleware(config.client, config.getUserId, onAuthorizeFailure),
    };
}

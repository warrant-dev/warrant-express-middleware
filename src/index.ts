import { Client } from "@warrantdev/warrant-node";
import { Request, Response, NextFunction } from "express";

export { WARRANT_IGNORE_ID } from "@warrantdev/warrant-node";

export type GetParamFunc = (req: Request, paramName: string) => string;

export type GetUserIdFunc = (req: Request) => string | number | null;

export type OnAuthorizeFailure = (req: Request, res: Response) => any;

export interface WarrantConfig {
    clientKey: string;
    getParam?: GetParamFunc;
    getUserId: GetUserIdFunc;
    onAuthorizeFailure?: OnAuthorizeFailure;
}

function createAuthorizeRoute(client: Client, getParam: GetParamFunc, getUserId: GetUserIdFunc, onAuthorizeFailure: OnAuthorizeFailure) {
    return (objectType: string, objectIdParam: string, relation: string) => {
        return async (req: Request, res: Response, next?: NextFunction) => {
            const objectId = getParam(req, objectIdParam);
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

export function createMiddleware(config: WarrantConfig) {
    const client = new Client(config.clientKey);
    let getParam = (req: Request, paramName: string) => req.params[paramName];
    let onAuthorizeFailure = (req: Request, res: Response) => res.sendStatus(401);

    if (config.getParam) {
        getParam = config.getParam;
    }

    if (config.onAuthorizeFailure) {
        onAuthorizeFailure = config.onAuthorizeFailure;
    }

    return createAuthorizeRoute(client, getParam, config.getUserId, onAuthorizeFailure);
}

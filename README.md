# Warrant Express.js Authorization Middleware

Use [Warrant](https://warrant.dev/) in server-side Express.js projects.

[![npm](https://img.shields.io/npm/v/@warrantdev/warrant-express-middleware)](https://www.npmjs.com/package/@warrantdev/warrant-express-middleware)
[![Discord](https://img.shields.io/discord/865661082203193365?label=discord)](https://discord.gg/QNCMKWzqET)

## Installation

Use `npm` to install the Warrant module:

```sh
npm install @warrantdev/warrant-express-middleware
```

## Usage

### Initializing the Middleware
Import the `createMiddleware` function and call it with some initialization options to get a configured middleware function you can protect your API routes with:
```js
const Warrant = require("@warrantdev/warrant-express-middleware");
const authorize = Warrant.createMiddleware({
    clientKey: "api_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=",
    getUserId: (req) => MyUserSession.getUserId(req).toString(), // Tell the middleware how to get the current user in your API
});

// The authorize middleware will run before the route code.
app.get("/api/posts/:postId", authorize("post", "postId", "viewer"), (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
        res.sendStatus(404);
        return;
    }

    res.json(post);
});
```
Or using ES modules:
```js
import { createMiddleware } from "@warrantdev/warrant-express-middleware";
const authorize = Warrant.createMiddleware({
    clientKey: "api_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=",
    getUserId: (req) => MyUserSession.getUserId(req).toString(), // Tell the middleware how to get the current user in your API
});

// The authorize middleware will run before the route code.
app.get("/api/posts/:postId", authorize("post", "postId", "viewer"), (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
        res.sendStatus(404);
        return;
    }

    res.json(post);
});
```

### Using the Middleware
Once you've initialized the middleware as shown above, you can use it to protect your Express.js API routes:
```js
// The authorize middleware will check that the current user is a "viewer"
// of the particular Post with id postId before executing the route.
app.get("/api/posts/:postId", authorize("post", "postId", "viewer"), (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
        res.sendStatus(404);
        return;
    }

    res.json(post);
});
```

## Options
The middleware supports options that allow you to configure how it works during the initialization step. All options are required unless stated that they are optional.

### `clientKey`
`string` - This is the API Key from the Warrant Dashboard. Without this value, the middleware cannot make requests to the Warrant API to perform access checks in your application.

### `getUserId(req)`
`function` - A function executed by the middleware in order to get the userId for which to perform an access check. Use this function to tell the middleware how to get the current user's id. Usually this user is determined using the current session or authentication token provided in the request.

### `getParam(req, paramName)` (Optional)
`function` - A function executed by the middleware in order to get the objectId for which to perform an access check. Use this function to tell the middleware how to get the objectId for an API endpoint. This option defaults to:
```js
(req: Request, paramName: string) => req.params[paramName]
```

### `onAuthorizeFailure(req, res)` (Optional)
`function` - A function executed by the middleware when an access check fails (the user is unauthorized). Use this function to tell the middleware what to do when a user fails an access check. This option defaults to:
```js
(req: Request, res: Response) => res.sendStatus(401)
```

**NOTE:** To ignore the `objectId` when performing authorization calls using the middleware, you can pass the constant `WARRANT_IGNORE_ID` for the `objectIdParam` parameter. You must have a corresponding warrant that grants access to **ANY** user on the given `objectType` for this check to succeed.
```js
import { WARRANT_IGNORE_ID } from "@warrantdev/warrant-express-middleware";

app.get("/api/posts", authorize("post", WARRANT_IGNORE_ID, "viewer"), (req, res) => {
    res.json(getPosts());
});
```

We’ve used a random API key in these code examples. Replace it with your
[actual publishable API keys](https://app.warrant.dev) to
test this code through your own Warrant account.

For more information on how to use the Warrant API, please refer to the
[Warrant API reference](https://docs.warrant.dev).

Note that we may release new [minor and patch](https://semver.org/) versions of
`@warrantdev/warrant-express-middleware` with small but backwards-incompatible fixes to the type
declarations. These changes will not affect Warrant itself.

## TypeScript support

This package includes TypeScript declarations for Warrant.

## Warrant Documentation

- [Warrant Docs](https://docs.warrant.dev/)

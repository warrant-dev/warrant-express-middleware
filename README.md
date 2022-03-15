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
const { hasPermission, hasAccess } = Warrant.createMiddleware({
  clientKey: "api_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=",
  getUserId: (req) => MyUserSession.getUserId(req).toString(), // Tell the middleware how to get the current user in your API
});

// The hasAccess middleware will run before the route code.
app.get(
  "/api/posts/:postId",
  hasAccess("post", (req) => req.params["postId"], "viewer"),
  (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.json(post);
  }
);
```

Or using ES modules:

```js
import { createMiddleware } from "@warrantdev/warrant-express-middleware";
const { hasPermission, hasAccess } = Warrant.createMiddleware({
  clientKey: "api_test_f5dsKVeYnVSLHGje44zAygqgqXiLJBICbFzCiAg1E=",
  getUserId: (req) => MyUserSession.getUserId(req).toString(), // Tell the middleware how to get the current user in your API
});

// The hasAccess middleware will run before the route code.
app.get(
  "/api/posts/:postId",
  hasAccess("post", (req) => req.params["postId"], "viewer"),
  (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.json(post);
  }
);
```

### Using the Middleware

Once you've initialized the middleware as shown above, you can use either the `hasPermission` or the `hasAccess` method to protect your Express.js API routes:

#### `hasPermission`

```js
// The hasPermission middleware will check that the current user
// has the specified permission before executing the route.
app.post("/api/posts", hasPermission("create-posts"), (req, res) => {
  try {
    const newPost = createPost(req.body);
    res.json(newPost);
  } catch (e) {
    res.sendStatus(e.code);
  }
});
```

#### `hasAccess`

```js
// The hasAccess middleware will check that the current user is a "viewer"
// of the particular Post with id postId before executing the route.
app.get(
  "/api/posts/:postId",
  hasAccess("post", (req) => req.params["postId"], "viewer"),
  (req, res) => {
    const { postId } = req.params;
    const post = getPost(postId);

    if (!post) {
      res.sendStatus(404);
      return;
    }

    res.json(post);
  }
);
```

The `hasPermission` middleware function takes a single argument:

#### `permissionId`

`string` - This is the string id of the permission you want to check for (ex: `"view-posts"`).

The `hasAccess` middleware function takes 3 arguments:

#### `objectType`

`string` - This is the object type you want to perform an access check for. To learn more about creating object types, visit our [documentation](https://docs.warrant.dev/).

#### `getObjectId(req)`

`function` - A function executed by the middleware in order to get the id of the object for which to perform the access check. In most scenarios, this will be the value of one of the request params. An example of what this function might look like:

```js
(req: Request) => req.params["myParam"];
```

#### `relation`

`string` - This is the relation you want to perform an access check for. To learn more about relations, visit our [documentation](https://docs.warrant.dev/).

## Configuration Options

The middleware supports options that allow you to configure how it works during the initialization step. All options are required unless stated that they are optional.

### `clientKey`

`string` - This is the API Key from the Warrant Dashboard. Without this value, the middleware cannot make requests to the Warrant API to perform access checks in your application.

### `getUserId(req)`

`function` - A function executed by the middleware in order to get the userId for which to perform an access check. Use this function to tell the middleware how to get the current user's id. Usually this user is determined using the current session or authentication token provided in the request.

### `onAuthorizeFailure(req, res)` (Optional)

`function` - A function executed by the middleware when an access check fails (the user is unauthorized). Use this function to tell the middleware what to do when a user fails an access check. This option defaults to:

```js
(req: Request, res: Response) => res.sendStatus(401);
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

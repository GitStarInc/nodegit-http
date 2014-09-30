Read-only GitHub-like HTTP API using [nodegit](https://github.com/nodegit/nodegit).

While there are a few similar node projects out there, the goal of this project is to keep the implementation as simple and as hackable as possible.

### Install & Usage

```shell
npm install -g nodegit
npm install -g nodegit-http

nodegit-http [--base=BASE_DIR] [--port=PORT] [--auth=AUTH_FILE]
```

**nodegit-http** serves any git repositories from the current directory, or that specified by the environment variable `BASE_DIR`.  The assumed directory structure is as follows:

```
BASE_DIR/user/repo.git
BASE_DIR/anotheruser/theirrepo.git
...
```

#### Authorization

The binary takes a file path to an authorization node module. This module is expected to define a middleware function that the server will use for authorization:

```javascript
modules.exports = function(req, res, next) {
  //E.g., allow : next();
  //E.g., deny  : next("Signal error");
};
```

The function is provided with the HTTP request (`req`), which you can use extract authorization information from; the response (`res`) can be used to directly produce an HTTP response; and, `next` should be used to to pass control to the next middleware. See [express.js middleware](http://expressjs.com/4x/api.html#middleware.api) for more information.

### Using as a library

You can also use nodegit-http as a library

```javascript
var githttp = require('nodegit-http');
var app  = githttp({ baseDir: ...
                   , authorize: function (req, res, next) {
                     ...
                   });

app.listen(PORT);
console.log('Serving repos from %s on port %d', BASE_DIR, PORT);
```

The module requires a base directory, specified by the property
`baseDir` of the options argument. The app will use the specified
'authorize' function for authorization, if provided. Otherwise it will
just use allow all requests.

Finally, it returns an `app` object which is a [express.js Application](http://expressjs.com/4x/api.html#express), that you can use as usual. The module will use the `app` provided in the (property `app`) options object; this is useful if you wish to define that should match first.

### API

The server exposes several routes, similar to the [GitHub-API](https://developer.github.com/v3/git/). All responses are JSON.

* [`GET /repos/:user/:repo/git/blobs/:sha`](https://developer.github.com/v3/git/blobs/#get-a-blob): get a blob.
* [`GET /repos/:user/:repo/git/refs`](https://developer.github.com/v3/git/refs/#get-all-references): get all references.
* [`GET /repos/:user/:repo/git/refs/:sub`](https://developer.github.com/v3/git/refs/#get-all-references): get all sub-namespace references.
* [`GET /repos/:user/:repo/git/refs/*`](https://developer.github.com/v3/git/refs/#get-a-reference): get a reference.
* [`GET /repos/:user/:repo/git/commits/:sha`](https://developer.github.com/v3/git/commits/#get-a-commit): get a commit.
* [`GET /repos/:user/:repo/git/trees/:sha`](https://developer.github.com/v3/git/trees/#get-a-tree): get a tree.
* [`GET /repos/:user/:repo/git/tags/:sha`](https://developer.github.com/v3/git/tags/#get-a-tag): get a tag.

Read-only GitHub-like HTTP API using [nodegit](https://github.com/nodegit/nodegit).

While there are a few similar node projects out there, the goal of this project is to keep the implementation as simple and as hackable as possible.

### Install & Usage

```shell
npm install -g nodegit
npm install -g nodegit-http

nodegit-http [BASE_DIR [, PORT]]
```

Or from source:

```shell
git clone git@github.com:deian/nodegit-http.git
cd nodegit-http && npm install && npm --BASE_DIR=/var/repos/ --PORT=1337 start
```

**nodegit-http** serves any git repositories from the current directory, or that specified by the environment variable `BASE_DIR`.  The assumed directory structure is as follows:

```
BASE_DIR/user/repo.git
BASE_DIR/anotheruser/theirrepo.git
...
```

### API

The server exposes sevaral routes, similar to the [GitHub-API](https://developer.github.com/v3/git/). All responses are JSON.

* [`GET /repos/:user/:repo/git/blobs/:sha`](https://developer.github.com/v3/git/blobs/#get-a-blob): get a blob.
* [`GET /repos/:user/:repo/git/refs`](https://developer.github.com/v3/git/refs/#get-all-references): get all references.
* [`GET /repos/:user/:repo/git/refs/:sub`](https://developer.github.com/v3/git/refs/#get-all-references): get all sub-namespace references.
* [`GET /repos/:user/:repo/git/refs/*`](https://developer.github.com/v3/git/refs/#get-a-reference): get a reference.
* [`GET /repos/:user/:repo/git/commits/:sha`](https://developer.github.com/v3/git/commits/#get-a-commit): get a commit.
* [`GET /repos/:user/:repo/git/trees/:sha`](https://developer.github.com/v3/git/trees/#get-a-tree): get a tree.
* [`GET /repos/:user/:repo/git/tags/:sha`](https://developer.github.com/v3/git/tags/#get-a-tag): get a tag.

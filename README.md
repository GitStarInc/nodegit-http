Read-only GitHub-like HTTP API using [nodegit](https://github.com/nodegit/nodegit).

While there are a few similar node projects out there, the goal of this project is to keep the implementation as simple as possible.  As a result, there are no users and thus no authentication.

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
BASE_DIR/repo.git
BASE_DIR/myotherrepo.git
...
```

### API

The server exposes sevaral routes, similar to the [GitHub-API](https://developer.github.com/v3/git/). All responses are JSON.

* [`GET /repos/:repo/git/blobs/:sha`](https://developer.github.com/v3/git/blobs/#get-a-blob): get a blob.
* [`GET /repos/:repo/git/refs`](https://developer.github.com/v3/git/refs/#get-all-references): get all references.
* [`GET /repos/:repo/git/refs/:sub`](https://developer.github.com/v3/git/refs/#get-all-references): get all sub-namespace references.
* [`GET /repos/:repo/git/refs/*`](https://developer.github.com/v3/git/refs/#get-a-reference): get a reference.
* [`GET /repos/:repo/git/commits/:sha`](https://developer.github.com/v3/git/commits/#get-a-commit): get a commit.
* [`GET /repos/:repo/git/trees/:sha`](https://developer.github.com/v3/git/trees/#get-a-tree): get a tree.
* [`GET /repos/:repo/git/tags/:sha`](https://developer.github.com/v3/git/tags/#get-a-tag): get a tag.

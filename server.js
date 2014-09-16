#!/usr/bin/env node
var fs      = require('fs');
var async   = require('async');
var express = require('express');
var git     = require('nodegit');
var debug   = require('debug')('nodegit-express');
var _       = require('underscore');

var BASE_DIR = fs.realpathSync(process.argv[2] || process.env.BASE_DIR ||
                               process.env.npm_config_BASE_DIR || __dirname);
var PORT = process.argv[3] || process.env.PORT ||
           process.env.npm_config_PORT || 3000;

var app = express();

// Handle params

app.param('repo', function (req, res, next, name) {
  if (!/^(\w|-)+$/.test(name)) {
    next("Invalid repo name: " + name);
  } else {
    git.Repo.open(BASE_DIR+"/"+name+".git", function (err, repo) {
      if (err) next(err);
      else {
        req.repo = repo;
        next();
      }
    });
  }
});

app.param('sha', function (req, res, next, sha) {
  if (!/^[0-9A-Fa-f]{40}$/.test(sha)) {
    next("Invalid object id");
  } else {
    next();
  }
});

// Refrerences

app.get('/repos/:repo/git/refs', function(req, res) {
  handlGetReferences(req, res);
});

app.get('/repos/:repo/git/refs/:sub', function(req, res) {
  var sub = "refs/"+req.params.sub+"/";
  handlGetReferences(req, res, function (name) {
    return (name.indexOf(sub) === 0);
  });
});

app.get('/repos/:repo/git/refs/*', function(req, res) {
  var name = "refs/"+req.params[0];
  refNameToJSON.bind(req.repo)(name, function (err, refs) {
    if (err) {
      res.status(500).json({ error: err.toString() });
    } else {
      res.status(200).json(refs);
    }
  });
});

// Commits


app.get('/repos/:repo/git/commits/:sha', function(req, res) {
  var sha = req.params.sha;
  req.repo.getCommit(sha, function (err, commit) {
    if (err) {
       res.status(500).json({ error: err.toString() });
    } else {
       function oidJSON(oid) { return {sha: oid.sha()}; }
       res.status(200).json(
         { sha       : sha
         , author    : authorToJSON(commit.author())
         , committer : authorToJSON(commit.committer())
         , message   : commit.message()
         , tree      : oidJSON(commit.treeId())
         , parents   : _.map(commit.parents(), oidJSON)
                     
         });
    }
  });
});

// Trees

app.get('/repos/:repo/git/trees/:sha', function(req, res) {
  var sha = req.params.sha;
  async.waterfall([
    req.repo.getTree.bind(req.repo, sha),
    function (tree, cb) {
      var entries = tree.entries();

      function entryType(ent) {
        var mode = ent.filemode();
        return ent.isTree() ? "tree"
             : ent.isBlob() ? "blob"
             : (mode == git.TreeEntry.FileMode.Commit) ? "commit"
             : (mode == git.TreeEntry.FileMode.Link)   ? "link"
             : (mode == git.TreeEntry.FileMode.New)    ? "new"
             : cb(new Error("Unknown tree entry type, with mode: "+mode))
      }

      function entryToJSON(ent, cb) {
        var jent = { path : ent.path()
                   , mode : ent.filemode().toString()
                   , type : entryType(ent)
                   , sha  : ent.sha() };
        if (!ent.isBlob()) {
          cb(null, jent);
        } else {
          var odb = req.repo.odb();
          odb.read(jent.sha, function (err, obj) {
            if (err) cb(err);
            jent.size = obj.size();
            cb(null, jent);
          });
        }
      }

      async.map(entries, entryToJSON, cb);
    }
  ], function (err, tree) {
       if (err) {
         res.status(500).json({ error: err.toString() });
       } else {
         res.status(200).json({ sha: sha, tree: tree });
       }
  });
});

// Blobs

app.get('/repos/:repo/git/blobs/:sha', function(req, res) {
  var sha = req.params.sha;
  req.repo.getBlob(sha, function (err, blob) {
    if (err) {
      res.status(500).json({ error: err.toString() });
    } else {
      res.status(200).json({ sha : sha
                           , size : blob.size()
                           , content : blob.content.toString() });
    }
  });
});

// Tags

app.get('/repos/:repo/git/tags/:sha', function(req, res) {
  var sha = req.params.sha;
  req.repo.getTag(sha, function (err, tag) {
    if (err) {
      res.status(500).json({ error: err.toString() });
    } else {
      debug("message: "+tag.message());
      res.status(200).json({ tag : tag.name()
                           , sha : sha
                           , message : tag.message()
                           , tagger : authorToJSON(tag.tagger())
                           , object : { type : objTypeToString(tag.targetType())
                                      , sha: tag.targetId().sha() }
                           });
    }
  });
});

app.listen(PORT);

console.log("Serving repos from %s on port %d", BASE_DIR, PORT);

// Helper functions

// Read references, but filter their names according to a (optional)
// supplied filter function
function handlGetReferences(req, res, filter) {
  async.waterfall([
    req.repo.getReferences.bind(req.repo, git.Reference.Type.All),
    function (refNames, cb) {
      if (filter) {
        refNames = _.filter(refNames, filter);
      }
      // convert reference names to references
      async.map(refNames, refNameToJSON.bind(req.repo), cb);
    }
  ], function (err, refs) {
     if (err) {
        res.status(500).json({ error: err.toString() });
     } else {
        res.status(200).json(refs);
     }
  });
}

// Convert an author object to a JSON form
function authorToJSON(auth) {
  var time = auth.time();
  var date = new Date(time.time() * 1000 + time.offset() * 60 * 1000);
  return  { date:  date
          , name:  auth.name()
          , email: auth.email() };
}

// Convert an object type to a stringified description
function objTypeToString(type) {
  return (type == git.Object.Type.Commit) ? "commit" :
         (type == git.Object.Type.Tree)   ? "tree"   :
         (type == git.Object.Type.Blob)   ? "blob"   :
         (type == git.Object.Type.Tag)    ? "tag"    :
         (type == git.Object.Type.Bad)    ? "bad"    : ""+type;
}

// Given a reference name, return a JSON-object containing the
// refernce type (tag/commit) and id:
// { ref: name, object: { type : (commit|tag), sha: sha } }
function refNameToJSON(name, cb) {
  var repo = this;
  var sha;
  async.waterfall([
    repo.getReference.bind(repo, name),
    function(ref, cb) {
      sha = ref.target();
      repo.getObject(sha, git.Object.Type.Any, cb);
    },
    function(obj, cb) {
      var type = objTypeToString(obj.type());
      cb(null, { ref: name, object: { type: type
                                    , sha : sha.toString() }});
    }
  ], cb);
}

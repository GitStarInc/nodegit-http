#!/usr/bin/env node
'use strict';
var fs      = require('fs');
var docopt  = require('docopt').docopt;
var githttp = require('./lib/nodegit-http');

var usage = _toString(function() {/*
Simple git http server.

Usage:
 $program [--base=BASE_DIR] [--port=PORT] [--auth=AUTH_FILE]
 $program -h | --help
 $program -v | --version

Options:
  --port=PORT       Port to listen on                       [default: 3000]
  --base=BASE_DIR   Base directory for user repositories
  --auth=AUTH_FILE  Filepath of authorization module
  -h --help         Show this
  -v --version      Get version
*/});

var cli = docopt(usage, {version: require('./package.json').version});

var BASE_DIR = fs.realpathSync(cli['--base'] || process.env.BASE_DIR  ||
                               process.env.npm_config_BASE_DIR || __dirname);

var PORT = parseInt(cli['--port'] || process.env.PORT ||
                    process.env.npm_config_PORT || '3000', 10);

var AUTH_FILE = cli['--auth'] || process.env.AUTH_FILE ||
                process.env.npm_config_AUTH_FILE;


var app = githttp({ baseDir: BASE_DIR
                  , authorize: AUTH_FILE ? require(AUTH_FILE) : undefined });

app.listen(PORT);
console.log('Serving repos from %s on port %d', BASE_DIR, PORT);


// Helper function

function _toString(f) {
  var program = __filename.split('/').slice(-1)[0];
  var lines = f.toString().replace(/\$program/g, program).split('\n');
  return lines.splice(1, lines.length - 2).join('\n');
}

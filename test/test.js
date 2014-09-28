var request = require('supertest');
var assert  = require('assert');
var util    = require('util');
var fs      = require('fs');


var BASE_DIR = fs.realpathSync('./test/repos');


var app = require('../lib/nodegit-http')({baseDir : BASE_DIR});

var refs = [ {ref:'refs/heads/mybranch',
              object: {type:'commit',
                       sha:'249a81e10c5cbc482557870a61edeec5b1d1a4cb'}}
           , {ref:'refs/heads/master',
              object:{type:'commit',
                      sha:'6a0b75bdd2a7e8f08670af9295be4f149344eec0'}}
           , {ref:'refs/tags/v0.0',
              object:{type:'tag',
                      sha:'3e0a08f77cf3d1d3cc8dacf62022ae22801fa366'}}];

describe('GET /refs', function (done) {
  it('respond with json', function (done) {
    request(app)
      .get('/repos/a/project1/git/refs')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(refs), done);
  });
});

describe('GET /refs/:sub', function (done) {
  it('respond with json', function (done) {
    request(app)
      .get('/repos/a/project1/git/refs/tags')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify([refs[2]]), done);
  });
});

describe('GET /refs/*', function (done) {
  it('respond with json', function (done) {
    request(app)
      .get('/repos/a/project1/git/refs/heads/master')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(refs[1]), done);
  });
});


describe('GET /commits/:sha', function (done) {
  it('respond with json', function (done) {
    var mybranch = {sha:'81f2b7a7ada4b5d7f6ca2c9b5a1a091c39be1404',
                    author:{date:'2014-09-20T22:48:54.000Z',
                            name:'Deian Stefan',
                            email:'deian@cs.stanford.edu'},
                    committer:{date:'2014-09-20T22:48:54.000Z',
                               name:'Deian Stefan',
                               email:'deian@cs.stanford.edu'},
                    message:'updated file\n',
                    tree:{sha:'2c4434ff2854c5928220ba7108175f3ccd1c1cd9'},
                    parents:[{sha:'9e73a2ab0df54e664edd5f554449399126aac3bd'}]};
    request(app)
      .get('/repos/a/project1/git/commits/81f2b7a7ada4b5d7f6ca2c9b5a1a091c39be1404')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(mybranch), done);
  });
});


describe('GET /trees/:sha', function (done) {
  it('respond with json', function (done) {
    var dir = {sha:'7e17bec02d663905c953f652b74421f0fc523a20',
               tree:[{path:'file',
                      mode:'100644',
                      type:'blob',
                      sha:'81b3b24d2d2e3eba3c0bbf86de70a7b90b08cd46',
                      size:5}]}
    request(app)
      .get('/repos/a/project1/git/trees/7e17bec02d663905c953f652b74421f0fc523a20')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(dir), done);
  });
});

describe('GET /blobs/:sha', function (done) {
  it('respond with json', function (done) {
    var file = {sha:'81b3b24d2d2e3eba3c0bbf86de70a7b90b08cd46',
                size:5,
                content: 'w00t\n'};
    request(app)
      .get('/repos/a/project1/git/blobs/81b3b24d2d2e3eba3c0bbf86de70a7b90b08cd46')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(file), done);
  });
});

describe('GET /tags/:sha', function (done) {
  it('respond with json', function (done) {
    var tag = {tag:'v0.0',
               sha:'3e0a08f77cf3d1d3cc8dacf62022ae22801fa366',
               message:'release world\n',
               tagger:{date:'2014-09-20T22:49:22.000Z',
                       name:'Deian Stefan',
                       email:'deian@cs.stanford.edu'},
               object:{type:'commit',
                       sha:'81f2b7a7ada4b5d7f6ca2c9b5a1a091c39be1404'}};
    request(app)
      .get('/repos/a/project1/git/tags/3e0a08f77cf3d1d3cc8dacf62022ae22801fa366')
      .expect('Content-Type', /json/)
      .expect(200, JSON.stringify(tag), done);
  });
});

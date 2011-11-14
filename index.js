var fs = require('fs'),
    path = require('path'),
    loaderPath = 'assets/loader.js';

exports.install = function(mesh, instance) {
    var app = this;
    
    // load the loader content
    fs.readFile(path.join(__dirname, loaderPath), 'utf8', function(err, content) {
        if (! err) {
            instance.get('/loader.js', function(req, res, next) {
                res.contentType(loaderPath);
                res.send(content);
            });
        }
    });
};
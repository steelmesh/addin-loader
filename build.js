var interleave = require('interleave'),
    fs = require('fs'),
    config = {
        aliases: {
            lab: 'github://getify/LABjs/LAB.js'
        }
    };

// build each of the builds
interleave('src', {
    multi: 'pass',
    path: 'assets',
    config: config
});
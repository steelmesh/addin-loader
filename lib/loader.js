var fs = require('fs'),
    path = require('path'),
    domainData = {},
    refererMatches = {},
    domain;
    
function extend() {
    var target = {},
        sources = Array.prototype.slice.call(arguments, 1);
    
    // if we have multiple arguments, then the target is the first
    if (arguments.length > 1) {
        target = arguments[0];
    } // if
    
    // iterate through the sources and copy to the target
    for (var ii = 0; ii < sources.length; ii++) {
        // iterate through the source keys and copy to the target
        for (var key in sources[ii]) {
            target[key] = sources[ii][key];
        } // for
    } // for
    
    return target;
} // if

function findAddins(domain, callback) {
    // look for addins in the html js addins directory for the domain
    fs.readdir('html/tripplanner/js/addins/' + domain, function(err, files) {
        if (! err) {
            callback(files.map(function(item) {
                return 'js/addins/' + domain + '/' + item;
            }));
        } // if
    });
} // findAddins

function findCustomSkin(domain, callback) {
    // look for addins in the html js addins directory for the domain
    path.exists('html/tripplanner/css/skins/' + domain + '.css', function(exists) {
        if (exists && callback) {
            callback('css/skins/' + domain + '.css');
        } // if
    });
} // findCustomSkin

function loadDomainConfig(mesh, domain, searchPath) {
    var configFile = path.resolve(searchPath, domain + '.json');
    
    fs.readFile(configFile, 'utf8', function(err, data) {
        if (! err) {
            mesh.log('loaded domain config: ' + configFile);

            var domainJSON = JSON.parse(data),
                regexStrings = domainJSON.regexes || [];
                
            // initialise the domain data
            domainData[domain] = extend({}, domainJSON);

            // set the regexes as an empty array as we have to initialize
            // these with proper regexes rather than strings
            domainData[domain].regexes = [];
            for (var ii = 0; ii < regexStrings.length; ii++) {
                domainData[domain].regexes.push(new RegExp(regexStrings[ii], 'i'));
            } // for
            
            // find the addins
            findAddins(domain, function(addins) {
                domainData[domain].addins = (domainData[domain].addins || []).concat(addins);
            });
            
            findCustomSkin(domain, function(skin) {
                domainData[domain].skin = skin;
            });
        } // if
    });
} // loadDomainConfig

exports.getConfig = function(req, res, next) {
    var referer = req.headers ? req.headers.referer : null,
        defaultData = domainData['default'],
        data;
    
    if (referer) {
        data = refererMatches[referer];
        
        // if we don't have a cached match, then look it up
        if (! data) {
            for (domain in domainData) {
                var regexes = domainData[domain].regexes || [],
                    matches = false;
                
                // check for a match
                for (var ii = 0; ii < regexes.length; ii++) {
                    matches = matches || regexes[ii].test(referer);
                } // if
                
                // if the domain matches, then update the domain match
                if (matches) {
                    // update the domain match, and also cache the result
                    data = extend({}, defaultData, domainData[domain]);
                    
                    break;
                } // if
            } // for
            
            // if we still don't have a match then use the default config
            if (! data) {
                data = extend({}, defaultData);
            } // if
            
            // if we have a skin, then add that to the css
            if (data.skin) {
                data.css = data.css.concat([{
                    url: data.skin
                }]);
            } // if
            
            // cache the match
            refererMatches[referer] = data;
        } // if
    } // if
    
    res.json(data);
}; // getConfig

exports.init = function(mesh, meshapp) {
    var searchPath = path.resolve(meshapp.basePath, 'conf/domains');
    
    mesh.log('looking for loader configurations in: ' + searchPath);
    fs.readdir(searchPath, function(err, files) {
        // reset the domain data
        domainData = {};

        // iterate through the files
        for (var ii = 0; (! err) && ii < files.length; ii++) {
            loadDomainConfig(mesh, path.basename(files[ii], '.json'), searchPath);
        } // for
    });    
};
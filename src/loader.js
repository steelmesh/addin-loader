//= lab!

var LOADERURL = '';

(function() {
    var req,
        minified = false,
        loading = false,
        tpData = {},
        runTP = false,
        scriptEl,
        chain = $LAB,

        isIE = (function() {
            var cache = {},
                b;
            return function(condition) {
                if(/*@cc_on!@*/true){return false;}
                var cc = 'IE';
                if(condition){
                    if(condition !== 'all'){ //deprecated support for 'all' keyword
                        if( !isNaN(parseFloat(condition)) ){
                            cc += ' ' + condition; //deprecated support for straight version #
                        }
                        else {
                            cc = condition; //recommended (conditional comment syntax)
                        }
                    }
                }
                if (cache[cc] === undefined) {
                    b = b || document.createElement('B');
                    b.innerHTML = '<!--[if '+ cc +']><b></b><![endif]-->';
                    cache[cc] = !!b.getElementsByTagName('b').length;
                }
                return cache[cc];
            };
        })();


    function checkLoaded() {
        var loaded = window.TP;

        if (loaded && (! runTP)) {
            TP.run(tpData);
            runTP = true;
        } // if

        if (window.jQuery && (! loading)) {
            loading = true;

            $.ajax({
                url: LOADERURL + 'loader',
                dataType: 'jsonp',
                success: loadConfig
            });
        }
    } // checkLoaded

    function loadConfig(data) {
        var version = data.version,
            addins = data.addins || [],
            ii;
            
        if (data.js) {
            for (req in data.js) {
                if (! window[req]) {
                    chain = chain.script(TPURL + data.js[req]);
                } // if
            } // for
        }

        chain.wait(function() {
            $LAB.script(LOADERURL + 'main' + (minified ? '.min' : '') + '-' + version + '.js')
                .wait(checkLoaded);
        });

        for (ii = 0; ii < data.css.length; ii++) {
            var cssData = data.css[ii],
                includeCSS = (! cssData.ieCond) || (cssData.ieCond && isIE(cssData.ieCond)),
                versionedUrl = cssData.url.replace(/(\.\w+)$/, '-' + version + '$1');

            if (includeCSS) {
                $(scriptEl).before(makeCSSLink(LOADERURL + versionedUrl, cssData.media));
            } // if
        } // for
    } // insertCSS

    function makeCSSLink(url, media) {
        var mediaAttr = media ? 'media="' + media + '" ' : '';
        return '<link rel="stylesheet" type="text/css" href="' + url + '" ' + mediaAttr + '/>';
    } // makeCSSLink

    LOADERURL = (function() {
        var regex = /loader\.(min\.)?js/i,
            checkScripts = document.getElementsByTagName('script');

        for (var ii = 0; ii < checkScripts.length; ii++) {
            var src = checkScripts[ii].src;
            if (src && regex.test(src)) {
                scriptEl = checkScripts[ii];
                minified = /\.min\.js/i.test(src);

                return src.replace(/^(.*)\/.*$/, '$1/');
            } // if
        } // for

        return '';
    })();

    if (! window.jQuery) {
        chain = chain
            .script('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js')
            .wait(checkLoaded);
    }
    else {
        checkLoaded();
    } // if..else

    if (document.namespaces && (! document.namespaces['rvml'])) {
        document.namespaces.add('rvml','urn:schemas-microsoft-com:vml');
    } // if
})();


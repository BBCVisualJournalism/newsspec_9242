var PHANTOM_INSTANCES = 2;

var imgPath = 'source/img/screens/';
var results;
var ProgressBar = require('progress');


// Shim requirejs define
global.define = function (data) {
    results = data;
};

var phantom = require('phantom');
require('../source/js/data/results/constituency_2015');

var urls = [
    'from-polling',
    'from-2010'
];
var doneCount = 0;
var parties = [
    'lib_dem',
    'con',
    'lab',
    'ukip',
    'green',
    'snp',
    'pc',
    'other'
];

for (var id in results.haveResults) {
    urls.push('constituancy-' + results.haveResults[id].code + '/from-polling');
    urls.push('constituancy-' + results.haveResults[id].code + '/from-2010');
}

for (var id in results.haveResults) {
    for (var i = 0, l = parties.length; i < l; i++) {
        var party = parties[i];
        urls.push('party-' + party + '/constituancy-' + results.haveResults[id].code + '/from-polling');
    }
}

urls.push('country-scotland/from-polling');
urls.push('country-scotland/from-2010');

module.exports = function (grunt) {
    grunt.registerTask('screen-shots', 'Captures images of various states of the application', function () {
        var done = this.async();
        var progressBar = new ProgressBar('Phantom: [:bar] :current of :total', {
            total: urls.length,
            width: 50
        });

        var spawnCount = PHANTOM_INSTANCES;
        var spawnDone = 0;

        var d = function () {
            spawnDone++;
            if (spawnDone >= spawnCount) {
                done();
            }
        };

        var start = 0;
        var len = Math.ceil(urls.length / spawnCount);
        var end = start + len;

        for (var i = 0, l = spawnCount; i < l; i ++) {
            s(urls.splice(start, end), 0, d);
        }

        function s(urls, doneCount, done) {
            phantom.create(function (ph) {
                ph.createPage(function (page) {
                    page.set('viewportSize', {width: 780, height: 600});
                    page.set('clipRect', {width: 780, height: 600});

                    page.open('http://local.bbc.co.uk:1031/news/special/2015/newsspec_9242/content/english/', function (status) {
                        setTimeout(function () {
                            page.evaluate(function () {
                                // hack the transition function of d3's select API
                                d3.selection.prototype.duration   = function(){ return this; };
                                d3.selection.prototype.transition = function(){ return this; };

                                $('body').addClass('phantom');
                            });

                            function next () {
                                if (doneCount >= urls.length) {
                                    return done();
                                }

                                var url = urls[doneCount];

                                page.evaluate('function(){window.location.hash = "' + url + '";}');
                                doneCount++;

                                setTimeout(function () {
                                    page.render(imgPath + url.replace(/\//g, '_') + '.jpg', {format: 'jpeg', quality: 100}, function () {
                                        progressBar.tick();
                                        next();
                                    });
                                }, 100);
                            }

                            setTimeout(function () {
                                next(page);
                            }, 100);
                        }, 1000);
                    });
                });
            });
        }
    });
};

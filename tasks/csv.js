var csv = require('csv-parser');
var fs = require('fs');
var basePath = './csvs/';
var outPath = './source/js/data/results/';
var csvRegexp = /\.csv$/;

module.exports = function (grunt) {
    grunt.registerTask('csv', 'Compile csvs to json', function () {
        var done = this.async();
        var d = {
            data: {},
            haveResults: []
        };

        fs.readdir(basePath, function (err, files) {
            if (err) throw err;

            var filesProcessed = 0;

            files.filter(function (file) {
                return csvRegexp.test(file);
            }).forEach(function (file, i, files) {
                fs.createReadStream(basePath + file)
                    .pipe(csv({
                        seperator: ';'
                    }))
                    .on('data', function (data) {
                        if (data.Code) {
                            d.data[data.Code] = data;

                            if (data.Winner_code) {
                                d.haveResults.push({
                                    code: data.Code,
                                    bbc_full_name: data.bbc_full_name,
                                    bbc_shorter_name: data.bbc_shorter_name,
                                    region: data.Region
                                });
                            }

                            delete d.data[data.Code].Code;
                        }
                    })
                    .on('end', function () {
                        d.haveResults.sort(function (a, b) {
                            if (a.bbc_full_name < b.bbc_full_name) {
                                return -1;
                            } else {
                                return 1;
                            }
                            return 0;
                        });

                        fs.writeFile(outPath + file.replace(csvRegexp, '.js'), 'define(' + JSON.stringify(d) + ');', function (err) {
                            if (err) throw err;

                            filesProcessed++;

                            if (filesProcessed >= files.length) {
                                done();
                            }
                        });
                    });
            });
        });
    });
};

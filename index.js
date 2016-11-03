const through2 = require('through2');
const gutil = require('gulp-util');
const path = require('path');
const File = gutil.File;

var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-dir-concat';

module.exports = function (options) {
    options = options || {};

    var FileCacheByDir = {};
    return through2.obj(function (file, enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'stream is not supported'), file);
        }



        var dirname = path.dirname(file.path);
        var filename = path.basename(file.path);

        if (options.concateIntoOne) {
            dirname = 'concat-dir'; //tmp
        }

        FileCacheByDir[dirname] = FileCacheByDir[dirname] || {
                files: [],
                cwd: file.cwd,
                base: file.base
            };

        FileCacheByDir[dirname].files.push({
            name: filename,
            file: file
        })
        callback(null);

    }, function onFinish(callback) {
        var dirs = Object.keys(FileCacheByDir);
        var self = this;

        dirs.forEach(function (dir) {
            var dirFiles = FileCacheByDir[dir];

            var concatedContent = dirFiles.files.map(function (fileItem) {
                var contents = fileItem.file.contents.toString();

                if (options.fileWaterMark) {
                    contents = [`/** ${fileItem.name} **/`, contents].join(gutil.linefeed);;
                }

                return contents;
            }).join(gutil.linefeed);

            var filename = 'concat.css';
            var dirObj = dirFiles;

            if (options.fileNameHandler) {
                dirObj = options.fileNameHandler(dirObj);
            }

            if (options.concatName) {
                filename = options.concatName;
            }

            dirObj.path = dirObj.path || path.join(dir, filename)
            var concatedFile = new gutil.File({
                base: dirObj.base,
                cwd: dirObj.cwd,
                path: dirObj.path,
                contents: new Buffer(concatedContent)
            });

            self.push(concatedFile);
        });

        callback(null);
    });
};
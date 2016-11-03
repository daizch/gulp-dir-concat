const vfs = require('vinyl-fs');
const through = require('through2');
const gulpif = require('gulp-if');
const should = require('should');
const path = require('path');
var concat = require('..');

require('mocha');

function fileTypeOf(type) {
    return function (file) {
        return path.extname(file.path) === '.' + type;
    };
}

describe('gulp-dir-concat', function() {
    it('test concat all', function (done) {
        vfs.src('./test/input/**/*.css')
            .pipe(gulpif(fileTypeOf('css'),concat({
                fileWaterMark: true,
                concateAll: true
            })))
            .pipe(vfs.dest('./test/output/'))
            .on('end', done);
    });

    it('test concat sub directory', function (done) {
        vfs.src('./test/input/**/*.css')
            .pipe(concat({
                fileWaterMark: true
            }))
            .pipe(vfs.dest('./test/output2/'))
            .on('end', done);
    });
});

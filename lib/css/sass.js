'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

var _detectiveSass = require('detective-sass');

var _detectiveSass2 = _interopRequireDefault(_detectiveSass);

var _detectiveScss = require('detective-scss');

var _detectiveScss2 = _interopRequireDefault(_detectiveScss);

var _sassLookup = require('sass-lookup');

var _sassLookup2 = _interopRequireDefault(_sassLookup);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/sass', 'text/scss'];
let sass = null;

/**
 * @access private
 */
class SassCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      comments: true,
      sourceMapEmbed: true,
      sourceMapContents: true
    };

    this.seenFilePaths = {};
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      return true;
    })();
  }

  determineDependentFiles(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.determineDependentFilesSync(sourceCode, filePath, compilerContext);
    })();
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      sass = sass || _this2.getSass();

      let thisPath = _path2.default.dirname(filePath);
      _this2.seenFilePaths[thisPath] = true;

      let paths = Object.keys(_this2.seenFilePaths);

      if (_this2.compilerOptions.paths) {
        paths.push(..._this2.compilerOptions.paths);
      }

      paths.unshift('.');

      sass.importer(_this2.buildImporterCallback(paths));

      let opts = Object.assign({}, _this2.compilerOptions, {
        indentedSyntax: filePath.match(/\.sass$/i),
        sourceMapRoot: filePath
      });

      let result = yield new Promise(function (res, rej) {
        sass.compile(sourceCode, opts, function (r) {
          if (r.status !== 0) {
            rej(new Error(r.formatted || r.message));
            return;
          }

          res(r);
          return;
        });
      });

      let source = result.text;

      // NB: If you compile a file that is solely imports, its
      // actual content is '' yet it is a valid file. '' is not
      // truthy, so we're going to replace it with a string that
      // is truthy.
      if (!source) {
        source = ' ';
      }

      return {
        code: source,
        mimeType: 'text/css'
      };
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    let dependencyFilenames = _path2.default.extname(filePath) === '.sass' ? (0, _detectiveSass2.default)(sourceCode) : (0, _detectiveScss2.default)(sourceCode);
    let dependencies = [];

    for (let dependencyName of dependencyFilenames) {
      dependencies.push((0, _sassLookup2.default)(dependencyName, _path2.default.basename(filePath), _path2.default.dirname(filePath)));
    }

    return dependencies;
  }

  compileSync(sourceCode, filePath, compilerContext) {
    sass = sass || this.getSass();

    let thisPath = _path2.default.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    let paths = Object.keys(this.seenFilePaths);

    if (this.compilerOptions.paths) {
      paths.push(...this.compilerOptions.paths);
    }

    paths.unshift('.');
    sass.importer(this.buildImporterCallback(paths));

    let opts = Object.assign({}, this.compilerOptions, {
      indentedSyntax: filePath.match(/\.sass$/i),
      sourceMapRoot: filePath
    });

    let result;
    (0, _toutsuite2.default)(() => {
      sass.compile(sourceCode, opts, r => {
        if (r.status !== 0) {
          throw new Error(r.formatted);
        }
        result = r;
      });
    });

    let source = result.text;

    // NB: If you compile a file that is solely imports, its
    // actual content is '' yet it is a valid file. '' is not
    // truthy, so we're going to replace it with a string that
    // is truthy.
    if (!source) {
      source = ' ';
    }

    return {
      code: source,
      mimeType: 'text/css'
    };
  }

  getSass() {
    let ret;
    (0, _toutsuite2.default)(() => ret = require('sass.js/dist/sass.node').Sass);
    return ret;
  }

  buildImporterCallback(includePaths) {
    const self = this;
    return function (request, done) {
      let file;
      if (request.file) {
        done();
        return;
      } else {
        // sass.js works in the '/sass/' directory
        const cleanedRequestPath = request.resolved.replace(/^\/sass\//, '');
        for (let includePath of includePaths) {
          const filePath = _path2.default.resolve(includePath, cleanedRequestPath);
          let variations = sass.getPathVariations(filePath);

          file = variations.map(self.fixWindowsPath.bind(self)).reduce(self.importedFileReducer.bind(self), null);

          if (file) {
            const content = _fs2.default.readFileSync(file, { encoding: 'utf8' });
            return sass.writeFile(file, content, () => {
              done({ path: file });
              return;
            });
          }
        }

        if (!file) {
          done();
          return;
        }
      }
    };
  }

  importedFileReducer(found, path) {
    // Find the first variation that actually exists
    if (found) return found;

    try {
      const stat = _fs2.default.statSync(path);
      if (!stat.isFile()) return null;
      return path;
    } catch (e) {
      return null;
    }
  }

  fixWindowsPath(file) {
    // Unfortunately, there's a bug in sass.js that seems to ignore the different
    // path separators across platforms

    // For some reason, some files have a leading slash that we need to get rid of
    if (process.platform === 'win32' && file[0] === '/') {
      file = file.slice(1);
    }

    // Sass.js generates paths such as `_C:\myPath\file.sass` instead of `C:\myPath\_file.sass`
    if (file[0] === '_') {
      const parts = file.slice(1).split(_path2.default.sep);
      const dir = parts.slice(0, -1).join(_path2.default.sep);
      const fileName = parts.reverse()[0];
      file = _path2.default.resolve(dir, '_' + fileName);
    }
    return file;
  }

  getCompilerVersion() {
    // NB: There is a bizarre bug in the node module system where this doesn't
    // work but only in saveConfiguration tests
    //return require('@paulcbetts/node-sass/package.json').version;
    return "4.1.1";
  }
}
exports.default = SassCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3Mvc2Fzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJzYXNzIiwiU2Fzc0NvbXBpbGVyIiwiY29uc3RydWN0b3IiLCJjb21waWxlck9wdGlvbnMiLCJjb21tZW50cyIsInNvdXJjZU1hcEVtYmVkIiwic291cmNlTWFwQ29udGVudHMiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJjb21waWxlIiwiZ2V0U2FzcyIsInRoaXNQYXRoIiwiZGlybmFtZSIsInBhdGhzIiwiT2JqZWN0Iiwia2V5cyIsInB1c2giLCJ1bnNoaWZ0IiwiaW1wb3J0ZXIiLCJidWlsZEltcG9ydGVyQ2FsbGJhY2siLCJvcHRzIiwiYXNzaWduIiwiaW5kZW50ZWRTeW50YXgiLCJtYXRjaCIsInNvdXJjZU1hcFJvb3QiLCJyZXN1bHQiLCJQcm9taXNlIiwicmVzIiwicmVqIiwiciIsInN0YXR1cyIsIkVycm9yIiwiZm9ybWF0dGVkIiwibWVzc2FnZSIsInNvdXJjZSIsInRleHQiLCJjb2RlIiwibWltZVR5cGUiLCJzaG91bGRDb21waWxlRmlsZVN5bmMiLCJkZXBlbmRlbmN5RmlsZW5hbWVzIiwiZXh0bmFtZSIsImRlcGVuZGVuY2llcyIsImRlcGVuZGVuY3lOYW1lIiwiYmFzZW5hbWUiLCJjb21waWxlU3luYyIsInJldCIsInJlcXVpcmUiLCJTYXNzIiwiaW5jbHVkZVBhdGhzIiwic2VsZiIsInJlcXVlc3QiLCJkb25lIiwiZmlsZSIsImNsZWFuZWRSZXF1ZXN0UGF0aCIsInJlc29sdmVkIiwicmVwbGFjZSIsImluY2x1ZGVQYXRoIiwicmVzb2x2ZSIsInZhcmlhdGlvbnMiLCJnZXRQYXRoVmFyaWF0aW9ucyIsIm1hcCIsImZpeFdpbmRvd3NQYXRoIiwiYmluZCIsInJlZHVjZSIsImltcG9ydGVkRmlsZVJlZHVjZXIiLCJjb250ZW50IiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJ3cml0ZUZpbGUiLCJwYXRoIiwiZm91bmQiLCJzdGF0Iiwic3RhdFN5bmMiLCJpc0ZpbGUiLCJlIiwicHJvY2VzcyIsInBsYXRmb3JtIiwic2xpY2UiLCJwYXJ0cyIsInNwbGl0Iiwic2VwIiwiZGlyIiwiam9pbiIsInJldmVyc2UiLCJnZXRDb21waWxlclZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBbEI7QUFDQSxJQUFJQyxPQUFPLElBQVg7O0FBRUE7OztBQUdlLE1BQU1DLFlBQU4sb0NBQXdDO0FBQ3JEQyxnQkFBYztBQUNaOztBQUVBLFNBQUtDLGVBQUwsR0FBdUI7QUFDckJDLGdCQUFVLElBRFc7QUFFckJDLHNCQUFnQixJQUZLO0FBR3JCQyx5QkFBbUI7QUFIRSxLQUF2Qjs7QUFNQSxTQUFLQyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0Q7O0FBRUQsU0FBT0MsaUJBQVAsR0FBMkI7QUFDekIsV0FBT1QsU0FBUDtBQUNEOztBQUVLVSxtQkFBTixDQUF3QkMsUUFBeEIsRUFBa0NDLGVBQWxDLEVBQW1EO0FBQUE7QUFDakQsYUFBTyxJQUFQO0FBRGlEO0FBRWxEOztBQUVLQyx5QkFBTixDQUE4QkMsVUFBOUIsRUFBMENDLFFBQTFDLEVBQW9ESCxlQUFwRCxFQUFxRTtBQUFBOztBQUFBO0FBQ25FLGFBQU8sTUFBS0ksMkJBQUwsQ0FBaUNGLFVBQWpDLEVBQTZDQyxRQUE3QyxFQUF1REgsZUFBdkQsQ0FBUDtBQURtRTtBQUVwRTs7QUFFS0ssU0FBTixDQUFjSCxVQUFkLEVBQTBCQyxRQUExQixFQUFvQ0gsZUFBcEMsRUFBcUQ7QUFBQTs7QUFBQTtBQUNu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YUFBT0EsS0FBS3lCLEtBQUwsQ0FBVyxDQUFYLENBQVA7QUFDRDs7QUFFRDtBQUNBLFFBQUl6QixLQUFLLENBQUwsTUFBWSxHQUFoQixFQUFxQjtBQUNuQixZQUFNMEIsUUFBUTFCLEtBQUt5QixLQUFMLENBQVcsQ0FBWCxFQUFjRSxLQUFkLENBQW9CLGVBQUtDLEdBQXpCLENBQWQ7QUFDQSxZQUFNQyxNQUFNSCxNQUFNRCxLQUFOLENBQVksQ0FBWixFQUFlLENBQUMsQ0FBaEIsRUFBbUJLLElBQW5CLENBQXdCLGVBQUtGLEdBQTdCLENBQVo7QUFDQSxZQUFNN0UsV0FBVzJFLE1BQU1LLE9BQU4sR0FBZ0IsQ0FBaEIsQ0FBakI7QUFDQS9CLGFBQU8sZUFBS0ssT0FBTCxDQUFhd0IsR0FBYixFQUFrQixNQUFNOUUsUUFBeEIsQ0FBUDtBQUNEO0FBQ0QsV0FBT2lELElBQVA7QUFDRDs7QUFFRGdDLHVCQUFxQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxXQUFPLE9BQVA7QUFDRDtBQXJOb0Q7a0JBQWxDMUYsWSIsImZpbGUiOiJzYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCB0b3V0U3VpdGUgZnJvbSAndG91dHN1aXRlJztcclxuaW1wb3J0IGRldGVjdGl2ZVNBU1MgZnJvbSAnZGV0ZWN0aXZlLXNhc3MnO1xyXG5pbXBvcnQgZGV0ZWN0aXZlU0NTUyBmcm9tICdkZXRlY3RpdmUtc2Nzcyc7XHJcbmltcG9ydCBzYXNzTG9va3VwIGZyb20gJ3Nhc3MtbG9va3VwJztcclxuaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xyXG5cclxuY29uc3QgbWltZVR5cGVzID0gWyd0ZXh0L3Nhc3MnLCAndGV4dC9zY3NzJ107XHJcbmxldCBzYXNzID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBAYWNjZXNzIHByaXZhdGVcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhc3NDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge1xyXG4gICAgICBjb21tZW50czogdHJ1ZSxcclxuICAgICAgc291cmNlTWFwRW1iZWQ6IHRydWUsXHJcbiAgICAgIHNvdXJjZU1hcENvbnRlbnRzOiB0cnVlXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc2VlbkZpbGVQYXRocyA9IHt9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xyXG4gICAgcmV0dXJuIG1pbWVUeXBlcztcclxuICB9XHJcblxyXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICBzYXNzID0gc2FzcyB8fCB0aGlzLmdldFNhc3MoKTtcclxuXHJcbiAgICBsZXQgdGhpc1BhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xyXG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XHJcblxyXG4gICAgbGV0IHBhdGhzID0gT2JqZWN0LmtleXModGhpcy5zZWVuRmlsZVBhdGhzKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpIHtcclxuICAgICAgcGF0aHMucHVzaCguLi50aGlzLmNvbXBpbGVyT3B0aW9ucy5wYXRocyk7XHJcbiAgICB9XHJcblxyXG4gICAgcGF0aHMudW5zaGlmdCgnLicpO1xyXG5cclxuICAgIHNhc3MuaW1wb3J0ZXIodGhpcy5idWlsZEltcG9ydGVyQ2FsbGJhY2socGF0aHMpKTtcclxuXHJcbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XHJcbiAgICAgIGluZGVudGVkU3ludGF4OiBmaWxlUGF0aC5tYXRjaCgvXFwuc2FzcyQvaSksXHJcbiAgICAgIHNvdXJjZU1hcFJvb3Q6IGZpbGVQYXRoLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXMscmVqKSA9PiB7XHJcbiAgICAgIHNhc3MuY29tcGlsZShzb3VyY2VDb2RlLCBvcHRzLCAocikgPT4ge1xyXG4gICAgICAgIGlmIChyLnN0YXR1cyAhPT0gMCkge1xyXG4gICAgICAgICAgcmVqKG5ldyBFcnJvcihyLmZvcm1hdHRlZCB8fCByLm1lc3NhZ2UpKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlcyhyKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHNvdXJjZSA9IHJlc3VsdC50ZXh0O1xyXG5cclxuICAgIC8vIE5COiBJZiB5b3UgY29tcGlsZSBhIGZpbGUgdGhhdCBpcyBzb2xlbHkgaW1wb3J0cywgaXRzXHJcbiAgICAvLyBhY3R1YWwgY29udGVudCBpcyAnJyB5ZXQgaXQgaXMgYSB2YWxpZCBmaWxlLiAnJyBpcyBub3RcclxuICAgIC8vIHRydXRoeSwgc28gd2UncmUgZ29pbmcgdG8gcmVwbGFjZSBpdCB3aXRoIGEgc3RyaW5nIHRoYXRcclxuICAgIC8vIGlzIHRydXRoeS5cclxuICAgIGlmICghc291cmNlKSB7XHJcbiAgICAgIHNvdXJjZSA9ICcgJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlOiBzb3VyY2UsXHJcbiAgICAgIG1pbWVUeXBlOiAndGV4dC9jc3MnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIGxldCBkZXBlbmRlbmN5RmlsZW5hbWVzID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy5zYXNzJyA/IGRldGVjdGl2ZVNBU1Moc291cmNlQ29kZSkgOiBkZXRlY3RpdmVTQ1NTKHNvdXJjZUNvZGUpO1xyXG4gICAgbGV0IGRlcGVuZGVuY2llcyA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGRlcGVuZGVuY3lOYW1lIG9mIGRlcGVuZGVuY3lGaWxlbmFtZXMpIHtcclxuICAgICAgZGVwZW5kZW5jaWVzLnB1c2goc2Fzc0xvb2t1cChkZXBlbmRlbmN5TmFtZSwgcGF0aC5iYXNlbmFtZShmaWxlUGF0aCksIHBhdGguZGlybmFtZShmaWxlUGF0aCkpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVwZW5kZW5jaWVzO1xyXG4gIH1cclxuXHJcbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgc2FzcyA9IHNhc3MgfHwgdGhpcy5nZXRTYXNzKCk7XHJcblxyXG4gICAgbGV0IHRoaXNQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcclxuICAgIHRoaXMuc2VlbkZpbGVQYXRoc1t0aGlzUGF0aF0gPSB0cnVlO1xyXG5cclxuICAgIGxldCBwYXRocyA9IE9iamVjdC5rZXlzKHRoaXMuc2VlbkZpbGVQYXRocyk7XHJcblxyXG4gICAgaWYgKHRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKSB7XHJcbiAgICAgIHBhdGhzLnB1c2goLi4udGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdGhzLnVuc2hpZnQoJy4nKTtcclxuICAgIHNhc3MuaW1wb3J0ZXIodGhpcy5idWlsZEltcG9ydGVyQ2FsbGJhY2socGF0aHMpKTtcclxuXHJcbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XHJcbiAgICAgIGluZGVudGVkU3ludGF4OiBmaWxlUGF0aC5tYXRjaCgvXFwuc2FzcyQvaSksXHJcbiAgICAgIHNvdXJjZU1hcFJvb3Q6IGZpbGVQYXRoLFxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHJlc3VsdDtcclxuICAgIHRvdXRTdWl0ZSgoKSA9PiB7XHJcbiAgICAgIHNhc3MuY29tcGlsZShzb3VyY2VDb2RlLCBvcHRzLCAocikgPT4ge1xyXG4gICAgICAgIGlmIChyLnN0YXR1cyAhPT0gMCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHIuZm9ybWF0dGVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ID0gcjtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgc291cmNlID0gcmVzdWx0LnRleHQ7XHJcblxyXG4gICAgLy8gTkI6IElmIHlvdSBjb21waWxlIGEgZmlsZSB0aGF0IGlzIHNvbGVseSBpbXBvcnRzLCBpdHNcclxuICAgIC8vIGFjdHVhbCBjb250ZW50IGlzICcnIHlldCBpdCBpcyBhIHZhbGlkIGZpbGUuICcnIGlzIG5vdFxyXG4gICAgLy8gdHJ1dGh5LCBzbyB3ZSdyZSBnb2luZyB0byByZXBsYWNlIGl0IHdpdGggYSBzdHJpbmcgdGhhdFxyXG4gICAgLy8gaXMgdHJ1dGh5LlxyXG4gICAgaWYgKCFzb3VyY2UpIHtcclxuICAgICAgc291cmNlID0gJyAnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvZGU6IHNvdXJjZSxcclxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRTYXNzKCkge1xyXG4gICAgbGV0IHJldDtcclxuICAgIHRvdXRTdWl0ZSgoKSA9PiByZXQgPSByZXF1aXJlKCdzYXNzLmpzL2Rpc3Qvc2Fzcy5ub2RlJykuU2Fzcyk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcbiAgYnVpbGRJbXBvcnRlckNhbGxiYWNrIChpbmNsdWRlUGF0aHMpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgcmV0dXJuIChmdW5jdGlvbiAocmVxdWVzdCwgZG9uZSkge1xyXG4gICAgICBsZXQgZmlsZTtcclxuICAgICAgaWYgKHJlcXVlc3QuZmlsZSkge1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc2Fzcy5qcyB3b3JrcyBpbiB0aGUgJy9zYXNzLycgZGlyZWN0b3J5XHJcbiAgICAgICAgY29uc3QgY2xlYW5lZFJlcXVlc3RQYXRoID0gcmVxdWVzdC5yZXNvbHZlZC5yZXBsYWNlKC9eXFwvc2Fzc1xcLy8sICcnKTtcclxuICAgICAgICBmb3IgKGxldCBpbmNsdWRlUGF0aCBvZiBpbmNsdWRlUGF0aHMpIHtcclxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGluY2x1ZGVQYXRoLCBjbGVhbmVkUmVxdWVzdFBhdGgpO1xyXG4gICAgICAgICAgbGV0IHZhcmlhdGlvbnMgPSBzYXNzLmdldFBhdGhWYXJpYXRpb25zKGZpbGVQYXRoKTtcclxuXHJcbiAgICAgICAgICBmaWxlID0gdmFyaWF0aW9uc1xyXG4gICAgICAgICAgICAubWFwKHNlbGYuZml4V2luZG93c1BhdGguYmluZChzZWxmKSlcclxuICAgICAgICAgICAgLnJlZHVjZShzZWxmLmltcG9ydGVkRmlsZVJlZHVjZXIuYmluZChzZWxmKSwgbnVsbCk7XHJcblxyXG4gICAgICAgICAgaWYgKGZpbGUpIHtcclxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlLCB7IGVuY29kaW5nOiAndXRmOCcgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzYXNzLndyaXRlRmlsZShmaWxlLCBjb250ZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZG9uZSh7IHBhdGg6IGZpbGUgfSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgICAgZG9uZSgpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpbXBvcnRlZEZpbGVSZWR1Y2VyKGZvdW5kLCBwYXRoKSB7XHJcbiAgICAvLyBGaW5kIHRoZSBmaXJzdCB2YXJpYXRpb24gdGhhdCBhY3R1YWxseSBleGlzdHNcclxuICAgIGlmIChmb3VuZCkgcmV0dXJuIGZvdW5kO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTtcclxuICAgICAgaWYgKCFzdGF0LmlzRmlsZSgpKSByZXR1cm4gbnVsbDtcclxuICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmaXhXaW5kb3dzUGF0aChmaWxlKSB7XHJcbiAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGVyZSdzIGEgYnVnIGluIHNhc3MuanMgdGhhdCBzZWVtcyB0byBpZ25vcmUgdGhlIGRpZmZlcmVudFxyXG4gICAgLy8gcGF0aCBzZXBhcmF0b3JzIGFjcm9zcyBwbGF0Zm9ybXNcclxuXHJcbiAgICAvLyBGb3Igc29tZSByZWFzb24sIHNvbWUgZmlsZXMgaGF2ZSBhIGxlYWRpbmcgc2xhc2ggdGhhdCB3ZSBuZWVkIHRvIGdldCByaWQgb2ZcclxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmIGZpbGVbMF0gPT09ICcvJykge1xyXG4gICAgICBmaWxlID0gZmlsZS5zbGljZSgxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTYXNzLmpzIGdlbmVyYXRlcyBwYXRocyBzdWNoIGFzIGBfQzpcXG15UGF0aFxcZmlsZS5zYXNzYCBpbnN0ZWFkIG9mIGBDOlxcbXlQYXRoXFxfZmlsZS5zYXNzYFxyXG4gICAgaWYgKGZpbGVbMF0gPT09ICdfJykge1xyXG4gICAgICBjb25zdCBwYXJ0cyA9IGZpbGUuc2xpY2UoMSkuc3BsaXQocGF0aC5zZXApO1xyXG4gICAgICBjb25zdCBkaXIgPSBwYXJ0cy5zbGljZSgwLCAtMSkuam9pbihwYXRoLnNlcCk7XHJcbiAgICAgIGNvbnN0IGZpbGVOYW1lID0gcGFydHMucmV2ZXJzZSgpWzBdO1xyXG4gICAgICBmaWxlID0gcGF0aC5yZXNvbHZlKGRpciwgJ18nICsgZmlsZU5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpbGU7XHJcbiAgfVxyXG5cclxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XHJcbiAgICAvLyBOQjogVGhlcmUgaXMgYSBiaXphcnJlIGJ1ZyBpbiB0aGUgbm9kZSBtb2R1bGUgc3lzdGVtIHdoZXJlIHRoaXMgZG9lc24ndFxyXG4gICAgLy8gd29yayBidXQgb25seSBpbiBzYXZlQ29uZmlndXJhdGlvbiB0ZXN0c1xyXG4gICAgLy9yZXR1cm4gcmVxdWlyZSgnQHBhdWxjYmV0dHMvbm9kZS1zYXNzL3BhY2thZ2UuanNvbicpLnZlcnNpb247XHJcbiAgICByZXR1cm4gXCI0LjEuMVwiO1xyXG4gIH1cclxufVxyXG4iXX0=
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _detectiveLess = require('detective-less');

var _detectiveLess2 = _interopRequireDefault(_detectiveLess);

var _compilerBase = require('../compiler-base');

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/less'];
let lessjs = null;

/**
 * @access private
 */
class LessCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      sourceMap: { sourceMapFileInline: true }
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
      lessjs = lessjs || _this2.getLess();

      let thisPath = _path2.default.dirname(filePath);
      _this2.seenFilePaths[thisPath] = true;

      let paths = Object.keys(_this2.seenFilePaths);

      if (_this2.compilerOptions.paths) {
        paths.push(..._this2.compilerOptions.paths);
      }

      let opts = Object.assign({}, _this2.compilerOptions, {
        paths: paths,
        filename: _path2.default.basename(filePath)
      });

      let result = yield lessjs.render(sourceCode, opts);
      let source = result.css;

      // NB: If you compile a file that is solely imports, its
      // actual content is '' yet it is a valid file. '' is not
      // truthy, so we're going to replace it with a string that
      // is truthy.
      if (!source && typeof source === 'string') {
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
    let dependencyFilenames = (0, _detectiveLess2.default)(sourceCode);
    let dependencies = [];

    for (let dependencyName of dependencyFilenames) {
      dependencies.push(_path2.default.join(_path2.default.dirname(filePath), dependencyName));
    }

    return dependencies;
  }

  compileSync(sourceCode, filePath, compilerContext) {
    lessjs = lessjs || this.getLess();

    let source;
    let error = null;

    let thisPath = _path2.default.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    let paths = Object.keys(this.seenFilePaths);

    if (this.compilerOptions.paths) {
      paths.push(...this.compilerOptions.paths);
    }

    let opts = Object.assign({}, this.compilerOptions, {
      paths: paths,
      filename: _path2.default.basename(filePath),
      fileAsync: false, async: false, syncImport: true
    });

    (0, _toutsuite2.default)(() => {
      lessjs.render(sourceCode, opts, (err, out) => {
        if (err) {
          error = err;
        } else {
          // NB: Because we've forced less to work in sync mode, we can do this
          source = out.css;
        }
      });
    });

    if (error) {
      throw error;
    }

    // NB: If you compile a file that is solely imports, its
    // actual content is '' yet it is a valid file. '' is not
    // truthy, so we're going to replace it with a string that
    // is truthy.
    if (!source && typeof source === 'string') {
      source = ' ';
    }

    return {
      code: source,
      mimeType: 'text/css'
    };
  }

  getLess() {
    let ret;
    (0, _toutsuite2.default)(() => ret = require('less'));
    return ret;
  }

  getCompilerVersion() {
    return require('less/package.json').version;
  }
}
exports.default = LessCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3MvbGVzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJsZXNzanMiLCJMZXNzQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVyT3B0aW9ucyIsInNvdXJjZU1hcCIsInNvdXJjZU1hcEZpbGVJbmxpbmUiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJjb21waWxlIiwiZ2V0TGVzcyIsInRoaXNQYXRoIiwiZGlybmFtZSIsInBhdGhzIiwiT2JqZWN0Iiwia2V5cyIsInB1c2giLCJvcHRzIiwiYXNzaWduIiwiZmlsZW5hbWUiLCJiYXNlbmFtZSIsInJlc3VsdCIsInJlbmRlciIsInNvdXJjZSIsImNzcyIsImNvZGUiLCJtaW1lVHlwZSIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImRlcGVuZGVuY3lGaWxlbmFtZXMiLCJkZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmN5TmFtZSIsImpvaW4iLCJjb21waWxlU3luYyIsImVycm9yIiwiZmlsZUFzeW5jIiwiYXN5bmMiLCJzeW5jSW1wb3J0IiwiZXJyIiwib3V0IiwicmV0IiwicmVxdWlyZSIsImdldENvbXBpbGVyVmVyc2lvbiIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsV0FBRCxDQUFsQjtBQUNBLElBQUlDLFNBQVMsSUFBYjs7QUFFQTs7O0FBR2UsTUFBTUMsWUFBTixvQ0FBd0M7QUFDckRDLGdCQUFjO0FBQ1o7O0FBRUEsU0FBS0MsZUFBTCxHQUF1QjtBQUNyQkMsaUJBQVcsRUFBRUMscUJBQXFCLElBQXZCO0FBRFUs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QixFQUF3QztBQUNqRGdCLGFBQU9BLEtBRDBDO0FBRWpETSxnQkFBVSxlQUFLQyxRQUFMLENBQWNiLFFBQWQsQ0FGdUM7QUFHakQyQixpQkFBVyxLQUhzQyxFQUcvQkMsT0FBTyxLQUh3QixFQUdqQkMsWUFBWTtBQUhLLEtBQXhDLENBQVg7O0FBTUEsNkJBQVUsTUFBTTtBQUNkMUMsYUFBTzRCLE1BQVAsQ0FBY2hCLFVBQWQsRUFBMEJXLElBQTFCLEVBQWdDLENBQUNvQixHQUFELEVBQU1DLEdBQU4sS0FBYztBQUM1QyxZQUFJRCxHQUFKLEVBQVM7QUFDUEosa0JBQVFJLEdBQVI7QUFDRCxTQUZELE1BRU87QUFDTDtBQUNBZCxtQkFBU2UsSUFBSWQsR0FBYjtBQUNEO0FBQ0YsT0FQRDtBQVFELEtBVEQ7O0FBV0EsUUFBSVMsS0FBSixFQUFXO0FBQ1QsWUFBTUEsS0FBTjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBSSxDQUFDVixNQUFELElBQVcsT0FBT0EsTUFBUCxLQUFrQixRQUFqQyxFQUEyQztBQUN6Q0EsZUFBUyxHQUFUO0FBQ0Q7O0FBRUQsV0FBTztBQUNMRSxZQUFNRixNQUREO0FBRUxHLGdCQUFVO0FBRkwsS0FBUDtBQUlEOztBQUVEaEIsWUFBVTtBQUNSLFFBQUk2QixHQUFKO0FBQ0EsNkJBQVUsTUFBTUEsTUFBTUMsUUFBUSxNQUFSLENBQXRCO0FBQ0EsV0FBT0QsR0FBUDtBQUNEOztBQUVERSx1QkFBcUI7QUFDbkIsV0FBT0QsUUFBUSxtQkFBUixFQUE2QkUsT0FBcEM7QUFDRDtBQWxJb0Q7a0JBQWxDL0MsWSIsImZpbGUiOiJsZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBkZXRlY3RpdmUgZnJvbSAnZGV0ZWN0aXZlLWxlc3MnO1xyXG5pbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XHJcbmltcG9ydCB0b3V0U3VpdGUgZnJvbSAndG91dHN1aXRlJztcclxuXHJcbmNvbnN0IG1pbWVUeXBlcyA9IFsndGV4dC9sZXNzJ107XHJcbmxldCBsZXNzanMgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc0NvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXJCYXNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5jb21waWxlck9wdGlvbnMgPSB7XHJcbiAgICAgIHNvdXJjZU1hcDogeyBzb3VyY2VNYXBGaWxlSW5saW5lOiB0cnVlIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzID0ge307XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XHJcbiAgICByZXR1cm4gbWltZVR5cGVzO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIGxlc3NqcyA9IGxlc3NqcyB8fCB0aGlzLmdldExlc3MoKTtcclxuXHJcbiAgICBsZXQgdGhpc1BhdGggPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpO1xyXG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XHJcblxyXG4gICAgbGV0IHBhdGhzID0gT2JqZWN0LmtleXModGhpcy5zZWVuRmlsZVBhdGhzKTtcclxuXHJcbiAgICBpZiAodGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpIHtcclxuICAgICAgcGF0aHMucHVzaCguLi50aGlzLmNvbXBpbGVyT3B0aW9ucy5wYXRocyk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucywge1xyXG4gICAgICBwYXRoczogcGF0aHMsXHJcbiAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGxlc3Nqcy5yZW5kZXIoc291cmNlQ29kZSwgb3B0cyk7XHJcbiAgICBsZXQgc291cmNlID0gcmVzdWx0LmNzcztcclxuXHJcbiAgICAvLyBOQjogSWYgeW91IGNvbXBpbGUgYSBmaWxlIHRoYXQgaXMgc29sZWx5IGltcG9ydHMsIGl0c1xyXG4gICAgLy8gYWN0dWFsIGNvbnRlbnQgaXMgJycgeWV0IGl0IGlzIGEgdmFsaWQgZmlsZS4gJycgaXMgbm90XHJcbiAgICAvLyB0cnV0aHksIHNvIHdlJ3JlIGdvaW5nIHRvIHJlcGxhY2UgaXQgd2l0aCBhIHN0cmluZyB0aGF0XHJcbiAgICAvLyBpcyB0cnV0aHkuXHJcbiAgICBpZiAoIXNvdXJjZSAmJiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBzb3VyY2UgPSAnICc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29kZTogc291cmNlLFxyXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHNob3VsZENvbXBpbGVGaWxlU3luYyhmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICBsZXQgZGVwZW5kZW5jeUZpbGVuYW1lcyA9IGRldGVjdGl2ZShzb3VyY2VDb2RlKTtcclxuICAgIGxldCBkZXBlbmRlbmNpZXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKGxldCBkZXBlbmRlbmN5TmFtZSBvZiBkZXBlbmRlbmN5RmlsZW5hbWVzKSB7XHJcbiAgICAgIGRlcGVuZGVuY2llcy5wdXNoKHBhdGguam9pbihwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBkZXBlbmRlbmN5TmFtZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXBlbmRlbmNpZXM7XHJcbiAgfVxyXG5cclxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICBsZXNzanMgPSBsZXNzanMgfHwgdGhpcy5nZXRMZXNzKCk7XHJcblxyXG4gICAgbGV0IHNvdXJjZTtcclxuICAgIGxldCBlcnJvciA9IG51bGw7XHJcblxyXG4gICAgbGV0IHRoaXNQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcclxuICAgIHRoaXMuc2VlbkZpbGVQYXRoc1t0aGlzUGF0aF0gPSB0cnVlO1xyXG5cclxuICAgIGxldCBwYXRocyA9IE9iamVjdC5rZXlzKHRoaXMuc2VlbkZpbGVQYXRocyk7XHJcblxyXG4gICAgaWYgKHRoaXMuY29tcGlsZXJPcHRpb25zLnBhdGhzKSB7XHJcbiAgICAgIHBhdGhzLnB1c2goLi4udGhpcy5jb21waWxlck9wdGlvbnMucGF0aHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMsIHtcclxuICAgICAgcGF0aHM6IHBhdGhzLFxyXG4gICAgICBmaWxlbmFtZTogcGF0aC5iYXNlbmFtZShmaWxlUGF0aCksXHJcbiAgICAgIGZpbGVBc3luYzogZmFsc2UsIGFzeW5jOiBmYWxzZSwgc3luY0ltcG9ydDogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgdG91dFN1aXRlKCgpID0+IHtcclxuICAgICAgbGVzc2pzLnJlbmRlcihzb3VyY2VDb2RlLCBvcHRzLCAoZXJyLCBvdXQpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICBlcnJvciA9IGVycjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gTkI6IEJlY2F1c2Ugd2UndmUgZm9yY2VkIGxlc3MgdG8gd29yayBpbiBzeW5jIG1vZGUsIHdlIGNhbiBkbyB0aGlzXHJcbiAgICAgICAgICBzb3VyY2UgPSBvdXQuY3NzO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTkI6IElmIHlvdSBjb21waWxlIGEgZmlsZSB0aGF0IGlzIHNvbGVseSBpbXBvcnRzLCBpdHNcclxuICAgIC8vIGFjdHVhbCBjb250ZW50IGlzICcnIHlldCBpdCBpcyBhIHZhbGlkIGZpbGUuICcnIGlzIG5vdFxyXG4gICAgLy8gdHJ1dGh5LCBzbyB3ZSdyZSBnb2luZyB0byByZXBsYWNlIGl0IHdpdGggYSBzdHJpbmcgdGhhdFxyXG4gICAgLy8gaXMgdHJ1dGh5LlxyXG4gICAgaWYgKCFzb3VyY2UgJiYgdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgc291cmNlID0gJyAnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvZGU6IHNvdXJjZSxcclxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBnZXRMZXNzKCkge1xyXG4gICAgbGV0IHJldDtcclxuICAgIHRvdXRTdWl0ZSgoKSA9PiByZXQgPSByZXF1aXJlKCdsZXNzJykpO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcclxuICAgIHJldHVybiByZXF1aXJlKCdsZXNzL3BhY2thZ2UuanNvbicpLnZlcnNpb247XHJcbiAgfVxyXG59XHJcbiJdfQ==
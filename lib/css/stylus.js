'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _detectiveStylus = require('detective-stylus');

var _detectiveStylus2 = _interopRequireDefault(_detectiveStylus);

var _stylusLookup = require('stylus-lookup');

var _stylusLookup2 = _interopRequireDefault(_stylusLookup);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/stylus'];

let stylusjs = null;
let nib = null;

function each(obj, sel) {
  for (let k in obj) {
    sel(obj[k], k);
  }
}

/**
 * @access private
 */
class StylusCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      sourcemap: 'inline',
      import: ['nib']
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
      nib = nib || require('nib');
      stylusjs = stylusjs || require('stylus');
      _this2.seenFilePaths[_path2.default.dirname(filePath)] = true;

      let opts = _this2.makeOpts(filePath);

      let code = yield new Promise(function (res, rej) {
        let styl = stylusjs(sourceCode, opts);

        _this2.applyOpts(opts, styl);

        styl.render(function (err, css) {
          if (err) {
            rej(err);
          } else {
            res(css);
          }
        });
      });

      return {
        code, mimeType: 'text/css'
      };
    })();
  }

  makeOpts(filePath) {
    let opts = Object.assign({}, this.compilerOptions, {
      filename: (0, _path.basename)(filePath)
    });

    if (opts.import && !Array.isArray(opts.import)) {
      opts.import = [opts.import];
    }

    if (opts.import && opts.import.indexOf('nib') >= 0) {
      opts.use = opts.use || [];

      if (!Array.isArray(opts.use)) {
        opts.use = [opts.use];
      }

      opts.use.push(nib());
    }

    return opts;
  }

  applyOpts(opts, stylus) {
    each(opts, (val, key) => {
      switch (key) {
        case 'set':
        case 'define':
          each(val, (v, k) => stylus[key](k, v));
          break;
        case 'include':
        case 'import':
        case 'use':
          each(val, v => stylus[key](v));
          break;
      }
    });

    stylus.set('paths', Object.keys(this.seenFilePaths).concat(['.']));
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    let dependencyFilenames = (0, _detectiveStylus2.default)(sourceCode);
    let dependencies = [];

    for (let dependencyName of dependencyFilenames) {
      dependencies.push((0, _stylusLookup2.default)(dependencyName, _path2.default.basename(filePath), _path2.default.dirname(filePath)));
    }

    return dependencies;
  }

  compileSync(sourceCode, filePath, compilerContext) {
    nib = nib || require('nib');
    stylusjs = stylusjs || require('stylus');
    this.seenFilePaths[_path2.default.dirname(filePath)] = true;

    let opts = this.makeOpts(filePath),
        styl = stylusjs(sourceCode, opts);

    this.applyOpts(opts, styl);

    return {
      code: styl.render(),
      mimeType: 'text/css'
    };
  }

  getCompilerVersion() {
    return require('stylus/package.json').version;
  }
}
exports.default = StylusCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3Mvc3R5bHVzLmpzIl0sIm5hbWVzIjpbIm1pbWVUeXBlcyIsInN0eWx1c2pzIiwibmliIiwiZWFjaCIsIm9iaiIsInNlbCIsImsiLCJTdHlsdXNDb21waWxlciIsImNvbnN0cnVjdG9yIiwiY29tcGlsZXJPcHRpb25zIiwic291cmNlbWFwIiwiaW1wb3J0Iiwic2VlbkZpbGVQYXRocyIsImdldElucHV0TWltZVR5cGVzIiwic2hvdWxkQ29tcGlsZUZpbGUiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwic291cmNlQ29kZSIsImZpbGVQYXRoIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZSIsInJlcXVpcmUiLCJkaXJuYW1lIiwib3B0cyIsIm1ha2VPcHRzIiwiY29kZSIsIlByb21pc2UiLCJyZXMiLCJyZWoiLCJzdHlsIiwiYXBwbHlPcHRzIiwicmVuZGVyIiwiZXJyIiwiY3NzIiwibWltZVR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJmaWxlbmFtZSIsIkFycmF5IiwiaXNBcnJheSIsImluZGV4T2YiLCJ1c2UiLCJwdXNoIiwic3R5bHVzIiwidmFsIiwia2V5IiwidiIsInNldCIsImtleXMiLCJjb25jYXQiLCJzaG91bGRDb21waWxlRmlsZVN5bmMiLCJkZXBlbmRlbmN5RmlsZW5hbWVzIiwiZGVwZW5kZW5jaWVzIiwiZGVwZW5kZW5jeU5hbWUiLCJiYXNlbmFtZSIsImNvbXBpbGVTeW5jIiwiZ2V0Q29tcGlsZXJWZXJzaW9uIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLE1BQU1BLFlBQVksQ0FBQyxhQUFELENBQWxCOztBQUVBLElBQUlDLFdBQVcsSUFBZjtBQUNBLElBQUlDLE1BQU0sSUFBVjs7QUFFQSxTQUFTQyxJQUFULENBQWNDLEdBQWQsRUFBbUJDLEdBQW5CLEVBQXdC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YUosUUFBYixDQUFuQixJQUE2QyxJQUE3Qzs7QUFFQSxRQUFJSyxPQUFPLEtBQUtDLFFBQUwsQ0FBY04sUUFBZCxDQUFYO0FBQUEsUUFBb0NXLE9BQU83QixTQUFTaUIsVUFBVCxFQUFxQk0sSUFBckIsQ0FBM0M7O0FBRUEsU0FBS08sU0FBTCxDQUFlUCxJQUFmLEVBQXFCTSxJQUFyQjs7QUFFQSxXQUFPO0FBQ0xKLFlBQU1JLEtBQUtFLE1BQUwsRUFERDtBQUVMRyxnQkFBVTtBQUZMLEtBQVA7QUFJRDs7QUFFRHNCLHVCQUFxQjtBQUNuQixXQUFPbkMsUUFBUSxxQkFBUixFQUErQm9DLE9BQXRDO0FBQ0Q7QUEzSHNEO2tCQUFwQ25ELGMiLCJmaWxlIjoic3R5bHVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBkZXRlY3RpdmUgZnJvbSAnZGV0ZWN0aXZlLXN0eWx1cyc7XHJcbmltcG9ydCBsb29rdXAgZnJvbSAnc3R5bHVzLWxvb2t1cCc7XHJcbmltcG9ydCB7Q29tcGlsZXJCYXNlfSBmcm9tICcuLi9jb21waWxlci1iYXNlJztcclxuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBtaW1lVHlwZXMgPSBbJ3RleHQvc3R5bHVzJ107XHJcblxyXG5sZXQgc3R5bHVzanMgPSBudWxsO1xyXG5sZXQgbmliID0gbnVsbDtcclxuXHJcbmZ1bmN0aW9uIGVhY2gob2JqLCBzZWwpIHtcclxuICBmb3IgKGxldCBrIGluIG9iaikge1xyXG4gICAgc2VsKG9ialtrXSwgayk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQGFjY2VzcyBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsdXNDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge1xyXG4gICAgICBzb3VyY2VtYXA6ICdpbmxpbmUnLFxyXG4gICAgICBpbXBvcnQ6IFsnbmliJ11cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzID0ge307XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XHJcbiAgICByZXR1cm4gbWltZVR5cGVzO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5kZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIG5pYiA9IG5pYiB8fCByZXF1aXJlKCduaWInKTtcclxuICAgIHN0eWx1c2pzID0gc3R5bHVzanMgfHwgcmVxdWlyZSgnc3R5bHVzJyk7XHJcbiAgICB0aGlzLnNlZW5GaWxlUGF0aHNbcGF0aC5kaXJuYW1lKGZpbGVQYXRoKV0gPSB0cnVlO1xyXG5cclxuICAgIGxldCBvcHRzID0gdGhpcy5tYWtlT3B0cyhmaWxlUGF0aCk7XHJcblxyXG4gICAgbGV0IGNvZGUgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzLHJlaikgPT4ge1xyXG4gICAgICBsZXQgc3R5bCA9IHN0eWx1c2pzKHNvdXJjZUNvZGUsIG9wdHMpO1xyXG5cclxuICAgICAgdGhpcy5hcHBseU9wdHMob3B0cywgc3R5bCk7XHJcblxyXG4gICAgICBzdHlsLnJlbmRlcigoZXJyLCBjc3MpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICByZWooZXJyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVzKGNzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvZGUsIG1pbWVUeXBlOiAndGV4dC9jc3MnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgbWFrZU9wdHMoZmlsZVBhdGgpIHtcclxuICAgIGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMsIHtcclxuICAgICAgZmlsZW5hbWU6IGJhc2VuYW1lKGZpbGVQYXRoKVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKG9wdHMuaW1wb3J0ICYmICFBcnJheS5pc0FycmF5KG9wdHMuaW1wb3J0KSkge1xyXG4gICAgICBvcHRzLmltcG9ydCA9IFtvcHRzLmltcG9ydF07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdHMuaW1wb3J0ICYmIG9wdHMuaW1wb3J0LmluZGV4T2YoJ25pYicpID49IDApIHtcclxuICAgICAgb3B0cy51c2UgPSBvcHRzLnVzZSB8fCBbXTtcclxuXHJcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcHRzLnVzZSkpIHtcclxuICAgICAgICBvcHRzLnVzZSA9IFtvcHRzLnVzZV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdHMudXNlLnB1c2gobmliKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvcHRzO1xyXG4gIH1cclxuICBcclxuICBcclxuICBhcHBseU9wdHMob3B0cywgc3R5bHVzKSB7XHJcbiAgICBlYWNoKG9wdHMsICh2YWwsIGtleSkgPT4ge1xyXG4gICAgICBzd2l0Y2goa2V5KSB7XHJcbiAgICAgIGNhc2UgJ3NldCc6XHJcbiAgICAgIGNhc2UgJ2RlZmluZSc6XHJcbiAgICAgICAgZWFjaCh2YWwsICh2LCBrKSA9PiBzdHlsdXNba2V5XShrLCB2KSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2luY2x1ZGUnOlxyXG4gICAgICBjYXNlICdpbXBvcnQnOlxyXG4gICAgICBjYXNlICd1c2UnOlxyXG4gICAgICAgIGVhY2godmFsLCAodikgPT4gc3R5bHVzW2tleV0odikpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzdHlsdXMuc2V0KCdwYXRocycsIE9iamVjdC5rZXlzKHRoaXMuc2VlbkZpbGVQYXRocykuY29uY2F0KFsnLiddKSk7XHJcbiAgfVxyXG5cclxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgbGV0IGRlcGVuZGVuY3lGaWxlbmFtZXMgPSBkZXRlY3RpdmUoc291cmNlQ29kZSk7XHJcbiAgICBsZXQgZGVwZW5kZW5jaWVzID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgZGVwZW5kZW5jeU5hbWUgb2YgZGVwZW5kZW5jeUZpbGVuYW1lcykge1xyXG4gICAgICBkZXBlbmRlbmNpZXMucHVzaChsb29rdXAoZGVwZW5kZW5jeU5hbWUsIHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpLCBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlcGVuZGVuY2llcztcclxuICB9XHJcblxyXG4gIGNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIG5pYiA9IG5pYiB8fCByZXF1aXJlKCduaWInKTtcclxuICAgIHN0eWx1c2pzID0gc3R5bHVzanMgfHwgcmVxdWlyZSgnc3R5bHVzJyk7XHJcbiAgICB0aGlzLnNlZW5GaWxlUGF0aHNbcGF0aC5kaXJuYW1lKGZpbGVQYXRoKV0gPSB0cnVlO1xyXG5cclxuICAgIGxldCBvcHRzID0gdGhpcy5tYWtlT3B0cyhmaWxlUGF0aCksIHN0eWwgPSBzdHlsdXNqcyhzb3VyY2VDb2RlLCBvcHRzKTtcclxuXHJcbiAgICB0aGlzLmFwcGx5T3B0cyhvcHRzLCBzdHlsKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlOiBzdHlsLnJlbmRlcigpLFxyXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcclxuICAgIHJldHVybiByZXF1aXJlKCdzdHlsdXMvcGFja2FnZS5qc29uJykudmVyc2lvbjtcclxuICB9XHJcbn1cclxuIl19
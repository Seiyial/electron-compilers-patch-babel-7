'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compilerBase = require('../compiler-base');

var _toutsuite = require('toutsuite');

var _toutsuite2 = _interopRequireDefault(_toutsuite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inputMimeTypes = ['text/vue'];
let vueify = null;

const d = require('debug')('electron-compile:vue');

const mimeTypeToSimpleType = {
  'text/coffeescript': 'coffee',
  'text/typescript': 'ts',
  'application/javascript': 'js',
  'text/jade': 'jade',
  'text/less': 'less',
  'text/sass': 'sass',
  'text/scss': 'scss',
  'text/stylus': 'stylus'
};

/**
 * @access private
 */
class VueCompiler extends _compilerBase.CompilerBase {
  constructor(asyncCompilers, syncCompilers) {
    super();
    Object.assign(this, { asyncCompilers, syncCompilers });

    this.compilerOptions = {};
  }

  static createFromCompilers(compilersByMimeType) {
    let makeAsyncCompilers = () => Object.keys(compilersByMimeType).reduce((acc, mimeType) => {
      let compiler = compilersByMimeType[mimeType];

      acc[mimeType] = (() => {
        var _ref = _asyncToGenerator(function* (content, cb, vueCompiler, filePath) {
          let ctx = {};
          try {
            if (!(yield compiler.shouldCompileFile(filePath, ctx))) {
              cb(null, content);
              return;
            }

            let result = yield compiler.compile(content, filePath, ctx);
            cb(null, result.code);
            return;
          } catch (e) {
            cb(e);
          }
        });

        return function (_x, _x2, _x3, _x4) {
          return _ref.apply(this, arguments);
        };
      })();

      let st = mimeTypeToSimpleType[mimeType];
      if (st) acc[st] = acc[mimeType];

      return acc;
    }, {});

    let makeSyncCompilers = () => Object.keys(compilersByMimeType).reduce((acc, mimeType) => {
      let compiler = compilersByMimeType[mimeType];

      acc[mimeType] = (content, cb, vueCompiler, filePath) => {
        let ctx = {};
        try {
          if (!compiler.shouldCompileFileSync(filePath, ctx)) {
            cb(null, content);
            return;
          }

          let result = compiler.compileSync(content, filePath, ctx);
          cb(null, result.code);
          return;
        } catch (e) {
          cb(e);
        }
      };

      let st = mimeTypeToSimpleType[mimeType];
      if (st) acc[st] = acc[mimeType];

      return acc;
    }, {});

    // NB: This is super hacky but we have to defer building asyncCompilers
    // and syncCompilers until compilersByMimeType is filled out
    let ret = new VueCompiler(null, null);

    let asyncCompilers, syncCompilers;
    Object.defineProperty(ret, 'asyncCompilers', {
      get: () => {
        asyncCompilers = asyncCompilers || makeAsyncCompilers();
        return asyncCompilers;
      }
    });

    Object.defineProperty(ret, 'syncCompilers', {
      get: () => {
        syncCompilers = syncCompilers || makeSyncCompilers();
        return syncCompilers;
      }
    });

    return ret;
  }

  static getInputMimeTypes() {
    return inputMimeTypes;
  }

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      return true;
    })();
  }

  determineDependentFiles(sourceCode, filePath, compilerContext) {
    return _asyncToGenerator(function* () {
      return [];
    })();
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      vueify = vueify || require('@paulcbetts/vueify');

      let opts = Object.assign({}, _this.compilerOptions);

      let code = yield new Promise(function (res, rej) {
        vueify.compiler.compileNoGlobals(sourceCode, filePath, _this.asyncCompilers, opts, function (e, r) {
          if (e) {
            rej(e);
          } else {
            res(r);
          }
        });
      });

      return {
        code,
        mimeType: 'application/javascript'
      };
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    return [];
  }

  compileSync(sourceCode, filePath, compilerContext) {
    vueify = vueify || require('@paulcbetts/vueify');

    let opts = Object.assign({}, this.compilerOptions);

    let err, code;
    (0, _toutsuite2.default)(() => {
      vueify.compiler.compileNoGlobals(sourceCode, filePath, this.syncCompilers, opts, (e, r) => {
        if (e) {
          err = e;
        } else {
          code = r;
        }
      });
    });

    if (err) throw err;

    return {
      code,
      mimeType: 'application/javascript'
    };
  }

  getCompilerVersion() {
    // NB: See same issue with SASS and user-scoped modules as to why we hard-code this
    let thisVersion = '9.4.0';
    let compilers = this.allCompilers || [];
    let otherVersions = compilers.map(x => x.getCompilerVersion).join();

    return `${thisVersion},${otherVersions}`;
  }
}
exports.default = VueCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL3Z1ZS5qcyJdLCJuYW1lcyI6WyJpbnB1dE1pbWVUeXBlcyIsInZ1ZWlmeSIsImQiLCJyZXF1aXJlIiwibWltZVR5cGVUb1NpbXBsZVR5cGUiLCJWdWVDb21waWxlciIsImNvbnN0cnVjdG9yIiwiYXN5bmNDb21waWxlcnMiLCJzeW5jQ29tcGlsZXJzIiwiT2JqZWN0IiwiYXNzaWduIiwiY29tcGlsZXJPcHRpb25zIiwiY3JlYXRlRnJvbUNvbXBpbGVycyIsImNvbXBpbGVyc0J5TWltZVR5cGUiLCJtYWtlQXN5bmNDb21waWxlcnMiLCJrZXlzIiwicmVkdWNlIiwiYWNjIiwibWltZVR5cGUiLCJjb21waWxlciIsImNvbnRlbnQiLCJjYiIsInZ1ZUNvbXBpbGVyIiwiZmlsZVBhdGgiLCJjdHgiLCJzaG91bGRDb21waWxlRmlsZSIsInJlc3VsdCIsImNvbXBpbGUiLCJjb2RlIiwiZSIsInN0IiwibWFrZVN5bmNDb21waWxlcnMiLCJzaG91bGRDb21waWxlRmlsZVN5bmMiLCJjb21waWxlU3luYyIsInJldCIsImRlZmluZVByb3BlcnR5IiwiZ2V0IiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwic291cmNlQ29kZSIsIm9wdHMiLCJQcm9taXNlIiwicmVzIiwicmVqIiwiY29tcGlsZU5vR2xvYmFscyIsInIiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJlcnIiLCJnZXRDb21waWxlclZlcnNpb24iLCJ0aGlzVmVyc2lvbiIsImNvbXBpbGVycyIsImFsbENvbXBpbGVycyIsIm90aGVyVmVyc2lvbnMiLCJtYXAiLCJ4Iiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBRUEsTUFBTUEsaUJBQWlCLENBQUMsVUFBRCxDQUF2QjtBQUNBLElBQUlDLFNBQVMsSUFBYjs7QUFFQSxNQUFNQyxJQUFJQyxRQUFR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QSxRQUFJQyxZQUFZLEtBQUtDLFlBQUwsSUFBcUIsRUFBckM7QUFDQSxRQUFJQyxnQkFBZ0JGLFVBQVVHLEdBQVYsQ0FBZUMsQ0FBRCxJQUFPQSxFQUFFTixrQkFBdkIsRUFBMkNPLElBQTNDLEVBQXBCOztBQUVBLFdBQVEsR0FBRU4sV0FBWSxJQUFHRyxhQUFjLEVBQXZDO0FBQ0Q7QUFqSm1EO2tCQUFqQ2pELFciLCJmaWxlIjoidnVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xyXG5pbXBvcnQgdG91dFN1aXRlIGZyb20gJ3RvdXRzdWl0ZSc7XHJcblxyXG5jb25zdCBpbnB1dE1pbWVUeXBlcyA9IFsndGV4dC92dWUnXTtcclxubGV0IHZ1ZWlmeSA9IG51bGw7XHJcblxyXG5jb25zdCBkID0gcmVxdWlyZSgnZGVidWcnKSgnZWxlY3Ryb24tY29tcGlsZTp2dWUnKTtcclxuXHJcbmNvbnN0IG1pbWVUeXBlVG9TaW1wbGVUeXBlID0ge1xyXG4gICd0ZXh0L2NvZmZlZXNjcmlwdCc6ICdjb2ZmZWUnLFxyXG4gICd0ZXh0L3R5cGVzY3JpcHQnOiAndHMnLFxyXG4gICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JzogJ2pzJyxcclxuICAndGV4dC9qYWRlJzogJ2phZGUnLFxyXG4gICd0ZXh0L2xlc3MnOiAnbGVzcycsXHJcbiAgJ3RleHQvc2Fzcyc6ICdzYXNzJyxcclxuICAndGV4dC9zY3NzJzogJ3Njc3MnLFxyXG4gICd0ZXh0L3N0eWx1cyc6ICdzdHlsdXMnLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVnVlQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xyXG4gIGNvbnN0cnVjdG9yKGFzeW5jQ29tcGlsZXJzLCBzeW5jQ29tcGlsZXJzKSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IGFzeW5jQ29tcGlsZXJzLCBzeW5jQ29tcGlsZXJzIH0pO1xyXG5cclxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge307XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3JlYXRlRnJvbUNvbXBpbGVycyhjb21waWxlcnNCeU1pbWVUeXBlKSB7XHJcbiAgICBsZXQgbWFrZUFzeW5jQ29tcGlsZXJzID0gKCkgPT4gT2JqZWN0LmtleXMoY29tcGlsZXJzQnlNaW1lVHlwZSkucmVkdWNlKChhY2MsIG1pbWVUeXBlKSA9PiB7XHJcbiAgICAgIGxldCBjb21waWxlciA9IGNvbXBpbGVyc0J5TWltZVR5cGVbbWltZVR5cGVdO1xyXG5cclxuICAgICAgYWNjW21pbWVUeXBlXSA9IGFzeW5jIChjb250ZW50LCBjYiwgdnVlQ29tcGlsZXIsIGZpbGVQYXRoKSA9PiB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHt9O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIWF3YWl0IGNvbXBpbGVyLnNob3VsZENvbXBpbGVGaWxlKGZpbGVQYXRoLCBjdHgpKSB7XHJcbiAgICAgICAgICAgIGNiKG51bGwsIGNvbnRlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IGNvbXBpbGVyLmNvbXBpbGUoY29udGVudCwgZmlsZVBhdGgsIGN0eCk7XHJcbiAgICAgICAgICBjYihudWxsLCByZXN1bHQuY29kZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgY2IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgbGV0IHN0ID0gbWltZVR5cGVUb1NpbXBsZVR5cGVbbWltZVR5cGVdO1xyXG4gICAgICBpZiAoc3QpIGFjY1tzdF0gPSBhY2NbbWltZVR5cGVdO1xyXG5cclxuICAgICAgcmV0dXJuIGFjYztcclxuICAgIH0sIHt9KTtcclxuXHJcbiAgICBsZXQgbWFrZVN5bmNDb21waWxlcnMgPSAoKSA9PiBPYmplY3Qua2V5cyhjb21waWxlcnNCeU1pbWVUeXBlKS5yZWR1Y2UoKGFjYywgbWltZVR5cGUpID0+IHtcclxuICAgICAgbGV0IGNvbXBpbGVyID0gY29tcGlsZXJzQnlNaW1lVHlwZVttaW1lVHlwZV07XHJcblxyXG4gICAgICBhY2NbbWltZVR5cGVdID0gKGNvbnRlbnQsIGNiLCB2dWVDb21waWxlciwgZmlsZVBhdGgpID0+IHtcclxuICAgICAgICBsZXQgY3R4ID0ge307XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICghY29tcGlsZXIuc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVQYXRoLCBjdHgpKSB7XHJcbiAgICAgICAgICAgIGNiKG51bGwsIGNvbnRlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGNvbXBpbGVyLmNvbXBpbGVTeW5jKGNvbnRlbnQsIGZpbGVQYXRoLCBjdHgpO1xyXG4gICAgICAgICAgY2IobnVsbCwgcmVzdWx0LmNvZGUpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGNiKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGxldCBzdCA9IG1pbWVUeXBlVG9TaW1wbGVUeXBlW21pbWVUeXBlXTtcclxuICAgICAgaWYgKHN0KSBhY2Nbc3RdID0gYWNjW21pbWVUeXBlXTtcclxuXHJcbiAgICAgIHJldHVybiBhY2M7XHJcbiAgICB9LCB7fSk7XHJcblxyXG4gICAgLy8gTkI6IFRoaXMgaXMgc3VwZXIgaGFja3kgYnV0IHdlIGhhdmUgdG8gZGVmZXIgYnVpbGRpbmcgYXN5bmNDb21waWxlcnNcclxuICAgIC8vIGFuZCBzeW5jQ29tcGlsZXJzIHVudGlsIGNvbXBpbGVyc0J5TWltZVR5cGUgaXMgZmlsbGVkIG91dFxyXG4gICAgbGV0IHJldCA9IG5ldyBWdWVDb21waWxlcihudWxsLCBudWxsKTtcclxuXHJcbiAgICBsZXQgYXN5bmNDb21waWxlcnMsIHN5bmNDb21waWxlcnM7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmV0LCAnYXN5bmNDb21waWxlcnMnLCB7XHJcbiAgICAgIGdldDogKCkgPT4ge1xyXG4gICAgICAgIGFzeW5jQ29tcGlsZXJzID0gYXN5bmNDb21waWxlcnMgfHwgbWFrZUFzeW5jQ29tcGlsZXJzKCk7XHJcbiAgICAgICAgcmV0dXJuIGFzeW5jQ29tcGlsZXJzO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmV0LCAnc3luY0NvbXBpbGVycycsIHtcclxuICAgICAgZ2V0OiAoKSA9PiB7XHJcbiAgICAgICAgc3luY0NvbXBpbGVycyA9IHN5bmNDb21waWxlcnMgfHwgbWFrZVN5bmNDb21waWxlcnMoKTtcclxuICAgICAgICByZXR1cm4gc3luY0NvbXBpbGVycztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBnZXRJbnB1dE1pbWVUeXBlcygpIHtcclxuICAgIHJldHVybiBpbnB1dE1pbWVUeXBlcztcclxuICB9XHJcblxyXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICB2dWVpZnkgPSB2dWVpZnkgfHwgcmVxdWlyZSgnQHBhdWxjYmV0dHMvdnVlaWZ5Jyk7XHJcblxyXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucyk7XHJcblxyXG4gICAgbGV0IGNvZGUgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcclxuICAgICAgdnVlaWZ5LmNvbXBpbGVyLmNvbXBpbGVOb0dsb2JhbHMoc291cmNlQ29kZSwgZmlsZVBhdGgsIHRoaXMuYXN5bmNDb21waWxlcnMsIG9wdHMsIChlLHIpID0+IHtcclxuICAgICAgICBpZiAoZSkgeyByZWooZSk7IH0gZWxzZSB7IHJlcyhyKTsgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvZGUsXHJcbiAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCdcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgdnVlaWZ5ID0gdnVlaWZ5IHx8IHJlcXVpcmUoJ0BwYXVsY2JldHRzL3Z1ZWlmeScpO1xyXG5cclxuICAgIGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMpO1xyXG5cclxuICAgIGxldCBlcnIsY29kZTtcclxuICAgIHRvdXRTdWl0ZSgoKSA9PiB7XHJcbiAgICAgIHZ1ZWlmeS5jb21waWxlci5jb21waWxlTm9HbG9iYWxzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCB0aGlzLnN5bmNDb21waWxlcnMsIG9wdHMsIChlLHIpID0+IHtcclxuICAgICAgICBpZiAoZSkgeyBlcnIgPSBlOyB9IGVsc2UgeyBjb2RlID0gcjsgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChlcnIpIHRocm93IGVycjtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlLFxyXG4gICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xyXG4gICAgLy8gTkI6IFNlZSBzYW1lIGlzc3VlIHdpdGggU0FTUyBhbmQgdXNlci1zY29wZWQgbW9kdWxlcyBhcyB0byB3aHkgd2UgaGFyZC1jb2RlIHRoaXNcclxuICAgIGxldCB0aGlzVmVyc2lvbiA9ICc5LjQuMCc7XHJcbiAgICBsZXQgY29tcGlsZXJzID0gdGhpcy5hbGxDb21waWxlcnMgfHwgW107XHJcbiAgICBsZXQgb3RoZXJWZXJzaW9ucyA9IGNvbXBpbGVycy5tYXAoKHgpID0+IHguZ2V0Q29tcGlsZXJWZXJzaW9uKS5qb2luKCk7XHJcblxyXG4gICAgcmV0dXJuIGAke3RoaXNWZXJzaW9ufSwke290aGVyVmVyc2lvbnN9YDtcclxuICB9XHJcbn1cclxuIl19
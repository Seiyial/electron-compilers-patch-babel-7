'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('@paulcbetts/mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inputMimeTypes = ['text/html'];
let cheerio = null;

const d = require('debug')('electron-compile:inline-html');

const compiledCSS = {
  'text/less': true,
  'text/scss': true,
  'text/sass': true,
  'text/stylus': true
};

/**
 * @access private
 */
class InlineHtmlCompiler extends _compilerBase.CompilerBase {
  constructor(compileBlock, compileBlockSync) {
    super();

    this.compileBlock = compileBlock;
    this.compileBlockSync = compileBlockSync;
  }

  static createFromCompilers(compilersByMimeType) {
    d(`Setting up inline HTML compilers: ${JSON.stringify(Object.keys(compilersByMimeType))}`);

    let compileBlock = (() => {
      var _ref = _asyncToGenerator(function* (sourceCode, filePath, mimeType, ctx) {
        let realType = mimeType;
        if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

        if (!realType) return sourceCode;

        let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
        let ext = _mimeTypes2.default.extension(realType);
        let fakeFile = `${filePath}:inline_${ctx.count}.${ext}`;

        d(`Compiling inline block for ${filePath} with mimeType ${mimeType}`);
        if (!(yield compiler.shouldCompileFile(fakeFile, ctx))) return sourceCode;
        return (yield compiler.compileSync(sourceCode, fakeFile, ctx)).code;
      });

      return function compileBlock(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    })();

    let compileBlockSync = (sourceCode, filePath, mimeType, ctx) => {
      let realType = mimeType;
      if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

      if (!realType) return sourceCode;

      let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
      let ext = _mimeTypes2.default.extension(realType);
      let fakeFile = `${filePath}:inline_${ctx.count}.${ext}`;

      d(`Compiling inline block for ${filePath} with mimeType ${mimeType}`);
      if (!compiler.shouldCompileFileSync(fakeFile, ctx)) return sourceCode;
      return compiler.compileSync(sourceCode, fakeFile, ctx).code;
    };

    return new InlineHtmlCompiler(compileBlock, compileBlockSync);
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

  each(nodes, selector) {
    return _asyncToGenerator(function* () {
      let acc = [];
      nodes.each(function (i, el) {
        let promise = selector(i, el);
        if (!promise) return false;

        acc.push(promise);
        return true;
      });

      yield Promise.all(acc);
    })();
  }

  eachSync(nodes, selector) {
    // NB: This method is here just so it's easier to mechanically
    // translate the async compile to compileSync
    return nodes.each((i, el) => {
      selector(i, el);
      return true;
    });
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      cheerio = cheerio || require('cheerio');

      //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
      let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });
      let toWait = [];

      let that = _this;
      let styleCount = 0;
      toWait.push(_this.each($('style'), (() => {
        var _ref2 = _asyncToGenerator(function* (i, el) {
          let mimeType = $(el).attr('type') || 'text/plain';

          let thisCtx = Object.assign({
            count: styleCount++,
            tag: 'style'
          }, compilerContext);

          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'text/css');
          }
        });

        return function (_x5, _x6) {
          return _ref2.apply(this, arguments);
        };
      })()));

      let scriptCount = 0;
      toWait.push(_this.each($('script'), (() => {
        var _ref3 = _asyncToGenerator(function* (i, el) {
          let src = $(el).attr('src');
          if (src && src.length > 2) {
            $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
            return;
          }

          let thisCtx = Object.assign({
            count: scriptCount++,
            tag: 'script'
          }, compilerContext);

          let mimeType = $(el).attr('type') || 'application/javascript';
          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'application/javascript');
          }
        });

        return function (_x7, _x8) {
          return _ref3.apply(this, arguments);
        };
      })()));

      $('link').map(function (i, el) {
        let href = $(el).attr('href');
        if (href && href.length > 2) {
          $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
        }

        // NB: In recent versions of Chromium, the link type MUST be text/css or
        // it will be flat-out ignored. Also I hate myself for hardcoding these.
        let type = $(el).attr('type');
        if (compiledCSS[type]) $(el).attr('type', 'text/css');
      });

      $('x-require').map(function (i, el) {
        let src = $(el).attr('src');

        // File URL? Bail
        if (src.match(/^file:/i)) return;

        // Absolute path? Bail.
        if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

        try {
          $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
        } catch (e) {
          $(el).text(`${e.message}\n${e.stack}`);
        }
      });

      yield Promise.all(toWait);

      return {
        code: $.html(),
        mimeType: 'text/html'
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
    cheerio = cheerio || require('cheerio');

    //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
    let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });

    let that = this;
    let styleCount = 0;
    this.eachSync($('style'), (() => {
      var _ref4 = _asyncToGenerator(function* (i, el) {
        let mimeType = $(el).attr('type');

        let thisCtx = Object.assign({
          count: styleCount++,
          tag: 'style'
        }, compilerContext);

        let origText = $(el).text();
        let newText = that.compileBlockSync(origText, filePath, mimeType, thisCtx);

        if (origText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'text/css');
        }
      });

      return function (_x9, _x10) {
        return _ref4.apply(this, arguments);
      };
    })());

    let scriptCount = 0;
    this.eachSync($('script'), (() => {
      var _ref5 = _asyncToGenerator(function* (i, el) {
        let src = $(el).attr('src');
        if (src && src.length > 2) {
          $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
          return;
        }

        let thisCtx = Object.assign({
          count: scriptCount++,
          tag: 'script'
        }, compilerContext);

        let mimeType = $(el).attr('type');

        let oldText = $(el).text();
        let newText = that.compileBlockSync(oldText, filePath, mimeType, thisCtx);

        if (oldText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'application/javascript');
        }
      });

      return function (_x11, _x12) {
        return _ref5.apply(this, arguments);
      };
    })());

    $('link').map((i, el) => {
      let href = $(el).attr('href');
      if (href && href.length > 2) {
        $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
      }

      // NB: In recent versions of Chromium, the link type MUST be text/css or
      // it will be flat-out ignored. Also I hate myself for hardcoding these.
      let type = $(el).attr('type');
      if (compiledCSS[type]) $(el).attr('type', 'text/css');
    });

    $('x-require').map((i, el) => {
      let src = $(el).attr('src');

      // File URL? Bail
      if (src.match(/^file:/i)) return;

      // Absolute path? Bail.
      if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

      try {
        $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
      } catch (e) {
        $(el).text(`${e.message}\n${e.stack}`);
      }
    });

    return {
      code: $.html(),
      mimeType: 'text/html'
    };
  }

  getCompilerVersion() {
    let thisVersion = require('../../package.json').version;
    let compilers = this.allCompilers || [];
    let otherVersions = compilers.map(x => x.getCompilerVersion).join();

    return `${thisVersion},${otherVersions}`;
  }

  static fixupRelativeUrl(url) {
    if (!url.match(/^\/\//)) return url;
    return `https:${url}`;
  }
}
exports.default = InlineHtmlCompiler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2lubGluZS1odG1sLmpzIl0sIm5hbWVzIjpbImlucHV0TWltZVR5cGVzIiwiY2hlZXJpbyIsImQiLCJyZXF1aXJlIiwiY29tcGlsZWRDU1MiLCJJbmxpbmVIdG1sQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVCbG9jayIsImNvbXBpbGVCbG9ja1N5bmMiLCJjcmVhdGVGcm9tQ29tcGlsZXJzIiwiY29tcGlsZXJzQnlNaW1lVHlwZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJPYmplY3QiLCJrZXlzIiwic291cmNlQ29kZSIsImZpbGVQYXRoIiwibWltZVR5cGUiLCJjdHgiLCJyZWFsVHlwZSIsInRhZyIsImNvbXBpbGVyIiwiZXh0IiwiZXh0ZW5zaW9uIiwiZmFrZUZpbGUiLCJjb3VudCIsInNob3VsZENvbXBpbGVGaWxlIiwiY29tcGlsZVN5bmMiLCJjb2RlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwiZWFjaCIsIm5vZGVzIiwic2VsZWN0b3IiLCJhY2MiLCJpIiwiZWwiLCJwcm9taXNlIiwicHVzaCIsIlByb21pc2UiLCJhbGwiLCJlYWNoU3luYyIsImNvbXBpbGUiLCIkIiwibG9hZCIsImxvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzIiwidG9XYWl0IiwidGhhdCIsInN0eWxlQ291bnQiLCJhdHRyIiwidGhpc0N0eCIsImFzc2lnbiIsIm9yaWdUZXh0IiwidGV4dCIsIm5ld1RleHQiLCJzY3JpcHRDb3VudCIsInNyYyIsImxlbmd0aCIsImZpeHVwUmVsYXRpdmVVcmwiLCJtYXAiLCJocmVmIiwidHlwZSIsIm1hdGNoIiwicmVzb2x2ZSIsImRpcm5hbWUiLCJlIiwibWVzc2FnZSIsInN0YWNrIiwiaHRtbCIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsIm9sZFRleHQiLCJnZXRDb21waWxlclZlcnNpb24iLCJ0aGlzVmVyc2lvbiIsInZlcnNpb24iLCJjb21waWxlcnMiLCJhbGxDb21waWxlcnMiLCJvdGhlclZlcnNpb25zIiwieCIsImpvaW4iLCJ1cmwiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsaUJBQWlCLENBQUMsV0FBRCxDQUF2QjtBQUNBLElBQUlDLFVBQVUsSUFBZDs7QUFFQSxNQUFNQyxJQUFJQyxRQUFRLE9BQVIsRUFBaUIsOEJBQWpCLENBQVY7O0FBRUEsTUFBTUMsY0FBYztBQUNsQixlQUFhLElBREs7QUFFbEIsZUFBYSxJQUZLO0FBR2xCLGVBQWEsSUFISztBQUlsQixpQkFBZTtBQUpHLENBQXBCOztBQU9BOzs7QUFHZSxNQUFNQyxrQkFBTixvQ0FBOEM7QUFDM0RDLGNBQVlDLFlBQVosRUFBMEJDLGdCQUExQixFQUE0QztBQUMxQzs7QUFFQSxTQUFLRCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRCxTQUFPQyxtQkFBUCxDQUEyQkMsbUJBQTNCLEVBQWdEO0FBQzlDUixNQUFHLHFDQUFvQ1MsS0FBS0MsU0FBTCxDQUFlQyxPQUFPQyxJQUFQLENBQVlKLG1CQUFaLENBQWYsQ0FBaUQsRUFBeEY7O0FBRUEsUUFBSUg7QUFBQSxtQ0FBZSxXQUFPUSxVQUFQLEVBQW1CQyxRQUFuQixFQUE2QkMsUUFBN0IsRUFBdUNDLEdBQXZDLEVBQStDO0FBQ2hFLFlBQUlDLFdBQVdGLFFBQWY7QUFDQSxZQUFJLENBQUNBLFFBQUQsSUFBYUMsSUFBSUUsR0FBSixLQUFZLFFBQTdCLEVBQXVDRCxXQUFXLHdCQUFYOztBQUV2QyxZQUFJLENBQUNBLFFBQUwsRUFBZSxPQUFPSixVQUFQOztBQUVmLFlBQUlNLFdBQVdYLG9CQUFvQlMsUUFBcEIsS0FBaUNULG9CQUFvQixZQUFwQixDQUFoRDtBQUNBLFlBQUlZLE1BQU0sb0JBQVVDLFNBQVYsQ0FBb0JKLFFBQXBCLENB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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCBtaW1lVHlwZXMgZnJvbSAnQHBhdWxjYmV0dHMvbWltZS10eXBlcyc7XHJcbmltcG9ydCB7Q29tcGlsZXJCYXNlfSBmcm9tICcuLi9jb21waWxlci1iYXNlJztcclxuXHJcbmNvbnN0IGlucHV0TWltZVR5cGVzID0gWyd0ZXh0L2h0bWwnXTtcclxubGV0IGNoZWVyaW8gPSBudWxsO1xyXG5cclxuY29uc3QgZCA9IHJlcXVpcmUoJ2RlYnVnJykoJ2VsZWN0cm9uLWNvbXBpbGU6aW5saW5lLWh0bWwnKTtcclxuXHJcbmNvbnN0IGNvbXBpbGVkQ1NTID0ge1xyXG4gICd0ZXh0L2xlc3MnOiB0cnVlLFxyXG4gICd0ZXh0L3Njc3MnOiB0cnVlLFxyXG4gICd0ZXh0L3Nhc3MnOiB0cnVlLFxyXG4gICd0ZXh0L3N0eWx1cyc6IHRydWUsXHJcbn07XHJcblxyXG4vKipcclxuICogQGFjY2VzcyBwcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmxpbmVIdG1sQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xyXG4gIGNvbnN0cnVjdG9yKGNvbXBpbGVCbG9jaywgY29tcGlsZUJsb2NrU3luYykge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLmNvbXBpbGVCbG9jayA9IGNvbXBpbGVCbG9jaztcclxuICAgIHRoaXMuY29tcGlsZUJsb2NrU3luYyA9IGNvbXBpbGVCbG9ja1N5bmM7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3JlYXRlRnJvbUNvbXBpbGVycyhjb21waWxlcnNCeU1pbWVUeXBlKSB7XHJcbiAgICBkKGBTZXR0aW5nIHVwIGlubGluZSBIVE1MIGNvbXBpbGVyczogJHtKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjb21waWxlcnNCeU1pbWVUeXBlKSl9YCk7XHJcblxyXG4gICAgbGV0IGNvbXBpbGVCbG9jayA9IGFzeW5jIChzb3VyY2VDb2RlLCBmaWxlUGF0aCwgbWltZVR5cGUsIGN0eCkgPT4ge1xyXG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcclxuICAgICAgaWYgKCFtaW1lVHlwZSAmJiBjdHgudGFnID09PSAnc2NyaXB0JykgcmVhbFR5cGUgPSAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XHJcblxyXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcclxuXHJcbiAgICAgIGxldCBjb21waWxlciA9IGNvbXBpbGVyc0J5TWltZVR5cGVbcmVhbFR5cGVdIHx8IGNvbXBpbGVyc0J5TWltZVR5cGVbJ3RleHQvcGxhaW4nXTtcclxuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xyXG4gICAgICBsZXQgZmFrZUZpbGUgPSBgJHtmaWxlUGF0aH06aW5saW5lXyR7Y3R4LmNvdW50fS4ke2V4dH1gO1xyXG5cclxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xyXG4gICAgICBpZiAoIShhd2FpdCBjb21waWxlci5zaG91bGRDb21waWxlRmlsZShmYWtlRmlsZSwgY3R4KSkpIHJldHVybiBzb3VyY2VDb2RlO1xyXG4gICAgICByZXR1cm4gKGF3YWl0IGNvbXBpbGVyLmNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZha2VGaWxlLCBjdHgpKS5jb2RlO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgY29tcGlsZUJsb2NrU3luYyA9IChzb3VyY2VDb2RlLCBmaWxlUGF0aCwgbWltZVR5cGUsIGN0eCkgPT4ge1xyXG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcclxuICAgICAgaWYgKCFtaW1lVHlwZSAmJiBjdHgudGFnID09PSAnc2NyaXB0JykgcmVhbFR5cGUgPSAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XHJcblxyXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcclxuXHJcbiAgICAgIGxldCBjb21waWxlciA9IGNvbXBpbGVyc0J5TWltZVR5cGVbcmVhbFR5cGVdIHx8IGNvbXBpbGVyc0J5TWltZVR5cGVbJ3RleHQvcGxhaW4nXTtcclxuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xyXG4gICAgICBsZXQgZmFrZUZpbGUgPSBgJHtmaWxlUGF0aH06aW5saW5lXyR7Y3R4LmNvdW50fS4ke2V4dH1gO1xyXG5cclxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xyXG4gICAgICBpZiAoIWNvbXBpbGVyLnNob3VsZENvbXBpbGVGaWxlU3luYyhmYWtlRmlsZSwgY3R4KSkgcmV0dXJuIHNvdXJjZUNvZGU7XHJcbiAgICAgIHJldHVybiBjb21waWxlci5jb21waWxlU3luYyhzb3VyY2VDb2RlLCBmYWtlRmlsZSwgY3R4KS5jb2RlO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gbmV3IElubGluZUh0bWxDb21waWxlcihjb21waWxlQmxvY2ssIGNvbXBpbGVCbG9ja1N5bmMpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xyXG4gICAgcmV0dXJuIGlucHV0TWltZVR5cGVzO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBhc3luYyBlYWNoKG5vZGVzLCBzZWxlY3Rvcikge1xyXG4gICAgbGV0IGFjYyA9IFtdO1xyXG4gICAgbm9kZXMuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgbGV0IHByb21pc2UgPSBzZWxlY3RvcihpLGVsKTtcclxuICAgICAgaWYgKCFwcm9taXNlKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICBhY2MucHVzaChwcm9taXNlKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChhY2MpO1xyXG4gIH1cclxuXHJcbiAgZWFjaFN5bmMobm9kZXMsIHNlbGVjdG9yKSB7XHJcbiAgICAvLyBOQjogVGhpcyBtZXRob2QgaXMgaGVyZSBqdXN0IHNvIGl0J3MgZWFzaWVyIHRvIG1lY2hhbmljYWxseVxyXG4gICAgLy8gdHJhbnNsYXRlIHRoZSBhc3luYyBjb21waWxlIHRvIGNvbXBpbGVTeW5jXHJcbiAgICByZXR1cm4gbm9kZXMuZWFjaCgoaSxlbCkgPT4ge1xyXG4gICAgICBzZWxlY3RvcihpLGVsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgY2hlZXJpbyA9IGNoZWVyaW8gfHwgcmVxdWlyZSgnY2hlZXJpbycpO1xyXG4gICAgXHJcbiAgICAvL0xlYXZlIHRoZSBhdHRyaWJ1dGVzIGNhc2luZyBhcyBpdCBpcywgYmVjYXVzZSBvZiBBbmd1bGFyIDIgYW5kIG1heWJlIG90aGVyIGNhc2Utc2Vuc2l0aXZlIGZyYW1ld29ya3NcclxuICAgIGxldCAkID0gY2hlZXJpby5sb2FkKHNvdXJjZUNvZGUsIHtsb3dlckNhc2VBdHRyaWJ1dGVOYW1lczogZmFsc2V9KTtcclxuICAgIGxldCB0b1dhaXQgPSBbXTtcclxuXHJcbiAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICBsZXQgc3R5bGVDb3VudCA9IDA7XHJcbiAgICB0b1dhaXQucHVzaCh0aGlzLmVhY2goJCgnc3R5bGUnKSwgYXN5bmMgKGksIGVsKSA9PiB7XHJcbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKSB8fCAndGV4dC9wbGFpbic7XHJcblxyXG4gICAgICBsZXQgdGhpc0N0eCA9IE9iamVjdC5hc3NpZ24oe1xyXG4gICAgICAgIGNvdW50OiBzdHlsZUNvdW50KyssXHJcbiAgICAgICAgdGFnOiAnc3R5bGUnXHJcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XHJcblxyXG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XHJcbiAgICAgIGxldCBuZXdUZXh0ID0gYXdhaXQgdGhhdC5jb21waWxlQmxvY2sob3JpZ1RleHQsIGZpbGVQYXRoLCBtaW1lVHlwZSwgdGhpc0N0eCk7XHJcblxyXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcclxuICAgICAgICAkKGVsKS50ZXh0KG5ld1RleHQpO1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgIGxldCBzY3JpcHRDb3VudCA9IDA7XHJcbiAgICB0b1dhaXQucHVzaCh0aGlzLmVhY2goJCgnc2NyaXB0JyksIGFzeW5jIChpLCBlbCkgPT4ge1xyXG4gICAgICBsZXQgc3JjID0gJChlbCkuYXR0cignc3JjJyk7XHJcbiAgICAgIGlmIChzcmMgJiYgc3JjLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzcmMnLCBJbmxpbmVIdG1sQ29tcGlsZXIuZml4dXBSZWxhdGl2ZVVybChzcmMpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCB0aGlzQ3R4ID0gT2JqZWN0LmFzc2lnbih7XHJcbiAgICAgICAgY291bnQ6IHNjcmlwdENvdW50KyssXHJcbiAgICAgICAgdGFnOiAnc2NyaXB0J1xyXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xyXG5cclxuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpIHx8ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JztcclxuICAgICAgbGV0IG9yaWdUZXh0ID0gJChlbCkudGV4dCgpO1xyXG4gICAgICBsZXQgbmV3VGV4dCA9IGF3YWl0IHRoYXQuY29tcGlsZUJsb2NrKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xyXG5cclxuICAgICAgaWYgKG9yaWdUZXh0ICE9PSBuZXdUZXh0KSB7XHJcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcclxuICAgICAgICAkKGVsKS5hdHRyKCd0eXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG5cclxuICAgICQoJ2xpbmsnKS5tYXAoKGksIGVsKSA9PiB7XHJcbiAgICAgIGxldCBocmVmID0gJChlbCkuYXR0cignaHJlZicpO1xyXG4gICAgICBpZiAoaHJlZiAmJiBocmVmLmxlbmd0aCA+IDIpIHsgJChlbCkuYXR0cignaHJlZicsIElubGluZUh0bWxDb21waWxlci5maXh1cFJlbGF0aXZlVXJsKGhyZWYpKTsgfVxyXG5cclxuICAgICAgLy8gTkI6IEluIHJlY2VudCB2ZXJzaW9ucyBvZiBDaHJvbWl1bSwgdGhlIGxpbmsgdHlwZSBNVVNUIGJlIHRleHQvY3NzIG9yXHJcbiAgICAgIC8vIGl0IHdpbGwgYmUgZmxhdC1vdXQgaWdub3JlZC4gQWxzbyBJIGhhdGUgbXlzZWxmIGZvciBoYXJkY29kaW5nIHRoZXNlLlxyXG4gICAgICBsZXQgdHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKTtcclxuICAgICAgaWYgKGNvbXBpbGVkQ1NTW3R5cGVdKSAkKGVsKS5hdHRyKCd0eXBlJywgJ3RleHQvY3NzJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKCd4LXJlcXVpcmUnKS5tYXAoKGksIGVsKSA9PiB7XHJcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcclxuXHJcbiAgICAgIC8vIEZpbGUgVVJMPyBCYWlsXHJcbiAgICAgIGlmIChzcmMubWF0Y2goL15maWxlOi9pKSkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gQWJzb2x1dGUgcGF0aD8gQmFpbC5cclxuICAgICAgaWYgKHNyYy5tYXRjaCgvXihbXFwvXXxbQS1aYS16XTopL2kpKSByZXR1cm47XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBzcmMpKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICQoZWwpLnRleHQoYCR7ZS5tZXNzYWdlfVxcbiR7ZS5zdGFja31gKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwodG9XYWl0KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlOiAkLmh0bWwoKSxcclxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2h0bWwnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIGNoZWVyaW8gPSBjaGVlcmlvIHx8IHJlcXVpcmUoJ2NoZWVyaW8nKTtcclxuICAgIFxyXG4gICAgLy9MZWF2ZSB0aGUgYXR0cmlidXRlcyBjYXNpbmcgYXMgaXQgaXMsIGJlY2F1c2Ugb2YgQW5ndWxhciAyIGFuZCBtYXliZSBvdGhlciBjYXNlLXNlbnNpdGl2ZSBmcmFtZXdvcmtzXHJcbiAgICBsZXQgJCA9IGNoZWVyaW8ubG9hZChzb3VyY2VDb2RlLCB7bG93ZXJDYXNlQXR0cmlidXRlTmFtZXM6IGZhbHNlfSk7XHJcblxyXG4gICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgbGV0IHN0eWxlQ291bnQgPSAwO1xyXG4gICAgdGhpcy5lYWNoU3luYygkKCdzdHlsZScpLCBhc3luYyAoaSwgZWwpID0+IHtcclxuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpO1xyXG5cclxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcclxuICAgICAgICBjb3VudDogc3R5bGVDb3VudCsrLFxyXG4gICAgICAgIHRhZzogJ3N0eWxlJ1xyXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xyXG5cclxuICAgICAgbGV0IG9yaWdUZXh0ID0gJChlbCkudGV4dCgpO1xyXG4gICAgICBsZXQgbmV3VGV4dCA9IHRoYXQuY29tcGlsZUJsb2NrU3luYyhvcmlnVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcclxuXHJcbiAgICAgIGlmIChvcmlnVGV4dCAhPT0gbmV3VGV4dCkge1xyXG4gICAgICAgICQoZWwpLnRleHQobmV3VGV4dCk7XHJcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgc2NyaXB0Q291bnQgPSAwO1xyXG4gICAgdGhpcy5lYWNoU3luYygkKCdzY3JpcHQnKSwgYXN5bmMgKGksIGVsKSA9PiB7XHJcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcclxuICAgICAgaWYgKHNyYyAmJiBzcmMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIElubGluZUh0bWxDb21waWxlci5maXh1cFJlbGF0aXZlVXJsKHNyYykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcclxuICAgICAgICBjb3VudDogc2NyaXB0Q291bnQrKyxcclxuICAgICAgICB0YWc6ICdzY3JpcHQnXHJcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XHJcblxyXG4gICAgICBsZXQgbWltZVR5cGUgPSAkKGVsKS5hdHRyKCd0eXBlJyk7XHJcblxyXG4gICAgICBsZXQgb2xkVGV4dCA9ICQoZWwpLnRleHQoKTtcclxuICAgICAgbGV0IG5ld1RleHQgPSB0aGF0LmNvbXBpbGVCbG9ja1N5bmMob2xkVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcclxuXHJcbiAgICAgIGlmIChvbGRUZXh0ICE9PSBuZXdUZXh0KSB7XHJcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcclxuICAgICAgICAkKGVsKS5hdHRyKCd0eXBlJywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJCgnbGluaycpLm1hcCgoaSwgZWwpID0+IHtcclxuICAgICAgbGV0IGhyZWYgPSAkKGVsKS5hdHRyKCdocmVmJyk7XHJcbiAgICAgIGlmIChocmVmICYmIGhyZWYubGVuZ3RoID4gMikgeyAkKGVsKS5hdHRyKCdocmVmJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoaHJlZikpOyB9XHJcblxyXG4gICAgICAvLyBOQjogSW4gcmVjZW50IHZlcnNpb25zIG9mIENocm9taXVtLCB0aGUgbGluayB0eXBlIE1VU1QgYmUgdGV4dC9jc3Mgb3JcclxuICAgICAgLy8gaXQgd2lsbCBiZSBmbGF0LW91dCBpZ25vcmVkLiBBbHNvIEkgaGF0ZSBteXNlbGYgZm9yIGhhcmRjb2RpbmcgdGhlc2UuXHJcbiAgICAgIGxldCB0eXBlID0gJChlbCkuYXR0cigndHlwZScpO1xyXG4gICAgICBpZiAoY29tcGlsZWRDU1NbdHlwZV0pICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoJ3gtcmVxdWlyZScpLm1hcCgoaSwgZWwpID0+IHtcclxuICAgICAgbGV0IHNyYyA9ICQoZWwpLmF0dHIoJ3NyYycpO1xyXG5cclxuICAgICAgLy8gRmlsZSBVUkw/IEJhaWxcclxuICAgICAgaWYgKHNyYy5tYXRjaCgvXmZpbGU6L2kpKSByZXR1cm47XHJcblxyXG4gICAgICAvLyBBYnNvbHV0ZSBwYXRoPyBCYWlsLlxyXG4gICAgICBpZiAoc3JjLm1hdGNoKC9eKFtcXC9dfFtBLVphLXpdOikvaSkpIHJldHVybjtcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShmaWxlUGF0aCksIHNyYykpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgJChlbCkudGV4dChgJHtlLm1lc3NhZ2V9XFxuJHtlLnN0YWNrfWApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb2RlOiAkLmh0bWwoKSxcclxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2h0bWwnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xyXG4gICAgbGV0IHRoaXNWZXJzaW9uID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJykudmVyc2lvbjtcclxuICAgIGxldCBjb21waWxlcnMgPSB0aGlzLmFsbENvbXBpbGVycyB8fCBbXTtcclxuICAgIGxldCBvdGhlclZlcnNpb25zID0gY29tcGlsZXJzLm1hcCgoeCkgPT4geC5nZXRDb21waWxlclZlcnNpb24pLmpvaW4oKTtcclxuXHJcbiAgICByZXR1cm4gYCR7dGhpc1ZlcnNpb259LCR7b3RoZXJWZXJzaW9uc31gO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZpeHVwUmVsYXRpdmVVcmwodXJsKSB7XHJcbiAgICBpZiAoIXVybC5tYXRjaCgvXlxcL1xcLy8pKSByZXR1cm4gdXJsO1xyXG4gICAgcmV0dXJuIGBodHRwczoke3VybH1gO1xyXG4gIH1cclxufVxyXG4iXX0=
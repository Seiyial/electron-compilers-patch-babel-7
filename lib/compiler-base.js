"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * This class is the base interface for compilers that are used by 
 * electron-compile. If your compiler library only supports a 
 * synchronous API, use SimpleCompilerBase instead.
 *
 * @interface
 */
class CompilerBase {
  constructor() {
    this.compilerOptions = {};
  }

  /**  
   * This method describes the MIME types that your compiler supports as input. 
   * Many precompiled file types don't have a specific MIME type, so if it's not
   * recognized by the mime-types package, you need to patch rig-mime-types in
   * electron-compile.
   *
   * @return {string[]}  An array of MIME types that this compiler can compile.
   *
   * @abstract
   */
  static getInputMimeTypes() {
    throw new Error("Implement me!");
  }

  /**
   * Determines whether a file should be compiled
   *    
   * @param  {string} fileName        The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<bool>}        True if you are able to compile this file.
   *
   * @abstract
   */
  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      throw new Error("Implement me!");
    })();
  }

  /**  
   * Returns the dependent files of this file. This is used for languages such
   * as LESS which allow you to import / reference other related files. In future
   * versions of electron-compile, we will use this information to invalidate
   * all of the parent files if a child file changes.
   *    
   * @param  {string} sourceCode    The contents of filePath
   * @param  {string} fileName        The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<string[]>}    An array of dependent file paths, or an empty
   *                                array if there are no dependent files. 
   *
   * @abstract
   */
  determineDependentFiles(sourceCode, fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      throw new Error("Implement me!");
    })();
  }

  /**  
   * Compiles the file
   *    
   * @param  {string} sourceCode    The contents of filePath
   * @param  {string} fileName      The full path of a file to compile.
   * @param  {object} compilerContext An object that compilers can add extra
                                    information to as part of a job - the caller
                                    won't do anything with this.
   * @return {Promise<object>}      An object representing the compiled result
   * @property {string} code        The compiled code
   * @property {string} mimeType    The MIME type of the compiled result, which 
   *                                should exist in the mime-types database.
   *
   * @abstract
   */
  compile(sourceCode, fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      throw new Error("Implement me!");
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    throw new Error("Implement me!");
  }

  determineDependentFilesSync(sourceCode, fileName, compilerContext) {
    throw new Error("Implement me!");
  }

  compileSync(sourceCode, fileName, compilerContext) {
    throw new Error("Implement me!");
  }

  /**
   * Returns a version number representing the version of the underlying 
   * compiler library. When this number changes, electron-compile knows
   * to throw all away its generated code.
   *    
   * @return {string}  A version number. Note that this string isn't 
   *                   parsed in any way, just compared to the previous
   *                   one for equality.
   *
   * @abstract
   */
  getCompilerVersion() {
    throw new Error("Implement me!");
  }
}

exports.CompilerBase = CompilerBase; /**
                                      * This class implements all of the async methods of CompilerBase by just 
                                      * calling the sync version. Use it to save some time when implementing 
                                      * simple compilers.
                                      *
                                      * To use it, implement the compile method, the getCompilerVersion method, 
                                      * and the getInputMimeTypes static method. 
                                      * 
                                      * @abstract
                                      */

class SimpleCompilerBase extends CompilerBase {
  constructor() {
    super();
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
      return _this.compileSync(sourceCode, filePath, compilerContext);
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    return [];
  }
}
exports.SimpleCompilerBase = SimpleCompilerBase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21waWxlci1iYXNlLmpzIl0sIm5hbWVzIjpbIkNvbXBpbGVyQmFzZSIsImNvbnN0cnVjdG9yIiwiY29tcGlsZXJPcHRpb25zIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJFcnJvciIsInNob3VsZENvbXBpbGVGaWxlIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsInNvdXJjZUNvZGUiLCJjb21waWxlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZVN5bmMiLCJnZXRDb21waWxlclZlcnNpb24iLCJTaW1wbGVDb21waWxlckJhc2UiLCJmaWxlUGF0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7Ozs7OztBQU9PLE1BQU1BLFlBQU4sQ0FBbUI7QUFDeEJDLGdCQUFjO0FBQ1osU0FBS0MsZUFBTCxHQUF1QixFQUF2QjtBQUNEOztBQUVEOzs7Ozs7Ozs7O0FBVUEsU0FBT0MsaUJBQVAsR0FBMkI7QUFDekIsVUFBTSxJQUFJQyxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0Q7O0FBR0Q7Ozs7Ozs7Ozs7O0FBV01DLG1CQUFOLENBQXdCQyxRQUF4QixFQUFrQ0MsZUFBbEMsRUFBbUQ7QUFBQTtBQUNqRCxZQUFNLElBQUlILEtBQUosQ0FBVSxlQUFWLENBQU47QUFEaUQ7QUFFbEQ7O0FBR0Q7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQk1JLHlCQUFOLENBQThCQyxVQUE5QixFQUEwQ0gsUUFBMUMsRUFBb0RDLGVBQXBELEVBQXFFO0FBQUE7QUFDbkUsWUFBTSxJQUFJSCxLQUFKLENBQVUsZUFBVixDQUFOO0FBRG1FO0FBRXBFOztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7QUFlTU0sU0FBTixDQUFjRCxVQUFkLEVBQTBCSCxRQUExQixFQUFvQ0MsZUFBcEMsRUFBcUQ7QUFBQTtBQUNuRCxZQUFNLElBQUlILEtBQUosQ0FBVSxlQUFWLENBQU47QUFEbUQ7QUFFcEQ7O0FBRURPLHdCQUFzQkwsUUFBdEIsRUFBZ0NDLGVBQWhDLEVBQWlEO0FBQy9DLFVBQU0sSUFBSUgsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNEOztBQUVEUSw4QkFBNEJILFVBQTVCLEVBQXdDSCxRQUF4QyxFQUFrREMsZUFBbEQsRUFBbUU7QUFDakUsVUFBTSxJQUFJSCxLQUFKLENBQVUsZUFBVixDQUFOO0FBQ0Q7O0FBRURTLGNBQVlKLFVBQVosRUFBd0JILFFBQXhCLEVBQWtDQyxlQUFsQyxFQUFtRDtBQUNqRCxVQUFNLElBQUlILEtBQUosQ0FBVSxlQUFWLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7QUFXQVUsdUJBQXFCO0FBQ25CLFVBQU0sSUFBSVYsS0FBSixDQUFVLGVBQVYsQ0FBTjtBQUNEO0FBckd1Qjs7UUFBYkosWSxHQUFBQSxZLEVBeUdiOzs7Ozs7Ozs7OztBQVVPLE1BQU1lLGtCQUFOLFNBQWlDZixZQUFqQyxDQUE4QztBQUNuREMsZ0JBQWM7QUFDWjtBQUNEOztBQUVLSSxtQkFBTixDQUF3QkMsUUFBeEIsRUFBa0NDLGVBQWxDLEVBQW1EO0FBQUE7QUFDakQsYUFBTyxJQUFQO0FBRGlEO0FBRWxEOztBQUVLQyx5QkFBTixDQUE4QkMsVUFBOUIsRUFBMENPLFFBQTFDLEVBQW9EVCxlQUFwRCxFQUFxRTtBQUFBO0FBQ25FLGFBQU8sRUFBUDtBQURtRTtBQUVwRTs7QUFFS0csU0FBTixDQUFjRCxVQUFkLEVBQTBCTyxRQUExQixFQUFvQ1QsZUFBcEMsRUFBcUQ7QUFBQTs7QUFBQTtBQUNuRCxhQUFPLE1BQUtNLFdBQUwsQ0FBaUJKLFVBQWpCLEVBQTZCTyxRQUE3QixFQUF1Q1QsZUFBdkMsQ0FBUDtBQURtRDtBQUVwRDs7QUFFREksd0JBQXNCTCxRQUF0QixFQUFnQ0MsZUFBaEMsRUFBaUQ7QUFDL0MsV0FBTyxJQUFQO0FBQ0Q7O0FBRURLLDhCQUE0QkgsVUFBNUIsRUFBd0NPLFFBQXhDLEVBQWtEVCxlQUFsRCxFQUFtRTtBQUNqRSxXQUFPLEVBQVA7QUFDRDtBQXZCa0Q7UUFBeENRLGtCLEdBQUFBLGtCIiwiZmlsZSI6ImNvbXBpbGVyLWJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogVGhpcyBjbGFzcyBpcyB0aGUgYmFzZSBpbnRlcmZhY2UgZm9yIGNvbXBpbGVycyB0aGF0IGFyZSB1c2VkIGJ5IFxyXG4gKiBlbGVjdHJvbi1jb21waWxlLiBJZiB5b3VyIGNvbXBpbGVyIGxpYnJhcnkgb25seSBzdXBwb3J0cyBhIFxyXG4gKiBzeW5jaHJvbm91cyBBUEksIHVzZSBTaW1wbGVDb21waWxlckJhc2UgaW5zdGVhZC5cclxuICpcclxuICogQGludGVyZmFjZVxyXG4gKi8gXHJcbmV4cG9ydCBjbGFzcyBDb21waWxlckJhc2Uge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jb21waWxlck9wdGlvbnMgPSB7fTtcclxuICB9XHJcbiAgXHJcbiAgLyoqICBcclxuICAgKiBUaGlzIG1ldGhvZCBkZXNjcmliZXMgdGhlIE1JTUUgdHlwZXMgdGhhdCB5b3VyIGNvbXBpbGVyIHN1cHBvcnRzIGFzIGlucHV0LiBcclxuICAgKiBNYW55IHByZWNvbXBpbGVkIGZpbGUgdHlwZXMgZG9uJ3QgaGF2ZSBhIHNwZWNpZmljIE1JTUUgdHlwZSwgc28gaWYgaXQncyBub3RcclxuICAgKiByZWNvZ25pemVkIGJ5IHRoZSBtaW1lLXR5cGVzIHBhY2thZ2UsIHlvdSBuZWVkIHRvIHBhdGNoIHJpZy1taW1lLXR5cGVzIGluXHJcbiAgICogZWxlY3Ryb24tY29tcGlsZS5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge3N0cmluZ1tdfSAgQW4gYXJyYXkgb2YgTUlNRSB0eXBlcyB0aGF0IHRoaXMgY29tcGlsZXIgY2FuIGNvbXBpbGUuXHJcbiAgICpcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKi8gICBcclxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXBsZW1lbnQgbWUhXCIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIGZpbGUgc2hvdWxkIGJlIGNvbXBpbGVkXHJcbiAgICogICAgXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBmaWxlTmFtZSAgICAgICAgVGhlIGZ1bGwgcGF0aCBvZiBhIGZpbGUgdG8gY29tcGlsZS5cclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBpbGVyQ29udGV4dCBBbiBvYmplY3QgdGhhdCBjb21waWxlcnMgY2FuIGFkZCBleHRyYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvcm1hdGlvbiB0byBhcyBwYXJ0IG9mIGEgam9iIC0gdGhlIGNhbGxlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b24ndCBkbyBhbnl0aGluZyB3aXRoIHRoaXMuXHJcbiAgICogQHJldHVybiB7UHJvbWlzZTxib29sPn0gICAgICAgIFRydWUgaWYgeW91IGFyZSBhYmxlIHRvIGNvbXBpbGUgdGhpcyBmaWxlLlxyXG4gICAqXHJcbiAgICogQGFic3RyYWN0XHJcbiAgICovICAgXHJcbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wbGVtZW50IG1lIVwiKTtcclxuICB9XHJcblxyXG4gIFxyXG4gIC8qKiAgXHJcbiAgICogUmV0dXJucyB0aGUgZGVwZW5kZW50IGZpbGVzIG9mIHRoaXMgZmlsZS4gVGhpcyBpcyB1c2VkIGZvciBsYW5ndWFnZXMgc3VjaFxyXG4gICAqIGFzIExFU1Mgd2hpY2ggYWxsb3cgeW91IHRvIGltcG9ydCAvIHJlZmVyZW5jZSBvdGhlciByZWxhdGVkIGZpbGVzLiBJbiBmdXR1cmVcclxuICAgKiB2ZXJzaW9ucyBvZiBlbGVjdHJvbi1jb21waWxlLCB3ZSB3aWxsIHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGludmFsaWRhdGVcclxuICAgKiBhbGwgb2YgdGhlIHBhcmVudCBmaWxlcyBpZiBhIGNoaWxkIGZpbGUgY2hhbmdlcy5cclxuICAgKiAgICBcclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZUNvZGUgICAgVGhlIGNvbnRlbnRzIG9mIGZpbGVQYXRoXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBmaWxlTmFtZSAgICAgICAgVGhlIGZ1bGwgcGF0aCBvZiBhIGZpbGUgdG8gY29tcGlsZS5cclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGNvbXBpbGVyQ29udGV4dCBBbiBvYmplY3QgdGhhdCBjb21waWxlcnMgY2FuIGFkZCBleHRyYVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvcm1hdGlvbiB0byBhcyBwYXJ0IG9mIGEgam9iIC0gdGhlIGNhbGxlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b24ndCBkbyBhbnl0aGluZyB3aXRoIHRoaXMuXHJcbiAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmdbXT59ICAgIEFuIGFycmF5IG9mIGRlcGVuZGVudCBmaWxlIHBhdGhzLCBvciBhbiBlbXB0eVxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheSBpZiB0aGVyZSBhcmUgbm8gZGVwZW5kZW50IGZpbGVzLiBcclxuICAgKlxyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqLyAgIFxyXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XHJcbiAgfVxyXG5cclxuICBcclxuICAvKiogIFxyXG4gICAqIENvbXBpbGVzIHRoZSBmaWxlXHJcbiAgICogICAgXHJcbiAgICogQHBhcmFtICB7c3RyaW5nfSBzb3VyY2VDb2RlICAgIFRoZSBjb250ZW50cyBvZiBmaWxlUGF0aFxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gZmlsZU5hbWUgICAgICBUaGUgZnVsbCBwYXRoIG9mIGEgZmlsZSB0byBjb21waWxlLlxyXG4gICAqIEBwYXJhbSAge29iamVjdH0gY29tcGlsZXJDb250ZXh0IEFuIG9iamVjdCB0aGF0IGNvbXBpbGVycyBjYW4gYWRkIGV4dHJhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uIHRvIGFzIHBhcnQgb2YgYSBqb2IgLSB0aGUgY2FsbGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvbid0IGRvIGFueXRoaW5nIHdpdGggdGhpcy5cclxuICAgKiBAcmV0dXJuIHtQcm9taXNlPG9iamVjdD59ICAgICAgQW4gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY29tcGlsZWQgcmVzdWx0XHJcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGNvZGUgICAgICAgIFRoZSBjb21waWxlZCBjb2RlXHJcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IG1pbWVUeXBlICAgIFRoZSBNSU1FIHR5cGUgb2YgdGhlIGNvbXBpbGVkIHJlc3VsdCwgd2hpY2ggXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBleGlzdCBpbiB0aGUgbWltZS10eXBlcyBkYXRhYmFzZS5cclxuICAgKlxyXG4gICAqIEBhYnN0cmFjdFxyXG4gICAqLyAgIFxyXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW1wbGVtZW50IG1lIVwiKTtcclxuICB9XHJcblxyXG4gIHNob3VsZENvbXBpbGVGaWxlU3luYyhmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXBsZW1lbnQgbWUhXCIpO1xyXG4gIH1cclxuXHJcbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkltcGxlbWVudCBtZSFcIik7XHJcbiAgfVxyXG5cclxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXBsZW1lbnQgbWUhXCIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHZlcnNpb24gbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgdmVyc2lvbiBvZiB0aGUgdW5kZXJseWluZyBcclxuICAgKiBjb21waWxlciBsaWJyYXJ5LiBXaGVuIHRoaXMgbnVtYmVyIGNoYW5nZXMsIGVsZWN0cm9uLWNvbXBpbGUga25vd3NcclxuICAgKiB0byB0aHJvdyBhbGwgYXdheSBpdHMgZ2VuZXJhdGVkIGNvZGUuXHJcbiAgICogICAgXHJcbiAgICogQHJldHVybiB7c3RyaW5nfSAgQSB2ZXJzaW9uIG51bWJlci4gTm90ZSB0aGF0IHRoaXMgc3RyaW5nIGlzbid0IFxyXG4gICAqICAgICAgICAgICAgICAgICAgIHBhcnNlZCBpbiBhbnkgd2F5LCBqdXN0IGNvbXBhcmVkIHRvIHRoZSBwcmV2aW91c1xyXG4gICAqICAgICAgICAgICAgICAgICAgIG9uZSBmb3IgZXF1YWxpdHkuXHJcbiAgICpcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKi8gICBcclxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbXBsZW1lbnQgbWUhXCIpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGltcGxlbWVudHMgYWxsIG9mIHRoZSBhc3luYyBtZXRob2RzIG9mIENvbXBpbGVyQmFzZSBieSBqdXN0IFxyXG4gKiBjYWxsaW5nIHRoZSBzeW5jIHZlcnNpb24uIFVzZSBpdCB0byBzYXZlIHNvbWUgdGltZSB3aGVuIGltcGxlbWVudGluZyBcclxuICogc2ltcGxlIGNvbXBpbGVycy5cclxuICpcclxuICogVG8gdXNlIGl0LCBpbXBsZW1lbnQgdGhlIGNvbXBpbGUgbWV0aG9kLCB0aGUgZ2V0Q29tcGlsZXJWZXJzaW9uIG1ldGhvZCwgXHJcbiAqIGFuZCB0aGUgZ2V0SW5wdXRNaW1lVHlwZXMgc3RhdGljIG1ldGhvZC4gXHJcbiAqIFxyXG4gKiBAYWJzdHJhY3RcclxuICovIFxyXG5leHBvcnQgY2xhc3MgU2ltcGxlQ29tcGlsZXJCYXNlIGV4dGVuZHMgQ29tcGlsZXJCYXNlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCk7XHJcbiAgfVxyXG5cclxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG4iXX0=
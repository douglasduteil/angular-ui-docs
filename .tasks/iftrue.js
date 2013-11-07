/*
 * if true - run task
 * ==================
 *
 * Inspired by https://github.com/tschaub/grunt-gh-pages
 *
 * Copyright (c) 2013 Douglas Duteil
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  // REQUIRED

  var f = grunt.template.process;


  grunt.registerMultiTask('iftrue', 'run task list if test true', function () {


    var data = grunt.util._.extend({
      test: false,
      trueMessage: this.name + " true",
      falseMessage: this.name + " false"
    }, this.data);
    grunt.verbose.writeflags(data, 'Data');

    var isTrue = (grunt.util.kindOf(data.test) === 'function') ? data.test() : data.test;

    if (isTrue) {
      grunt.log.writeln(f(data.trueMessage));
    } else {
      grunt.warn(f(data.falseMessage), 0);
    }

  });

};
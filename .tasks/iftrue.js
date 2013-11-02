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

  var __ = grunt.template.process;


  grunt.registerMultiTask('iftrue', 'run task list if test true', function () {


    var data = grunt.util._.extend({
      test: false,
      tasks: [],
      trueMessage: this.name + " true",
      falseMessage: this.name + " false"
    }, this.data);
    grunt.verbose.writeflags(data, 'Data');

    var isTrue = (grunt.util.kindOf(data.test) === 'function') ? data.test() : data.test;
    var tasks = (grunt.util.kindOf(data.tasks) === 'string') ? [data.tasks] : data.tasks;

    if (isTrue) {
      grunt.log.writeln(__(data.trueMessage));
      grunt.task.run(tasks);
    } else {
      grunt.log.writeln(__(data.falseMessage));
    }

  });

};
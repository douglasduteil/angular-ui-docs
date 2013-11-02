/*
 * delegating task
 * ===============
 *
 * Copyright (c) 2013 Douglas Duteil
 * Licensed under the MIT license.
 */


/** @param {Object} grunt Grunt. */
module.exports = function (grunt) {

  'use strict';

  var exec = require('child_process').exec,

  //TODO CHANGE BAD MANUAL LINKING...
    execOptions = { cwd: 'bower_components/angular-ui-docs' };

  function shell(cmd, callback) {
    var child = exec(cmd, execOptions);
    child.stdout.on('data', grunt.log.write);
    child.stderr.on('data', grunt.log.write);
    child.on('exit', function (code) {
      if (code !== 0) {
        grunt.log.error(f('Exited with code: ' + code));
        return callback(false);
      }

      return callback();
    });
  }

  function initThenRun(cmd, callback) {

    shell('npm install', function () {
      var verboseMode = grunt.option('verbose') ? ' -v' : '';
      shell(cmd + verboseMode, callback);
    });
  }

  grunt.registerTask('delegate', 'Delegate grunt work to another worker...', function (task) {
    var done = this.async();
    if (task) {
      grunt.log.subhead('==================\n\n' + task + ' delegated !');

      initThenRun('grunt --gruntfile=DelegatedFile.js ' + task, function () {
        grunt.log.ok('Delegated grunt work done !');
        grunt.log.subhead('==================');
        done();
      });
    } else {
      grunt.log.warn("Nothing to delegate.");
      done();
    }


    grunt.log.writeln();
  });
};
/*
 * Generate Bower Components
 * ======================
 *
 * Copyright (c) 2013 Douglas Duteil
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  // REQUIRED

  var sh = require('shelljs'), f = grunt.template.process;

  grunt.registerMultiTask('clearBowerComponents', 'Clear Bower Components', function () {

    function e(cmd_tmpl, data) {
      var cmd = f(cmd_tmpl, { data: data || {} });
      grunt.log.writeln("$", cmd.cyan);
      return sh.exec(cmd);
    }

    e("git push origin :<%= target %>-test-<%= version %>", {target: this.target, version: grunt.option('target') || "" })

    if (grunt.option('nuke'))
      e("git push origin :bower-<%= target %>-test", {target: this.target, version: grunt.option('target') || "" })
  });

  grunt.registerMultiTask('generateBowerComponents', 'Generate Bower Components', function () {

    var data = this.data || [];
    var target = this.target;
    var property, setup, ntarget;

    grunt.verbose.writeflags(data, 'Data');
    grunt.config('bwr', grunt.util._.extend(grunt.file.readJSON('bower.json'), { name: data.fullName }));


    property = 'component-' + target;

// Config copy

    setup = {
      options: {processContent: function (content) {
        return f(content);
      }},
      files: [
        // TODO Use a "real" tmp file
        {src: ['<%= dist %>/.tmpl/bower.tmpl'], dest: '<%= dist %>/dist/js/bower.json'},
        {src: ['<%= dist %>/.tmpl/.travis.yml.tmpl'], dest: '<%= dist %>/dist/js/.travis.yml'}
      ]
    };
    ntarget = {};
    ntarget[property] = setup;
    grunt.config('copy', ntarget);


// Config gitpublisher
    setup = {
      options: {
        push: !!grunt.config('allowPushOnRepo'),
        branch: 'bower-' + target + '-test',
        tag: target + '-test-<%= pkg.version %>',
        message: 'v<%= pkg.version %> (bower-' + target + '-test-branch, build ' + process.env.TRAVIS_BUILD_NUMBER + ')'
      },
      // TODO Use a "real" tmp file
      cwd: "<%= dist %>/dist/js",
      src: ['**/*', '.travis.yml']
    };
    ntarget = {};
    ntarget[property] = setup;
    grunt.config('gitpublisher', ntarget);


    // Run tasks
    grunt.task.run(['copy:' + property, 'gitpublisher:' + property ]);


  });

};

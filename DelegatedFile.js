/*
 * DelegatedFile
 * ===========
 *
 * Copyright (c) 2013 Douglas Duteil
 * Licensed under the MIT license.
 */

/** @param {Object} grunt Grunt. */
module.exports = function (grunt) {

  //TODO CHANGE BAD MANUAL LINKING...
  grunt.file.setBase("../../");
  //TODO CHANGE BAD MANUAL LINKING...
  var rrr = "./bower_components/angular-ui-docs";

  var _ = grunt.util._;


  //TODO CHANGE REALLY NOT PRETTY WAY TO PICK IT...
  if (!grunt.file.isFile('delegatedConfig.js')) {
    grunt.fatal("This grunt work require some attention. (delegatedConfig.js)");
    return;
  }
  var config = require('../../delegatedConfig.js')(grunt);

  grunt.verbose.writeflags(config, 'Config');

  var default_config = {
    bower: 'bower_components',
    dist: '<%= bower %>/angular-ui-docs',
    pkg: grunt.file.readJSON('package.json'),


    copy: {
      template: {
        options: {processContent: function (content) {
          return grunt.template.process(content);
        }},
        files: [
          {src: ['<%= meta.view.repoName %>.js'], dest: '<%= dist %>/dist/js/<%= meta.view.repoName %>.js', filter: 'isFile'},
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'},
          {src: ['demo/demo.css'], dest: '<%= dist %>/assets/css/demo.css'}
        ]
          .concat(
            _.map(config.js_dependencies.concat(config.css_dependencies), function (f) {
              return {src: [f], dest: '<%= dist %>/' + f, filter: 'isFile'};
            }))
      }
    },

    'gh-pages': {
      'doc': {
        options: {
          base: '<%= dist %>',
          branch: 'gh-pages-test',
          add: true,
          message: 'Travis commit : build $TRAVIS_BUILD_NUMBER',
          user: {
            name: 'X (via TravisCI)',
            email: 'x@googlegroups.com'
          }
        },
        src: [ '**/*', '!node_modules/**' ]
      },
      'bower': {
        options: {
          base: '<%= dist %>/dist/js',
          branch: 'bower-test',
          add: true,
          tag: 'v<%= pkg.version %>',
          message: 'Travis commit : build $TRAVIS_BUILD_NUMBER',
          user: {
            name: 'X (via TravisCI)',
            email: 'x@googlegroups.com'
          }
        },
        src: ['**/*']
      }
    }
  };

  var opts = _.extend(default_config, { meta : config });


  //TODO CHANGE BAD MANUAL LINKING...
  grunt.loadTasks(rrr + '/node_modules/grunt-contrib-copy/tasks');

  grunt.registerTask('doc-building', ['copy:template']);

  grunt.registerTask('doc-publishing', ['doc-building', 'gh-pages:doc']);
  grunt.registerTask('bower-publishing', []);// COMING SOON


  grunt.initConfig(opts);
};
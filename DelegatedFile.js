/*
 * Git Publisher
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
  var allowPushOnRepo = (process.env.TRAVIS == 'true') && (process.env.TRAVIS_PULL_REQUEST == 'false') && (process.env.TRAVIS_BRANCH == 'develop') && true;

  if (allowPushOnRepo){
    grunt.log.subhead("MAIN TRAVIS BRANCH DETECTED !");
  }

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

    'gitpublisher': {
      'doc': {
        options: {
          push: true,
          branch: 'gh-pages-test',
          message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER,
          repo :  process.env.REPO || false
        },
        src: [
          '<%= dist %>/index.html']
      },
      'bower': {
        options: {
          push: allowPushOnRepo,
          base: '<%= dist %>/dist/js',
          branch: 'bower-test',
          tag: 'v<%= pkg.version %>',
          message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER,
          repo :  process.env.REPO || false
        },
        src: ['**/*']
      }
    }
  };

  var opts = _.extend(default_config, { meta : config });


  //TODO CHANGE BAD MANUAL LINKING...
  grunt.loadTasks(rrr + '/node_modules/grunt-contrib-copy/tasks');
  grunt.loadTasks(rrr + '/.tasks');

  grunt.registerTask('doc-building', ['copy:template']);

  grunt.registerTask('doc-publishing', ['doc-building', 'gitpublisher:doc']);
  grunt.registerTask('bower-publishing', []);// COMING SOON


  grunt.initConfig(opts);
};
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
  var gtp = grunt.template.process;
  var sh = require('shelljs');


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

    //TODO CHANGE REALLY NOT PRETTY WAY TO PICK IT...
    'MASTER_BRANCH' : "develop",


    copy: {
      template: {
        options: {processContent: gtp},
        files: [
          {src: ['<%= meta.view.repoName %>.js'], dest: '<%= dist %>/dist/js/<%= meta.view.repoName %>.js', filter: 'isFile'},
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'},
          {src: ['demo/demo.css'], dest: '<%= dist %>/assets/css/demo.css'}
        ]
          .concat(
            _.map(config.js_dependencies.concat(config.css_dependencies), function (f) {
              return {src: [f], dest: '<%= dist %>/' + f, filter: 'isFile'};
            }))
      },
      bowerfile: {
        options: {processContent: function (content) {
          grunt.config('bwr', _.extend(grunt.file.readJSON('bower.json'), { name: "angular-ui-codemirror" }));
          return gtp(content);
        }},
        files: [
          {src: ['<%= dist %>/.tmpl/bower.tmpl'], dest: '<%= dist %>/dist/js/bower.json'},
          {src: ['<%= dist %>/.tmpl/.travis.yml.tmpl'], dest: '<%= dist %>/dist/js/.travis.yml'}
        ]
      },
      ghpagetravi:{
        options: {processContent: gtp},
        files: [
          {src: ['<%= dist %>/.tmpl/.travis.yml.tmpl'], dest: '<%= dist %>/.travis.yml'}
        ]
      }
    },

    iftrue: {
      'new-release': {
        test: function () {
          cmd = gtp("git ls-remote --tags --exit-code origin v<%= pkg.version %>");
          grunt.log.writeln('$', cmd.cyan);
          return sh.exec(cmd).code > 0;
        },
        trueMessage: "New release v<%= pkg.version %>.",
        falseMessage: "Release v<%= pkg.version %> detected.",
        tasks: ['copy:bowerfile', 'gitpublisher:bower']
      }
    },

    gitpublisher: {
      doc: {
        options: {
          push: allowPushOnRepo,
          branch: 'gh-pages-test',
          message: 'Travis commit : build ' + process.env.TRAVIS_BUILD_NUMBER,
          repo :  process.env.REPO || false
        },
        cwd: "<%= dist %>",
        src: [
          'index.html', '.travis.yml']
      },
      bower: {
        options: {
          push: allowPushOnRepo,
          branch: 'bower-test',
          tag: 'v<%= pkg.version %>',
          message: 'v<%= pkg.version %> (bower-test-branch, build ' + process.env.TRAVIS_BUILD_NUMBER + ')',
          repo :  process.env.REPO || false
        },
        cwd: "<%= dist %>/dist/js",
        src: ['**/*', '.travis.yml']
      }
    }
  };

  var opts = _.extend(default_config, { meta : config });


  //TODO CHANGE BAD MANUAL LINKING...
  grunt.loadTasks(rrr + '/node_modules/grunt-contrib-copy/tasks');
  grunt.loadTasks(rrr + '/.tasks');

  grunt.registerTask('doc-building', ['copy:template']);

  grunt.registerTask('doc-publishing', ['doc-building', 'copy:ghpagetravi','gitpublisher:doc']);
  grunt.registerTask('bower-publishing', ['iftrue:new-release']);


  grunt.initConfig(opts);
};
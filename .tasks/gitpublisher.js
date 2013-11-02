/*
 * Git publisher task
 * ==================
 *
 * Inspired by https://github.com/tschaub/grunt-gh-page
 *
 * Copyright (c) 2013 Douglas Duteil
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
  'use strict';

  // REQUIRED

  var sh = require('shelljs'),
    path = require('path'),
    __ = grunt.template.process;


  grunt.registerMultiTask('gitpublisher', 'Git publisher !', function () {


    var defaults = {
      add: false,
      git: 'git',
      cloneLocation: path.join(sh.tempdir(), this.name, this.target),
      branch: 'gh-pages',
      remote: 'origin',
      base: process.cwd(),
      only: '.',
      push: true,
      message: 'Updates'
    };

    // override defaults with any task options
    var options = this.options(defaults);
    grunt.verbose.writeflags(options, 'Options');


    function e(cmd_tmpl, data) {
      var cmd = __(cmd_tmpl, { data: grunt.util._.extend(data || {}, options) });
      grunt.log.writeln("$", cmd.cyan);
      return sh.exec(cmd);
    }

    if (!grunt.file.isDir(options.base)) {
      grunt.fatal(new Error('The "base" option must be an existing directory'));
    }

    if (!Array.isArray(this.files) || this.files.length === 0) {
      grunt.fatal(new Error('Files must be provided in the "src" property.'));
    }


    var res;

    // Get the remote.origin.url
    res = e("<%= git %> config --get remote.origin.url");
    if (res.code > 0) {
      grunt.fatal(new Error("Can't get no remote.origin.url !"));
    }
    options.repoUrl = String(res.output).split(/[\n\r]/).shift();
    grunt.verbose.writeln("Repo link :", options.repoUrl.cyan);


    // Remove tmp file
    if (grunt.file.isDir(options.cloneLocation)) {
      e("rm -rf <%= cloneLocation %>");
    }

    // Clone the repo branch to a special location (clonedRepoLocation)
    res = e("<%= git %> clone --branch=<%= branch %> --single-branch <%= repoUrl %> <%= cloneLocation %>");
    if (res.code > 0) {
      // try again without banch options
      res = e("<%= git %> clone <%= repoUrl %> <%= cloneLocation %>");
      if (res.code > 0) {
        grunt.fatal(new Error("Can't clone !"));
      }
    }


    // Clean cloneLocation
    if (grunt.file.isDir(options.cloneLocation)) {
      e("mkdir -p <%= cloneLocation %>");
    }
    e("cd <%= cloneLocation %>");

    if (sh.pwd() !== options.cloneLocation) {
      grunt.fatal(new Error("No cd SiDy ! "));
    }

    e("<%= git %> clean -f -d");
    e("<%= git %> fetch <%= remote %>");

    // Checkout a branch (create an orphan if it doesn't exist on the remote).
    res = e("<%= git %> ls-remote --exit-code . <%= remote %>/<%= branch %>");
    if (res.code > 0) {
      // branch doesn't exist, create an orphan
      res = e("<%= git %> checkout --orphan <%= branch %>");
      if (res.code > 0) {
        grunt.fatal(new Error("Can't clone !"));
      }
    } else {
      // branch exists on remote, hard reset
      e("<%= git %> checkout <%= branch %>");

    }

    if (!options.add) {
      // Empty the clone
      e("<%= git %> rm --ignore-unmatch -r -f *");
    }


    this.files.forEach(function (filePair) {


      grunt.log.writeln("src", src.cyan);
      grunt.log.writeln("relative", relative.cyan);
      grunt.log.writeln("target", target.cyan);
      /*
       filePair.src.forEach(function (src) {

       var rel_src = filePair.cwd + '/' + src;
       var rel_dest = clonedRepoLocation + '/' + src;
       if (grunt.file.isDir(rel_src)) {
       grunt.verbose.writeln('Creating ' + rel_dest.cyan);
       sh.mkdir('-p', rel_dest);
       } else {
       grunt.verbose.writeln('Creating ' + rel_dest.cyan);
       sh.cp('-f', rel_src, rel_dest);
       }

       });
       */
    });


    grunt.log.writeln();
  });

};
/*
 * Git publisher task
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

  var sh = require('shelljs'),
    path = require('path'),
    __ = grunt.template.process;


  grunt.registerMultiTask('gitpublisher', 'Git publisher !', function () {


    var defaults = {
      add: false,
      git: 'git',
      cloneLocation: path.join(process.env.HOME, 'tmp', this.name, this.target),
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
      grunt.fatal('The "base" option must be an existing directory');
    }

    if (!Array.isArray(this.files) || this.files.length === 0) {
      grunt.fatal('Files must be provided in the "src" property.');
    }


    var res;

    // Get the remote.origin.url
    res = e("<%= git %> config --get remote.origin.url 2>&1 >/dev/null");
    if (res.code > 0) {
      grunt.log.debug(res.output);
      grunt.fatal("Can't get no remote.origin.url !");
    }
    options.repoUrl =  process.env.REPO || String(res.output).split(/[\n\r]/).shift();
    if (!options.repoUrl) {
      grunt.fatal('No repo link !');
    }
    grunt.verbose.writeln("Repo link :", options.repoUrl.cyan);


    grunt.verbose.writeln();
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
        grunt.log.debug(res.output);
        grunt.fatal("Can't clone !");
      }
    }


    grunt.verbose.writeln();
    // Go to the cloneLocation
    sh.cd(options.cloneLocation);

    if (sh.pwd() !== options.cloneLocation) {
      grunt.fatal("Can't access to the clone location : " + options.cloneLocation);
    }

    e("<%= git %> clean -f -d");
    e("<%= git %> fetch <%= remote %>");

    // Checkout a branch (create an orphan if it doesn't exist on the remote).
    res = e("<%= git %> ls-remote --exit-code . <%= remote %>/<%= branch %>");
    if (res.code > 0) {
      // branch doesn't exist, create an orphan
      res = e("<%= git %> checkout --orphan <%= branch %>");
      if (res.code > 0) {
        grunt.log.debug(res.output);
        grunt.fatal("Can't clone !");
      }
    } else {
      // branch exists on remote, hard reset
      e("<%= git %> checkout <%= branch %>");

    }

    if (!options.add) {
      // Empty the clone
      e("<%= git %> ls-files -z | xargs -0 <%= git %> rm --ignore-unmatch -rfq");
      //e("<%= git %> rm --ignore-unmatch -rfq .[^.]* *");
    }


    grunt.verbose.writeln();
    // Copie the targeted files
    var tally = {
      dirs: 0,
      files: 0
    };
    this.files.forEach(function (filePair) {
      filePair.src.forEach(function (filesrc) {
        var src = path.resolve(options.base, filePair.cwd, filesrc);
        var dest = path.join(options.cloneLocation, filesrc);

        if (grunt.file.isDir(src)) {
          grunt.verbose.writeln('Creating ' + dest.cyan);
          sh.mkdir(dest);
          tally.dirs++;
        } else {
          grunt.verbose.writeln('Copying ' + src.cyan + ' -> ' + dest.cyan);
          sh.cp('-f', src, dest);
          tally.files++;
        }

      });
    });

    if (tally.dirs) {
      grunt.log.write('Created ' + tally.dirs.toString().cyan + ' directories');
    }

    if (tally.files) {
      grunt.log.write((tally.dirs ? ', copied ' : 'Copied ') + tally.files.toString().cyan + ' files');
    }
    grunt.log.writeln();


    grunt.verbose.writeln();
    // Add and commit all the files
    e("<%= git %> add .");
    res = e("<%= git %> commit -m '<%= message%>'");


    grunt.verbose.writeln();
    // Add new tack if not exits
    if (options.tag) {
      res = e("<%= git %> tag <%= tag %>");
      if (res.code > 0) {
        grunt.log.debug(res.output);
        grunt.log.error("Can't tag failed, continuing !");
      }
    }


    // grunt.verbose.writeln();
    // Push :)
    if (options.push) {
      e("<%= git %> push --tags <%= remote %> <%= branch %>");
    }


    // Clean up the clone location
    if (grunt.file.isDir(options.cloneLocation)) {
      e("rm -rf <%= cloneLocation %>");
    }

  });

};
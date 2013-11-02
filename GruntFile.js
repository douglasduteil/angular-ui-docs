/** @param {Object} grunt Grunt. */
module.exports = function (grunt) {

  grunt.initConfig({
    jshint: {
      files: ['**/*.js', '!**/*.min.js', '!assets/vendor/**', '!node_modules/**'],
      options: {
        // options here to override JSHint defaults
        globals: {
          curly: true,
          immed: true,
          newcap: true,
          noarg: true,
          sub: true,
          boss: true,
          eqnull: true,
          globals: {}
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);

};
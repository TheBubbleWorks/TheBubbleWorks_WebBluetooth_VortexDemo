// see: https://github.com/gruntjs/grunt-contrib-connect
module.exports = function(grunt) {

	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist'],

        copy: {
            all: {
                expand: true,
                cwd: "src/",
                src: ['*.css', 'images/**/*', 'img/**/*', '!Gruntfile.js', 'conf/**/*', 'js/**/*', '*.html'],
                dest: 'dist/',
            },

            bower: {
                expand: true,
                cwd: "bower_components",
                src: ['**/*'],
                dest: 'dist/bower_components',
            },
        },

        vulcanize: {
            options: {},
            files: {
                'dist/build.html': 'dist/index.html'
            },
        },

        connect: {
            server: {
                options: {
                    hostname: '*',
                    port: 3141,
                    protocol: 'https',
                    //key: grunt.file.read('server.key').toString(),
                    //cert: grunt.file.read('server.crt').toString(),
                    //ca: grunt.file.read('ca.crt').toString(),
                    keepalive: true,
                    base: 'dist'
                },
            },
        },

        'gh-pages': {
            options: {
                base: 'dist'
            },
            src: ['**']
        }
	});



    // This:
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    // Replaces lots of these:
    //grunt.loadNpmTasks('grunt-contrib-connect');
    //grunt.loadNpmTasks('grunt-...


    // Default task(s).
    grunt.registerTask('default', ['clean',  'copy', 'vulcanize' ]); //'connect:server']);


};

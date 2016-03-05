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
                dest: 'dist/lib',
            },
        },

        vulcanize: {
            default: {
                options: {
                    inlineScripts: true,
                    inlineCss: true,
                    stripComments: true,
                },
                files: {
                    'dist/index-inlined.html': 'dist/index.html'
                },
            },
        },

        watch: {
            options: {
                livereload: true,
            },
            files: ['src/**/*'],
            tasks: ['default'],
        },

        connect: {
            server: {
                options: {
                    hostname: '*',
                    port: 3141,
                    protocol: 'https',
                    // Only need these if you want to overide the built-in self-signed certificate
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


    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    // The above replaces lots of manual entries:
    //grunt.loadNpmTasks('grunt-contrib-connect');
    //grunt.loadNpmTasks('grunt-...


    grunt.registerTask('default', ['clean',  'copy']); //, 'vulcanize']);
    grunt.registerTask('dev', ['watch']);
    grunt.registerTask('run', ['connect:server']);
    grunt.registerTask('publish', ['gh-pages']);

};

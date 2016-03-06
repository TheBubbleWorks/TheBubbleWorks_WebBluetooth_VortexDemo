module.exports = function(grunt) {

	grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist'],

        copy: {
            all: {
                expand: true,
                cwd: "app/",
                src: ['*.css', 'images/**/*', 'img/**/*', '!Gruntfile.js', 'conf/**/*', 'scripts/**/*', 'elements/**/*', 'styles/**/*', '*.html', '**/*.ico'],
                dest: 'dist/',
            },

            // There should no need to copy as we vulcanise the included elements into a single elements.html file later
            // However... TODO: find the handful of cases where the include dependancied arent being picked up (e.g. colours.json)
            bower: {
                expand: true,
                cwd: "app/bower_components",
                src: ['**/*'],
                dest: 'dist/bower_components',
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
                    'dist/elements/elements.html': 'app/elements/elements.html'
                },
            },
        },

        watch: {
            options: {
                livereload: true,
            },
            files: ['app/**/*'],
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


    // Find the development onlt grunt-* dependencies from package.json
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    // The above replaces lots of manual entries:
    //grunt.loadNpmTasks('grunt-contrib-connect')  etc.


    grunt.registerTask('default', ['clean', 'copy', 'vulcanize']);
    grunt.registerTask('dev', ['default', 'watch']);
    grunt.registerTask('serve', ['default', 'connect:server']);
    grunt.registerTask('publish', ['default', 'gh-pages']);

};

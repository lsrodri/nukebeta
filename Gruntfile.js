module.exports = function(grunt) {

    "use strict"

    grunt.initConfig({

        nodemon: {
          dev: {
            script: 'index.js'
          }
        },

        watch: {
            options: {
                livereload: true,
                nospawn: true
            },
            js: {
                files: ["js/*.js", "js/controllers/*.js", "js/model/*.js"],
                options: {
                  livereload: true,
                  keepAlive: true
                }
            },
            html: {
                files: ["*.html","view/*.html"],
                options: {
                  livereload: true,
                  keepAlive: true
                }
            },
            css: {
                files: "css/*.css",
                options: {
                  livereload: true,
                  keepAlive: true
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 3000,
                    hostname: "localhost",
                    livereload: true,
                    open: true
                }
            }
        },

        pkg: grunt.file.readJSON('package.json')
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask( "default", [ "connect", "watch" ]);

};
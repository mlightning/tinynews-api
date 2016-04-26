module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            options: {
                stout: true
            },
            npm_install: {
                command: 'npm install'
            },
            bower_install: {
                command: 'bower install'
            }
        },

        clean : {
            common : {
                src : [
                    "node_modules/tinynews-common"
                ]
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'nyan',
                    mocha: require('mocha')
                },
                src: ['test/*.js']
            },
            report: {
                options: {
                    reporter: 'spec',
                    mocha: require('mocha')
                },
                src: ['test/*.js']
            }
        }
    });

    grunt.registerTask('default', ['mochaTest:test']);
    grunt.registerTask('test', ['mochaTest:test']);
    grunt.registerTask('test_report', ['mochaTest:report']);
    grunt.registerTask('install', ['shell:npm_install', 'shell:bower_install', 'clean:common', 'shell:npm_install']);
};
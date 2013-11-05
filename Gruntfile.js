module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            js: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
            css: {
                src: ['src/**/*.css'],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true,
                    window: true
                }
            }
        },
        watch: {
            files: ['src/**/*'],
            tasks: ['jshint', 'concat', 'uglify']
        },
        connect: {
            server: {
                options: {
                    port: 8282,
                    base: '.'
                }
            }
        }
     });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('dev', ['connect', 'watch']);
};

var path = require('path');
module.exports = function(grunt) {
	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			jade: {
				files: ['source/jade/*.jade','source/jade/**/*.jade'],
				tasks: ['jade']
			},
			css: {
				files: ['source/less/*.less', 'source/less/**/*.js'],
				tasks: ['less']
			},
			js: {
				files: ['source/js/*.js', 'source/js/**/*.js'],
				tasks: ['jshint', 'browserify']
			},
			express: {
				files: ['server/*.js'],
				tasks: ['express:dev'],
				options: {
					spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
				}
			}

		},
		jshint: {
			all: ['gruntfile.js', 'js/*.js']
		},
		less: {
			development: {
				files: {
					"public/css/style.css": "source/less/style.less"
				}
			}
		},
		jade: {
			files: {
				expand: true, // Enable dynamic expansion.
				cwd: 'source/jade', // Src matches are relative to this path.
				src: '*.jade', // Actual pattern(s) to match.
				//src: '**/*.jade', // Actual pattern(s) to match.
				//src: 'index.jade', // Actual pattern(s) to match.
				dest: 'public/',
				ext: '.html' // Dest filepaths will have this extension.
			}
		},
		browserify: {
			main: {
				options: {
					browserifyOptions: {
						debug: true
					},
					transform: ['debowerify']
				},
				src: 'source/js/main.js',
				dest: 'public/js/main.js'
			}
		},
		express: {
		    dev: {
				options: {
					script: 'server/index.js'
				}
		    }
		}
	});

	//Load NPM tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-express-server');

	//Making grunt default to force in order not to break the project.
	//grunt.option('force', true);

	//Default task(s).
	grunt.registerTask('default', ['jshint', 'less', 'jade', 'browserify', 'express:dev', 'watch']);
};
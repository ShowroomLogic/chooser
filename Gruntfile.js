module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    build_dir: 'build',
    dist_dir: 'dist',
    clean: {
      build: ['<%= build_dir %>'],
      dist: ['<%= dist_dir %>']
    },
    concat: {
      build: {
        src: ['<%= build_dir %>/<%= pkg.name %>.js', '<%= build_dir %>/templates.js'],
        dest: '<%= build_dir %>/<%= pkg.name %>.js'
      }
    },
    copy: {
      dist: {
        files: [{
          cwd: '<%= build_dir %>',
          src: ['<%= pkg.name %>.css', '<%= pkg.name %>.js'],
          dest: '<%= dist_dir %>/',
          expand: true
        }]
      }
    },
    html2js: {
      options: {
        module: 'chooser.templates'
      },
      build: {
        src: ['templates/**/*.html'],
        dest: '<%= build_dir %>/templates.js'
      }
    },
    ngmin: {
      build: {
        files: [
          {
            src: ['<%= pkg.name %>.js'],
            dest: '<%= build_dir %>/<%= pkg.name %>.js'
          }
        ]
      }
    },
    recess: {
      build: {
        options: {
          compile: true
        },
        files: {
          '<%= build_dir %>/<%= pkg.name %>.css': ['less/<%= pkg.name %>.less']
        }
      },
      dist: {
        options: {
          compress: true
        },
        files: {
          '<%= dist_dir %>/<%= pkg.name %>.min.css': ['<%= dist_dir %>/<%= pkg.name %>.css']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        src: '<%= dist_dir %>/<%= pkg.name %>.js',
        dest: '<%= dist_dir %>/<%= pkg.name %>.min.js'
      }
    }
  });

  [ 'grunt-contrib-clean',
    'grunt-contrib-concat',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-html2js',
    'grunt-ngmin',
    'grunt-recess'
  ].forEach(function(task) {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask('build', ['clean:build', 'ngmin:build', 'html2js:build', 'concat:build', 'recess:build']);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('release', ['clean:dist', 'build', 'copy:dist', 'uglify:dist', 'recess:dist', 'clean:build']);
};
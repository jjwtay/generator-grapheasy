'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the majestic ${chalk.red('generator-grapheasy')} generator!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Name of project.',
        default: this.appname
      },
      {
        type: 'list',
        name: 'type',
        message: 'What db driver do you wish to use with TypeORM?',
        choices: ['postgres']
      },
      {
        type: 'input',
        name: 'host',
        message: 'Database Host.',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database Port.',
        default: 5432
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username',
        default: 'postgres'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password',
        default: 'password'
      },
      {
        type: 'input',
        name: 'dbname',
        message: 'Database name',
        default: this.appname
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(this.templatePath('.babelrc'), this.destinationPath('.babelrc'));
    this.fs.copy(
      this.templatePath('.graphqlconfig'),
      this.destinationPath('.graphqlconfig')
    );
    this.fs.copy(
      this.templatePath('schemas/schema.graphql'),
      this.destinationPath('schemas/schema.graphql')
    );
    this.fs.copyTpl(this.templatePath('index.js'), this.destinationPath('index.js'), {
      type: this.props.type,
      host: this.props.host,
      port: this.props.port,
      username: this.props.username,
      password: this.props.password,
      dbname: this.props.dbname
    });
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        name: this.props.name
      }
    );
  }

  install() {
    this.installDependencies();
  }
};

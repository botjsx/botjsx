#!/usr/bin/env node

const shell = require('shelljs');
const publishUtils = require('./utils');
const path = require('path');
const packageJson = require(path.resolve('./package.json'));

// get GIT url
console.log('=> Getting the git remote URL');
const GIT_URL = publishUtils.exec('git config --get remote.origin.url');
if (!GIT_URL) {
    console.log('This project is not configured with a remote git repo');
    process.exit(-1);
}

// git pull first
publishUtils.exec('git pull');

// check if the branch exists with the name as in the package.json version field
const VERSION = packageJson.version;
const TAG_NAME = 'v' + VERSION;
console.log('=> Check if version ' + VERSION + ' is already exists');
let tagIsExists;
try {
    tagIsExists = publishUtils.exec('git rev-parse -q --verify "refs/tags/' + TAG_NAME + '"');
} catch(err) {}
if(!!tagIsExists) {
    console.error('ERROR: Tag with name ' + TAG_NAME + ' is already exists');
    process.exit(-1);
}

// git commit
try {
    publishUtils.exec('git add .');
    publishUtils.exec('git commit -m "release ' + TAG_NAME + '"');
    publishUtils.exec('git push origin master');
} catch(err) {}

// set version tag to latest commit
publishUtils.exec('git tag -f ' + TAG_NAME);
// pushing tag
console.log('=> Pushing tag');
publishUtils.exec('git push origin ' + TAG_NAME);

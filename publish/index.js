#!/usr/bin/env node

const execa = require('execa');
const path = require('path');
const { writeFile } = require('then-fs');

module.exports = async function publish(directory, level, { noNpm }={}) {
  const package = localRequire('package.json');
  const { version } = package;
  const newVersion = bumpVersion(version, level);
  const newPackage = { ...package, version: newVersion };
  const inDir = { cwd: directory };

  await writeFile(localFile('package.json'), JSON.stringify(newPackage, null, 2));
  await execa('git', ['add', '*'], inDir);
  await execa('git', ['commit', '-am', `🚀 Publish ${newVersion}`], inDir);
  await execa('git', ['push', 'origin', 'master'], inDir);
  if(!noNpm) await execa('npm', ['publish', '--access=public'], inDir);

  console.log(`${newPackage.name} v${newVersion} published`);

  function localFile(p) {
    return path.join(directory, p);
  }

  function localRequire(p) {
    return require(localFile(p));
  }

  function bumpVersion(version, level='minor') {
    const [ major, patch, minor ] = version.split(/\./g).map(n => parseInt(n));
    switch(level) {
      case 'major': return `${major + 1}.${patch}.${minor}`;
      case 'patch': return `${major}.${patch + 1}.${minor}`;
      case 'minor': return `${major}.${patch}.${minor + 1}`;
      default: throw new Error(`Invalid version level "${level}"`);
    }
  }
}

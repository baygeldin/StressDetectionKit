const fs = require('fs');
const path = require('path');
const program = require('commander');

const samples = fs.readdirSync('./samples');

console.log(samples);

program
  .option('-s, --samples [timestamp]', 'specify samples collection', 'latest')
  .parse(process.argv);

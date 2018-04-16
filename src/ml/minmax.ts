import { Command } from 'commander';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Sample } from 'lib/types';
import { max, min } from 'mathjs';
import { join, resolve } from 'path';

const root = join(__dirname, 'samples');
const dirs = readdirSync(root)
  .map(s => parseInt(s))
  .sort();

const program = new Command();

program
  .option(
    '-s, --samples [timestamp]',
    'specify samples collection',
    dirs[dirs.length - 1]
  )
  .option(
    '-o, --output [path]',
    'specify output file',
    'src/config/minmax.json'
  )
  .parse(process.argv);

const dest = join(root, program.samples);

const samples = JSON.parse(
  readFileSync(join(dest, 'samples.json'), 'ascii')
) as Sample[];
const vectors = samples.map(s => s.vector);
const vectorSize = vectors[0].length;

const minmax: [number, number][] = [];

for (let i = 0; i < vectorSize; i++) {
  const feature = vectors.map(v => v[i]);
  minmax.push([min(feature), max(feature)]);
}

writeFileSync(
  resolve(__dirname, '../../', program.output),
  JSON.stringify({ minmax }, null, 2)
);

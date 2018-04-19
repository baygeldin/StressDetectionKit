import { Command } from 'commander';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Sample } from 'lib/types';
import { max, min, std, mean } from 'mathjs';
import { join, resolve } from 'path';
import { FeatureProps } from 'config/features';

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
    'src/config/features.json'
  )
  .parse(process.argv);

const dest = join(root, program.samples);

const samples = JSON.parse(
  readFileSync(join(dest, 'samples.json'), 'ascii')
) as Sample[];
const vectors = samples.map(s => s.vector);
const vectorSize = vectors[0].length;

const properties: FeatureProps[] = [];

for (let i = 0; i < vectorSize; i++) {
  const feature = vectors.map(v => v[i]);
  properties.push({
    min: min(feature),
    max: max(feature),
    mean: mean(feature),
    std: std(feature)
  });
}

writeFileSync(
  resolve(__dirname, '../../', program.output),
  JSON.stringify({ properties }, null, 2)
);

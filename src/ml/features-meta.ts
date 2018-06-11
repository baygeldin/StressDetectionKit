import { Command } from 'commander';
import { FeatureProps } from 'config/features';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Sample } from 'lib/types';
import { max, mean, min, std } from 'mathjs';
import { join, resolve } from 'path';

const ALL = 'all';

const program = new Command();

program
  .option(
    '-s, --samples <entry>',
    'specify samples collection',
    (f, files) => (files === ALL ? [f] : [...files, f]),
    ALL
  )
  .option(
    '-o, --output <path>',
    'specify output file',
    'src/config/features.json'
  )
  .parse(process.argv);

const root = join(__dirname, 'samples');
const dirs = readdirSync(root);

const entries = program.samples === ALL ? dirs : (program.samples as string[]);

const absent = entries.find((e: string) => !dirs.includes(e));

if (absent) {
  throw new Error(`Samples for "${absent}" don't exist.`);
}

function readSamples(entry: string) {
  return JSON.parse(
    readFileSync(join(root, entry, 'samples.json'), 'ascii')
  ) as Sample[];
}

const samples = entries
  .map(e => readSamples(e))
  .reduce((acc, c) => acc.concat(c));
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

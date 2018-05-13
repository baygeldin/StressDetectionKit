import { Command } from 'commander';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { STEP_SIZE, WINDOW_SIZE } from 'lib/constants';
import { calcSample } from 'lib/sample';
import { Chunk, StressMark } from 'lib/types';
import { join } from 'path';

const ALL = 'all';

const program = new Command();

program
  .option(
    '-s, --samples <entry>',
    'specify samples collection',
    (f, files) => (files === ALL ? [f] : [...files, f]),
    ALL
  )
  .parse(process.argv);

const root = join(__dirname, 'samples');
const dirs = readdirSync(root);

const entries = program.samples === ALL ? dirs : (program.samples as string[]);

const absent = entries.find((e: string) => !dirs.includes(e));

if (absent) {
  console.error(`Samples for "${absent}" don't exist.`);
  process.exit(1);
}

function sample<T>(array: T[], windowSize: number, stepSize: number) {
  const result = [];

  for (let i = 0; i < array.length - (windowSize - stepSize); i += stepSize) {
    result.push(array.slice(i, i + windowSize));
  }

  return result;
}

for (let e of entries) {
  const dest = join(root, e);

  function readJson(name: string) {
    return JSON.parse(readFileSync(join(dest, `${name}.json`), 'ascii'));
  }

  const chunks = readdirSync(dest)
    .filter(n => n.match(/^\d*\.json$/))
    .map(n => readJson(n.slice(0, -'.json'.length)) as Chunk[])
    .reduce((acc, c) => acc.concat(c));

  const stress = readJson('stress') as StressMark[];
  const baselines = readJson('baselines');

  const { baselineHrv, baselineHeartRate, accelerometerError, age } = baselines;

  const samples = sample(chunks, WINDOW_SIZE, STEP_SIZE).map(c => {
    const timestamp = c[c.length - 1].timestamp;
    const stressMark = stress.find(
      s => s.start <= timestamp && s.end > timestamp
    )!;
    const state = ['medium', 'high'].includes(stressMark.level);

    return calcSample(
      c,
      accelerometerError,
      baselineHrv,
      baselineHeartRate,
      age,
      timestamp,
      state
    );
  });

  writeFileSync(join(dest, 'samples.json'), JSON.stringify(samples));
}

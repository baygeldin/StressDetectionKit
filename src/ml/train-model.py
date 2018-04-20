"""Usage: train-model.py [--samples <entry>]... [--output <path>]

Options:

  -s, --samples          specify samples collection [default: all]
  -o, --output <path>    specify output file [default: src/ml/model.pkl]
  -h, --help             output usage information
"""

from docopt import docopt
import ipdb
import os

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.externals import joblib
from sklearn import svm

arguments = docopt(__doc__)
options, arguments = arguments
output = options.output  # pylint: disable=E1101
entries = arguments.entry  # pylint: disable=E1101

root = os.path.dirname(os.path.realpath(__file__))
samples_root = os.path.join(root, 'samples')
samples_list = os.listdir(samples_root)

entries = samples_list if not entries else entries

absent = next((x for x in entries if x not in samples_list), None)

if absent:
    print("Samples for \"%s\" don't exist." % absent)
    exit(1)

samples_paths = [os.path.join(samples_root, e, 'samples.json')
                 for e in entries]
samples = pd.concat([pd.read_json(p) for p in samples_paths])

pkl_path = os.path.normpath(os.path.join(root, '../../', output))

x = pd.DataFrame(samples['stdVector'].values.tolist())
y = samples['state']

x_train, _, y_train, _ = train_test_split(x, y, test_size=0.33)

model = svm.SVC()
model.fit(x_train, y_train)
joblib.dump(model, pkl_path)

# ipdb.set_trace()

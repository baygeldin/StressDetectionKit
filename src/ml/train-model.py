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
#from yellowbrick.classifier import ROCAUC
from sklearn.svm import SVC
from sklearn.model_selection import cross_validate, cross_val_predict, GridSearchCV
from sklearn.externals import joblib
from sklearn.utils import shuffle
from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix, make_scorer

# Arguments parsing
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

kfolds = 10

# Samples processing
samples_paths = [os.path.join(samples_root, e, 'samples.json')
                 for e in entries]
samples = shuffle(pd.concat([pd.read_json(p) for p in samples_paths]))

x = pd.DataFrame(samples['stdVector'].values.tolist())
y = samples['state']

# Hyper-parameters tuning
param_grid = {"kernel": ['linear', 'poly', 'rbf', 'sigmoid'],
              "gamma": [1e-1, 1e-2, 1e-3, 1e-4],
              "C": [1, 10, 100, 1000]}
grid_search = GridSearchCV(SVC(), param_grid, cv=kfolds)
grid_search.fit(x, y)
model = grid_search.best_estimator_

# Performance evaluation
scorer = {
    'f1_false': make_scorer(f1_score, pos_label=False),
    'f1_true': make_scorer(f1_score, pos_label=True),
    'precision_false': make_scorer(precision_score, pos_label=False),
    'precision_true': make_scorer(precision_score, pos_label=True),
    'recall_false': make_scorer(recall_score, pos_label=False),
    'recall_true': make_scorer(recall_score, pos_label=True)
}

cv_results = cross_validate(model, x, y, cv=kfolds, scoring=scorer)

for score in scorer.keys():
    scores = cv_results["test_%s" % score]
    print("%s accuracy: %0.2f (+/- %0.2f)" %
          (score, scores.mean(), scores.std() * 2))

print(confusion_matrix(y, cross_val_predict(model, x, y, cv=kfolds)))

# Model persistence
pkl_path = os.path.normpath(os.path.join(root, '../../', output))
joblib.dump(model, pkl_path)

# ipdb.set_trace()

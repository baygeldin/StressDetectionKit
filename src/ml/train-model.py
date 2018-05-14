"""Usage: train-model.py [--samples <entry>]... [--output <path>] [--oversample]

Options:

  -s, --samples          specify samples collection [default: all]
  -o, --output <path>    specify output file [default: src/ml/model.pkl]
  --oversample           generate additional samples
  -h, --help             output usage information
"""

from docopt import docopt
import ipdb
import os

import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import cross_validate, cross_val_predict, \
    GridSearchCV, train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score, \
    confusion_matrix, make_scorer
from sklearn.externals import joblib
from imblearn.over_sampling import SMOTE

from sklearn.datasets import make_classification

# Arguments parsing
arguments = docopt(__doc__)
options, arguments = arguments
output = options.output  # pylint: disable=E1101
entries = arguments.entry  # pylint: disable=E1101
oversample = options.oversample  # pylint: disable=E1101

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
samples = pd.concat([pd.read_json(p) for p in samples_paths])

x = pd.DataFrame(samples['stdVector'].values.tolist())
y = samples['state']

# Useful when trying to estimate how each feature contribute to the model:
# x = pd.DataFrame(np.array([np.array(x) for x in samples['stdVector'].values])[:, (0, 1, 2)])

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33)

# Hyper-parameters tuning
param_grid = {
    'kernel': ['linear', 'poly', 'rbf', 'sigmoid'],
    'gamma': [1e-1, 1e-2, 1e-3, 1e-4],
    'C': [1, 10, 100, 1000]
}
grid_search = GridSearchCV(SVC(), param_grid, cv=kfolds)
grid_search.fit(x_train, y_train)

model = grid_search.best_estimator_

# Performance evaluation
scorer = {
    'f1_false': make_scorer(f1_score, pos_label=False),
    'f1_true': make_scorer(f1_score, pos_label=True),
    'precision_false': make_scorer(precision_score, pos_label=False),
    'precision_true': make_scorer(precision_score, pos_label=True),
    'recall_false': make_scorer(recall_score, pos_label=False),
    'recall_true': make_scorer(recall_score, pos_label=True),
    'f1_total': make_scorer(f1_score, average='weighted'),
    'precision_total': make_scorer(precision_score, average='weighted'),
    'recall_total': make_scorer(recall_score, average='weighted')
}

cv_results = cross_validate(model, x_test, y_test, cv=kfolds, scoring=scorer)
cv_predict = cross_val_predict(model, x_test, y_test, cv=kfolds)

# Classification report


def confidence_interval(scores):
    return "%0.2f (+/- %0.2f)" % (scores.mean(), scores.std() * 2)


df = [[confidence_interval(cv_results["test_%s_%s" % (row, col)])
       for row in ['precision', 'recall', 'f1']] for col in ['false', 'true', 'total']]
print(pd.DataFrame(df, ['False', 'True', 'Total'],
                   ['Precision', 'Recall', 'F1']))

# Confusion matrix
df = confusion_matrix(y_test, cv_predict)
rows = ['False (actual)', 'True (actual)']
cols = ['False (predicted)', 'True (predicted)']
print(pd.DataFrame(df, rows, cols))

# Model persistence
pkl_path = os.path.normpath(os.path.join(root, '../../', output))
joblib.dump(model, pkl_path)

# ipdb.set_trace()

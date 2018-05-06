"""Usage: serialize-model.py [--model <path>] [--output <path>]

Options:

  -m, --model <path>     specify model pickle file [default: src/ml/model.pkl]
  -o, --output <path>    specify output file [default: src/config/model.json]
  -h, --help             output usage information
"""

from docopt import docopt
import ipdb
import os
import json

from sklearn.externals import joblib
from sklearn.svm import SVC

arguments = docopt(__doc__)
options, arguments = arguments

output = options.output  # pylint: disable=E1101
pickle = options.model  # pylint: disable=E1101

root = os.path.dirname(os.path.realpath(__file__))
pkl_path = os.path.normpath(os.path.join(root, '../../', pickle))
output_path = os.path.normpath(os.path.join(root, '../../', output))


def serialize_svc(clf):
    n_features = len(clf.support_vectors_[0])
    gamma = clf.gamma if clf.gamma != 'auto' else 1. / n_features

    return {
        'nClasses': len(clf.classes_),
        'nRows': len(clf.n_support_),
        'vectors': clf.support_vectors_.tolist(),
        'coefficients': clf.dual_coef_.tolist(),
        'intercepts': clf._intercept_.tolist(),
        'weights': clf.n_support_.tolist(),
        'kernel': clf.kernel.upper(),
        'gamma': gamma,
        'coef0': clf.coef0,
        'degree': clf.degree
    }


models = [
    {'name': 'SVC', 'class': SVC, 'serializer': serialize_svc}
]

model = joblib.load(pkl_path)
entry = next((m for m in models if isinstance(model, m['class'])), None)
result = {'type': entry['name'], 'parameters': entry['serializer'](model)}

with open(output_path, 'w') as f:
    f.write(json.dumps(result, indent=2, sort_keys=True))

# ipdb.set_trace()

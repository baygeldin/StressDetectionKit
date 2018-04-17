import ipdb
import os
import json
from fire import Fire

from sklearn.externals import joblib
from sklearn import svm

root = os.path.dirname(os.path.realpath(__file__))


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
    {'name': 'SVC', 'class': svm.SVC, 'serializer': serialize_svc}
]


def serialize(pickle='src/ml/model.pkl', output='src/config/model.json'):
    pkl_path = os.path.normpath(os.path.join(root, '../../', pickle))
    output_path = os.path.normpath(os.path.join(root, '../../', output))

    model = joblib.load(pkl_path)
    entry = next((m for m in models if isinstance(model, m['class'])), None)
    result = {'type': entry['name'], 'parameters': entry['serializer'](model)}

    with open(output_path, 'w') as f:
        f.write(json.dumps(result, indent=2, sort_keys=True))

    # ipdb.set_trace()


Fire(serialize)

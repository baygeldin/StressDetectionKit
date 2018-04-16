import ipdb
import os
from fire import Fire

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.externals import joblib
from sklearn import svm

root = os.path.dirname(os.path.realpath(__file__))
samples_root = os.path.join(root, 'samples')
samples_list = sorted(os.listdir(samples_root), key=lambda x: int(x))

def train(samples=samples_list[-1], output='src/ml/model.pkl'):
    samples_path = os.path.join(samples_root, samples, 'samples.json')
    pkl_path = os.path.normpath(os.path.join(root, '../../', output))
    
    data = pd.read_json(samples_path)
    x = pd.DataFrame(data['normalizedVector'].values.tolist())
    y = data['state']

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33)
    
    model = svm.SVC()
    model.fit(x_train, y_train)
    joblib.dump(model, pkl_path)
    
    # ipdb.set_trace()


Fire(train)

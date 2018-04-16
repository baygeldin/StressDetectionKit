import ipdb
import os
from fire import Fire

from sklearn.externals import joblib

root = os.path.dirname(os.path.realpath(__file__))

def serialize(pickle='src/ml/model.pkl', output='src/config/model.json'):
    pkl_path = os.path.normpath(os.path.join(root, '../../', pickle))
    output_path = os.path.normpath(os.path.join(root, '../../', output))
    
    model = joblib.load(pkl_path)
    
    ipdb.set_trace()

    # isinstance(model, ...) => type
    # model.kernel, ..., => parameters
    # { type, parameters } => model.json


Fire(serialize)

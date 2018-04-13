import ipdb

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn_porter import Porter

data = pd.read_json('test.json')

x_train, x_test, y_train, y_test = train_test_split(
    data[['pulse', 'rmssd']], data['state'], test_size=0.33)

model = svm.SVC()
model.fit(x_train, y_train)

porter = Porter(model, language='js')
output = porter.export()
print(output)

ipdb.set_trace()

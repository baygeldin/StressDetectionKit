var SVC = function(
  nClasses,
  nRows,
  vectors,
  coefficients,
  intercepts,
  weights,
  kernel,
  gamma,
  coef0,
  degree
) {
  this.nClasses = nClasses;
  this.classes = new Array(nClasses);
  for (var i = 0; i < nClasses; i++) {
    this.classes[i] = i;
  }
  this.nRows = nRows;
  this.vectors = vectors;
  this.coefficients = coefficients;
  this.intercepts = intercepts;
  this.weights = weights;
  this.kernel = kernel.toUpperCase();
  this.gamma = gamma;
  this.coef0 = coef0;
  this.degree = degree;

  this.predict = function(features) {
    var kernels = new Array(vectors.length);
    var kernel;
    switch (this.kernel) {
      case 'LINEAR':
        // <x,x'>
        for (var i = 0; i < this.vectors.length; i++) {
          kernel = 0;
          for (var j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = kernel;
        }
        break;
      case 'POLY':
        // (y<x,x'>+r)^d
        for (var i = 0; i < this.vectors.length; i++) {
          kernel = 0;
          for (var j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = Math.pow(this.gamma * kernel + this.coef0, this.degree);
        }
        break;
      case 'RBF':
        // exp(-y|x-x'|^2)
        for (var i = 0; i < this.vectors.length; i++) {
          kernel = 0;
          for (var j = 0; j < this.vectors[i].length; j++) {
            kernel += Math.pow(this.vectors[i][j] - features[j], 2);
          }
          kernels[i] = Math.exp(-this.gamma * kernel);
        }
        break;
      case 'SIGMOID':
        // tanh(y<x,x'>+r)
        for (var i = 0; i < this.vectors.length; i++) {
          kernel = 0;
          for (var j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = Math.tanh(this.gamma * kernel + this.coef0);
        }
        break;
    }

    var starts = new Array(this.nRows);
    for (var i = 0; i < this.nRows; i++) {
      if (i != 0) {
        var start = 0;
        for (var j = 0; j < i; j++) {
          start += this.weights[j];
        }
        starts[i] = start;
      } else {
        starts[0] = 0;
      }
    }

    var ends = new Array(this.nRows);
    for (var i = 0; i < this.nRows; i++) {
      ends[i] = this.weights[i] + starts[i];
    }

    if (this.nClasses == 2) {
      for (var i = 0; i < kernels.length; i++) {
        kernels[i] = -kernels[i];
      }

      var decision = 0;
      for (var k = starts[1]; k < ends[1]; k++) {
        decision += kernels[k] * this.coefficients[0][k];
      }
      for (var k = starts[0]; k < ends[0]; k++) {
        decision += kernels[k] * this.coefficients[0][k];
      }
      decision += this.intercepts[0];

      if (decision > 0) {
        return 0;
      }
      return 1;
    }

    var decisions = new Array(this.intercepts.length);
    for (var i = 0, d = 0, l = this.nRows; i < l; i++) {
      for (var j = i + 1; j < l; j++) {
        var tmp = 0;
        for (var k = starts[j]; k < ends[j]; k++) {
          tmp += this.coefficients[i][k] * kernels[k];
        }
        for (var k = starts[i]; k < ends[i]; k++) {
          tmp += this.coefficients[j - 1][k] * kernels[k];
        }
        decisions[d] = tmp + this.intercepts[d];
        d++;
      }
    }

    var votes = new Array(this.intercepts.length);
    for (var i = 0, d = 0, l = this.nRows; i < l; i++) {
      for (var j = i + 1; j < l; j++) {
        votes[d] = decisions[d] > 0 ? i : j;
        d++;
      }
    }

    var amounts = new Array(this.nClasses).fill(0);
    for (var i = 0, l = votes.length; i < l; i++) {
      amounts[votes[i]] += 1;
    }

    var classVal = -1,
      classIdx = -1;
    for (var i = 0, l = amounts.length; i < l; i++) {
      if (amounts[i] > classVal) {
        classVal = amounts[i];
        classIdx = i;
      }
    }
    return this.classes[classIdx];
  };
};

// Features:
var features = process.argv.slice(2);

// Parameters:
var vectors = [
  [40.0, 80.0],
  [50.0, 70.0],
  [45.0, 75.0],
  [90.0, 30.0],
  [80.0, 40.0],
  [65.0, 55.0],
  [85.0, 35.0]
];
var coefficients = [
  [
    -1.0,
    -1.0,
    -1.0,
    0.750000000001736,
    0.7499999999965281,
    0.7500000000121518,
    0.749999999989584
  ]
];
var intercepts = [-0.2499999999895841];
var weights = [3, 4];

// Prediction:
var clf = new SVC(
  2,
  2,
  vectors,
  coefficients,
  intercepts,
  weights,
  'rbf',
  0.5,
  0.0,
  3
);
var samples = [[75, 45], [70, 50], [60, 60], [55, 65], [50, 71]];
samples.forEach(s => {
  var prediction = clf.predict(s);
  console.log(prediction);
});

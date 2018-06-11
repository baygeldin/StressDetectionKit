// Ported from SciKit-Learn SVC classifier based on sklearn-porter output.

export interface SvmParameters {
  nClasses: number;
  nRows: number;
  vectors: number[][];
  coefficients: number[][];
  intercepts: number[];
  weights: number[];
  kernel: 'LINEAR' | 'POLY' | 'RBF' | 'SIGMOID';
  gamma: number;
  coef0: number;
  degree: number;
}

interface Svm extends SvmParameters {}

class Svm {
  constructor(options: SvmParameters) {
    Object.assign(this, options);
  }

  public predict(features: number[]) {
    const kernels = new Array(this.vectors.length);

    switch (this.kernel) {
      case 'LINEAR':
        // <x,x'>
        for (let i = 0; i < this.vectors.length; i++) {
          let kernel = 0;
          for (let j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = kernel;
        }
        break;
      case 'POLY':
        // (y<x,x'>+r)^d
        for (let i = 0; i < this.vectors.length; i++) {
          let kernel = 0;
          for (let j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = Math.pow(this.gamma * kernel + this.coef0, this.degree);
        }
        break;
      case 'RBF':
        // exp(-y|x-x'|^2)
        for (let i = 0; i < this.vectors.length; i++) {
          let kernel = 0;
          for (let j = 0; j < this.vectors[i].length; j++) {
            kernel += Math.pow(this.vectors[i][j] - features[j], 2);
          }
          kernels[i] = Math.exp(-this.gamma * kernel);
        }
        break;
      case 'SIGMOID':
        // tanh(y<x,x'>+r)
        for (let i = 0; i < this.vectors.length; i++) {
          let kernel = 0;
          for (let j = 0; j < this.vectors[i].length; j++) {
            kernel += this.vectors[i][j] * features[j];
          }
          kernels[i] = Math.tanh(this.gamma * kernel + this.coef0);
        }
        break;
    }

    const starts = new Array(this.nRows);

    for (let i = 0; i < this.nRows; i++) {
      if (i !== 0) {
        let start = 0;
        for (let j = 0; j < i; j++) {
          start += this.weights[j];
        }
        starts[i] = start;
      } else {
        starts[0] = 0;
      }
    }

    const ends = new Array(this.nRows);

    for (let i = 0; i < this.nRows; i++) {
      ends[i] = this.weights[i] + starts[i];
    }

    if (this.nClasses === 2) {
      for (let i = 0; i < kernels.length; i++) {
        kernels[i] = -kernels[i];
      }

      let decision = 0;

      for (let k = starts[1]; k < ends[1]; k++) {
        decision += kernels[k] * this.coefficients[0][k];
      }
      for (let k = starts[0]; k < ends[0]; k++) {
        decision += kernels[k] * this.coefficients[0][k];
      }

      decision += this.intercepts[0];

      return decision > 0 ? 0 : 1;
    }

    const decisions = new Array(this.intercepts.length);

    for (let i = 0, d = 0, l = this.nRows; i < l; i++) {
      for (let j = i + 1; j < l; j++) {
        let tmp = 0;

        for (let k = starts[j]; k < ends[j]; k++) {
          tmp += this.coefficients[i][k] * kernels[k];
        }

        for (let k = starts[i]; k < ends[i]; k++) {
          tmp += this.coefficients[j - 1][k] * kernels[k];
        }

        decisions[d] = tmp + this.intercepts[d];
        d++;
      }
    }

    const votes = new Array(this.intercepts.length);

    for (let i = 0, d = 0, l = this.nRows; i < l; i++) {
      for (let j = i + 1; j < l; j++) {
        votes[d] = decisions[d] > 0 ? i : j;
        d++;
      }
    }

    const amounts = new Array(this.nClasses).fill(0);

    for (let i = 0, l = votes.length; i < l; i++) {
      amounts[votes[i]] += 1;
    }

    let classVal = -1;
    let classIdx = -1;

    for (let i = 0, l = amounts.length; i < l; i++) {
      if (amounts[i] > classVal) {
        classVal = amounts[i];
        classIdx = i;
      }
    }

    return classIdx;
  }
}

export default Svm;

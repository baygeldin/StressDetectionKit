declare module 'config/model' {
  type Classifier = 'svm';

  const type: Classifier;
  const parameters: any;

  export { parameters, type };
}

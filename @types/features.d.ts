declare module 'config/features' {
  export interface FeatureProps {
    min: number;
    max: number;
    mean: number;
    std: number;
  }

  const properties: FeatureProps[];

  export { properties };
}

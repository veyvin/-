export type EasingFunction = (t: number) => number;

export interface EasingDefinition {
  name: string;
  id: string;
  description: string;
  fn: EasingFunction;
  color: string;
}

export type ThemeMode = 'dark' | 'light';

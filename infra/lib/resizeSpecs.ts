export interface ResizeSpec {
  width: number;
  height: number;
}

export const resizeSpecs: ResizeSpec[] = [
  {
    width: 500,
    height: 500,
  },
  {
    width: 1000,
    height: 1000,
  },
];

export function stringifySize(resizeSpec: ResizeSpec): string {
  return `${resizeSpec.width}x${resizeSpec.height}`;
}

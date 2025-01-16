declare module 'deepface' {
  export function detectFace(input: string | HTMLImageElement | HTMLCanvasElement): Promise<Array<{
    box: {
      x: number;
      y: number;
      w: number;
      h: number;
    }
  }>>;
}
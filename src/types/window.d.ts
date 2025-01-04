declare module '@mediapipe/tasks-vision' {
  export class FilesetResolver {
    static forVisionTasks(wasmFilePath: string): Promise<any>;
  }

  export class FaceLandmarker {
    static createFromOptions(vision: any, options: FaceLandmarkerOptions): Promise<FaceLandmarker>;
    detectForVideo(video: HTMLVideoElement, timestamp: number): FaceLandmarkerResult;
  }

  interface FaceLandmarkerOptions {
    baseOptions: {
      modelAssetPath: string;
      delegate: string;
    };
    outputFaceBlendshapes: boolean;
    runningMode: string;
    numFaces: number;
  }

  interface FaceBlendshape {
    categoryName: string;
    score: number;
  }

  interface FaceLandmarkerResult {
    faceLandmarks: any[];
    faceBlendshapes?: Array<{
      categories: FaceBlendshape[];
    }>;
  }
}

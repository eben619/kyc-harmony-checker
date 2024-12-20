interface ImageCapture {
  takePhoto(): Promise<Blob>;
  getPhotoCapabilities(): Promise<PhotoCapabilities>;
  getPhotoSettings(): Promise<PhotoSettings>;
}

interface PhotoCapabilities {
  redEyeReduction: string;
  imageHeight: MediaSettingsRange;
  imageWidth: MediaSettingsRange;
  fillLightMode: string[];
}

interface PhotoSettings {
  fillLightMode: string;
  imageHeight: number;
  imageWidth: number;
  redEyeReduction: boolean;
}

interface MediaSettingsRange {
  max: number;
  min: number;
  step: number;
}

declare var ImageCapture: {
  prototype: ImageCapture;
  new(track: MediaStreamTrack): ImageCapture;
};
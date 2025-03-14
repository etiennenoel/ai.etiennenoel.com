export function firstNoise(
  buffer: Float32Array,
  windowSize: number,
  threshold: number
) {
  let maxRms = 0;

  let sum = 0;
  for (let i = 0; i < Math.min(windowSize, buffer.length); i++) {
    sum += buffer[i] ** 2;
  }

  for (let i = windowSize - 1; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
    if (i >= windowSize) {
      sum -= buffer[i - windowSize] ** 2;
    }
    const rms = sum / windowSize;
    maxRms = Math.max(rms, maxRms);
    if (rms > threshold) {
      return i - windowSize + 1;
    }
  }
  console.log('No speech detected', maxRms);
  return buffer.length;
}

export function lastSilence(
  buffer: Float32Array,
  windowSize: number,
  threshold: number
) {
  let sum = 0;

  let end = buffer.length;
  let minRms = 1;

  for (let i = buffer.length - windowSize; i < buffer.length; i++) {
    sum += buffer[i] ** 2;
  }
  for (let i = buffer.length - windowSize; i >= 0; i--) {
    sum += buffer[i] ** 2;
    if (buffer.length - i > windowSize) {
      sum -= buffer[i + windowSize] ** 2;
    }
    const rms = sum / windowSize;
    minRms = Math.min(minRms, rms);
    if (rms < threshold) {
      console.log('Detected rms', rms);
      end = i;
      break;
    }
  }

  // console.log('Min RMS', minRms);

  return end;
}

export const MIC_SAMPLE_RATE = 48_000;

export const CHUNK_SIZE = MIC_SAMPLE_RATE * 10;
export const STEP_SIZE = MIC_SAMPLE_RATE * 5;

//export const SILENCE = new Float32Array(MIC_SAMPLE_RATE / 10);

// TODO(vkyryliuk): tune SILENCE_RMS for different environments.
// Magic number. Should be tuned / calculated dynamically. Works for quiet
// spaces, not clean about noise ones.
export const SILENCE_RMS = 0.00001;

// 48_000 * 0.2 seconds.
export const WINDOW = MIC_SAMPLE_RATE / 5;

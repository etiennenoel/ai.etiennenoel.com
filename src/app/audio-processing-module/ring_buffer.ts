// Default format for Google Chrome.
const AUDIO_DATA_FORMAT = 'f32-planar';
import { AudioData } from './audio.interface';

/** Circular buffer to hold audio data. */
export class AudioRingBuffer {
  private readonly buffer: Float32Array;
  written = 0;
  lastRead = 0;

  get available() {
    return this.written - this.lastRead;
  }

  constructor(private readonly bufferSize: number) {
    this.buffer = new Float32Array(bufferSize);
  }

  clear() {
    this.written = 0;
    this.lastRead = 0;
  }

  writeAudioData(data: AudioData) {
    const offset = this.written % this.bufferSize;
    if (offset + data.numberOfFrames > this.bufferSize) {
      const left = this.bufferSize - offset;

      data.copyTo(this.buffer.subarray(offset, offset + left), {
        planeIndex: 0,
        frameCount: left,
        format: AUDIO_DATA_FORMAT,
      });

      data.copyTo(this.buffer.subarray(0, data.numberOfFrames - left), {
        planeIndex: 0,
        frameOffset: left,
        format: AUDIO_DATA_FORMAT,
      });
    } else {
      data.copyTo(this.buffer.subarray(offset, offset + data.numberOfFrames), {
        planeIndex: 0,
        format: AUDIO_DATA_FORMAT,
      });
    }
    this.written += data.numberOfFrames;
  }

  writeFloat32Array(data: Float32Array) {
    const offset = this.written % this.bufferSize;
    if (offset + data.length > this.bufferSize) {
      const left = this.bufferSize - offset;
      this.buffer.set(data.slice(0, left), offset);
      this.buffer.set(data.slice(left), 0);
    } else {
      this.buffer.set(data, offset);
    }
    this.written += data.length;
  }

  write(data: AudioData | Float32Array) {
    if (data instanceof Float32Array) {
      this.writeFloat32Array(data);
    } else {
      this.writeAudioData(data);
    }
  }

  /** Returns the last X values from the ring buffer without changing it. */
  last(windowSize: number): Float32Array {
    const offset = this.written % this.bufferSize;
    const startIndex =
      (this.written - windowSize + this.bufferSize) % this.bufferSize;
    let chunk: Float32Array;
    if (startIndex < offset) {
      chunk = this.buffer.slice(startIndex, offset);
    } else {
      chunk = new Float32Array(windowSize);
      chunk.set(this.buffer.slice(startIndex, this.bufferSize));
      chunk.set(this.buffer.slice(0, offset), this.bufferSize - startIndex);
    }
    this.lastRead = this.written;
    return chunk;
  }
}

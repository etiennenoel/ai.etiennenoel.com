import './dom-chromium-ai.ts';
import { AudioRingBuffer } from './ring_buffer';
import { firstNoise, lastSilence } from './silence';
import { AudioData } from './audio.interface';
import {CHUNK_SIZE, MIC_SAMPLE_RATE, STEP_SIZE, WINDOW} from './constants';

declare global {
  interface MediaStreamTrackProcessor {
    readable: ReadableStream<AudioData>;
  }

  var MediaStreamTrackProcessor: new (params: {
    track: MediaStreamTrack;
  }) => MediaStreamTrackProcessor;
}



const GEMINI_V2_PROMPT =
  '[multimodal-audio] Transcribe the following speech segment:';

/**
 * Processes the audio stream and returns the transcript.
 */
export async function* processStream(
  inputStream: ReadableStream<AudioData> | MediaStream,
  options?: {
    stepSize?: number;
    chunkSize?: number;
    micSampleRate?: number;
    silenceRMS?: number;
    window?: number;
  },
) {

  const micSampleRate = options?.micSampleRate ?? MIC_SAMPLE_RATE;
  const chunkSize = options?.chunkSize ?? CHUNK_SIZE;
  const stepSize = options?.stepSize ?? STEP_SIZE;
  const silenceRMS = options?.silenceRMS ?? 0.00001;
  const silence = new Float32Array(micSampleRate / 10);

  const window = options?.window ?? WINDOW;

  let stream: ReadableStream<AudioData>;
  if (inputStream instanceof ReadableStream) {
    stream = inputStream;
  } else {
    const transformer = new MediaStreamTrackProcessor({
      track: inputStream.getAudioTracks()[0],
    });
    stream = transformer.readable;
  }

  let fullText = '';

  const buffer = new AudioRingBuffer(chunkSize * 2);

  for await (const value of stream) {
    buffer.write(value);

    if (buffer.written < stepSize) continue;

    // const s = await window.ai.languageModel.create();


    // console.log('\n\nReading new audio chunk');
    let chunk = buffer.last(Math.min(buffer.written, chunkSize));
    buffer.clear();
    buffer.writeFloat32Array(silence);

    const speechStart = firstNoise(chunk, window, silenceRMS);
    // console.log('Speech start', speechStart);
    if (speechStart === chunk.length) {
      // console.log('No audio detected');
      continue;
    }
    chunk = chunk.slice(speechStart);

    const end = lastSilence(chunk, window, silenceRMS);

    // Less than 1 second of audio.
    if (end < micSampleRate) {
      buffer.writeFloat32Array(chunk);
      continue;
    }

    const trueChunk = chunk.slice(0, end);
    buffer.clear();
    if (chunk.length - end > window) {
      // console.log('Writing back ', chunk.length - end);
      buffer.writeFloat32Array(chunk.slice(end));
    } else {
      // console.log('Not writing anything');
    }

    const content = new AudioBuffer({
      sampleRate: 48000,
      numberOfChannels: 1,
      length: trueChunk.length,
    });
    content.copyToChannel(trueChunk, 0, 0);

    yield content;
    //
    // const nextText = await s.prompt([
    //   GEMINI_V2_PROMPT,
    //   { type: 'audio', content: content as unknown as string },
    // ]);
    // console.log('Detected text:\n', nextText);
    // fullText += ' ' + nextText;
    //
    // yield fullText;
  }
}

// const output = document.querySelector('#output');

/**
 * Demo that uses a sample audio file.
 */
// export async function sampleDemo() {
//   const audioCtx = new AudioContext();
//   const request = await fetch(
//     'https://cdn.glitch.global/e5522a51-ab87-443b-80b5-2ce583856d56/en_jeremyt_2.wav?v=1740437231265'
//   );
//   const buffer = await audioCtx.decodeAudioData(await request.arrayBuffer());
//   try {
//     const s = await window.ai.languageModel.create();
//     const r = await s.prompt([
//       GEMINI_V2_PROMPT,
//       { type: 'audio', content: buffer as unknown as string },
//     ]);
//     console.log(r);
//     if (output) output.textContent = r;
//   } catch (e) {
//     console.error(e);
//     if (output) output.textContent = String(e);
//   }
// }
//
// /**
//  * Demo that uses the microphone.
//  */
// export async function microphoneDemo() {
//   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//
//   for await (const chunk of processStream(stream)) {
//     console.log(chunk);
//     if (output) output.textContent = chunk;
//   }
// }
//
// document.querySelector('#mic')?.addEventListener('click', microphoneDemo);
// document.querySelector('#sample')?.addEventListener('click', sampleDemo);

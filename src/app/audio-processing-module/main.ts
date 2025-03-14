import './dom-chromium-ai.ts';
import { AudioRingBuffer } from './ring_buffer';
import { firstNoise, lastSilence } from './silence';
import { AudioData } from './audio.interface';

declare global {
  interface MediaStreamTrackProcessor {
    readable: ReadableStream<AudioData>;
  }

  var MediaStreamTrackProcessor: new (params: {
    track: MediaStreamTrack;
  }) => MediaStreamTrackProcessor;
}

const MIC_SAMPLE_RATE = 48_000;

const CHUNK_SIZE = MIC_SAMPLE_RATE * 10;
const STEP_SIZE = MIC_SAMPLE_RATE * 5;

const SILENCE = new Float32Array(MIC_SAMPLE_RATE / 10);

const GEMINI_V2_PROMPT =
  '[multimodal-audio] Transcribe the following speech segment:';

/**
 * Processes the audio stream and returns the transcript.
 */
export async function* processStream(
  inputStream: ReadableStream<AudioData> | MediaStream
) {
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

  const buffer = new AudioRingBuffer(CHUNK_SIZE * 2);

  for await (const value of stream) {
    buffer.write(value);

    if (buffer.written < STEP_SIZE) continue;

    // const s = await window.ai.languageModel.create();

    // TODO(vkyryliuk): tune SILENCE_RMS for different environments.
    // Magic number. Should be tuned / calculated dynamically. Works for quiet
    // spaces, not clean about noise ones.
    const SILENCE_RMS = 0.00001;

    // 48_000 * 0.2 seconds.
    const WINDOW = MIC_SAMPLE_RATE / 5;

    // console.log('\n\nReading new audio chunk');
    let chunk = buffer.last(Math.min(buffer.written, CHUNK_SIZE));
    buffer.clear();
    buffer.writeFloat32Array(SILENCE);

    const speechStart = firstNoise(chunk, WINDOW, SILENCE_RMS);
    // console.log('Speech start', speechStart);
    if (speechStart === chunk.length) {
      // console.log('No audio detected');
      continue;
    }
    chunk = chunk.slice(speechStart);

    const end = lastSilence(chunk, WINDOW, SILENCE_RMS);

    // Less than 1 second of audio.
    if (end < MIC_SAMPLE_RATE) {
      buffer.writeFloat32Array(chunk);
      continue;
    }

    const trueChunk = chunk.slice(0, end);
    buffer.clear();
    if (chunk.length - end > WINDOW) {
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

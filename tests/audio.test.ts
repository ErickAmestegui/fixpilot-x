import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundBus, type SoundEvent } from '../src/audio';

// API-level simulation only: these tests do not measure speaker output or browser gesture policies.
const oscillator = () => ({
  type: '', frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(),
  start: vi.fn(), stop: vi.fn(), onended: null as null | (() => void),
});
const gain = () => ({
  gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(), disconnect: vi.fn(),
});

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state: AudioContextState = 'suspended';
  currentTime = 0;
  destination = {};
  oscillators: ReturnType<typeof oscillator>[] = [];
  gains: ReturnType<typeof gain>[] = [];
  resume = vi.fn(async () => { this.state = 'running'; });
  suspend = vi.fn(async () => { this.state = 'suspended'; });
  createOscillator = vi.fn(() => { const item = oscillator(); this.oscillators.push(item); return item; });
  createGain = vi.fn(() => { const item = gain(); this.gains.push(item); return item; });
  constructor() { FakeAudioContext.instances.push(this); }
}

beforeEach(() => {
  FakeAudioContext.instances = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
});
afterEach(() => vi.unstubAllGlobals());

async function enabledBus() {
  const bus = new SoundBus(); bus.enabled = true; await bus.unlock();
  return { bus, context: FakeAudioContext.instances[0] };
}

describe('optional original sound cues (simulated Web Audio API)', () => {
  it('never constructs an audio context on construction or play before explicit unlock', () => {
    const bus = new SoundBus();
    bus.play('send');
    bus.enabled = true;
    bus.play('success');
    expect(bus.context).toBeNull();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('does not unlock while disabled and resumes one context after enabling', async () => {
    const bus = new SoundBus();
    await bus.unlock();
    expect(FakeAudioContext.instances).toHaveLength(0);
    bus.enabled = true;
    await bus.unlock();
    const context = FakeAudioContext.instances[0];
    expect(context.resume).toHaveBeenCalledOnce();
    expect(context.state).toBe('running');
    await bus.unlock();
    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(context.resume).toHaveBeenCalledOnce();
  });

  it('resumes a suspended context on a later explicit unlock', async () => {
    const { bus, context } = await enabledBus();
    context.state = 'suspended';
    bus.play('send');
    expect(context.oscillators).toHaveLength(0);
    await bus.unlock();
    expect(context.resume).toHaveBeenCalledTimes(2);
    bus.play('send');
    expect(context.oscillators).toHaveLength(1);
  });

  it('disabling sound prohibits subsequent tones', async () => {
    const { bus, context } = await enabledBus();
    bus.play('send');
    bus.enabled = false;
    context.currentTime = 1;
    bus.play('success');
    expect(context.oscillators).toHaveLength(1);
  });

  it('mute suspends playback and prevents subsequent cues until enabled again', async () => {
    const { bus, context } = await enabledBus();
    bus.play('send');
    bus.mute();
    expect(bus.enabled).toBe(false);
    expect(context.suspend).toHaveBeenCalledOnce();
    context.currentTime = 1;
    bus.play('warning');
    await bus.unlock();
    expect(context.oscillators).toHaveLength(1);
    expect(context.resume).toHaveBeenCalledOnce();
    bus.enabled = true;
    await bus.unlock();
    bus.play('select');
    expect(context.oscillators).toHaveLength(2);
  });

  it('throttles repeated and overlapping cues within 150 ms', async () => {
    const { bus, context } = await enabledBus();
    bus.play('success');
    bus.play('success');
    context.currentTime = .149;
    bus.play('warning');
    expect(context.oscillators).toHaveLength(2);
    context.currentTime = .151;
    bus.play('send');
    expect(context.oscillators).toHaveLength(3);
  });

  it.each([-100, 0, .2, .35, 1, Infinity, -Infinity, NaN])('keeps envelope gain finite and quiet at volume %s', async volume => {
    const { bus, context } = await enabledBus();
    bus.volume = volume;
    bus.play('send');
    for (const node of context.gains) {
      const envelopes = [...node.gain.setValueAtTime.mock.calls, ...node.gain.linearRampToValueAtTime.mock.calls, ...node.gain.exponentialRampToValueAtTime.mock.calls];
      for (const [value] of envelopes) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(.056);
      }
    }
  });

  it.each<SoundEvent>(['send', 'success', 'warning', 'select', 'mic-on', 'mic-off'])('schedules a bounded %s cue and releases its nodes', async event => {
    const { bus, context } = await enabledBus();
    bus.play(event);
    expect(context.oscillators.length).toBeGreaterThan(0);
    expect(context.oscillators.length).toBeLessThanOrEqual(2);
    for (let index = 0; index < context.oscillators.length; index++) {
      const node = context.oscillators[index];
      expect(node.type).toBe('sine');
      expect(node.start).toHaveBeenCalledOnce();
      expect(node.stop).toHaveBeenCalledOnce();
      expect(node.stop.mock.calls[0][0] - node.start.mock.calls[0][0]).toBeLessThanOrEqual(.15);
      node.onended?.();
      expect(node.disconnect).toHaveBeenCalledOnce();
      expect(context.gains[index].disconnect).toHaveBeenCalledOnce();
    }
  });

  it('a blocked constructor never rejects unlock or throws when playing', async () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('Audio blocked'); } });
    const bus = new SoundBus(); bus.enabled = true;
    await expect(bus.unlock()).resolves.toBeUndefined();
    expect(() => bus.play('warning')).not.toThrow();
    expect(bus.context).toBeNull();
  });

  it('a rejected resume leaves audio silent and can recover on a later gesture', async () => {
    const { bus, context } = await enabledBus();
    context.state = 'suspended';
    context.resume.mockRejectedValueOnce(new Error('Gesture required'));
    await expect(bus.unlock()).resolves.toBeUndefined();
    expect(() => bus.play('warning')).not.toThrow();
    expect(context.oscillators).toHaveLength(0);
    await bus.unlock();
    bus.play('send');
    expect(context.oscillators).toHaveLength(1);
  });

  it('a closed context remains silent', async () => {
    const { bus, context } = await enabledBus();
    context.state = 'closed';
    expect(() => bus.play('send')).not.toThrow();
    expect(context.oscillators).toHaveLength(0);
  });

  it('node creation failure cannot interrupt an application operation', async () => {
    const { bus, context } = await enabledBus();
    context.createOscillator.mockImplementationOnce(() => { throw new Error('Audio resource unavailable'); });
    expect(() => bus.play('send')).not.toThrow();
  });

  it('a suspend failure cannot interrupt mute or re-enable sound', async () => {
    const { bus, context } = await enabledBus();
    context.suspend.mockImplementationOnce(() => { throw new Error('Context unavailable'); });
    expect(() => bus.mute()).not.toThrow();
    expect(bus.enabled).toBe(false);
    context.currentTime = 1;
    bus.play('send');
    expect(context.oscillators).toHaveLength(0);
  });
});

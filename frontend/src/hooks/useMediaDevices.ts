'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MediaDeviceInfoState {
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  selectedAudioInputId: string;
  selectedAudioOutputId: string;
  selectedVideoInputId: string;
}

export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfoState>({
    audioInputs: [],
    audioOutputs: [],
    videoInputs: [],
    selectedAudioInputId: '',
    selectedAudioOutputId: '',
    selectedVideoInputId: '',
  });

  const refreshDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();

      const audioIn = allDevices.filter((d) => d.kind === 'audioinput');
      const audioOut = allDevices.filter((d) => d.kind === 'audiooutput');
      const videoIn = allDevices.filter((d) => d.kind === 'videoinput');

      setDevices((prev) => ({
        audioInputs: audioIn,
        audioOutputs: audioOut,
        videoInputs: videoIn,
        selectedAudioInputId: prev.selectedAudioInputId || audioIn[0]?.deviceId || '',
        selectedAudioOutputId: prev.selectedAudioOutputId || audioOut[0]?.deviceId || '',
        selectedVideoInputId: prev.selectedVideoInputId || videoIn[0]?.deviceId || '',
      }));
    } catch (e) {
      console.warn('Could not enumerate media devices:', e);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices);
    };
  }, [refreshDevices]);

  const selectAudioInput = (deviceId: string) => {
    setDevices((prev) => ({ ...prev, selectedAudioInputId: deviceId }));
  };

  const selectVideoInput = (deviceId: string) => {
    setDevices((prev) => ({ ...prev, selectedVideoInputId: deviceId }));
  };

  const selectAudioOutput = (deviceId: string) => {
    setDevices((prev) => ({ ...prev, selectedAudioOutputId: deviceId }));
  };

  return {
    ...devices,
    refreshDevices,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
  };
}

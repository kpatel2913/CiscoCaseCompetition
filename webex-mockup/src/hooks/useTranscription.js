import { useRef } from 'react';

/**
 * useTranscription — Web Speech API hook
 *
 * @param {object} opts
 * @param {object}   opts.meetingIdRef  - React ref whose .current holds the backend meeting ID
 * @param {string}   opts.speakerName   - name shown on each transcript entry
 * @param {function} opts.onSegment     - callback(segment) when a final result is ready
 * @param {function} opts.onInterim     - callback(text) on interim (in-progress) results
 */
export function useTranscription({ meetingIdRef, speakerName, onSegment, onInterim }) {
  const recognitionRef = useRef(null);
  const meetingStartRef = useRef(Date.now());

  const start = (startTime) => {
    meetingStartRef.current = startTime || Date.now();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (result.isFinal) {
          if (!text) continue;
          const segment = {
            speaker: speakerName,
            text,
            timestamp: Date.now() - meetingStartRef.current,
          };

          // Notify parent component
          onSegment?.(segment);
          onInterim?.('');

          // Persist to backend — always read ref.current at call time, never a stale closure
          const currentMeetingId = meetingIdRef?.current;
          if (currentMeetingId) {
            fetch(`/api/meetings/${currentMeetingId}/transcript`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ segments: [segment] }),
            }).catch(() => {}); // silently ignore network errors
          }
        } else {
          // Interim result — show typing indicator
          onInterim?.(text);
        }
      }
    };

    recognition.onerror = (e) => {
      // 'no-speech' is common and harmless — restart automatically
      if (e.error === 'no-speech') {
        try { recognition.stop(); } catch (_) {}
        setTimeout(() => {
          try { recognition.start(); } catch (_) {}
        }, 500);
      } else {
        console.warn('Speech recognition error:', e.error);
      }
    };

    // Auto-restart when recognition ends (browser behaviour varies)
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch (_) {}
      }
    };

    recognition.start();
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return { start, stop };
}

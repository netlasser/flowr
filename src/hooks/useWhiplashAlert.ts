import { useEffect } from 'react';
import { useFlowrStore } from '../store';

export function useWhiplashAlert() {
  const zoneSwitchHistory = useFlowrStore((s) => s.zoneSwitchHistory);
  const whiplashAlertShown = useFlowrStore((s) => s.whiplashAlertShown);
  const setWhiplashAlertShown = useFlowrStore((s) => s.setWhiplashAlertShown);
  const pushToast = useFlowrStore((s) => s.pushToast);
  const storeSet = useFlowrStore.setState;

  useEffect(() => {
    const now = Date.now();
    const TEN_MIN = 10 * 60 * 1000;

    const recent = zoneSwitchHistory.filter((e) => now - e.timestamp < TEN_MIN);

    if (recent.length >= 3) {
      if (!whiplashAlertShown) {
        setWhiplashAlertShown(true);
        const count = recent.length;
        const cost = count * 15;

        pushToast(
          `You switched zones ${count} times in 10 minutes. That will cost you ~${cost} min of refocus. Take a short break?`,
          'info',
          {
            label: 'Take a short break',
            onClick: () => {
              storeSet({
                isBufferActive: true,
                bufferSecondsLeft: 120,
                bufferIsQuickBreak: true,
              });
            },
          },
          15000,
        );
      }
    } else if (recent.length < 3 && whiplashAlertShown) {
      setWhiplashAlertShown(false);
    }
  }, [zoneSwitchHistory, whiplashAlertShown, setWhiplashAlertShown, pushToast, storeSet]);
}

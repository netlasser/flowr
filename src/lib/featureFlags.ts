type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment?: string;
};

const defaultFlags: FeatureFlag[] = [
  {
    key: 'beta_feedback_form',
    name: 'Beta Feedback Form',
    description: 'Show in-app feedback form for beta testers',
    enabled: true,
    environment: 'beta',
  },
  {
    key: 'multi_user_collab',
    name: 'Multi-User Collaboration',
    description: 'Enable experimental multi-user collaboration features',
    enabled: false,
  },
  {
    key: 'ai_zone_suggestions',
    name: 'AI Zone Suggestions',
    description: 'Enable AI-powered zone suggestions for tasks',
    enabled: true,
  },
];

export function getFeatureFlags(): FeatureFlag[] {
  const isBeta = import.meta.env.VITE_APP_ENV === 'beta';
  
  return defaultFlags.map((flag) => {
    // If flag has environment restriction, only enable in that environment
    if (flag.environment && flag.environment !== import.meta.env.VITE_APP_ENV) {
      return { ...flag, enabled: false };
    }
    return flag;
  });
}

export function isFeatureEnabled(key: string): boolean {
  const flags = getFeatureFlags();
  const flag = flags.find((f) => f.key === key);
  return flag?.enabled ?? false;
}

export function setFeatureFlag(key: string, enabled: boolean): void {
  // For development purposes, allow toggling flags via localStorage
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const storedFlags = JSON.parse(localStorage.getItem('flowr_feature_flags') || '{}');
    storedFlags[key] = enabled;
    localStorage.setItem('flowr_feature_flags', JSON.stringify(storedFlags));
  }
}

export function getStoredFeatureFlags(): Record<string, boolean> {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('flowr_feature_flags') || '{}');
  }
  return {};
}

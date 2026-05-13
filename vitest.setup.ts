import { vi } from 'vitest';

// Mock React Native Platform
vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default,
  },
}));

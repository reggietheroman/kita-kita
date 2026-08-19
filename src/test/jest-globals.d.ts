import { jest as jestObject } from '@jest/globals';

declare global {
  const jest: typeof jestObject;
}

export {};

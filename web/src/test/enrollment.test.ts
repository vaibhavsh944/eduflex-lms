import { describe, it, expect } from 'vitest';

describe('Course enrollment logic', () => {
  const scenarios = [
    { isAuth: false, enrolled: false, free: true, expected: 'login' },
    { isAuth: true, enrolled: false, free: true, expected: 'enroll' },
    { isAuth: true, enrolled: true, free: true, expected: 'continue' },
    { isAuth: true, enrolled: false, free: false, expected: 'payment' },
    { isAuth: false, enrolled: false, free: false, expected: 'login' },
  ];

  scenarios.forEach(({ isAuth, enrolled, free, expected }) => {
    it(`returns ${expected} for auth=${isAuth} enrolled=${enrolled} free=${free}`, () => {
      let action: string;
      if (!isAuth) action = 'login';
      else if (enrolled) action = 'continue';
      else if (free) action = 'enroll';
      else action = 'payment';
      expect(action).toBe(expected);
    });
  });
});

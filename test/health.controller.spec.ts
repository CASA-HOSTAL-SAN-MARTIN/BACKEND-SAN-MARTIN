import { HealthController } from '../src/health/health.controller';

describe('HealthController', () => {
  it('returns the healthy status', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});

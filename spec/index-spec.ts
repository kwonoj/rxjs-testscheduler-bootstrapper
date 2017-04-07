import { expect } from 'chai';
import { createTestScheduler } from '../src/index';

describe('bootstrapper', () => {
  describe('module export', () => {
    it('should export marble testscheduler factory function', () => {
      expect(createTestScheduler).to.exist;
      expect(createTestScheduler).to.be.a('function');
    });
  });

  describe('createTestScheduler', () => {
    it('should create test scheduler object', () => {
      const { scheduler, hot, cold, expectObservable } = createTestScheduler();

      const v1 = hot ('--a--b--|');
      const v2 = cold('--1--2--|');

      const value = v1.concatMap(() => v2);

      expectObservable(value).toBe('----1--2----1--2--|');

      scheduler.flush();
    });

    it('should allow custom assertion matcher for observable', () => {
      let called = false;
      const simpleMock = (..._args: Array<any>) => called = true;

      const { scheduler, hot, cold, expectObservable } = createTestScheduler(simpleMock);

      const v1 = hot ('--a--b--|');
      const v2 = cold('--1--2--|');

      const value = v1.concatMap(() => v2);

      expectObservable(value).toBe('----1--2----1--2--|');

      scheduler.flush();

      expect(called).to.be.true;
    });
  });
});
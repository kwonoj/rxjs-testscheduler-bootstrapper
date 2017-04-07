import { Observable, TestScheduler } from 'rxjs';
import { observableToBeFn } from 'rxjs/testing/TestScheduler';
import * as _ from 'lodash';
import { assert, expect } from 'chai';

export type marbleSignature = (marbles: string, values?: any, error?: any) => Observable<any>;
export type observableAssert = (observable: Observable<any>,
                                unsubscriptionMarbles?: string) => ({ toBe: observableToBeFn });

export interface Marble {
  scheduler: TestScheduler;
  hot: marbleSignature;
  cold: marbleSignature;
  expectObservable: observableAssert;
}

function deleteErrorNotificationStack(marble: any) {
  const { notification } = marble;
  if (notification) {
    const { kind, exception } = notification;
    if (kind === 'E' && exception instanceof Error) {
      notification.exception = { name: exception.name, message: exception.message };
    }
  }
  return marble;
}

function stringify(x: any): string {
  return JSON.stringify(x, function (_key: string, value: any) {
    if (Array.isArray(value)) {
      return '[' + value
        .map(function (i: any) {
          return '\n\t' + stringify(i);
        }) + '\n]';
    }
    return value;
  })
    .replace(/\\"/g, '"')
    .replace(/\\t/g, '\t')
    .replace(/\\n/g, '\n');
}

export function ObservableMatcher(actual: Array<any>, expected: Array<any>): void {
  if (Array.isArray(actual) && Array.isArray(expected)) {
    actual = actual.map(deleteErrorNotificationStack);
    expected = expected.map(deleteErrorNotificationStack);
    const passed = _.isEqual(actual, expected);
    if (passed) {
      return;
    }

    let message = '\nExpected \n';
    actual.forEach((x) => message += `\t${stringify(x)}\n`);

    message += '\t\nto deep equal \n';
    expected.forEach((x) => message += `\t${stringify(x)}\n`);

    assert(passed, message);
  } else {
    expect(expected).to.deep.equal(actual);
  }
}

export function createTestScheduler(customMatcher?: typeof ObservableMatcher): Marble {
  const scheduler = new TestScheduler(customMatcher || ObservableMatcher);
  return {
    scheduler,
    hot: (...args: Array<any>) => scheduler.createHotObservable.apply(scheduler, args),
    cold: (...args: Array<any>) => scheduler.createColdObservable.apply(scheduler, args),
    expectObservable: (...args: Array<any>) => scheduler.expectObservable.apply(scheduler, args)
  };
}
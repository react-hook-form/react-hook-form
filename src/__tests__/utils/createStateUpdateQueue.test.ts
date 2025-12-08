import { createStateUpdateQueue } from '../../utils/createStateUpdateQueue';
import createSubject from '../../utils/createSubject';

describe('createStateUpdateQueue', () => {
  let mockSubjects: any;
  let nextSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    nextSpy = jest.fn();
    mockSubjects = {
      state: {
        next: nextSpy,
      },
    };
  });

  describe('batching behavior', () => {
    it('should batch multiple updates into single notification', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.enqueue({ field2: 'value2' });
      queue.enqueue({ field3: 'value3' });

      // Wait for microtask
      await new Promise((resolve) => queueMicrotask(resolve));

      // Should call next only once with merged updates
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
      });
    });

    it('should merge updates with later values taking precedence', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'initial' });
      queue.enqueue({ field1: 'updated', field2: 'value2' });
      queue.enqueue({ field1: 'final' });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({
        field1: 'final',
        field2: 'value2',
      });
    });

    it('should handle nested object updates correctly', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ errors: { field1: 'error1' } });
      queue.enqueue({ errors: { field2: 'error2' } });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledTimes(1);
      // Later update completely replaces the errors object
      expect(nextSpy).toHaveBeenCalledWith({
        errors: { field2: 'error2' },
      });
    });
  });

  describe('timing and scheduling', () => {
    it('should execute updates in microtask', async () => {
      const queue = createStateUpdateQueue(mockSubjects);
      const executionOrder: string[] = [];

      queue.enqueue({ field1: 'value1' });
      executionOrder.push('after-enqueue');

      // Synchronous code executes first
      expect(executionOrder).toEqual(['after-enqueue']);
      expect(nextSpy).not.toHaveBeenCalled();

      // Wait for microtask
      await new Promise((resolve) => queueMicrotask(resolve));
      executionOrder.push('after-microtask');

      expect(executionOrder).toEqual(['after-enqueue', 'after-microtask']);
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });

    it('should flush immediately for urgent updates', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'urgent' }, true);

      // Urgent updates flush immediately
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({ field1: 'urgent' });
    });

    it('should handle mixed urgent and non-urgent updates', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'normal' }, false);
      queue.enqueue({ field2: 'urgent' }, true);

      // Urgent update triggers immediate flush including pending normal updates
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({
        field1: 'normal',
        field2: 'urgent',
      });

      // No additional flush after microtask
      await new Promise((resolve) => queueMicrotask(resolve));
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('flush operation', () => {
    it('should manually flush pending updates', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.enqueue({ field2: 'value2' });

      // Manually flush before microtask
      queue.flush();

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should handle empty flush gracefully', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.flush();

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should not double-flush after manual flush', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.flush();

      await new Promise((resolve) => queueMicrotask(resolve));

      // Should not flush again
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear operation', () => {
    it('should clear all pending updates without executing', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.enqueue({ field2: 'value2' });

      queue.clear();

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should cancel scheduled flush on clear', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      expect(queue.hasPendingUpdates()).toBe(true);

      queue.clear();

      expect(queue.hasPendingUpdates()).toBe(false);
    });

    it('should handle clear during flush', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.flush();
      queue.clear(); // Clear after flush

      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasPendingUpdates', () => {
    it('should return true when updates are pending', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      expect(queue.hasPendingUpdates()).toBe(false);

      queue.enqueue({ field1: 'value1' });

      expect(queue.hasPendingUpdates()).toBe(true);
    });

    it('should return false after flush', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      expect(queue.hasPendingUpdates()).toBe(true);

      queue.flush();

      expect(queue.hasPendingUpdates()).toBe(false);
    });

    it('should return false after clear', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'value1' });
      queue.clear();

      expect(queue.hasPendingUpdates()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid enqueue and clear cycles', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      for (let i = 0; i < 100; i++) {
        queue.enqueue({ [`field${i}`]: `value${i}` });
        if (i % 10 === 0) {
          queue.clear();
        }
      }

      queue.flush();

      // Should only have updates after last clear
      expect(nextSpy).toHaveBeenCalledTimes(1);
      const lastCall = nextSpy.mock.calls[0][0];
      expect(Object.keys(lastCall).length).toBeLessThan(10);
    });

    it('should handle undefined and null values', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: undefined });
      queue.enqueue({ field2: null });
      queue.enqueue({ field3: '' });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledWith({
        field1: undefined,
        field2: null,
        field3: '',
      });
    });

    it('should handle boolean and numeric values', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ isValid: true });
      queue.enqueue({ count: 0 });
      queue.enqueue({ isValid: false });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledWith({
        isValid: false,
        count: 0,
      });
    });

    it('should handle array values', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ errors: ['error1'] });
      queue.enqueue({ errors: ['error2', 'error3'] });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledWith({
        errors: ['error2', 'error3'],
      });
    });
  });

  describe('concurrency', () => {
    it('should handle concurrent enqueue operations', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      // Simulate concurrent updates
      Promise.all([
        Promise.resolve().then(() => queue.enqueue({ field1: 'value1' })),
        Promise.resolve().then(() => queue.enqueue({ field2: 'value2' })),
        Promise.resolve().then(() => queue.enqueue({ field3: 'value3' })),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 10));

      // All updates should be batched
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle interleaved urgent and normal updates', () => {
      const queue = createStateUpdateQueue(mockSubjects);

      queue.enqueue({ field1: 'normal1' });
      queue.enqueue({ field2: 'urgent1' }, true);

      expect(nextSpy).toHaveBeenCalledTimes(1);

      queue.enqueue({ field3: 'normal2' });
      queue.enqueue({ field4: 'urgent2' }, true);

      expect(nextSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle form state updates correctly', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      // Simulate form state updates during validation
      queue.enqueue({ isValidating: true });
      queue.enqueue({ validatingFields: { email: true } });
      queue.enqueue({ isValidating: false });
      queue.enqueue({ errors: { email: 'Invalid email' } });
      queue.enqueue({ isValid: false });

      await new Promise((resolve) => queueMicrotask(resolve));

      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(nextSpy).toHaveBeenCalledWith({
        isValidating: false,
        validatingFields: { email: true },
        errors: { email: 'Invalid email' },
        isValid: false,
      });
    });

    it('should handle rapid field registration updates', async () => {
      const queue = createStateUpdateQueue(mockSubjects);

      // Simulate multiple field registrations
      for (let i = 0; i < 10; i++) {
        queue.enqueue({
          touchedFields: { [`field${i}`]: false },
          dirtyFields: { [`field${i}`]: false },
        });
      }

      await new Promise((resolve) => queueMicrotask(resolve));

      // Should batch all updates into one
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });
});
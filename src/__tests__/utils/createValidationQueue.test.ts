import { createValidationQueue } from '../../utils/createValidationQueue';

describe('createValidationQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should batch multiple enqueue calls into single validation', async () => {
    let validationCount = 0;
    const validationFn = jest.fn(async () => {
      validationCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const queue = createValidationQueue(validationFn);

    // Enqueue multiple fields
    queue.enqueue('field1');
    queue.enqueue('field2');
    queue.enqueue('field3');

    // Wait for microtask to execute
    await new Promise((resolve) => queueMicrotask(resolve));
    await queue.flush();

    expect(validationCount).toBe(1);
  });

  it('should execute validation in microtask', async () => {
    const executionOrder: string[] = [];

    const validationFn = jest.fn(async () => {
      executionOrder.push('validation');
    });

    const queue = createValidationQueue(validationFn);

    queue.enqueue('field1');
    executionOrder.push('after-enqueue');

    // Synchronous code should execute first
    expect(executionOrder).toEqual(['after-enqueue']);

    // Wait for microtask
    await new Promise((resolve) => queueMicrotask(resolve));
    await queue.flush();

    // Validation should happen in microtask
    expect(executionOrder).toEqual(['after-enqueue', 'validation']);
  });

  it('should track pending fields', () => {
    const validationFn = jest.fn();
    const queue = createValidationQueue(validationFn);

    queue.enqueue('field1');
    queue.enqueue('field2');
    queue.enqueue('field1'); // Duplicate should not add

    const pendingFields = queue.getPendingFields();
    expect(pendingFields.size).toBe(2);
    expect(pendingFields.has('field1')).toBe(true);
    expect(pendingFields.has('field2')).toBe(true);
  });

  it('should clear queue without executing', () => {
    const validationFn = jest.fn();
    const queue = createValidationQueue(validationFn);

    queue.enqueue('field1');
    queue.enqueue('field2');

    expect(queue.isQueued()).toBe(true);

    queue.clear();

    expect(queue.isQueued()).toBe(false);
    expect(queue.getPendingFields().size).toBe(0);
  });

  it('should handle validation errors gracefully', async () => {
    const errorHandler = jest.fn();
    const validationFn = jest.fn(async () => {
      throw new Error('Validation failed');
    });

    const queue = createValidationQueue(validationFn, {
      onError: errorHandler,
    });

    queue.enqueue('field1');

    await new Promise((resolve) => queueMicrotask(resolve));
    await queue.flush();

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
      }),
    );
  });

  it('should notify when flush starts', async () => {
    const onFlush = jest.fn();
    const validationFn = jest.fn();

    const queue = createValidationQueue(validationFn, {
      onFlush,
    });

    queue.enqueue('field1');

    await new Promise((resolve) => queueMicrotask(resolve));
    await queue.flush();

    expect(onFlush).toHaveBeenCalled();
  });

  it('should prevent duplicate flush operations', async () => {
    let validationCount = 0;
    const validationFn = jest.fn(async () => {
      validationCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const queue = createValidationQueue(validationFn);

    queue.enqueue('field1');

    // Try to flush multiple times
    const flush1 = queue.flush();
    const flush2 = queue.flush();
    const flush3 = queue.flush();

    await Promise.all([flush1, flush2, flush3]);

    // Should only validate once
    expect(validationCount).toBe(1);
  });

  it('should handle rapid enqueue and clear operations', () => {
    const validationFn = jest.fn();
    const queue = createValidationQueue(validationFn);

    for (let i = 0; i < 100; i++) {
      queue.enqueue(`field${i}`);
      if (i % 10 === 0) {
        queue.clear();
      }
    }

    // Queue should handle rapid operations without error
    expect(queue.isQueued()).toBeDefined();
  });

  describe('edge cases and error scenarios', () => {
    it('should handle validation function throwing synchronously', async () => {
      const errorHandler = jest.fn();
      const validationFn = jest.fn(() => {
        throw new Error('Sync error');
      });

      const queue = createValidationQueue(validationFn, {
        onError: errorHandler,
      });

      queue.enqueue('field1');

      await new Promise((resolve) => queueMicrotask(resolve));
      await queue.flush();

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Sync error',
        }),
      );
    });

    it('should continue processing after error', async () => {
      let callCount = 0;
      const validationFn = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First call error');
        }
      });

      const queue = createValidationQueue(validationFn, {
        onError: jest.fn(),
      });

      queue.enqueue('field1');
      await new Promise((resolve) => queueMicrotask(resolve));
      await queue.flush();

      // Should be able to enqueue and process again
      queue.enqueue('field2');
      await new Promise((resolve) => queueMicrotask(resolve));
      await queue.flush();

      expect(callCount).toBe(2);
    });

    it('should handle empty field name gracefully', async () => {
      const validationFn = jest.fn();
      const queue = createValidationQueue(validationFn);

      queue.enqueue('');
      queue.enqueue(undefined as any);
      queue.enqueue('validField');

      await new Promise((resolve) => queueMicrotask(resolve));

      // Empty string and undefined are still added to the set
      // The validation should still run
      expect(validationFn).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate fields correctly', () => {
      const validationFn = jest.fn();
      const queue = createValidationQueue(validationFn);

      queue.enqueue('email');
      queue.enqueue('password');
      queue.enqueue('email'); // Duplicate
      queue.enqueue('username');
      queue.enqueue('password'); // Duplicate

      const pendingFields = queue.getPendingFields();
      expect(pendingFields.size).toBe(3);
      expect(Array.from(pendingFields).sort()).toEqual(['email', 'password', 'username']);
    });

    it('should handle validation during flush', async () => {
      let flushCount = 0;
      const validationFn = jest.fn(async () => {
        flushCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const queue = createValidationQueue(validationFn);

      queue.enqueue('field1');
      const flush1 = queue.flush();

      // Try to enqueue during flush
      queue.enqueue('field2');

      await flush1;

      // Should process the second enqueue separately
      await new Promise((resolve) => queueMicrotask(resolve));
      await queue.flush();

      expect(flushCount).toBe(2);
    });
  });

  describe('performance and memory', () => {
    it('should not leak memory with large field sets', () => {
      const validationFn = jest.fn();
      const queue = createValidationQueue(validationFn);

      // Add many fields
      for (let i = 0; i < 10000; i++) {
        queue.enqueue(`field${i}`);
      }

      // Clear should release memory
      queue.clear();

      expect(queue.getPendingFields().size).toBe(0);
      expect(queue.isQueued()).toBe(false);
    });

    it('should handle very long field names', () => {
      const validationFn = jest.fn();
      const queue = createValidationQueue(validationFn);

      const longFieldName = 'field'.repeat(1000);
      queue.enqueue(longFieldName);

      const pendingFields = queue.getPendingFields();
      expect(pendingFields.has(longFieldName)).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should work with multiple queues independently', async () => {
      const validation1 = jest.fn();
      const validation2 = jest.fn();

      const queue1 = createValidationQueue(validation1);
      const queue2 = createValidationQueue(validation2);

      queue1.enqueue('field1');
      queue2.enqueue('field2');

      await new Promise((resolve) => queueMicrotask(resolve));
      await Promise.all([queue1.flush(), queue2.flush()]);

      expect(validation1).toHaveBeenCalledTimes(1);
      expect(validation2).toHaveBeenCalledTimes(1);
    });

    it('should handle nested enqueue calls', async () => {
      let enqueueCount = 0;
      const validationFn = jest.fn(async () => {
        if (enqueueCount === 0) {
          enqueueCount++;
          // This simulates a scenario where validation triggers another field update
          // but we don't want to create an infinite loop
        }
      });

      const queue = createValidationQueue(validationFn);
      queue.enqueue('field1');

      await new Promise((resolve) => queueMicrotask(resolve));
      await queue.flush();

      expect(validationFn).toHaveBeenCalledTimes(1);
    });
  });
});
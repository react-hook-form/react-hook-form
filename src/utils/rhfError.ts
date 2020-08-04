export class RHFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RHFError';
  }
}

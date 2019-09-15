export function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  return (
    obj.constructor === Object
    && Object.getPrototypeOf(obj) === Object.prototype
  );
}

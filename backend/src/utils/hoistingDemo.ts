/**
 * Demonstrates JavaScript hoisting behavior (var vs let/const vs functions).
 */
export const runHoistingDemo = () => {
  const results: any[] = [];

  // 1. var hoisting
  try {
    // @ts-ignore - Intentionally demonstrating hoisting
    results.push({ type: 'var', value: hoistedVar, explanation: 'var is hoisted and initialized to undefined before assignment.' });
  } catch (e: any) {
    results.push({ type: 'var', error: e.message });
  }
  var hoistedVar = 'I am var';

  // 2. let/const Temporal Dead Zone (TDZ)
  try {
    // @ts-ignore - Intentionally demonstrating TDZ
    results.push({ type: 'let', value: hoistedLet });
  } catch (e: any) {
    results.push({ type: 'let', error: e.message, explanation: 'let/const are hoisted but remain in the Temporal Dead Zone (TDZ) until initialization, causing a ReferenceError.' });
  }
  let hoistedLet = 'I am let';

  // 3. Function hoisting
  try {
    // @ts-ignore
    const result = hoistedFunction();
    results.push({ type: 'function', value: result, explanation: 'Function declarations are fully hoisted, allowing them to be called before they appear in code.' });
  } catch (e: any) {
    results.push({ type: 'function', error: e.message });
  }

  function hoistedFunction() {
    return 'I am a hoisted function';
  }

  return results;
};

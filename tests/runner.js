// Mini-Testrunner ohne Abhängigkeiten
const tests = [];
export function test(name, fn) { tests.push({ name, fn }); }
export function eq(actual, expected, msg = "") {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} erwartet ${e}, erhalten ${a}`);
}
export function ok(cond, msg = "Bedingung nicht erfüllt") { if (!cond) throw new Error(msg); }
export function run(out) {
  let passed = 0, failed = 0;
  const lines = [];
  for (const t of tests) {
    try { t.fn(); passed++; lines.push(`✓ ${t.name}`); }
    catch (err) { failed++; lines.push(`✗ ${t.name}\n    ${err.message}`); }
  }
  lines.unshift(`RESULT: ${passed} passed, ${failed} failed`);
  out.textContent = lines.join("\n");
  document.title = failed ? "FAIL" : "OK";
  return failed;
}

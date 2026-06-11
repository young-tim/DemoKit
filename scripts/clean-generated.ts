import fs from "node:fs";

for (const dir of ["api", "netlify/functions", "functions/api", "generated"]) {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log("Cleaned generated adapters.");

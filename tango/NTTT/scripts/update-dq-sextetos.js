const fs = require("fs");
const path = require("path");

const dqPath = path.join(__dirname, "../public/songData/dataQualityIssues.json");
const dq = JSON.parse(fs.readFileSync(dqPath, "utf8"));

let updated = 0;
const changes = [];

dq.issues.forEach(issue => {
  const isMilonguero = issue.orchestra && issue.orchestra.includes("Sexteto Milonguero");
  const isCristal = issue.orchestra && issue.orchestra.includes("Sexteto Cristal");

  if (isMilonguero || isCristal) {
    if (issue.status === "not_reviewed" || issue.status === "reviewed") {
      changes.push({
        issueId: issue.issueId,
        title: issue.title,
        orchestra: issue.orchestra,
        oldStatus: issue.status
      });

      issue.status = "fixed";
      issue.resolution = "valid_modern";
      issue.reviewedAt = new Date().toISOString();
      issue.notes = "Valid Renaissance orchestra - removed DNP, made playable";
      updated++;
    }
  }
});

// Update metadata
dq.metadata.lastModified = new Date().toISOString();
dq.metadata.reviewed = dq.issues.filter(i => i.status !== "not_reviewed").length;
dq.metadata.fixed = dq.issues.filter(i => i.status === "fixed").length;

fs.writeFileSync(dqPath, JSON.stringify(dq, null, 2));

console.log("=== DQ Issues Updated ===");
console.log("Fixed:", updated, "issues");
changes.forEach(c => console.log(`  ${c.issueId}: ${c.title} (${c.orchestra})`));
console.log("\nMetadata:");
console.log("  Total issues:", dq.issues.length);
console.log("  Reviewed:", dq.metadata.reviewed);
console.log("  Fixed:", dq.metadata.fixed);

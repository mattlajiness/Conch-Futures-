const fs = require("fs");
let content = fs.readFileSync("src/components/AdminTab.tsx", "utf8");

content = content.replace(
  `              </button>
            </div>
          </div>

          {/* Members Dues Tracking Checklist */}`,
  `              </button>
            </div>
          </div>
          )}

          {/* Members Dues Tracking Checklist */}`
);

fs.writeFileSync("src/components/AdminTab.tsx", content);
console.log("Added missing bracket!");

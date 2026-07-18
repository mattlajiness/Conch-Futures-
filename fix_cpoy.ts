import fs from 'fs';

let content = fs.readFileSync('src/constants.ts', 'utf-8');

// The user might be talking about Kirk Cousins and Aaron Rodgers. 
// I'll add them back to CPOY and set their teams correctly.
content = content.replace('{ value: "garrett_wilson", label: "Garrett Wilson (Jets)" },', '{ value: "garrett_wilson", label: "Garrett Wilson (Jets)" },\n      { value: "kirk_cousins", label: "Kirk Cousins (Raiders)" },\n      { value: "aaron_rodgers", label: "Aaron Rodgers (Steelers)" },');

fs.writeFileSync('src/constants.ts', content);

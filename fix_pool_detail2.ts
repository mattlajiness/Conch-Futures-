import * as fs from 'fs';
let content = fs.readFileSync('src/components/PoolDetail.tsx', 'utf-8');
content = content.replace(
  '{activeTab !== "picks" && (\n      {/* Category Filter Selector */}\n      <div id="category-filter-bar"',
  '{activeTab !== "picks" && (\n      <div id="category-filter-bar"'
);
fs.writeFileSync('src/components/PoolDetail.tsx', content);

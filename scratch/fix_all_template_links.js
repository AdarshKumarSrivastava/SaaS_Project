const fs = require('fs');
const path = require('path');

const templateSlugs = [
  'atelier',
  'aurelia',
  'canvas',
  'essence',
  'horizon',
  'minimalist',
  'monument',
  'nexus-pro',
  'nexus_pro',
  'noire',
  'origin',
  'quantum',
  'vanta',
  'velocity'
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const templatesDir = path.join(__dirname, '..', 'app', 'templates');
const files = walk(templatesDir);
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix escaped \${basePath}
  content = content.split('\\${basePath}').join('${basePath}');

  // Replace hardcoded template paths in href strings for each template slug
  templateSlugs.forEach(slug => {
    // href="/templates/slug" -> href={basePath || '/'}
    content = content.split(`href="/templates/${slug}"`).join("href={basePath || '/'}");
    content = content.split(`href={"/templates/${slug}"}`).join("href={basePath || '/'}");
    content = content.split(`href=\`/templates/${slug}\``).join("href={basePath || '/'}");

    // href="/templates/slug/..." -> href={`${basePath}/...`}
    const regexHrefDQuote = new RegExp('href="/templates/' + slug + '/([^"]+)"', 'g');
    content = content.replace(regexHrefDQuote, (m, sub) => 'href={`' + '${basePath}/' + sub + '`}');

    const regexHrefTick = new RegExp('href={`/templates/' + slug + '/([^`]+)`}', 'g');
    content = content.replace(regexHrefTick, (m, sub) => 'href={`' + '${basePath}/' + sub + '`}');

    const regexHrefPlainTick = new RegExp('href=`/templates/' + slug + '/([^`]+)`', 'g');
    content = content.replace(regexHrefPlainTick, (m, sub) => 'href={`' + '${basePath}/' + sub + '`}');

    // router.push("/templates/slug/...") -> router.push(`${basePath}/...`)
    const regexPush = new RegExp('router\\.push\\(["\'`]\\/templates\\/' + slug + '\\/([^"\'`]+)["\'`]\\)', 'g');
    content = content.replace(regexPush, (m, sub) => 'router.push(`' + '${basePath}/' + sub + '`)');

    // router.push("/templates/slug") -> router.push(basePath || '/')
    const regexPushRoot = new RegExp('router\\.push\\(["\'`]\\/templates\\/' + slug + '["\'`]\\)', 'g');
    content = content.replace(regexPushRoot, () => "router.push(basePath || '/')");
  });

  // Fix falsy __customContext?.basePath || '/templates/...'
  content = content.replace(
    /const\s+basePath\s*=\s*typeof\s+__customContext\?\s*\.basePath\s*===\s*['"]string['"]\s*\?\s*__customContext\.basePath\s*:\s*(['"][^'"]+['"])\s*;/g,
    'const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";'
  );
  content = content.replace(
    /const\s+basePath\s*=\s*__customContext\?\s*\.basePath\s*\|\|\s*(['"][^'"]+['"])\s*;/g,
    'const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Updated:', path.relative(templatesDir, file));
  }
});

console.log('Total files updated:', modifiedCount);

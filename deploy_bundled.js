const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = 'sbp_v0_94d670da98609648ed9ca78eb67e9cc01edf02a8';
const PROJECT_REF = 'ljhhzbifxtryglamrskw';
const FUNCTIONS_DIR = 'D:\\final\\supabase\\functions';

// Cache for _shared files
const sharedCache = {};

function loadSharedFiles() {
  const sharedDir = path.join(FUNCTIONS_DIR, '_shared');
  if (!fs.existsSync(sharedDir)) return;
  const files = fs.readdirSync(sharedDir);
  for (const f of files) {
    if (f.endsWith('.ts')) {
      sharedCache[f] = fs.readFileSync(path.join(sharedDir, f), 'utf8');
    }
  }
}

function inlineShared(source) {
  let result = source;
  // Match imports from ../_shared/ or ../../_shared/ etc.
  const sharedImportRegex = /import\s+[^;]+\s+from\s+["']([^"']*_shared\/[^"']+)["']\s*;?\s*/g;
  let match;
  while ((match = sharedImportRegex.exec(source)) !== null) {
    const importPath = match[1];
    const fileName = path.basename(importPath);
    if (sharedCache[fileName]) {
      // Replace the import with the actual file content, wrapped in a block
      const importStatement = match[0];
      const inlineContent = sharedCache[fileName]
        // Remove its own imports that won't resolve
        .replace(/^import\s+.*from\s+["'].*["']\s*;?\s*/gm, '')
        // Add a comment to mark it
        .trim();
      result = result.replace(importStatement, `// --- inlined from _shared/${fileName} ---\n${inlineContent}\n// --- end inlined ---`);
    }
  }
  return result;
}

function deployFunction(slug, filePath) {
  return new Promise((resolve, reject) => {
    let sourceCode = fs.readFileSync(filePath, 'utf8');
    sourceCode = inlineShared(sourceCode);
    
    const metadata = JSON.stringify({ entrypoint_path: 'index.ts', name: slug });
    const boundary = '----Boundary' + Math.random().toString(36).substring(2, 20);

    let body = '';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="metadata"\r\n';
    body += 'Content-Type: application/json\r\n\r\n';
    body += metadata + '\r\n';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="file"; filename="index.ts"\r\n';
    body += 'Content-Type: application/octet-stream\r\n\r\n';
    body += sourceCode + '\r\n';
    body += '--' + boundary + '--\r\n';

    const bodyBuffer = Buffer.from(body, 'utf8');
    const urlObj = new URL(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${slug}`);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ status: 'deployed', slug });
        } else {
          resolve({ status: 'failed', slug, code: res.statusCode, error: data.substring(0, 300) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(bodyBuffer);
    req.end();
  });
}

async function main() {
  loadSharedFiles();
  console.log(`Loaded ${Object.keys(sharedCache).length} shared files\n`);

  // Collect all functions (both root level and subdirectory)
  const funcs = []; // { slug, filePath }[]

  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory() && e.name !== '_shared');

  for (const entry of dirs) {
    const funcDir = path.join(FUNCTIONS_DIR, entry.name);
    const rootIndex = path.join(funcDir, 'index.ts');
    const subdirs = fs.readdirSync(funcDir, { withFileTypes: true }).filter(e => e.isDirectory());

    if (subdirs.length > 0) {
      // Deploy each subdirectory as separate function
      for (const sub of subdirs) {
        const subIndex = path.join(funcDir, sub.name, 'index.ts');
        if (fs.existsSync(subIndex)) {
          funcs.push({ slug: `${entry.name}-${sub.name}`, filePath: subIndex });
        }
      }
    } else if (fs.existsSync(rootIndex)) {
      funcs.push({ slug: entry.name, filePath: rootIndex });
    }
  }

  console.log(`Found ${funcs.length} functions to deploy\n`);

  let ok = 0, fail = 0;
  for (const { slug, filePath } of funcs) {
    const result = await deployFunction(slug, filePath);
    if (result.status === 'deployed') {
      console.log(`OK  ${slug}`);
      ok++;
    } else {
      console.log(`ERR ${slug}`);
      console.log(`    -> ${result.error}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n=== Functions: ${ok} deployed, ${fail} failed ===`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });

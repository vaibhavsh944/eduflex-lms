const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = 'sbp_v0_94d670da98609648ed9ca78eb67e9cc01edf02a8';
const PROJECT_REF = 'ljhhzbifxtryglamrskw';
const FUNCTIONS_DIR = 'D:\\final\\supabase\\functions';

function deployFunction(slug, filePath, entrypoint) {
  return new Promise((resolve, reject) => {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.stringify({ entrypoint_path: entrypoint, name: slug });
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
          resolve({ status: 'deployed', slug, version: JSON.parse(data).version || 1 });
        } else {
          resolve({ status: 'failed', slug, code: res.statusCode, error: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(bodyBuffer);
    req.end();
  });
}

async function deploySubdirs(parentSlug, funcDir) {
  const entries = fs.readdirSync(funcDir, { withFileTypes: true });
  const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const results = [];
  
  for (const sub of subdirs) {
    const slug = `${parentSlug}-${sub}`;
    const indexPath = path.join(funcDir, sub, 'index.ts');
    if (fs.existsSync(indexPath)) {
      const result = await deployFunction(slug, indexPath, `${sub}/index.ts`);
      results.push(result);
      if (result.status === 'deployed') {
        process.stdout.write(`OK  ${slug}\n`);
      } else {
        process.stdout.write(`ERR ${slug} - HTTP ${result.code}: ${result.error}\n`);
      }
    } else {
      process.stdout.write(`SKIP ${slug} (no index.ts)\n`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function main() {
  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory() && e.name !== '_shared').map(e => e.name).sort();

  let ok = 0, fail = 0;
  process.stdout.write(`Deploying ${dirs.length} functions...\n\n`);

  for (const slug of dirs) {
    const funcDir = path.join(FUNCTIONS_DIR, slug);
    const indexPath = path.join(funcDir, 'index.ts');

    // Check if it has subdirectories
    const subdirs = fs.readdirSync(funcDir, { withFileTypes: true }).filter(e => e.isDirectory());
    
    if (subdirs.length > 0) {
      // Deploy as sub-functions (e.g., gamification/check-badges -> gamification-check-badges)
      process.stdout.write(`--- ${slug} has subdirs (${subdirs.map(s => s.name).join(', ')})\n`);
      const results = await deploySubdirs(slug, funcDir);
      const subOk = results.filter(r => r.status === 'deployed').length;
      ok += subOk;
      fail += results.length - subOk;
    } else if (fs.existsSync(indexPath)) {
      const result = await deployFunction(slug, indexPath, 'index.ts');
      if (result.status === 'deployed') {
        process.stdout.write(`OK  ${slug}\n`);
        ok++;
      } else {
        process.stdout.write(`ERR ${slug} - HTTP ${result.code}: ${result.error}\n`);
        fail++;
      }
    } else {
      process.stdout.write(`SKIP ${slug} (no index.ts)\n`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  process.stdout.write(`\n=== Functions: ${ok} deployed, ${fail} failed ===\n`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });

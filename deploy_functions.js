const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const TOKEN = 'sbp_v0_94d670da98609648ed9ca78eb67e9cc01edf02a8';
const PROJECT_REF = 'ljhhzbifxtryglamrskw';

function multipartFormData(fields) {
  const boundary = '----' + Math.random().toString(36).substring(2);
  const parts = [];
  
  for (const [name, value, filename] of fields) {
    if (filename) {
      // File field
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n${value}`);
    } else {
      // Text field
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}`);
    }
  }
  parts.push(`--${boundary}--\r\n`);
  
  const body = parts.join('\r\n');
  return { body, boundary };
}

function deployFunction(slug, filePath, entrypoint) {
  return new Promise((resolve, reject) => {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const metadata = JSON.stringify({ entrypoint_path: entrypoint, name: slug });
    const { body, boundary } = multipartFormData([
      ['metadata', metadata],
      ['file', sourceCode, 'index.ts']
    ]);

    const url = new URL(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=${slug}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const parsed = JSON.parse(data);
          resolve({ status: 'deployed', slug, id: parsed.id || 'ok' });
        } else {
          resolve({ status: 'failed', slug, code: res.statusCode, error: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

async function main() {
  const functionsDir = 'D:\\final\\supabase\\functions';
  const entries = fs.readdirSync(functionsDir, { withFileTypes: true });
  const slugs = entries.filter(e => e.isDirectory() && e.name !== '_shared').map(e => e.name).sort();

  console.log(`Found ${slugs.length} functions to deploy\n`);

  let ok = 0, fail = 0;
  for (const slug of slugs) {
    const funcDir = path.join(functionsDir, slug);
    const indexPath = path.join(funcDir, 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
      console.log(`SKIP ${slug} (no index.ts)`);
      fail++;
      continue;
    }

    // Check if it has subdirectories (complex function)
    const hasSubdirs = fs.readdirSync(funcDir, { withFileTypes: true }).some(e => e.isDirectory());
    if (hasSubdirs) {
      console.log(`SKIP ${slug} (has subdirectories - needs special handling)`);
      fail++;
      continue;
    }

    try {
      const result = await deployFunction(slug, indexPath, 'index.ts');
      if (result.status === 'deployed') {
        console.log(`OK  ${slug}`);
        ok++;
      } else {
        console.log(`ERR ${slug} - HTTP ${result.code}: ${result.error}`);
        fail++;
      }
    } catch (err) {
      console.log(`ERR ${slug} - ${err.message}`);
      fail++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== Functions: ${ok} deployed, ${fail} failed ===`);
}

main().catch(console.error);

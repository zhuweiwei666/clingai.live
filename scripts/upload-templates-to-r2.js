import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const R2_ACCOUNT_ID = mustEnv('R2_ACCOUNT_ID');
const R2_ACCESS_KEY_ID = mustEnv('R2_ACCESS_KEY_ID');
const R2_SECRET_ACCESS_KEY = mustEnv('R2_SECRET_ACCESS_KEY');
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'clingailive';
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const ROOT = process.argv[2] || path.resolve(process.cwd(), 'public/templates');
const PREFIX = process.argv[3] || 'templates';

const contentTypeByExt = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
};

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

async function main() {
  if (!fs.existsSync(ROOT)) throw new Error(`Not found: ${ROOT}`);

  const client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const files = walk(ROOT);
  console.log(`[R2] Uploading ${files.length} files from ${ROOT} to s3://${R2_BUCKET_NAME}/${PREFIX}/`);

  let i = 0;
  for (const file of files) {
    i += 1;
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const key = `${PREFIX}/${rel}`;
    const ext = path.extname(file).toLowerCase();
    const contentType = contentTypeByExt[ext] || 'application/octet-stream';
    const body = fs.readFileSync(file);

    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    if (i % 25 === 0 || i === files.length) {
      console.log(`[R2] ${i}/${files.length} uploaded`);
    }
  }

  console.log('[R2] Done');
}

main().catch((e) => {
  console.error('[R2] Failed:', e.message);
  process.exit(1);
});



const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

for (const line of lines) {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      console.log(`Adding ${key}...`);
      try {
        // Remove existing if any (ignores error if doesn't exist)
        try {
          execSync(`npx vercel env rm ${key} production -y`);
        } catch (e) {}
        
        execSync(`npx vercel env add ${key} production`, { input: value.trim(), stdio: ['pipe', 'inherit', 'inherit'] });
      } catch (e) {
        console.error(`Failed to add ${key}`);
      }
    }
  }
}
console.log("Done adding env variables!");

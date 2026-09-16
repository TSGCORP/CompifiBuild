import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });

const required = [
  'SALARY_COM_CLIENT_ID',
  'SALARY_COM_CLIENT_SECRET',
  'SALARY_COM_TOKEN_URL',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error('Missing required environment variables:');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error('');
  console.error('Example:');
  console.error('  SALARY_COM_CLIENT_ID=...');
  console.error('  SALARY_COM_CLIENT_SECRET=...');
  console.error('  SALARY_COM_TOKEN_URL=https://your-oauth-server.example.com/oauth/token');
  console.error('  SALARY_COM_ENDPOINT=https://daasjobmatchapi.salary.com/jobposting/jobpricing');
  console.error('  SALARY_COM_JOB_CODE=AccountantII');
  console.error('  SALARY_COM_REQUEST_BODY={"jobCode":"AccountantII"}');
  console.error('');
  console.error('Run: node scripts/fetch-salarycom-one-job.mjs');
  process.exit(1);
}

const tokenUrl = process.env.SALARY_COM_TOKEN_URL;
const clientId = process.env.SALARY_COM_CLIENT_ID;
const clientSecret = process.env.SALARY_COM_CLIENT_SECRET;
const endpoint = process.env.SALARY_COM_ENDPOINT;
const jobCode = process.env.SALARY_COM_JOB_CODE;
const requestBodyText = process.env.SALARY_COM_REQUEST_BODY || JSON.stringify({
  jobCode,
  jobTitle: undefined,
  title: undefined,
  region: undefined,
  state: undefined,
  city: undefined,
});

const tokenUrlWithCredentials = new URL(tokenUrl);
tokenUrlWithCredentials.searchParams.set('ClientID', clientId);
tokenUrlWithCredentials.searchParams.set('ClientSecret', clientSecret);

console.log('========================================');
console.log('Trying Salary.com token request');
console.log('Method: GET');
console.log('URL:', tokenUrlWithCredentials.toString());
console.log('Headers:');
console.log(JSON.stringify({ Accept: 'application/json' }, null, 2));
console.log('========================================');

const tokenResponse = await fetch(tokenUrlWithCredentials, {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
});

const responseText = await tokenResponse.text();
console.log('Response status:', tokenResponse.status, tokenResponse.statusText);
console.log('Response headers:');
console.log(JSON.stringify(Object.fromEntries(tokenResponse.headers.entries()), null, 2));
console.log('Response body:');
console.log(responseText || '<empty body>');
console.log('========================================');

if (!tokenResponse.ok) {
  console.error('Salary.com token request failed.');
  process.exit(1);
}

const tokenData = JSON.parse(responseText);
const accessToken = tokenData?.AccessToken?.TokenContent ?? tokenData?.access_token;

if (!accessToken) {
  console.error('No access token returned by Salary.com. Check response shape above.');
  process.exit(1);
}

console.log('========================================');
console.log('Salary.com OAuth token response');
console.log('Token URL:', tokenUrl);
console.log('HTTP status:', tokenResponse.status);
console.log('========================================');
console.log(JSON.stringify(tokenData, null, 2));
console.log('========================================');

if (!accessToken) {
  console.error('No access token returned by Salary.com. Check the response shape above.');
  process.exit(1);
}

if (!endpoint) {
  console.log('SALARY_COM_ENDPOINT is empty, so the API call was skipped after successful token validation.');
  process.exit(0);
}

const finalUrl = endpoint;

let requestPayload;
try {
  requestPayload = JSON.parse(requestBodyText);
} catch {
  requestPayload = { jobCode };
}

if (jobCode && !requestPayload.jobCode && !requestPayload.jobTitle) {
  requestPayload.jobCode = jobCode;
}

const apiResponse = await fetch(finalUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestPayload),
});

const apiResponseText = await apiResponse.text();

console.log('========================================');
console.log('Salary.com raw response for job code:');
console.log(jobCode || requestPayload.jobCode || 'unknown');
console.log('URL:', finalUrl);
console.log('HTTP status:', apiResponse.status);
console.log('Request body:', JSON.stringify(requestPayload, null, 2));
console.log('========================================');

try {
  const pretty = JSON.parse(apiResponseText);
  console.log(JSON.stringify(pretty, null, 2));
} catch {
  console.log(apiResponseText);
}

console.log('========================================');
console.log('If this prints the actual vendor payload, the field names and nesting are now confirmed.');
console.log('Next step: normalize the response into market_benchmarks using the fields you see here.');

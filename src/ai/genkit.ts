
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config as dotenvConfig} from 'dotenv'; // Added for local .env loading

console.log('============================================================');
console.log('[Genkit Init] Attempting to load src/ai/genkit.ts...');
console.log('NodeJS Environment:', process.env.NODE_ENV);
console.log('Vercel Environment:', process.env.VERCEL_ENV);
console.log('============================================================');

dotenvConfig(); // Load .env file for local development

// Prepare Google AI plugin configuration
const googleAIPluginOptions: { apiKey?: string } = {};
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

console.log(`[Genkit Init] Attempting to initialize Genkit. GEMINI_API_KEY found (length): ${geminiApiKey ? geminiApiKey.length : 'NOT FOUND'}`);

if (geminiApiKey) {
  googleAIPluginOptions.apiKey = geminiApiKey;
}

if (!googleAIPluginOptions.apiKey) {
  const errorMessage = `
CRITICAL_STARTUP_ERROR: The 'GEMINI_API_KEY' (or 'GOOGLE_API_KEY') environment variable is MISSING.
This key is ESSENTIAL for Genkit's AI features to work.
Your Next.js server, when deployed to Firebase Hosting (which uses Google Cloud Run), WILL NOT START without this key.

SOLUTION:
1. Go to the Google Cloud Console (console.cloud.google.com).
2. Select your project.
3. Find your Cloud Run service (usually named like 'ssr[YOUR-FIREBASE-PROJECT-ID]' or similar, matching your Firebase Hosting site).
4. Click on the service, then 'EDIT AND DEPLOY NEW REVISION'.
5. Under the 'Variables & Secrets' tab (or similar section for environment variables), ADD a new environment variable:
   - Name: GEMINI_API_KEY
   - Value: YOUR_ACTUAL_GEMINI_API_KEY
6. Deploy the new revision.

The application server will now terminate.`;
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(errorMessage);
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // Throw an error to ensure the server process stops and logs this critical failure.
  throw new Error(errorMessage.trim().split('\n')[1]); // Throw a shorter summary for the error object
}


export const ai = genkit({
  plugins: [googleAI(googleAIPluginOptions)],
  model: 'googleai/gemini-2.0-flash', // Default model
});

console.log('[Genkit Init] Genkit initialized successfully with Google AI plugin.');

import { GoogleGenAI } from '@google/genai';

export async function testGeminiAPI() {
  console.log("%c[Gemini API Diagnostic] Starting test...", "color: #059669; font-weight: bold;");
  
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    const msg = "❌ FAILED: GEMINI_API_KEY is missing or undefined in environment variables.";
    console.error("%c" + msg, "color: #dc2626; font-weight: bold;");
    return { success: false, reason: "Missing API Key" };
  }

  console.log(`%c[Gemini API Diagnostic] API Key found (Length: ${apiKey.length})`, "color: #2563eb;");

  try {
    console.log("%c[Gemini API Diagnostic] Calling Gemini 3 Flash directly...", "color: #2563eb;");
    
    const startTime = Date.now();
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: 'Reply with exactly one word: "pong".',
    });
    const duration = Date.now() - startTime;

    if (response.text) {
      const msg = `✅ SUCCESS: API is working perfectly! (Latency: ${duration}ms)`;
      console.log("%c" + msg, "color: #16a34a; font-weight: bold; font-size: 14px;");
      console.log(`Model replied: "${response.text.trim()}"`);
      return { success: true, message: msg, latency: duration };
    } else {
      const msg = `❌ FAILED: API returned an empty response.`;
      console.error("%c" + msg, "color: #dc2626; font-weight: bold; font-size: 14px;");
      return { success: false, reason: msg };
    }
  } catch (error: any) {
    console.error("%c❌ FAILED: API Request threw an error.", "color: #dc2626; font-weight: bold; font-size: 14px;");
    console.error("Raw Error Object:", error);
    
    let reason = error.message || String(error);
    
    // Provide human-readable explanations for common HTTP status codes
    if (error.status === 400) {
      reason = "400 Bad Request: Your request format, schema, or parameters are invalid.";
    } else if (error.status === 401) {
      reason = "401 Unauthorized: Your API Key is invalid, expired, or not being passed correctly.";
    } else if (error.status === 403) {
      reason = "403 Forbidden: Your API Key doesn't have permission to access this model, or there is a billing issue.";
    } else if (error.status === 404) {
      reason = "404 Not Found: The specified model ('gemini-3-flash-preview') does not exist or is unavailable.";
    } else if (error.status === 429) {
      reason = "429 Too Many Requests: You have exceeded your rate limit. Please wait a moment and try again.";
    } else if (error.status >= 500) {
      reason = `${error.status} Server Error: Google's API servers are currently experiencing issues.`;
    } else if (error.message && error.message.includes('fetch')) {
      reason = "Network Error: Could not reach the API. Check your internet connection or VPN/Proxy settings.";
    }

    console.error(`%cDiagnosis: ${reason}`, "color: #dc2626; font-weight: bold;");
    return { success: false, reason, rawError: error };
  }
}

// Expose to global window object for easy access in the browser console
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'testGeminiAPI', {
    value: testGeminiAPI,
    writable: true,
    configurable: true
  });
  console.log("%c[Diagnostic Tool] You can now run `await window.testGeminiAPI()` in the console.", "color: #8b5cf6; font-style: italic;");
}

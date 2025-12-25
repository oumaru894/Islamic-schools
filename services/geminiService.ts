import { GoogleGenAI } from "@google/genai";
import { fetchAllSchools } from "./api";
import { School } from "../types";

// Initialize Gemini
// NOTE: We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Cache for school data to avoid repeated API calls
let cachedSchools: School[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get schools data from backend API with caching
 */
async function getSchoolsData(): Promise<School[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedSchools && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSchools;
  }

  try {
    // Fetch from backend API
    cachedSchools = await fetchAllSchools();
    lastFetchTime = now;
    return cachedSchools;
  } catch (error) {
    console.error("Error fetching schools for Gemini:", error);
    // Return cached data if available, even if stale
    if (cachedSchools) {
      return cachedSchools;
    }
    // If no cache and fetch failed, return empty array
    return [];
  }
}

/**
 * Build system instruction with current school data from backend
 */
async function buildSystemInstruction(): Promise<string> {
  const schools = await getSchoolsData();
  
  const schoolsSummary = schools.map(s => ({
    name: s.name,
    type: s.type,
    county: s.county,
    location: s.location,
    features: s.features,
    rating: s.rating,
    students: s.students,
    founded: s.founded
  }));

  return `
You are the "Islamic Schools Assistant", an AI guide for the "Liberia Islamic Schools Directory" platform.
Your goal is to help Muslim parents, students, and community members find the best Islamic education in Liberia.

Here is the current database of schools you have access to (JSON format):
${JSON.stringify(schoolsSummary, null, 2)}

Rules:
1. When asked about schools, query the data provided above.
2. If a user asks for a recommendation, provide one based on the features (e.g., Tahfeez, Arabic classes), location, or type they mention.
3. Be helpful, polite, and respectful of Islamic culture and Liberian traditions. Use phrases like "Insha'Allah" or "Masha'Allah" where appropriate but keep it professional.
4. If asked to write content (e.g., an 'About Us' page), use a professional, inspiring tone suitable for an Islamic educational institution, emphasizing moral values, academic excellence, and faith.
5. Keep answers concise but informative.
6. If the answer isn't in the data, suggest general advice about Islamic education in Liberia but admit you don't have that specific school in your current database.
7. Always provide accurate information based on the database provided. The database is updated in real-time from the backend.
`;
}

export const getGeminiResponse = async (userPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment.";
  }

  try {
    // Build system instruction with current school data from backend
    const systemInstruction = await buildSystemInstruction();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};

export const generateSchoolDescription = async (schoolName: string, keywords: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing.";
  }
  
  try {
    // Fetch school data from backend to get context
    const schools = await getSchoolsData();
    const school = schools.find(s => s.name.toLowerCase().includes(schoolName.toLowerCase()));
    
    // Build context about the school if found
    let schoolContext = '';
    if (school) {
      schoolContext = `
Here is information about this school from the database:
- Name: ${school.name}
- Type: ${school.type}
- Location: ${school.location}, ${school.county}
- Current Description: ${school.description}
- Features: ${school.features.join(', ')}
- Founded: ${school.founded}
- Students: ${school.students}
- Rating: ${school.rating}/5
`;
    }
    
    const prompt = `Write a compelling 2-paragraph 'About Us' description for an Islamic school named "${schoolName}". 
${schoolContext ? schoolContext : ''}
Focus on these keywords/themes: ${keywords}. 
The tone should be professional, welcoming, and rooted in Islamic values.
${school ? 'Use the existing information as context but enhance and expand it naturally.' : ''}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Content Gen Error:", error);
    return "Error generating description.";
  }
};

/**
 * Clear the schools cache (useful for testing or when data updates)
 */
export const clearSchoolsCache = () => {
  cachedSchools = null;
  lastFetchTime = 0;
};
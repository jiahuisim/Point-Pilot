import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Program, ProgramType } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for parsing raw text into structured program data
const programParsingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    programName: { type: Type.STRING, description: "Name of the specific program (e.g., Sapphire Reserve, SkyMiles)" },
    provider: { type: Type.STRING, description: "The company providing the points (e.g., Chase, Amex, Delta)" },
    balance: { type: Type.NUMBER, description: "Current point or mile balance" },
    currencyName: { type: Type.STRING, description: "Name of the currency (e.g. Points, Miles)" },
    expirationDate: { type: Type.STRING, description: "Expiration date of the POINTS in YYYY-MM-DD format. Null if no expiration." },
    type: { 
      type: Type.STRING, 
      enum: [ProgramType.AIRLINE, ProgramType.HOTEL, ProgramType.CREDIT_CARD, ProgramType.OTHER],
      description: "Category of the program"
    },
    benefits: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { 
             type: Type.STRING, 
             enum: ["Generic", "Free Night", "Companion Fare", "Travel Credit", "Dining Credit", "Ride Credit", "Lounge Access", "Insurance", "Status"],
             description: "Categorize the benefit. Detect 'Free Night' for hotels, 'Companion Fare' for airlines."
          },
          count: { type: Type.NUMBER, description: "Quantity, e.g. 2 passes, 1 certificate. Default to 1." },
          expirationDate: { type: Type.STRING, description: "Specific expiration for this benefit/certificate in YYYY-MM-DD format." }
        },
        required: ["title", "type"]
      },
      description: "List of benefits, credits, or certificates."
    }
  },
  required: ["programName", "provider", "balance", "type", "currencyName"]
};

export const parseProgramFromText = async (text: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract loyalty program or credit card details from the following text. 
      Look for specific high-value benefits like "Free Night Awards", "Companion Fares", or "Travel Credits".
      If a benefit has a specific expiration date mentioned (e.g. "companion fare expires 12/31/2024"), extract it.
      
      Text to parse:
      "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: programParsingSchema
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw new Error("Failed to parse program data.");
  }
};

export const getPortfolioAdvice = async (query: string, programs: Program[]): Promise<string> => {
  // Simplify program data to save tokens and focus on relevant info
  const contextData = programs.map(p => ({
    program: `${p.provider} ${p.name}`,
    type: p.type,
    balance: `${p.balance} ${p.currencyName}`,
    expiration: p.expirationDate || "Never",
    benefits: p.benefits.map(b => `${b.count || 1}x ${b.title} (${b.type}) ${b.expirationDate ? `expires ${b.expirationDate}` : ''}`).join(", ")
  }));

  const systemInstruction = `You are an expert Points & Miles Advisor. 
  You have access to the user's current portfolio of loyalty programs and credit cards.
  
  User Portfolio Summary:
  ${JSON.stringify(contextData, null, 2)}
  
  Analyze the user's portfolio to answer their questions. 
  Be specific, referencing their actual balances and benefits.
  If suggesting a redemption, estimate value based on standard valuations (e.g. 1.5 cents per point).
  Keep answers concise and actionable. Format with Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I couldn't generate advice at this time.";
  } catch (error) {
    console.error("Gemini advice error:", error);
    return "Sorry, I encountered an error analyzing your portfolio.";
  }
};
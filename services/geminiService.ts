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
    expirationDate: { type: Type.STRING, description: "Expiration date in YYYY-MM-DD format, or null if not found or no expiration." },
    type: { 
      type: Type.STRING, 
      enum: [ProgramType.AIRLINE, ProgramType.HOTEL, ProgramType.CREDIT_CARD, ProgramType.OTHER],
      description: "Category of the program"
    },
    benefits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of benefits mentioned or generally known for this card/program level."
    }
  },
  required: ["programName", "provider", "balance", "type", "currencyName"]
};

export const parseProgramFromText = async (text: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract loyalty program or credit card details from the following text. 
      If specific benefits aren't listed but the card name is known (e.g. "Amex Platinum"), 
      infer top 3 common benefits.
      
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
    benefits: p.benefits.map(b => b.title).join(", ")
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

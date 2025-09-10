// frontend/src/utils/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateMessageTemplates = async (
  campaignName: string,
  segmentName: string
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Generate 3 different message templates for a marketing campaign.
      Campaign name: "${campaignName}"
      Target segment: "${segmentName}"

      Requirements:
      1. Each template should be personalized and engaging
      2. Include placeholders for customer name where appropriate
      3. Vary the tone and style between templates
      4. Keep messages concise (1-2 sentences max)
      5. Format response as a JSON array with "templates" key containing the 3 templates

      Example format:
      {
        "templates": [
          "Template 1 text with {name} placeholder",
          "Template 2 text with different style",
          "Template 3 text with another approach"
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(text);
      if (parsed.templates && Array.isArray(parsed.templates)) {
        return parsed.templates;
      }
    } catch (e) {
      // If parsing fails, try to extract templates from plain text
      const templateMatch = text.match(/["'](.*?)(?:{name}|$)/g);
      if (templateMatch) {
        return templateMatch.map((t) => t.trim().replace(/["']/g, ""));
      }
    }

    // Fallback to simple split if all else fails
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3);
  } catch (error) {
    console.error("Error generating templates:", error);
    // Return default templates if API fails
    return [
      `Hi {name}, check out our exciting ${campaignName} campaign!`,
      `{name}, don't miss our special ${campaignName} offer just for you!`,
      `Exclusive ${campaignName} deal for valued customers like you, {name}!`,
    ];
  }
};

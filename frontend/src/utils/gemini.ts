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
      6. The templates should be emphasized with user attracting capabilities to pull them towards this marketing campaign.

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

    try {
      const parsed = JSON.parse(text);
      if (parsed.templates && Array.isArray(parsed.templates)) {
        return parsed.templates;
      }
    } catch (e) {
      const templateMatch = text.match(/["'](.*?)(?:{name}|$)/g);
      if (templateMatch) {
        return templateMatch.map((t) => t.trim().replace(/["']/g, ""));
      }
    }

    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3);
  } catch (error) {
    console.error("Error generating templates:", error);
    return [
      `Hi {name}, check out our exciting ${campaignName} campaign!`,
      `{name}, don't miss our special ${campaignName} offer just for you!`,
      `Exclusive ${campaignName} deal for valued customers like you, {name}!`,
    ];
  }
};

export const convertNaturalLanguageToSegmentRules = async (
  naturalLanguage: string
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Convert this natural language description to segment rules for an e-commerce platform:

      "${naturalLanguage}"

      Available fields:
      - totalSpending: customer's total spending amount (use INR currency symbol)
      - countVisits: number of visits
      - lastActiveAt: date of last activity (use relative time like "6 months ago")

      Available operators: >, <, >=, <=, =, !=

      Return ONLY a JSON array of objects with this structure:
      {
        field: "fieldName",
        operator: "operator",
        value: "value",
        connector?: "AND"|"OR"
      }

      Examples:
      "People who spent more than ₹5000 and visited at least 3 times" would return:
      [
        { "field": "totalSpending", "operator": ">", "value": "5000" },
        { "field": "countVisits", "operator": ">=", "value": "3", "connector": "AND" }
      ]

      "Customers inactive for 6 months or spent less than ₹1000" would return:
      [
        { "field": "lastActiveAt", "operator": "<", "value": "6 months ago", "connector": "OR" },
        { "field": "totalSpending", "operator": "<", "value": "1000" }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonText = text.replace(/```json|```/g, "").trim();
      const parsedRules = JSON.parse(jsonText);

      if (Array.isArray(parsedRules)) {
        return parsedRules;
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      throw new Error("Could not parse AI response");
    }

    throw new Error("Invalid response format from AI");
  } catch (error) {
    console.error("Error generating rules from natural language:", error);
    throw error;
  }
};

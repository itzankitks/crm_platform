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

    // Calculate date offsets for common relative time expressions
    const now = new Date();
    const dateExamples = {
      "3 weeks ago": new Date(now.setDate(now.getDate() - 21))
        .toISOString()
        .split("T")[0],
      "1 month ago": new Date(now.setDate(now.getDate() - 30))
        .toISOString()
        .split("T")[0],
      "6 months ago": new Date(now.setMonth(now.getMonth() - 6))
        .toISOString()
        .split("T")[0],
      "1 year ago": new Date(now.setFullYear(now.getFullYear() - 1))
        .toISOString()
        .split("T")[0],
    };

    const prompt = `
      Convert this natural language description to segment rules for an e-commerce platform:

      "${naturalLanguage}"

      Available fields:
      - totalSpending: customer's total spending amount (use numbers only, no currency symbols)
      - countVisits: number of visits (use numbers only)
      - lastActiveAt: date of last activity (use YYYY-MM-DD format)

      Available operators: >, <, >=, <=, =, !=

      Important requirements:
      1. For time expressions like "3 weeks ago", convert to actual dates using today's date (${
        new Date().toISOString().split("T")[0]
      }) as reference
      2. Always include connectors (AND/OR) between rules
      3. Return ONLY a JSON array with proper connectors between rules

      Example conversions:
      - "3 weeks ago" → "${dateExamples["3 weeks ago"]}"
      - "1 month ago" → "${dateExamples["1 month ago"]}"
      - "6 months ago" → "${dateExamples["6 months ago"]}"

      Return ONLY a JSON array of objects with this structure:
      [
        {
          field: "fieldName",
          operator: "operator",
          value: "value",
          connector?: "AND"|"OR"
        }
      ]

      Example response for "People who spent more than 2000 but haven't visited in last 3 weeks":
      [
        {
          "field": "totalSpending",
          "operator": ">",
          "value": "2000",
          "connector": "AND"
        },
        {
          "field": "lastActiveAt",
          "operator": "<",
          "value": "${dateExamples["3 weeks ago"]}"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      // Clean up the response text
      const jsonText = text.replace(/```json|```/g, "").trim();
      const parsedRules = JSON.parse(jsonText);

      if (Array.isArray(parsedRules)) {
        // Post-process to convert relative dates to actual dates
        const processedRules = parsedRules.map((rule) => {
          if (rule.field === "lastActiveAt") {
            // Check if value is a relative time expression
            const relativeTimeMatch = rule.value.match(
              /(\d+)\s*(week|month|year)s?\s*ago/i
            );
            if (relativeTimeMatch) {
              const amount = parseInt(relativeTimeMatch[1]);
              const unit = relativeTimeMatch[2];

              const date = new Date();
              if (unit === "week") {
                date.setDate(date.getDate() - amount * 7);
              } else if (unit === "month") {
                date.setMonth(date.getMonth() - amount);
              } else if (unit === "year") {
                date.setFullYear(date.getFullYear() - amount);
              }

              return {
                ...rule,
                value: date.toISOString().split("T")[0],
              };
            }
          }
          return rule;
        });

        return processedRules;
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

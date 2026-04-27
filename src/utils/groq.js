import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "YOUR_GROQ_API_KEY",
  dangerouslyAllowBrowser: true // For hackathon demo purposes
});

export const getVolunteerRecommendations = async (needDetails, availableVolunteers) => {
  const prompt = `
    You are an AI Volunteer Matching assistant for the Impact Resource Nexus NGO platform.
    
    COMMUNITY NEED:
    ${JSON.stringify(needDetails, null, 2)}
    
    AVAILABLE VOLUNTEERS:
    ${JSON.stringify(availableVolunteers, null, 2)}
    
    TASK:
    Analyze the need and the volunteers. Find the best matches based on skills, location, and urgency.
    
    STRICT RULE:
    Return ONLY valid JSON. No text before or after.
    
    JSON FORMAT:
    {
      "recommended_volunteers": [
        {
          "volunteerId": "ID_HERE",
          "name": "NAME_HERE",
          "match_score": 0-100,
          "confidence": "Low/Medium/High",
          "reason": "BRIEF_EXPLANATION"
        }
      ]
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw error;
  }
};

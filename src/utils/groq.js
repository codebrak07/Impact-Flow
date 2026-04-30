import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // For frontend demo purposes
});

export const getVolunteerRecommendations = async (needDetails, availableVolunteers) => {
  const prompt = `
    You are an advanced AI Volunteer Matching assistant for "ImpactFlow" (Impact Resource Nexus), an NGO disaster response and community resource management platform.
    
    CONTEXT:
    The platform connects verified volunteers with urgent community needs (Medical, Food, Shelter, Water & Sanitation, Education). 
    Volunteers have profiles detailing their location, travel radius, availability, specialized skills, and vehicle access.
    Needs have urgency levels (Critical, High, Medium, Low), location, and number of people affected.

    COMMUNITY NEED:
    ${JSON.stringify(needDetails, null, 2)}
    
    AVAILABLE VOLUNTEERS:
    ${JSON.stringify(availableVolunteers, null, 2)}
    
    TASK:
    Analyze the community need and the pool of available volunteers. 
    Calculate a match score (0-100) for each volunteer based on:
    1. Skill relevance to the need category.
    2. Proximity (if location matches or is within travel radius).
    3. Vehicle access (crucial for logistics and critical urgency).
    4. Availability matching the urgency level.
    
    Return ONLY valid JSON. No markdown, no text before or after.
    
    JSON FORMAT:
    {
      "recommended_volunteers": [
        {
          "volunteerId": "ID_HERE",
          "name": "NAME_HERE",
          "match_score": 85,
          "confidence": "High/Medium/Low",
          "reason": "Explain exactly why this volunteer is a good match based on their skills, location, and vehicle access."
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
      model: "llama-3.1-70b-versatile", // Using 70b as the highest capacity text model
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw error;
  }
};

export const extractNeedFromImage = async (base64Image) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an AI assistant for an NGO. Extract the following information from this survey form or field photo: 1. Community Name, 2. Need Category (Medical, Food, Shelter, Water & Sanitation, or Education), 3. People Affected (number), 4. Urgency Level (Critical, High, Medium, or Low). Return ONLY valid JSON with keys: communityName, needCategory, peopleAffected (integer), urgencyLevel."
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      model: "llama-3.2-90b-vision-preview", // 90b vision model
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Groq Vision AI Error:", error);
    throw error;
  }
};

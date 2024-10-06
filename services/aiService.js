import axios from "axios";

export const reviewPR = async (prData) => {
  try {
    const PROMPT = `Review the following Pull Request:\n\nTitle: ${prData.title}\n\nDescription: ${prData.body}\n\nChanged Files: ${prData.changed_files}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-flash-1.5-8b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: PROMPT,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error reviewing PR:", error);
    throw error;
  }
};

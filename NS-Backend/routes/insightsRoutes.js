const express = require("express");
const axios = require("axios");

const router = express.Router();

function getOutputText(responseData) {
  if (responseData?.output_text) {
    return responseData.output_text;
  }

  const outputContent = responseData?.output?.flatMap((item) => item.content || []) || [];
  const textParts = outputContent
    .map((content) => content.text || content.value || "")
    .filter(Boolean);

  return textParts.join("\n").trim();
}

router.post("/", async (req, res) => {
  const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";

  if (!input) {
    return res.status(400).json({ message: "Input is required." });
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-mini";
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const bearerToken = process.env.AZURE_OPENAI_BEARER_TOKEN;

  if (!endpoint || (!apiKey && !bearerToken)) {
    return res.status(500).json({
      message: "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY or AZURE_OPENAI_BEARER_TOKEN.",
    });
  }

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["api-key"] = apiKey;
    } else {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const normalizedEndpoint = endpoint.replace(/\/$/, "");
    const url = `${normalizedEndpoint}/responses`;

    const response = await axios.post(
      url,
      {
        model: deploymentName,
        input,
      },
      { headers }
    );

    const answer = getOutputText(response.data);

    return res.json({
      answer: answer || "I received a response, but could not read the answer text.",
      raw: process.env.NODE_ENV === "development" ? response.data : undefined,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.response?.data?.message || error.message;

    return res.status(status).json({ message });
  }
});

module.exports = router;

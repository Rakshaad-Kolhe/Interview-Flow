"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInterviewQuestions = void 0;
const aiValidation_1 = require("../utils/aiValidation");
const LLM_API_KEY = process.env.LLM_API_KEY || 'your_llm_api_key_here';
const generateInterviewQuestions = async (role, difficulty, count) => {
    // Demonstration of a mock AI generation to allow the interview UI to function properly locally
    // even without a real OpenAI key. We simulate network latency as well.
    if (LLM_API_KEY === 'your_llm_api_key_here') {
        return new Promise((resolve) => {
            setTimeout(() => {
                const dummyQuestions = Array.from({ length: count }).map((_, i) => ({
                    question: `Can you explain a complex concept related to ${role} (Question ${i + 1})?`,
                    category: 'Technical',
                    difficulty,
                }));
                resolve({ questions: dummyQuestions });
            }, 2000); // 2 second delay to demonstrate loading states on frontend
        });
    }
    // --- Actual Implementation Example ---
    const prompt = `Generate ${count} ${difficulty} interview questions for a ${role} position. Output strictly in JSON format with a "questions" array containing objects with "question", "category", and "difficulty".`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${LLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`LLM API returned status ${response.status}`);
        }
        const data = await response.json();
        const parsedData = JSON.parse(data.choices[0].message.content);
        // Validate the LLM output against our expected schema so we never blindly trust it
        const validatedData = aiValidation_1.generateQuestionsOutputSchema.parse(parsedData);
        return validatedData;
    }
    catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('LLM request timed out');
        }
        // Log the actual error safely server-side
        console.error('LLM Service Error:', error.message);
        throw new Error('Failed to generate questions securely');
    }
};
exports.generateInterviewQuestions = generateInterviewQuestions;
//# sourceMappingURL=ai.js.map
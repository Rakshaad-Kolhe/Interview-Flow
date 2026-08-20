export const getProgrammingChallenge = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming?type=single&safe-mode', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Third-party API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      challengeText: data.joke,
    };
  } catch (error: any) {
    console.error('Third-party API Error:', error.message);
    throw new Error('Failed to fetch external challenge');
  }
};

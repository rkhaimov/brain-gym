import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { createSearcher } from './createSearcher';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/multi-agent/router
async function main() {
  const searcher = await createSearcher(
    [
      // Rosters
      'New York Liberty 2024 roster: Breanna Stewart, Sabrina Ionescu, Jonquel Jones, Courtney Vandersloot.',
      "Las Vegas Aces 2024 roster: A'ja Wilson, Kelsey Plum, Jackie Young, Chelsea Gray.",
      'Indiana Fever 2024 roster: Caitlin Clark, Aliyah Boston, Kelsey Mitchell, NaLyssa Smith.',
      // Game results
      '2024 WNBA Finals: New York Liberty defeated Minnesota Lynx 3-2 to win the championship.',
      'June 15, 2024: Indiana Fever 85, Chicago Sky 79. Caitlin Clark had 23 points and 8 assists.',
      "August 20, 2024: Las Vegas Aces 92, Phoenix Mercury 84. A'ja Wilson scored 35 points.",
      // Player stats
      "A'ja Wilson 2024 season stats: 26.9 PPG, 11.9 RPG, 2.6 BPG. Won MVP award.",
      'Caitlin Clark 2024 rookie stats: 19.2 PPG, 8.4 APG, 5.7 RPG. Won Rookie of the Year.',
      'Breanna Stewart 2024 stats: 20.4 PPG, 8.5 RPG, 3.5 APG.',
    ],
    { k: 3 },
  );

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const question = 'Who won the 2024 WNBA Championship?';

  const rewrite = await model
    .withStructuredOutput(z.object({ query: z.string() }))
    .invoke([
      {
        role: 'system',
        content: `Rewrite this query to retrieve relevant WNBA information.
        The knowledge base contains: team rosters, game results with scores, and player statistics (PPG, RPG, APG).
      Focus on specific player names, team names, or stat categories mentioned.`,
      },
      {
        role: 'human',
        content: question,
      },
    ]);

  const context = await searcher.search(rewrite.query);

  const response = await model.invoke([
    {
      role: 'human',
      content: `Context:\n${context.join('\n\n')}\n\nQuestion: ${question}`,
    },
  ]);

  console.log(response.text);
}

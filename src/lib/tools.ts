import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { DynamicTool, DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

if (import.meta.env.VITE_SERPAPI_API_KEY == undefined) {
	throw console.warn('SERPAPI_API_KEY is undefined');
}

function getTools() {
	const tools = [
		new DynamicTool({
			//for testing remove when merge
			name: 'FOO',
			description: 'call this to get the value of foo. input should be an empty string.',
			func: async () => 'baz'
		}),
		new SerpAPI(import.meta.env.VITE_SERPAPI_API_KEY, {
			location: 'Austin,Texas,United States',
			hl: 'en',
			gl: 'us'
		}),
		new DynamicStructuredTool({
			//for testing remove when merge
			name: 'random-number-generator',
			description: 'generates a random number between two input numbers',
			schema: z.object({
				low: z.number().describe('The lower bound of the generated number'),
				high: z.number().describe('The upper bound of the generated number')
			}),
			func: async ({ low, high }) => (Math.random() * (high - low) + low).toString() // Outputs still must be strings
		}),
		new Calculator()
	];
	return tools;
}

export { getTools };

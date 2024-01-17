import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { DynamicTool } from 'langchain/tools';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import type { OpenAI } from 'langchain/llms/openai';
import { SUMMARY } from './prompt';

function getTools(
	qdrantClient: QdrantClient,
	collection_name: string,
	embeddings: OpenAIEmbeddings,
	summaryBot: OpenAI
) {
	if (import.meta.env.VITE_SERPAPI_API_KEY == undefined) {
		throw console.warn('SERPAPI_API_KEY is undefined');
	}
	const tools = [
		new DynamicTool({
			name: 'FRC971',
			description:
				'Useful to get information about The robotics team FRC971. Input should be a search query. The same search query will return the same result',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search('FRC971', {
					vector: embedding,
					limit: 3
				}); //strResponse bad name
				const strResponse = response
					.map((response) => response.payload!.pageContent as string)
					.join('\n');
				console.log(strResponse)
				const prompt = SUMMARY.replace('{question}', query).replace('{text}', strResponse);
				return (await summaryBot.call(prompt))
			}
		}),
		new DynamicTool({
			//for testing remove when merge
			name: 'FIRSTAwards',
			description:
				'Useful to get information about FIRST Awards. Input should be a search query. The same search query will return the same result',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search('FIRSTAwards', {
					vector: embedding,
					limit: 3
				}); //strResponse bad name
				const strResponse = response
					.map((response) => response.payload!.pageContent as string)
					.join('\n');
				const prompt = SUMMARY.replace('{question}', query).replace('{text}', strResponse);
				return (await summaryBot.call(prompt))
			}
		}),
		// new SerpAPI(import.meta.env.VITE_SERPAPI_API_KEY, {
		// 	location: 'Austin,Texas,United States',
		// 	hl: 'en',
		// 	gl: 'us'
		// }),
		new Calculator()
	];
	return tools;
}

export { getTools };

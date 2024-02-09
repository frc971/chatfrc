import { DynamicTool } from '@langchain/core/tools';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import type { OpenAI } from '@langchain/openai';
import { SUMMARY } from './prompt';

function getTools(
	qdrantClient: QdrantClient,
	collection_name: string,
	embeddings: OpenAIEmbeddings,
	summaryBot: OpenAI,
	do_summaryBot: boolean
) {
	const tools = [
		new DynamicTool({
			name: 'FRC971',
			description:
				'Useful to get information about The robotics team FRC971. Input should be a search query. Do not use the same search query twice',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search('FRC971', {
					vector: embedding,
					limit: 3
				});
				const strResponse = response
					.map((response) => response.payload!.pageContent as string)
					.join('\n');
				const prompt = SUMMARY.replace('{question}', query).replace('{text}', strResponse);
				if (do_summaryBot) return await summaryBot.call(prompt);
				return strResponse;
			}
		}),
		new DynamicTool({
			name: 'FIRSTAwards',
			description:
				'Useful to get information about FIRST Awards. Input should be a search query. The same search query will return the same result',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search('FIRSTAwards', {
					vector: embedding,
					limit: 3
				});
				const strResponse = response
					.map((response) => response.payload!.pageContent as string)
					.join('\n');
				const prompt = SUMMARY.replace('{question}', query).replace('{text}', strResponse);
				return await summaryBot.call(prompt);
			}
		})
	];
	return tools;
}

export { getTools };

import { DynamicTool } from '@langchain/core/tools';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import type { OpenAI } from '@langchain/openai';
import { Calculator } from 'langchain/tools/calculator';
import { SUMMARY } from './prompt';

function getTools(
	qdrantClient: QdrantClient,
	collection_name: string,
	embeddings: OpenAIEmbeddings,
	summaryBot: OpenAI,
	do_summaryBot: boolean
) {
	const tools = [
		new Calculator(),
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
				if (do_summaryBot) return await summaryBot.invoke(prompt);
				return strResponse;
			}
		}),
		new DynamicTool({
			name: 'FIRSTAwards',
			description: 'A database of all the FIRST awards.',
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
				if (do_summaryBot) return await summaryBot.invoke(prompt);
				return strResponse;
			}
		}),
		new DynamicTool({
			name: 'FIRSTDocuments',
			description:
				'Information about the FIRST competition. Includes forms, procedure and documents about the FIRST competition',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search('FIRSTDocuments', {
					vector: embedding,
					limit: 3
				});
				const strResponse = response
					.map((response) => response.payload!.pageContent as string)
					.join('\n');
				const prompt = SUMMARY.replace('{question}', query).replace('{text}', strResponse);
				if (do_summaryBot) return await summaryBot.invoke(prompt);
				return strResponse;
			}
		})
	];
	return tools;
}

export { getTools };

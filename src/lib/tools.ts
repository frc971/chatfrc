import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { DynamicTool } from 'langchain/tools';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

function getTools(
	qdrantClient: QdrantClient,
	collection_name: string,
	embeddings: OpenAIEmbeddings
) {
	if (import.meta.env.VITE_SERPAPI_API_KEY == undefined) {
		import.meta.env.VITE_SERPAPI_API_KEY = 'no_key';
		throw console.warn('SERPAPI_API_KEY is undefined');
	}
	const tools = [
		new DynamicTool({
			//for testing remove when merge
			name: 'FRC971Database',
			description: 'useful to get information about FRC971. Input should be a search query.',
			func: async (query: string) => {
				const embedding = await embeddings.embedQuery(query);
				const response = await qdrantClient.search(collection_name, {
					vector: embedding,
					limit: 1
				});
				const output: string = response[0].payload!.pageContent as string;
				return output;
			}
		}),
		new SerpAPI(import.meta.env.VITE_SERPAPI_API_KEY, {
			location: 'Austin,Texas,United States',
			hl: 'en',
			gl: 'us'
		}),
		new Calculator()
	];
	return tools;
}

export { getTools };

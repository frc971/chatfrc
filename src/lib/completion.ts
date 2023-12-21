import { Document } from 'langchain/document';

import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SystemMessage, BaseMessage, AIMessage, HumanMessage } from 'langchain/schema';

import { ChatHistoryType, type ChatHistory } from '$lib/history';
import { BytesOutputParser } from 'langchain/schema/output_parser';

import { QdrantClient } from '@qdrant/js-client-rest';

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_COLLECTION = 'default';

export class ChatbotCompletion {
	private model: ChatOpenAI;
	private embeddings_model: OpenAIEmbeddings;

	private qdrant_client: QdrantClient;
	private qdrant_collection: string;

	constructor(
		openai_api_key: string,
		{
			openai_model = DEFAULT_MODEL,
			qdrant_collection = DEFAULT_COLLECTION
		}: {
			openai_model?: string;
			qdrant_collection?: string;
		}
	) {
		this.model = new ChatOpenAI({
			openAIApiKey: openai_api_key,
			temperature: 0.7,
			streaming: true,
			maxTokens: 250,
			modelName: openai_model,
			verbose: true
		});

		this.embeddings_model = new OpenAIEmbeddings({
			openAIApiKey: openai_api_key,
			modelName: 'text-embedding-ada-002'
		});
		this.qdrant_client = new QdrantClient({
			url: 'http://' + (process.env.QDRANT_HOST ?? 'localhost') + ':6333'
		});

		this.qdrant_collection = qdrant_collection;
	}

	/*
        We need to pass with_vector to qdrant to get our response
    */
	private async qdrant_similarity_search(query: string, k: number): Promise<Document[]> {
		const query_embedding = await this.embeddings_model.embedQuery(query);
		const qdrant_results = await this.qdrant_client.search(this.qdrant_collection, {
			vector: query_embedding,
			limit: k,
			with_vector: true
		});

		console.log(qdrant_results);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return qdrant_results.map((result: any) => {
			return new Document({
				pageContent: result.payload.pageContent,
				metadata: result.payload.metadata
			});
		});
	}

	private async get_vector_response(query: string): Promise<string[]> {
		console.log('Retrieving vector response from qdrant...');

		const vector_response = await this.qdrant_similarity_search(query, 2);

		console.log(vector_response);

		console.log('Vector response retreived');

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return vector_response.map((document: Document<Record<string, any>>) => {
			return document.pageContent;
		});
	}

	private generate_history(history: ChatHistory[]): BaseMessage[] {
		return history.map((message: { content: string; type: ChatHistoryType }) => {
			if (message.type == ChatHistoryType.AI) {
				return new AIMessage({ content: message.content });
			} else {
				return new HumanMessage({ content: message.content });
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async query(history: ChatHistory[]): Promise<any> {
		const vector_response = await this.get_vector_response(history[history.length - 1].content);

		const context = vector_response.map((content: string) => {
			return new SystemMessage({ content });
		});

		if (context.length == 0) {
			context.push(
				new SystemMessage({
					content:
						'You dont have data on this content, you may want to respond with "sorry I cannot answer that as I do not have enough information"'
				})
			);
		}

		const chat_history = [
			new SystemMessage({
				content: `You are a kind, professional, understanding, and enthusiastic
                    assistant that is an expert in mechanical, electrical, and software engineering, but most importantly FIRST robotics
                    and helping all levels of frc robotics teams. Avoiding repeating the same information and useless statements.
                    The current date is ${new Date()}.`
			}),
			...context,
			...this.generate_history(history)
		];

		// TODO(max): Add history pruning based on token length

		return await this.model.pipe(new BytesOutputParser()).stream(chat_history);
	}
}

//https://js.langchain.com/docs/modules/agents/how_to/custom_llm_agent
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
	type AgentAction,
	type AgentFinish,
	HumanMessage,
	type InputValues,
	type AgentStep,
	AIMessageChunk
} from 'langchain/schema';
import { QdrantClient } from '@qdrant/js-client-rest';
import { type ChatHistory } from '$lib/history';
import { formatLogToString } from 'langchain/agents/format_scratchpad/log';
import { RunnableSequence } from 'langchain/schema/runnable';
import { AgentExecutor } from 'langchain/agents';
import { SYSTEM, HISTORY, SUFFIX } from './prompt';
import { getTools } from './tools';
import { colors } from './colors';
import fs from 'fs';
import { OpenAI } from 'langchain/llms/openai';

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_COLLECTION = 'default';
export class ChatbotCompletion {
	private embeddings_model: OpenAIEmbeddings;
	private executor: AgentExecutor | undefined;
	private openai_api_key: string;
	private model_name;
	private verbose: boolean;
	private qdrantClient: QdrantClient;
	private collection_name: string;
	private history: ChatHistory[];
	private do_history: boolean;
	private generate_data: boolean;
	private chain: string[];
	private summaryBot: OpenAI;
	private do_summaryBot: boolean;

	constructor(
		openai_api_key: string,
		{
			openai_model = DEFAULT_MODEL,
			collection_name = DEFAULT_COLLECTION,
			verbose = false,
			do_history = true,
			generate_data = false,
			do_summaryBot = true
		}: {
			openai_model?: string;
			collection_name?: string;
			verbose?: boolean;
			do_history?: boolean;
			generate_data?: boolean;
			do_summaryBot?: boolean;
		}
	) {
		this.verbose = verbose;
		this.model_name = openai_model;
		this.openai_api_key = openai_api_key;

		this.embeddings_model = new OpenAIEmbeddings({
			openAIApiKey: openai_api_key,
			modelName: 'text-embedding-ada-002'
		});
		this.summaryBot = new OpenAI({
			openAIApiKey: openai_api_key,
			modelName: this.model_name,
			temperature: 0.0
		});
		this.do_summaryBot = do_summaryBot;
		this.qdrantClient = new QdrantClient({ host: 'localhost', port: 6333 });
		this.collection_name = collection_name;
		this.executor = undefined;
		this.history = [];
		this.do_history = do_history;
		this.generate_data = generate_data;
		this.chain = [];
		if (openai_api_key == undefined) {
			throw console.warn('OPENAI_API_KEY is undefined');
		}
	}

	public async setup() {
		console.log(colors.fg.cyan, 'Model name: ' + this.model_name, colors.style.reset);
		console.log('\n');
		const tools = getTools(
			this.qdrantClient,
			this.collection_name,
			this.embeddings_model,
			this.summaryBot,
			this.do_summaryBot
		);
		const model = new ChatOpenAI({
			openAIApiKey: this.openai_api_key,
			modelName: this.model_name,
			temperature: 0.0,
			stop: ['\nObservation']
		});
		const runnable = RunnableSequence.from([
			{
				input: (values: InputValues) => {
					return values.input;
				},
				intermediate_steps: (values: InputValues) => {
					return values.steps;
				}
			},
			this.formatMessages,
			model,
			this.customOutputParser.bind(this)
		]);
		const executor = new AgentExecutor({
			agent: runnable,
			tools: tools
		});
		this.executor = executor;
	}
	private formatMessages = async (values: InputValues) => {
		if (this.history.length != 0) this.history.pop();
		const history =
			this.history
				.map((input: { type: string; content: string }) => {
					return input.type + ': ' + input.content;
				})
				.join('\n') + '\n';
		const tools = getTools(
			this.qdrantClient,
			this.collection_name,
			this.embeddings_model,
			this.summaryBot,
			this.do_summaryBot
		); //to do seperate function for this
		const intermediateSteps = values.intermediate_steps
			? (values.intermediate_steps as Array<AgentStep>)
			: [];
		const agentScratchpad = formatLogToString(intermediateSteps);
		let toolString = '';
		let toolNames = '';
		for (let i = 0; i < tools.length; i++) {
			toolString += '\n' + tools[i].name + ': ' + tools[i].description;
			toolNames += tools[i].name + ', ';
		}
		toolNames = toolNames.slice(0, -1);
		toolNames = toolNames.slice(0, -1);
		toolString += '\n\n';
		const system = SYSTEM.replace('{tool_names}', toolNames).replace('{tools}', toolString);

		const formatted = [
			system,
			HISTORY,
			history,
			SUFFIX.replace('{input}', values.input),
			agentScratchpad
		].join('');
		if (this.verbose) {
			console.log(colors.fg.green, 'Model prompt: ', colors.style.reset);
			console.log(colors.fg.blue, formatted, colors.style.reset);
			console.log('\n');
		}
		this.chain.push(JSON.stringify({ user: formatted }));
		return [new HumanMessage(formatted)];
	};
	private customOutputParser(text: AIMessageChunk): AgentAction | AgentFinish {
		const content = text.lc_kwargs.content;
		if (content.includes('Final Answer:')) {
			if (this.verbose) {
				console.log(colors.fg.red, 'Model response: ', colors.style.reset);
				console.log(colors.fg.yellow, content, colors.style.reset);
			}
			this.chain.push(JSON.stringify({ chatbot: content }));
			const parts = content.split('Final Answer:');
			const input = parts[parts.length - 1].trim();
			const finalAnswers = { output: input };
			return { log: content, returnValues: finalAnswers };
		}
		const match = /Action: (.*)\nAction Input: (.*)/s.exec(content);
		if (match == null) {
			// this.chain.slice(-1, 1);
			this.chain.push(JSON.stringify({ chatbot: content }));
			console.warn('Could not parse output');
			console.warn(content);
			const finalAnswers = { output: content };
			return { log: content, returnValues: finalAnswers };
		}
		if (this.verbose) {
			console.log(colors.fg.red, 'Model response: ', colors.style.reset);
			console.log(colors.fg.yellow, content, colors.style.reset);
		}
		this.chain.push(JSON.stringify({ chatbot: content }));
		return {
			tool: match[1].trim(),
			toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
			log: content
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async query(history: ChatHistory[], input: any): Promise<any> {
		if (this.executor == undefined) {
			console.warn("ChatbotCompletion's setup was not called, calling setup");
			this.setup();
			if (this.executor == undefined) {
				console.warn('setup failed');
				return 'Error';
			}
		}
		if (this.do_history) this.history = history;
		const result = await this.executor.invoke({ input: input });
		if (this.generate_data)
			fs.writeFile('data/logs/' + input + '.jsonl', this.chain.join('\n'), (err) => {
				if (err) throw err;
			});
		return result.output;
	}
}

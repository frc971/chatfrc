//https://js.langchain.com/docs/modules/agents/how_to/custom_llm_agent
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { type AgentAction, type AgentFinish, type AgentStep } from '@langchain/core/agents';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { type InputValues } from '@langchain/core/memory';
import { AIMessageChunk } from '@langchain/core/messages';
import { QdrantClient } from '@qdrant/js-client-rest';
import { type ChatHistory } from '$lib/history';
import { formatLogToString } from 'langchain/agents/format_scratchpad/log';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentExecutor } from 'langchain/agents';
import { GPT3Prompt, GPT4Prompt, GPT4System } from './prompt';
import { getTools } from './tools';
import { colors } from '../colors';
import fs from 'fs';
import { OpenAI } from '@langchain/openai';

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_COLLECTION = 'default';
export class ChatbotCompletion {
	private embeddings_model: OpenAIEmbeddings;
	private executor: AgentExecutor | undefined;
	private openai_api_key: string;
	private model_name;
	private verbose: boolean;
	private qdrant_client: QdrantClient;
	private collection_name: string;
	private history: ChatHistory[];
	private use_history: boolean; //controls if the model see the history of the chat or not
	private generate_data: boolean;
	private chain: string[]; //used for loging the react process; each element is either the chatbot's response or the prompt
	private summaryBot: OpenAI;
	private use_summarybot: boolean;
	private model: ChatOpenAI;

	constructor(
		openai_api_key: string,
		{
			openai_model = DEFAULT_MODEL,
			collection_name = DEFAULT_COLLECTION,
			verbose = false,
			do_history = true,
			generate_data = false,
			use_summarybot = true
		}: {
			openai_model?: string;
			collection_name?: string;
			verbose?: boolean;
			do_history?: boolean;
			generate_data?: boolean;
			use_summarybot?: boolean;
		}
	) {
		this.verbose = verbose;
		this.model_name = openai_model;
		this.openai_api_key = openai_api_key;

		this.embeddings_model = new OpenAIEmbeddings({
			openAIApiKey: openai_api_key,
			modelName: 'text-embedding-3-large'
		});
		this.summaryBot = new OpenAI({
			openAIApiKey: openai_api_key,
			modelName: this.model_name,
			temperature: 0.0
		});
		this.use_summarybot = use_summarybot;
		this.qdrant_client = new QdrantClient({ host: 'localhost', port: 6333 });
		this.collection_name = collection_name;
		this.executor = undefined;
		this.history = [];
		this.use_history = do_history;
		this.generate_data = generate_data;
		this.chain = [];
		if (openai_api_key == undefined) {
			throw console.warn('OPENAI_API_KEY is undefined');
		}
		this.model = new ChatOpenAI({
			openAIApiKey: this.openai_api_key,
			modelName: this.model_name,
			temperature: 0.0,
			stop: ['\nObservation']
		});
	}

	public async setup() {
		console.log(colors.fg.cyan, 'Model name: ' + this.model_name, colors.style.reset);
		console.log('\n');
		const tools = getTools(
			this.qdrant_client,
			this.collection_name,
			this.embeddings_model,
			this.summaryBot,
			this.use_summarybot,
			this.verbose
		);
		const runnable = RunnableSequence.from([
			{
				input: (values: InputValues) => {
					return values.input;
				},
				intermediate_steps: (values: InputValues) => {
					return values.steps;
				}
			},
			this.promptBuilder.bind(this),
			this.model,
			this.customOutputParser.bind(this)
		]);
		const executor = new AgentExecutor({
			agent: runnable,
			tools: tools
		});
		this.executor = executor;
	}
	private async promptBuilder(values: InputValues) {
		`
		Takes in InputValues, which consists of the model's intermedediate steps which includes 
		the output of tools and format it into the prompt for the model. 

		Link to docs: https://js.langchain.com/docs/modules/agents/how_to/custom_llm_agent
		`;
		if (this.history.length != 0) this.history.pop();
		const history =
			this.history
				.map((input: { type: string; content: string }) => {
					return input.type + ': ' + input.content;
				})
				.join('\n') + '\n';
		const tools = getTools(
			this.qdrant_client,
			this.collection_name,
			this.embeddings_model,
			this.summaryBot,
			this.use_summarybot,
			this.verbose
		); //to do seperate function for this
		const intermediate_steps = values.intermediate_steps
			? (values.intermediate_steps as Array<AgentStep>)
			: [];
		const agentScratchpad = formatLogToString(intermediate_steps);
		let toolString = '';
		let toolNames = '';
		for (let i = 0; i < tools.length; i++) {
			toolString += '\n' + tools[i].name + ': ' + tools[i].description;
			toolNames += tools[i].name + ', ';
		}
		toolNames = toolNames.slice(0, -1);
		toolNames = toolNames.slice(0, -1);
		toolString += '\n\n';
		let template = '';
		let system = GPT4System;
		system = system.replace('{tool_names}', toolNames);
		system = system.replace('{tools}', toolString);
		// console.log(system)
		if (this.model_name == 'gpt-4') {
			template = GPT4Prompt;
		} else {
			template = GPT3Prompt;
		}
		template = template.replace('{input}', values.input);
		template = template.replace('{tool_names}', toolNames);
		template = template.replace('{tools}', toolString);
		template = template.replace('{history}', history);
		template = template.replace('{scratchpad}', agentScratchpad);
		if (this.verbose) {
			console.log(colors.fg.white, 'Time: ' + new Date(), colors.style.reset);
			console.log(colors.fg.green, 'Model prompt: ', colors.style.reset);
			console.log(colors.fg.blue, template, colors.style.reset);
			console.log('\n');
		}
		this.chain.push(JSON.stringify({ user: template }));
		const output = [new HumanMessage(template)];
		if (this.model_name == 'gpt-4') output.push(new SystemMessage(system));
		return output;
	}
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
		if (this.use_history) this.history = history;
		const result = await this.executor.invoke({ input: input });
		if (this.generate_data)
			fs.writeFile('data/logs/' + input + '.jsonl', this.chain.join('\n'), (err) => {
				if (err) console.warn('failed to write to logs'); //logs folder probably missing or wrong path
			});
		return result.output;
	}
}

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

import { type ChatHistory } from '$lib/history';
import { formatLogToString } from 'langchain/agents/format_scratchpad/log';
import { RunnableSequence } from 'langchain/schema/runnable';
import { AgentExecutor } from 'langchain/agents';
import { PREFIX, SUFFIX, TOOL_INSTRUCTIONS_TEMPLATE } from './prompt';
import { getTools } from './tools';
import { collapseDocs } from 'langchain/chains/combine_documents/reduce';
import { colors } from './colors';

const DEFAULT_MODEL = 'gpt-3.5-turbo';

export class ChatbotCompletion {
	private model: ChatOpenAI;
	private embeddings_model: OpenAIEmbeddings;
	private executor: AgentExecutor | undefined;
	private openai_api_key: string;
	private model_name;
	private verbose: boolean;

	constructor(
		openai_api_key: string,
		verbose: boolean,
		{
			openai_model = DEFAULT_MODEL
		}: {
			openai_model?: string;
		}
	) {
		this.verbose = verbose;
		this, (this.model_name = DEFAULT_MODEL);
		this.openai_api_key = openai_api_key;
		this.model = new ChatOpenAI({
			openAIApiKey: openai_api_key,
			temperature: 0.0,
			modelName: openai_model,
			verbose: false,
			stop: ['\nObservation']
		});

		this.embeddings_model = new OpenAIEmbeddings({
			openAIApiKey: openai_api_key,
			modelName: 'text-embedding-ada-002'
		});
		this.executor = undefined;
	}

	public async setup() {
		const tools = getTools();
		const llm = new ChatOpenAI({
			modelName: 'gpt-3.5-turbo',
			temperature: 0,
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
			llm,
			this.customOutputParser.bind(this)
		]);
		const executor = new AgentExecutor({
			agent: runnable,
			tools: tools
		});
		this.executor = executor;
	}
	private formatMessages = async (values: InputValues) => {
		const tools = getTools();
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

		const formatted = [
			PREFIX,
			toolString,
			TOOL_INSTRUCTIONS_TEMPLATE.replace('{tool_names}', toolNames),
			SUFFIX.replace('{input}', values.input),
			agentScratchpad
		].join('');
		if (this.verbose){
			console.log(colors.fg.green, "Model prompt: ", colors.style.reset);
			console.log(colors.fg.blue, formatted, colors.style.reset);
			console.log("\n");
		}
		return [new HumanMessage(formatted)];
	};
	private customOutputParser(text: AIMessageChunk): AgentAction | AgentFinish {
		const content = text.lc_kwargs.content;
		if (content.includes('Final Answer:')) {
			if (this.verbose){
				console.log(colors.fg.red, "Model response: ", colors.style.reset);
				console.log(colors.fg.yellow, content, colors.style.reset);
			}
			const parts = content.split('Final Answer:');
			const input = parts[parts.length - 1].trim();
			const finalAnswers = { output: input };
			return { log: content, returnValues: finalAnswers };
		}
		const match = /Action: (.*)\nAction Input: (.*)/s.exec(content);
		if (match == null) {
			console.warn('Could not parse output');
			console.warn(text);
			process.exit(42);
		}	
		if (this.verbose){
			console.log(colors.fg.red, "Model response: ", colors.style.reset);
			console.log(colors.fg.yellow, content, colors.style.reset);
		}
		return {
			tool: match[1].trim(),
			toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
			log: content
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async query(history: ChatHistory[], input: any): Promise<any> {
		if (this.executor == undefined) {
			throw new Error('Setup was not called');
		}
		const result = await this.executor.invoke({ input: input });
		return result.output;
	}
}

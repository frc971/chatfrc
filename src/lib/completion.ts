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

import { QdrantClient } from '@qdrant/js-client-rest';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { formatLogToString } from 'langchain/agents/format_scratchpad/log';
import { RunnableSequence } from 'langchain/schema/runnable';
import { PromptTemplate } from 'langchain/prompts';
import { AgentExecutor } from 'langchain/agents';

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_COLLECTION = 'default';

export class ChatbotCompletion {
	private model: ChatOpenAI;
	private embeddings_model: OpenAIEmbeddings;

	private tools: object;

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
			verbose: false
		});

		this.embeddings_model = new OpenAIEmbeddings({
			openAIApiKey: openai_api_key,
			modelName: 'text-embedding-ada-002'
		});
		this.qdrant_client = new QdrantClient({
			url: 'http://' + (process.env.QDRANT_HOST ?? 'localhost') + ':6333'
		});

		this.tools = [
			new SerpAPI(process.env.SERPAPI_API_KEY, {
				location: 'Austin,Texas,United States',
				hl: 'en',
				gl: 'us'
			}),
			new Calculator()
		];
		console.log(typeof this.tools);

		this.qdrant_collection = qdrant_collection;
	}

	public async generate_executor() {
		this.executor = await initializeAgentExecutorWithOptions(this.tools, this.model, {
			agentType: 'zero-shot-react-description',
			verbose: false
		});
	}
	private formatMessages = async (values: InputValues) => {
		// private async formatMessages(values: InputValues): Promise<Array<BaseMessage>> {
		//From https://js.langchain.com/docs/modules/agents/how_to/custom_llm_agent
		const PREFIX = `Answer the following questions as best you can. You have access to the following tools: {tools}.`;
		const TOOL_INSTRUCTIONS_TEMPLATE = `You can use the following format in your response:
		Question: the input question you must answer
		Thought: you should always think about what to do
		Action: the action to take, should be one of [{tool_names}]
		Action Input: the input to the action
		Observation: the result of the action
		... (this Thought/Action/Action Input/Observation can repeat N times)
		Thought: I now know the final answer
		Final Answer: the final answer to the original input question`;
		const SUFFIX = `Begin!
		Question: {input}
		Thought:`;
		if (!('input' in values) || !('intermediate_steps' in values)) {
			throw new Error('Missing input or agent_scratchpad from values.');
		}
		/** Extract and case the intermediateSteps from values as Array<AgentStep> or an empty array if none are passed */
		const intermediateSteps = values.intermediate_steps
			? (values.intermediate_steps as Array<AgentStep>)
			: [];
		/** Call the helper `formatLogToString` which returns the steps as a string  */
		const agentScratchpad = formatLogToString(intermediateSteps);
		/** Construct the tool strings */
		const toolStrings = this.tools
			.map((tool: object) => `${tool.name}: ${tool.description}`)
			.join('\n');
		const toolNames = this.tools.map((tool: object) => tool.name).join(',\n');
		/** Create templates and format the instructions and suffix prompts */
		const prefixTemplate = new PromptTemplate({
			template: PREFIX,
			inputVariables: ['tools']
		});
		const instructionsTemplate = new PromptTemplate({
			template: TOOL_INSTRUCTIONS_TEMPLATE,
			inputVariables: ['tool_names']
		});
		const suffixTemplate = new PromptTemplate({
			template: SUFFIX,
			inputVariables: ['input']
		});
		/** Format both templates by passing in the input variables */
		const formattedPrefix = await prefixTemplate.format({
			tools: toolStrings
		});
		const formattedInstructions = await instructionsTemplate.format({
			tool_names: toolNames
		});
		const formattedSuffix = await suffixTemplate.format({
			input: values.input.text
		});
		/** Construct the final prompt string */
		const formatted = [
			formattedPrefix,
			formattedInstructions,
			formattedSuffix,
			agentScratchpad
		].join('\n');
		return [new HumanMessage(formatted)];
	};
	private customOutputParser(text: AIMessageChunk): AgentAction | AgentFinish {
		//From https://js.langchain.com/docs/modules/agents/how_to/custom_llm_agent
		/** If the input includes "Final Answer" return as an instance of `AgentFinish` */
		if (text.lc_kwargs.content.includes('Final Answer:')) {
			const parts = text.lc_kwargs.content.split('Final Answer:');
			const input = parts[parts.length - 1].trim();
			const finalAnswers = { output: input };
			return { log: text.lc_kwargs.content, returnValues: finalAnswers };
		}
		/** Use regex to extract any actions and their values */
		const match = /Action: (.*)\nAction Input: (.*)/s.exec(text.lc_kwargs.content);
		if (!match) {
			throw new Error(`Could not parse LLM output: ${text.lc_kwargs.content}`);
		}
		/** Return as an instance of `AgentAction` */
		return {
			tool: match[1].trim(),
			toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
			log: text.lc_kwargs.content
		};
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async query(history: ChatHistory[], input: any): Promise<any> {
		this.formatMessages.bind(this);
		const runnable = RunnableSequence.from([
			{
				input: (values: InputValues) => values,
				intermediate_steps: (values: InputValues) => values.steps
			},
			this.formatMessages,
			this.model,
			this.customOutputParser
		]);
		const ex = new AgentExecutor({
			agent: runnable,
			tools: this.tools
		});

		const tmp = input;

		console.log(`Executing with input "${tmp}"...`);

		const res = await ex.invoke({ text: tmp });

		return res;
	}
}

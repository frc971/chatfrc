import { ChatbotCompletion } from '$lib';

//TODO(max): Change this function to another protocol, nothing is being POSTed
/** @type {import('./$types').RequestHandler} */
export async function POST(params: { request: Request }) {
	const { chatHistory, input } = await params.request.json();

	const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {
		openai_model: import.meta.env.VITE_OPENAI_MODEL_NAME!,
		verbose: true,
		do_history: true,
	});
	// ChatbotCompletion(openaikey, verbose, {model_name})
	await completion_manager.setup();

	const output = await completion_manager.query(chatHistory, input);

	return new Response(JSON.stringify(output), {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}

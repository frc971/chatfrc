import { ChatbotCompletion } from '$lib';

const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {
	openai_model: import.meta.env.VITE_OPENAI_MODEL_NAME!
});

//TODO(max): Change this function to another protocol, nothing is being POSTed
/** @type {import('./$types').RequestHandler} */
export async function POST(params: { request: Request }) {
	const { chatHistory } = await params.request.json();

	const stream = await completion_manager.query(chatHistory);

	const response = new Response(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});

	return response;
}

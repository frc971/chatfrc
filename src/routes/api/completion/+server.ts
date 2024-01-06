import { ChatbotCompletion } from '$lib';

//TODO(max): Change this function to another protocol, nothing is being POSTed
/** @type {import('./$types').RequestHandler} */
export async function POST(params: { request: Request }) {
	const { chatHistory } = await params.request.json();

	const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {});

	const stream = await completion_manager.query(chatHistory);

	const response = new Response(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});

	return response;
}

import { CONDA_DEFAULT_ENV } from '$env/static/private';
import { ChatbotCompletion } from '$lib';

//TODO(max): Change this function to another protocol, nothing is being POSTed
/** @type {import('./$types').RequestHandler} */
export async function POST(params: { request: Request }) {
	const { chatHistory, input } = await params.request.json();

	const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {
		openai_model: import.meta.env.VITE_OPENAI_MODEL_NAME!
	});
	
	const output = await completion_manager.query(chatHistory, input);
	console.log('-------')
	console.log(output);
	console.log("^^^^^")

	const response = new Response(output);
	console.log(new Response("BRUH"));
	console.log("^^^^^")
	return new Response(JSON.stringify(output), {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
	return new Response();
}

/** @type {import('./$types').RequestHandler} */
export async function GET(params: RequestEvent) {
	const { chatHistory } = await params.request.json();

	const stream = await completion_manager.query(chatHistory);

	const response = new Response(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});

	return response;
}

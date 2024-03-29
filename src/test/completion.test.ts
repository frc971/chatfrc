import { test } from 'vitest';
import { ChatbotCompletion } from '$lib/completion/completion';

test('ChatbotCompletion Sanity Check', async () => {
	const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {
		openai_model: import.meta.env.VITE_OPENAI_MODEL_NAME!,
		verbose: true,
		do_history: true,
		generate_data: false,
		use_summarybot: true
	});
	await completion_manager.setup();

	await completion_manager.query([], 'What is 1 + 1?');
});

const questions = [
	'Does FRC971 use Bazel?',
	'Who is the lead mentor of FRC971',
	'What is Scouting?',
	'Does frc971 use postman?',
	'Who is the lead mentor of frc971',
	'How can I install pycharm on the frc971 build server?',

	'What is the Chaiman Award?',
	'What are some awards that team RamTech won?',
	'Gib me some teams that have won the Impact Award?',
	'What does it take to win the Impact Award?',

	'How should a mentor recruit students to their FRC team?',
	'What is outreach in FIRST?',
	'Who can be volenteers in FIRST?'
];
for (let i = 0; i < questions.length; i++) {
	test(questions[i], async () => {
		const completion_manager = new ChatbotCompletion(import.meta.env.VITE_OPENAI_API_KEY!, {
			openai_model: import.meta.env.VITE_OPENAI_MODEL_NAME!,
			verbose: true,
			do_history: true,
			generate_data: false,
			use_summarybot: true
		});
		await completion_manager.setup();

		await completion_manager.query([], questions[i]);
	});
}

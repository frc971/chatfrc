export enum ChatHistoryType {
	AI = 'AI',
	Human = 'Human'
}

export type ChatHistory = {
	content: string;
	type: ChatHistoryType;
};

export default ChatHistory;

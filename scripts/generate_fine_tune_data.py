#bad name

import os
import json
PATH = 'logs'

data = []
for path in os.listdir(PATH):
    with open(os.path.join(PATH, path)) as chain:
        for message in chain:
            data.append(message)

formatted_data = []
for i in range(0,len(data),2):
    user = data[i]
    chatbot = data[i+1]
    message = {
        "messages": [
            {"role": "system", "content": ""},
            {"role": "user", "content": user},
            {"role": "assistant", "content": chatbot}
            ]
    }
    message = json.dumps(message)
    formatted_data.append(message)

final_data = "\n".join(formatted_data)

file = open("train.jsonl","w") 
file.write(final_data)
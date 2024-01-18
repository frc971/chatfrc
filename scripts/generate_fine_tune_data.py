#bad name

import os
import json
PATH = 'data'

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

train_test_split = 0.8
split_index = round(len(formatted_data) * train_test_split)
train = formatted_data[:split_index]
valid = formatted_data[split_index:]
print(train)
print(valid)
print(formatted_data)

train = "\n".join(train)
valid = "\n".join(valid)

file = open("train.jsonl", "w") 
file.write(train)

file = open("valid.jsonl", "w")
file.write(valid)
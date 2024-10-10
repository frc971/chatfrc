from openai import OpenAI


def main():
    client = OpenAI()

    model_name = ""
    train = client.files.create(file=open("../data/train.jsonl", "rb"),
                                purpose="fine-tune")
    valid = client.files.create(file=open("../data/train.jsonl", "rb"),
                                purpose="fine-tune")
    client.fine_tuning.jobs.create(training_file=train.id,
                                   validation_file=valid.id,
                                   model=model_name)


if __name__ == "__main__":
    main()

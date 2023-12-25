from qdrant_client import QdrantClient

from openai import OpenAI

from dotenv import load_dotenv

def main():
    load_dotenv()
    client = QdrantClient("0.0.0.0", port=6333)
    openai_client = OpenAI()

    model = "text-embedding-ada-002"
    prompt = ""
    embeddings = openai_client.embeddings.create(
        input = prompt,
        model=model
    ).data[0].embedding
    results = client.search(
        collection_name="default",
        query_vector=embeddings,
        limit=3,
    )   
    print(results)


if __name__ == '__main__':
    main()

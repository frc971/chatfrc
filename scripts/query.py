from qdrant_client import QdrantClient

from openai import OpenAI

def main():
    client = QdrantClient("0.0.0.0", port=6333)
    query = "How should I contribute to the FRC team?"  
    openai_client = OpenAI()
    embedded_query = openai_client.embeddings.create(input=[query], model="text-embedding-ada-002")

    results = client.search(
        collection_name="default",
        query_vector=embedded_query.data[0].embedding,
        limit=3,
    )
    print(results[0])

if __name__ == '__main__':
    main()

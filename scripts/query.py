from qdrant_client import QdrantClient

from openai import OpenAI

from dotenv import load_dotenv

import argparse


def main():
    load_dotenv()
    parser = argparse.ArgumentParser()
    parser.add_argument('query')
    parser.add_argument('collection')
    args = parser.parse_args()
    query = args.query
    client = QdrantClient("0.0.0.0", port=6333)
    openai_client = OpenAI()

    model = "text-embedding-3-large"
    embeddings = openai_client.embeddings.create(input=query,
                                                 model=model).data[0].embedding
    results = client.search(
        collection_name=args.collection,
        query_vector=embeddings,
        limit=3,
    )
    for result in results:
        print(result.payload['pageContent'])


if __name__ == '__main__':
    main()

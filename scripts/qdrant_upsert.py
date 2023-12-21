import numpy as np

from qdrant_client import QdrantClient

from qdrant_client.http import models


def main():
    client = QdrantClient("0.0.0.0", port=6333)
    client.create_collection(collection_name='default',
                             vectors_config=models.VectorParams(
                                 size=1536, distance=models.Distance.COSINE))

    data = np.load('data.npy', allow_pickle=True)

    for i, item in enumerate(data):
        print('\r',
              f'Embedding progress: {i + 1}/{len(data) - 1}',
              end='',
              flush=True)

        client.upsert(collection_name='default',
                      points=[
                          models.PointStruct(id=i,
                                             payload={
                                                 'pageContent':
                                                 item['document'].page_content,
                                                 'metadata':
                                                 item['document'].metadata
                                             },
                                             vector=item['vector'])
                      ])


if __name__ == '__main__':
    main()

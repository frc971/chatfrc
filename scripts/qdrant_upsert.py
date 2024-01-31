import numpy as np

from qdrant_client import QdrantClient

from qdrant_client.http import models

def qdrant_upsert(path, collection_name, port=6333):
    client = QdrantClient("0.0.0.0", port=port)
    try: 
        client.delete_collection(collection_name=collection_name)
    except:
        pass
    client.create_collection(collection_name=collection_name,
                             vectors_config=models.VectorParams(
                                 size=1536, distance=models.Distance.COSINE))

    data = np.load(path, allow_pickle=True)

    for i, item in enumerate(data):
        print('\r',
              f'Embedding progress: {i + 1}/{len(data) - 1}',
              end='',
              flush=True)

        client.upsert(collection_name=collection_name,
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

def main():
    qdrant_upsert('../data/documents/FRC971.npy', 'FRC971')
    qdrant_upsert('../data/documents/FIRSTAwards.npy', 'FIRSTAwards')

if __name__ == '__main__':
    main()

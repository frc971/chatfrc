"""
    Upserts data from data.npy into the qdrant server
"""

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams


def main():
    client = QdrantClient("0.0.0.0", port=6333)

    client.create_collection(collection_name="default",
                             vectors_config=VectorParams(
                                 size=1536, distance=Distance.COSINE))

    pass


if __name__ == '__main__':
    main()

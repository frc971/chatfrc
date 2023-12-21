from python:3.11-slim

WORKDIR /app/

COPY ./scripts ./app

RUN pip install -U qdrant-client numpy

CMD [ "python3", "app/qdrant_upsert.py"]


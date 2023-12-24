"""
    This script reads documents from data/ and encodes them into a data.npy file
"""

import os
import threading
from langchain.document_loaders.base import BaseLoader

import numpy as np
from dotenv import load_dotenv

from langchain.document_loaders import DirectoryLoader, TextLoader, UnstructuredPDFLoader, UnstructuredRSTLoader
from langchain.embeddings import OpenAIEmbeddings

from langchain.text_splitter import TokenTextSplitter


class CustomDataLoader:

    def __init__(self, chunk_size=500) -> None:
        self.files = []

        self.documents = []

        self.embeddings_model = OpenAIEmbeddings(
            model="text-embedding-ada-002")

        self.text_splitter = TokenTextSplitter(chunk_size=chunk_size,
                                               chunk_overlap=0)

        self.counter = 0

        self.lock = threading.Lock()

        self.semaphore = threading.Semaphore(3)
    
    def embed_documents(self) -> None:
        self._load_files()

        for file in self.files:
            name, _ = os.path.splitext(file) 

            if name == "data/links":
                continue

            thread = threading.Thread(target=self._process_document, args=(file,))

            self.semaphore.acquire()

            thread.start()

    def save(self) -> None:
        np.save('data.npy', np.asarray(self.documents, dtype=object))
    
    def _process_document(self, file) -> None:
        _, extension = os.path.splitext(file)

        loader = TextLoader(file)

        match extension:
            case ".pdf":
                loader = UnstructuredPDFLoader(file)
            case ".rst":
                loader = UnstructuredRSTLoader(file)


        documents = self.text_splitter.split_documents(loader.load())
        vector_responses = self.embeddings_model.embed_documents(
            list(map(lambda document: document.page_content, documents))
        )

        document_map = []

        for doc in zip(vector_responses, documents):
            document_map.append({
                "vector": doc[0],
                "document": doc[1]
            })

        with self.lock:
            print('\r', f'Embedding progress: {self.counter + 1}/{len(self.files) - 1}')
            self.documents.extend(document_map)

            self.counter += 1
        
        self.semaphore.release()


    def _load_files(self) -> None:
        for root, _, files in os.walk('data/'):
            for filename in files:
                full_path = os.path.join(root, filename)
                name, extension = os.path.splitext(full_path) 

                match extension:
                    case ".pdf" | ".rst":
                        pass
                    case _:
                        # Links is a special case, its where we load arbitrary html
                        if (name != "data/links"):
                            continue

                self.files.append(full_path)

def main():
    load_dotenv()
    """
        Loading multiple file types like this isn't ideal, in the future 
        we'd want to make our own DirectoryLoader class that can handle
        multiple filetypes better and can check embeddings against pinecone.
    """

    loader = CustomDataLoader()

    loader.embed_documents()

    loader.save()

if __name__ == "__main__":
    main()

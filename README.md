# ChatFRC

## Introduction

ChatFRC is a chatbot built on GPT-4 Turbo, designed to be a helpful resource for FIRST Robotics Competition (FRC) teams. The chatbot has been designed to support younger, less experienced teams. Utilizing RAG, the chatbot should be able to accurately answer queries across a range of FRC topics including software, mechanical, electrical, awards, outreach, strategy, and scouting. The chatbot is public as of January 6th, however it is still in the process of being improved to provide responses that are fully accurate.

## Development Quick Start

To run the completion locally you’ll need an OpenAI API Key. The key can be used by placing it inside of `.env`

```bash
VITE_OPENAI_API_KEY=""

# You can also provide a custom OpenAI model endpoint
VITE_OPENAI_MODEL_NAME=""
```

### Node

To run the app you’ll need to install pnpm, to do this follow their [install guide](https://pnpm.io/installation).

The app can be started with:

```bash
pnpm i && pnpm run dev
```

You’ll also need to set up a Qdrant server for vector retrieval, see their [installation instructions](https://qdrant.tech/documentation/guides/installation/).

### Docker

The app can also be run with docker-compose using `docker compose build` and `docker compose up`.

Installation instructions for docker compose can be found [here](https://docs.docker.com/compose/install/)

## Contributing

Additional contributions to the chatbot are welcome. To contribute documents, please reach out to us via the [contact form](https://www.frc971.org/contact) on our website.

By making a contribution to this project, I certify that:

```
    (a) The contribution was created in whole or in part by me and I
        have the right to submit it under the open source license
        indicated in the file; or

    (b) The contribution is based upon previous work that, to the best
        of my knowledge, is covered under an appropriate open source
        license and I have the right under that license to submit that
        work with modifications, whether created in whole or in part
        by me, under the same open source license (unless I am
        permitted to submit under a different license), as indicated
        in the file; or

    (c) The contribution was provided directly to me by some other
        person who certified (a), (b) or (c) and I have not modified
        it.

    (d) I understand and agree that this project and the contribution
        are public and that a record of the contribution (including all
        personal information I submit with it, including my sign-off) is
        maintained indefinitely and may be redistributed consistent with
        this project or the open source license(s) involved.
```

To do this, add the following to your commit message. Gerrit will enforce that all commits have been signed off.

```
Signed-off-by: Random J Developer <random@developer.example.org>
```

Git has support for adding Signed-off-by lines by using git commit -s, or you can setup a git commit hook to automatically sign off your commits.

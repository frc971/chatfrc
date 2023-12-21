# ChatFRC

## Introduction
ChatFRC is a chatbot built on GPT-3.5, designed to be a helpful resource for FIRST Robotics Competition (FRC) teams. The chatbot has been designed to support younger, less experienced teams. Utilizing RAG, the chatbot should be able to accurately answer queries across a range of FRC topics including software, mechanical, electrical, awards, outreach, strategy, and scouting. The chatbot is still in the process of development, the goal is to have a version ready for launch by early January 2024.

## Development Quick Start

To run the app you’ll need to install pnpm, to do this follow [their install guide](https://pnpm.io/installation)

Then install the dependencies in the project with `pnpm install`

To run the app run `pnpm run dev`

To run the completion locally you’ll need an OpenAPIAPI Key. The key can be used by placing it inside of a `.env` file

```bash
OPENAI_API_KEY=""
```

You’ll also need to set up a Qdrant server, see their [installation instructions](https://qdrant.tech/documentation/guides/installation/).

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

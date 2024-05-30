import re
import urllib.request

from enum import Enum

class RstContext(Enum):
    UNKNOWN = 0,
    TABSET = 1,
    CODEBLOCK = 3,
    HTML = 4,

class RstParser:
    def __init__(self) -> None:
        self.skipped_tokens = [".. include::", ".. todo::", ".. image::", ":sync:", ".. tab-set::", ".. tab-set-code::"]
        self.section_tokens = ["====", "----", "^^^^"]

        pass

    def parse_file(self, filename: str) -> list[str]:
        with open(filename) as file:
            return self.parse(file.read())

    '''
        Parses a piece of text line by line, splitting the output into sections and ignoring includes and html
    '''
    def parse(self, data: str) -> list[str]:
        context = RstContext.UNKNOWN
        output: list[str] = []
        section_buffer: str = ""

        for chunk in data.split('\n\n'):
            # Skip all invalid chunks
            if any([sub in chunk for sub in self.skipped_tokens]) or len(chunk.strip()) == 0:
                continue

            if ".. code-block::" in chunk:
                context = RstContext.CODEBLOCK
                section_buffer += "```" + chunk.split(".. code-block::")[-1].strip().lower() + '\n'
                continue
            
            if context == RstContext.CODEBLOCK:
                section_buffer += chunk + '\n```\n'
                context = RstContext.UNKNOWN
                continue

            # Check if the chunk is a header
            splitlines = chunk.splitlines()
            if len(splitlines) == 2:
                if any([sub in splitlines[1] for sub in self.section_tokens]):
                    if context == RstContext.CODEBLOCK:
                        section_buffer += "```\n"

                    context = RstContext.UNKNOWN

                    output.append(section_buffer)
                    section_buffer = ""
            
            section_buffer += self._cvt_markdown(chunk) + '\n\n'

        output.append(section_buffer)

        return output

    def _cvt_markdown(self, chunk: str) -> str:
        # Converts note to the github markdown format. 
        if self._to_tag("note") in chunk:
            note_text = chunk.split(self._to_tag("note"))[-1].strip()
            chunk = f"> [!NOTE]\n> {note_text}"

        if self._to_tag("remoteliteralinclude") in chunk:
            return self._remoteliteralinclude_handler(chunk) + '\n'

        if self._to_tag("tab-item") in chunk:
            item_text = chunk.split(self._to_tag("tab-item"))[-1].strip()

            return f"{item_text}:"
        
        if ":ref:" in chunk:
            found_refs = re.findall(r":ref:`[^`]+ <[^>]+>`", chunk)

            for ref in found_refs:
                split_ref = ref.strip(":ref:").split("<", 1)
                title = split_ref[0].strip("`").strip()
                link = split_ref[1].split(":", 1)[0]

                chunk = chunk.replace(ref, f'[{title}]({link})')

        return chunk

    def _to_tag(self, tag: str) -> str:
        return f".. {tag}::"

    def _remoteliteralinclude_handler(self, chunk: str) -> str:
        lines = chunk.splitlines()

        url: None | str = None
        language: None | str = None
        rli_lines: None | list[int] = None
        rli_line_ranges: None | list[list[int | None]] = None

        for line in lines:
            if ".. remoteliteralinclude::" in line:
                url = line.split(".. remoteliteralinclude::")[-1].strip()
            elif ":language:" in line:
                language = line.split(":language:")[-1].strip()
            elif ":lines:" in line:
                raw_lines = line.split(":lines:")[-1].strip()
                split_lines = raw_lines.split(',')

                for rli_line in split_lines:
                    # Its a range
                    if "-" in rli_line:
                        if rli_line_ranges is None:
                            rli_line_ranges = []

                        raw_line = rli_line.split("-")
                        line_range = []

                        line_range.append(int(raw_line[0]))

                        if raw_line[1] == "":
                            line_range.append(None)
                        else:
                            line_range.append(int(raw_line[1]))

                        rli_line_ranges.append(line_range)
                    else:
                        if rli_lines is None:
                            rli_lines = []

                        rli_lines.append(int(rli_line))
        if url == None:
            return ""

        output_buffer = ""

        with urllib.request.urlopen(url) as f:
            data = f.read().decode('utf-8')
            for i, line in enumerate(data.splitlines()):
                if (rli_lines is not None and i in rli_lines) or (rli_line_ranges is not None and any(rli_range[0] is not None and i >= rli_range[0] and (rli_range[1] is None or i <= rli_range[1]) for rli_range in rli_line_ranges)):
                    output_buffer += line + '\n'

        return f"```{language}\n{output_buffer}\n```"

if __name__ == "__main__":
    parser = RstParser()

    output = parser.parse_file("data/docs/software/advanced-controls/state-space/state-space-flywheel-walkthrough.rst")

    for chunk in output:
        print(chunk)
        print("END_CHUNK")

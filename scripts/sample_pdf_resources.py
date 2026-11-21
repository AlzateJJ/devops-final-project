"""Extract only cited PDF pages without changing their text or images.

Build-time dependency: Python with pypdf. The delivered app needs neither.
"""

import base64
import json
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def main():
    root, input_path, output_path = map(Path, sys.argv[1:4])
    db = json.loads(input_path.read_text(encoding="utf-8"))
    references = {}
    for collection in ("tools", "practices", "diagrams", "usages"):
        for record in db[collection]:
            for ref in record.get("references", []):
                references.setdefault(ref["source"], set()).add(ref["page"])

    resources = {}
    pdf_dir = output_path.parent / "pdf"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    for source in db["sources"]:
        reader = PdfReader(root / "app" / source["file"])
        writer = PdfWriter()
        original_pages = sorted(references[source["id"]])
        for index, number in enumerate(original_pages):
            if not 1 <= number <= len(reader.pages):
                raise ValueError(f"Invalid page: {source['id']} / {number}")
            writer.add_page(reader.pages[number - 1])
            writer.set_page_label(index, index, style="/D", start=number)
        for page in writer.pages:
            page.compress_content_streams(level=9)
        writer.compress_identical_objects()
        writer.add_metadata({"/Title": source["name"] + " - páginas citadas"})
        pdf_path = pdf_dir / (source["id"] + ".pdf")
        writer.write(pdf_path)

        # Verify every retained page, including the original page labels.
        excerpt = PdfReader(pdf_path)
        assert len(excerpt.pages) == len(original_pages)
        assert excerpt.page_labels == [str(n) for n in original_pages]
        for index, number in enumerate(original_pages):
            assert excerpt.pages[index].extract_text() == reader.pages[number - 1].extract_text()
            assert excerpt.pages[index].mediabox == reader.pages[number - 1].mediabox

        source["pageMap"] = {str(n): i + 1 for i, n in enumerate(original_pages)}
        source["name"] += " (extracto de páginas citadas)"
        resources[source["file"]] = "data:application/pdf;base64," + base64.b64encode(
            pdf_path.read_bytes()
        ).decode("ascii")

    output_path.write_text(
        json.dumps({"sources": db["sources"], "resources": resources}, ensure_ascii=False),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

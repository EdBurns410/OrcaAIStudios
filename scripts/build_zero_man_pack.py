import textwrap
from pathlib import Path

PAGE_W = 612
PAGE_H = 792
MARGIN_X = 60
MARGIN_Y = 60

ACCENT = (0.13, 0.83, 0.93)
BLACK = (0, 0, 0)


def sanitize(text: str) -> str:
    replacements = {
        "–": "-",
        "—": "-",
        "→": "->",
        "•": "-",
        "’": "'",
        "‘": "'",
        "“": "\"",
        "”": "\"",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap(text, width):
    return textwrap.wrap(text, width=width)


def add_line(lines, text, x, y, size=12, color=BLACK):
    lines.append({"text": sanitize(text), "x": x, "y": y, "size": size, "color": color})


def add_paragraph(lines, text, x, y, size=12, leading=16, width=90, color=BLACK):
    for line in wrap(text, width):
        add_line(lines, line, x, y, size=size, color=color)
        y -= leading
    return y


def add_bullets(lines, items, x, y, size=12, leading=16, width=86):
    for item in items:
        for i, line in enumerate(wrap(item, width)):
            bullet = "- " if i == 0 else "  "
            add_line(lines, f"{bullet}{line}", x, y, size=size, color=BLACK)
            y -= leading
    return y


def build_pages():
    pages = []

    # Page 1 - Cover
    lines = []
    y = PAGE_H - 120
    add_line(lines, "Zero-Man Business Skill Pack", MARGIN_X, y, size=28, color=ACCENT)
    y -= 36
    add_line(lines, "Automate 80% of ops in 30 days", MARGIN_X, y, size=16)
    y -= 30
    add_line(lines, "Templates • SOPs • Automation Recipes • KPI Dashboards", MARGIN_X, y, size=12)
    y -= 40
    y = add_paragraph(
        lines,
        "A full-stack operating system for founders and ops teams who want to build a business that runs without constant manual work.",
        MARGIN_X,
        y,
        size=12,
        leading=18,
        width=85,
    )
    y -= 16
    add_line(lines, "Includes:", MARGIN_X, y, size=12, color=ACCENT)
    y -= 18
    y = add_bullets(
        lines,
        [
            "30-day build roadmap",
            "10 automation recipes",
            "12 SOP templates",
            "6 KPI dashboards",
            "3 AI agent prompt packs",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=80,
    )
    pages.append(lines)

    # Page 2 - Outcomes
    lines = []
    y = PAGE_H - 90
    add_line(lines, "Outcomes You Can Expect", MARGIN_X, y, size=22, color=ACCENT)
    y -= 32
    y = add_paragraph(
        lines,
        "The goal is simple: reclaim 10–30 hours/week by replacing manual ops with automated systems.",
        MARGIN_X,
        y,
        size=12,
        leading=18,
        width=86,
    )
    y -= 8
    y = add_bullets(
        lines,
        [
            "Fewer handoffs and fewer mistakes",
            "Cash collected faster with automated invoicing",
            "Clear ownership for every workflow",
            "Real-time KPI visibility for leadership",
            "Scalable systems that grow with the team",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=80,
    )
    pages.append(lines)

    # Page 3 - Ops Stack
    lines = []
    y = PAGE_H - 90
    add_line(lines, "The Zero-Man Ops Stack", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    add_line(lines, "Pipeline:", MARGIN_X, y, size=12, color=ACCENT)
    y -= 18
    add_line(lines, "Lead Intake → Qualify → Onboard → Deliver → Invoice → Retain", MARGIN_X, y, size=12)
    y -= 30
    y = add_bullets(
        lines,
        [
            "Lead Intake: automated forms + instant routing",
            "Qualify: scoring + calendar triggers",
            "Onboard: task templates + document requests",
            "Deliver: tracked milestones + QA checks",
            "Invoice: auto-generated invoices + follow-ups",
            "Retain: NPS + renewal workflows",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=82,
    )
    pages.append(lines)

    # Page 4 - 30-Day Plan
    lines = []
    y = PAGE_H - 90
    add_line(lines, "30-Day Build Plan", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    y = add_bullets(
        lines,
        [
            "Week 1: Workflow mapping + KPI design",
            "Week 2: Database + core automation scaffolding",
            "Week 3: Build the web app core + auth roles",
            "Week 4: Integrations, QA, and launch",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=18,
        width=82,
    )
    y -= 12
    y = add_paragraph(
        lines,
        "Each week includes checklists, deliverables, and clear definitions of ‘done’.",
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=86,
    )
    pages.append(lines)

    # Page 5 - Automation Recipes
    lines = []
    y = PAGE_H - 90
    add_line(lines, "Automation Recipes", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    y = add_bullets(
        lines,
        [
            "Lead capture → CRM → onboarding tasks",
            "Proposal generation → approval → invoice",
            "Project milestones → status updates → client comms",
            "Support inbox → routing → SLA reminders",
            "Weekly KPI digest → leadership Slack channel",
            "Failed payment recovery → follow-up + retries",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=82,
    )
    pages.append(lines)

    # Page 6 - KPI Dashboards
    lines = []
    y = PAGE_H - 90
    add_line(lines, "KPI Dashboards Included", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    y = add_bullets(
        lines,
        [
            "Sales pipeline velocity",
            "Delivery capacity + utilization",
            "Revenue by product/service",
            "Ops time saved (hours reclaimed)",
            "Cash collection + outstanding invoices",
            "Customer health score",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=82,
    )
    pages.append(lines)

    # Page 7 - SOP Library
    lines = []
    y = PAGE_H - 90
    add_line(lines, "SOP Library", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    y = add_bullets(
        lines,
        [
            "Lead qualification",
            "Client onboarding",
            "Weekly reporting",
            "Project kickoff",
            "Quality assurance",
            "Invoice follow-up",
            "Retention and renewals",
            "Hiring handoff",
        ],
        MARGIN_X,
        y,
        size=12,
        leading=16,
        width=82,
    )
    pages.append(lines)

    # Page 8 - Next steps
    lines = []
    y = PAGE_H - 90
    add_line(lines, "Next Step", MARGIN_X, y, size=22, color=ACCENT)
    y -= 30
    y = add_paragraph(
        lines,
        "If you want this system implemented for your business, book a discovery call. We’ll map the scope, stack, and timeline for your custom web app.",
        MARGIN_X,
        y,
        size=12,
        leading=18,
        width=86,
    )
    y -= 20
    add_line(lines, "Orca AI Studios", MARGIN_X, y, size=12, color=ACCENT)
    y -= 18
    add_line(lines, "Signal-first systems", MARGIN_X, y, size=12)
    pages.append(lines)

    return pages


def build_pdf(pages, output_path: Path):
    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    objects = []

    def add_object(content: bytes):
        objects.append(content)

    # Build content streams first
    content_streams = []
    for lines in pages:
        content_lines = ["BT"]
        for line in lines:
            r, g, b = line["color"]
            content_lines.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
            content_lines.append(f"/F1 {line['size']} Tf")
            content_lines.append(
                f"1 0 0 1 {line['x']} {line['y']} Tm ({pdf_escape(line['text'])}) Tj"
            )
        content_lines.append("ET")
        stream = "\n".join(content_lines).encode("latin-1")
        content_obj = b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream"
        content_streams.append(content_obj)

    num_pages = len(pages)

    # 1: Catalog
    add_object(b"<< /Type /Catalog /Pages 2 0 R >>")
    # 2: Pages
    page_kids = " ".join([f"{i + 4} 0 R" for i in range(num_pages)]).encode("ascii")
    add_object(b"<< /Type /Pages /Kids [" + page_kids + b"] /Count " + str(num_pages).encode("ascii") + b" >>")
    # 3: Font
    add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    # Page objects
    for i in range(num_pages):
        content_ref = 4 + num_pages + i
        page_obj = (
            b"<< /Type /Page /Parent 2 0 R "
            + f"/MediaBox [0 0 {PAGE_W} {PAGE_H}] ".encode("ascii")
            + b"/Resources << /Font << /F1 3 0 R >> >> "
            + f"/Contents {content_ref} 0 R >>".encode("ascii")
        )
        add_object(page_obj)

    # Content objects
    for content_obj in content_streams:
        add_object(content_obj)

    # Write PDF with xref
    pdf = bytearray()
    pdf.extend(header)
    offsets = [0]
    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{idx} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))

    trailer = (
        f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
        f"startxref\n{xref_start}\n%%EOF"
    ).encode("ascii")
    pdf.extend(trailer)

    output_path.write_bytes(pdf)


if __name__ == "__main__":
    output = Path(__file__).resolve().parents[1] / "zero-man-business-skill-pack.pdf"
    pages = build_pages()
    build_pdf(pages, output)
    print(f"Created {output}")

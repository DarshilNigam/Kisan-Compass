import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE, MSO_SHAPE_TYPE

sys.stdout.reconfigure(encoding='utf-8')

# Input and output paths
TEMPLATE_PATH = r"C:\Users\HP\.gemini\antigravity\brain\07678bde-10b0-4416-8f00-fe747eaf0e1a\.user_uploaded\media_1790456034864.pptx"
OUTPUT_PATH = r"D:\KISAN COMPASS\KISAN_COMPASS_Final_Judge_Deck.pptx"

# Color Palette
COLOR_DARK_GREEN = RGBColor(13, 59, 38)     # #0D3B26 Primary brand
COLOR_EMERALD    = RGBColor(22, 101, 52)    # #166534 Accent green
COLOR_LIGHT_GREEN= RGBColor(240, 253, 244)  # #F0FDF4 Soft green tint
COLOR_COBALT     = RGBColor(30, 64, 175)    # #1E40AF Intelligent blue
COLOR_BLUE_BAR   = RGBColor(0, 112, 192)    # #0070C0 Template blue accent
COLOR_AMBER      = RGBColor(217, 119, 6)    # #D97706 Warm orange accent
COLOR_DARK_TEXT  = RGBColor(30, 41, 59)     # #1E293B Slate dark
COLOR_MUTED_TEXT = RGBColor(71, 85, 105)    # #475569 Slate muted
COLOR_WHITE      = RGBColor(255, 255, 255)  # #FFFFFF Pure white
COLOR_CARD_BG    = RGBColor(248, 250, 252)  # #F8FAFC Clean card background
COLOR_CARD_BORDER= RGBColor(203, 213, 225)  # #CBD5E1 Subtle border
COLOR_CARD_GREEN = RGBColor(240, 249, 244)  # Light green card
COLOR_CARD_BLUE  = RGBColor(239, 246, 255)  # Light blue card
COLOR_CARD_AMBER = RGBColor(255, 251, 235)  # Light amber card

def sanitize_element(shape):
    """Removes a shape element from its parent."""
    sp = shape._element
    sp.getparent().remove(sp)

def add_header_banner(slide, title_text, slide_num, total_slides=9):
    """Standardizes slide header, oval badge, bottom bar, footer text, and slide number."""
    # 1. Update or create Oval badge (FusionX4)
    oval = None
    for s in slide.shapes:
        if "Oval" in s.name:
            oval = s
            break
    if oval:
        oval.left = Inches(0.36)
        oval.top = Inches(0.24)
        oval.width = Inches(1.45)
        oval.height = Inches(0.80)
        tf = oval.text_frame
        tf.word_wrap = False
        tf.margin_left = Inches(0.04)
        tf.margin_right = Inches(0.04)
        tf.margin_top = Inches(0.04)
        tf.margin_bottom = Inches(0.04)
        tf.clear()
        p = tf.paragraphs[0]
        p.text = "FusionX4"
        p.alignment = PP_ALIGN.CENTER
        if p.runs:
            p.runs[0].font.name = "Arial"
            p.runs[0].font.size = Pt(11.5)
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_WHITE
        oval.fill.solid()
        oval.fill.fore_color.rgb = COLOR_DARK_GREEN
        oval.line.color.rgb = COLOR_EMERALD
    else:
        oval = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.36), Inches(0.24), Inches(1.45), Inches(0.80))
        oval.fill.solid()
        oval.fill.fore_color.rgb = COLOR_DARK_GREEN
        oval.line.color.rgb = COLOR_EMERALD
        tf = oval.text_frame
        tf.word_wrap = False
        tf.margin_left = Inches(0.04)
        tf.margin_right = Inches(0.04)
        tf.margin_top = Inches(0.04)
        tf.margin_bottom = Inches(0.04)
        p = tf.paragraphs[0]
        p.text = "FusionX4"
        p.alignment = PP_ALIGN.CENTER
        if p.runs:
            p.runs[0].font.name = "Arial"
            p.runs[0].font.size = Pt(11.5)
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_WHITE

    # 2. Update or create Title
    title_shape = None
    for s in slide.shapes:
        if s.is_placeholder and s.placeholder_format.type in [1, 3]:
            title_shape = s
            break
        elif "Title" in s.name:
            title_shape = s
            break
    if title_shape:
        title_shape.left = Inches(1.95)
        title_shape.top = Inches(0.22)
        title_shape.width = Inches(10.8)
        title_shape.height = Inches(0.85)
        tf = title_shape.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0.04)
        tf.margin_bottom = Inches(0.04)
        tf.margin_left = Inches(0.04)
        tf.clear()
        p = tf.paragraphs[0]
        p.text = title_text
        p.alignment = PP_ALIGN.LEFT
        if p.runs:
            p.runs[0].font.name = "Arial"
            p.runs[0].font.size = Pt(20.5)
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_DARK_GREEN
    else:
        tb = slide.shapes.add_textbox(Inches(1.95), Inches(0.22), Inches(10.8), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.alignment = PP_ALIGN.LEFT
        p.runs[0].font.name = "Arial"
        p.runs[0].font.size = Pt(20.5)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = COLOR_DARK_GREEN

    # 3. Bottom bar rectangle
    rect = None
    for s in slide.shapes:
        if s.shape_type == MSO_SHAPE.RECTANGLE and s.top > Inches(6.5):
            rect = s
            break
    if not rect:
        rect = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(6.95), Inches(13.333), Inches(0.55))
    rect.fill.solid()
    rect.fill.fore_color.rgb = COLOR_DARK_GREEN
    rect.line.fill.background()

    # 4. Footer Placeholder / Text
    footer = None
    for s in slide.shapes:
        if s.is_placeholder and "Footer" in s.name:
            footer = s
            break
        elif "Footer" in s.name:
            footer = s
            break
    if footer:
        footer.left = Inches(1.5)
        footer.top = Inches(6.98)
        footer.width = Inches(8.5)
        footer.height = Inches(0.45)
        tf = footer.text_frame
        tf.clear()
        p = tf.paragraphs[0]
        p.text = "KISAN COMPASS — Farm Decision Intelligence  •  Team FusionX4"
        p.alignment = PP_ALIGN.LEFT
        if p.runs:
            p.runs[0].font.name = "Arial"
            p.runs[0].font.size = Pt(11)
            p.runs[0].font.bold = False
            p.runs[0].font.color.rgb = COLOR_WHITE
    else:
        tb = slide.shapes.add_textbox(Inches(1.5), Inches(6.98), Inches(8.5), Inches(0.45))
        p = tb.text_frame.paragraphs[0]
        p.text = "KISAN COMPASS — Farm Decision Intelligence  •  Team FusionX4"
        p.runs[0].font.name = "Arial"
        p.runs[0].font.size = Pt(11)
        p.runs[0].font.color.rgb = COLOR_WHITE

    # 5. Slide Number
    sl_num_shape = None
    for s in slide.shapes:
        if s.is_placeholder and "Slide Number" in s.name:
            sl_num_shape = s
            break
        elif "Slide Number" in s.name:
            sl_num_shape = s
            break
    num_text = f"{slide_num} / {total_slides}"
    if sl_num_shape:
        sl_num_shape.left = Inches(11.0)
        sl_num_shape.top = Inches(6.98)
        sl_num_shape.width = Inches(1.8)
        sl_num_shape.height = Inches(0.45)
        tf = sl_num_shape.text_frame
        tf.clear()
        p = tf.paragraphs[0]
        p.text = num_text
        p.alignment = PP_ALIGN.RIGHT
        if p.runs:
            p.runs[0].font.name = "Arial"
            p.runs[0].font.size = Pt(11)
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_WHITE
    else:
        tb = slide.shapes.add_textbox(Inches(11.0), Inches(6.98), Inches(1.8), Inches(0.45))
        p = tb.text_frame.paragraphs[0]
        p.text = num_text
        p.alignment = PP_ALIGN.RIGHT
        p.runs[0].font.name = "Arial"
        p.runs[0].font.size = Pt(11)
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = COLOR_WHITE

def create_card(slide, left, top, width, height, title, items, card_type="default", title_size=13, item_size=10.5):
    """Creates a beautifully styled card box with title and bullet points."""
    if card_type == "green":
        bg_col = COLOR_CARD_GREEN
        border_col = COLOR_EMERALD
        header_col = COLOR_DARK_GREEN
    elif card_type == "blue":
        bg_col = COLOR_CARD_BLUE
        border_col = COLOR_COBALT
        header_col = COLOR_COBALT
    elif card_type == "amber":
        bg_col = COLOR_CARD_AMBER
        border_col = COLOR_AMBER
        header_col = COLOR_AMBER
    else:
        bg_col = COLOR_CARD_BG
        border_col = COLOR_CARD_BORDER
        header_col = COLOR_DARK_GREEN

    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    box.fill.solid()
    box.fill.fore_color.rgb = bg_col
    box.line.color.rgb = border_col
    box.line.width = Pt(1.5)

    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.10)
    tf.margin_bottom = Inches(0.10)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.14)
    tf.clear()

    if title:
        p0 = tf.paragraphs[0]
        p0.text = title
        p0.alignment = PP_ALIGN.LEFT
        p0.space_after = Pt(5)
        if p0.runs:
            p0.runs[0].font.name = "Arial"
            p0.runs[0].font.size = Pt(title_size)
            p0.runs[0].font.bold = True
            p0.runs[0].font.color.rgb = header_col

    for item in items:
        p = tf.add_paragraph()
        p.space_after = Pt(3.5)
        if ": " in item:
            parts = item.split(": ", 1)
            r_bullet = p.add_run()
            r_bullet.text = "• "
            r_bullet.font.bold = True
            r_bullet.font.size = Pt(item_size)
            r_bullet.font.color.rgb = header_col

            r_lbl = p.add_run()
            r_lbl.text = parts[0] + ": "
            r_lbl.font.bold = True
            r_lbl.font.size = Pt(item_size)
            r_lbl.font.color.rgb = COLOR_DARK_TEXT

            r_val = p.add_run()
            r_val.text = parts[1]
            r_val.font.bold = False
            r_val.font.size = Pt(item_size)
            r_val.font.color.rgb = COLOR_DARK_TEXT
        else:
            r = p.add_run()
            prefix = "• " if not item.startswith("  ") else "    - "
            r.text = prefix + item.strip()
            r.font.size = Pt(item_size)
            r.font.color.rgb = COLOR_DARK_TEXT
            if item.startswith("• "):
                r.font.bold = True
    return box

def purge_all_sih(prs):
    """Purges all SIH text from Masters and Slide Layouts."""
    print("Purging SIH text from Masters and Layouts...")
    for master in prs.slide_masters:
        for s in master.shapes:
            if s.has_text_frame:
                if "SIH" in s.text_frame.text:
                    s.text_frame.text = s.text_frame.text.replace("@SIH Idea submission- Template", "KISAN COMPASS — Farm Decision Intelligence • Team FusionX4").replace("SMART INDIA HACKATHON", "").replace("SIH", "")
        for layout in master.slide_layouts:
            for s in layout.shapes:
                if s.has_text_frame:
                    if "SIH" in s.text_frame.text:
                        s.text_frame.text = s.text_frame.text.replace("@SIH Idea submission- Template", "KISAN COMPASS — Farm Decision Intelligence • Team FusionX4").replace("SMART INDIA HACKATHON", "").replace("SIH", "")

def main():
    print(f"Loading reference presentation from {TEMPLATE_PATH}...")
    prs = pptx.Presentation(TEMPLATE_PATH)
    purge_all_sih(prs)

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    print("Editing Slide 1: Title Slide...")
    slide1 = prs.slides[0]

    # Remove SIH pictures
    to_remove = [s for s in slide1.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)

    # Style Title 7: KISAN COMPASS
    for s in slide1.shapes:
        if s.name == "Title 7" or (s.is_placeholder and "Title" in s.name):
            s.left = Inches(0.6)
            s.top = Inches(0.4)
            s.width = Inches(12.0)
            s.height = Inches(1.3)
            tf = s.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "KISAN COMPASS"
            p.alignment = PP_ALIGN.LEFT
            r = p.runs[0]
            r.font.name = "Arial"
            r.font.size = Pt(40)
            r.font.bold = True
            r.font.color.rgb = COLOR_DARK_GREEN

    # Style Subtitle 3: Farm Decision Intelligence
    for s in slide1.shapes:
        if s.name == "Subtitle 3" or (s.is_placeholder and "Subtitle" in s.name):
            s.left = Inches(0.6)
            s.top = Inches(1.6)
            s.width = Inches(12.0)
            s.height = Inches(0.7)
            tf = s.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "Farm Decision Intelligence"
            p.alignment = PP_ALIGN.LEFT
            r = p.runs[0]
            r.font.name = "Arial"
            r.font.size = Pt(22)
            r.font.bold = True
            r.font.color.rgb = COLOR_COBALT

    # Style TextBox 9 (Left column info)
    for s in slide1.shapes:
        if s.name == "TextBox 9":
            s.left = Inches(0.6)
            s.top = Inches(2.4)
            s.width = Inches(6.8)
            s.height = Inches(4.5)
            tf = s.text_frame
            tf.word_wrap = True
            tf.clear()

            p = tf.paragraphs[0]
            p.text = '“Not what to think. What’s actually true — and how sure we are.”'
            p.space_after = Pt(14)
            r = p.runs[0]
            r.font.name = "Arial"
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = COLOR_AMBER

            p2 = tf.add_paragraph()
            p2.text = "KISAN COMPASS unites real farmer ground truth with crop phenology, Open-Meteo numerical forecasts, AGMARKNET benchmarks, and road logistics to simulate outcomes and guide confident harvest decisions."
            p2.space_after = Pt(16)
            r2 = p2.runs[0]
            r2.font.name = "Arial"
            r2.font.size = Pt(11)
            r2.font.color.rgb = COLOR_DARK_TEXT

            p3 = tf.add_paragraph()
            p3.text = "TEAM: FusionX4"
            p3.space_after = Pt(6)
            r3 = p3.runs[0]
            r3.font.name = "Arial"
            r3.font.size = Pt(13)
            r3.font.bold = True
            r3.font.color.rgb = COLOR_DARK_GREEN

            members = [
                "Darshil Nigam — Team Leader",
                "Manvi Tripathi",
                "Ritvika Srivastava",
                "Devanshu Gupta"
            ]
            for m in members:
                pm = tf.add_paragraph()
                pm.space_after = Pt(3)
                r = pm.add_run()
                r.text = f"•  {m}"
                r.font.name = "Arial"
                r.font.size = Pt(11)
                r.font.color.rgb = COLOR_DARK_TEXT
                if "Team Leader" in m:
                    r.font.bold = True

    # Right Column Card
    create_card(
        slide1,
        left=Inches(7.7),
        top=Inches(2.3),
        width=Inches(5.0),
        height=Inches(4.6),
        title="THE 5 TRUTH CONTRACTS",
        items=[
            "1. Real Farm Single Source of Truth: Driven by actual farmer field acreage, crop variety, sowing date, and target yield.",
            "2. Deterministic Decision Engine: Agronomy stage (GDD) and net realization (Price × Qty - Freight) run on pure deterministic math.",
            "3. What-If Simulation Sandbox: Evaluates Sell Now vs Wait vs Sell Part across multiple mandis with uncertainty distributions.",
            "4. Transparent Provenance: Every metric cites source, freshness timestamp, and explicit error bounds (±X%).",
            "5. Farmer Sovereignty: The system recommends with explainable rationale; the farmer always decides."
        ],
        card_type="green"
    )

    # =========================================================================
    # SLIDE 2: THE PROBLEM (THE REAL FARMER DILEMMA)
    # =========================================================================
    print("Editing Slide 2: The Problem...")
    slide2 = prs.slides[1]
    to_remove = [s for s in slide2.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)
    for s in slide2.shapes:
        if s.name == "TextBox 8":
            sanitize_element(s)
    add_header_banner(slide2, "THE PROBLEM: FRAGMENTED DATA VS REAL FARMER DILEMMAS", 2)

    card_w = Inches(3.85)
    card_h = Inches(5.35)
    card_top = Inches(1.35)

    create_card(
        slide2,
        left=Inches(0.6),
        top=card_top,
        width=card_w,
        height=card_h,
        title="Fragmented Siloed Information",
        items=[
            "Weather Forecasts: Generic district-level rain alerts fail to capture farm-level crop vulnerability.",
            "Mandi Price Boards: Raw market rates ignore haulage cost, toll taxes, and transit spoilage.",
            "Crop Stage & Soil: Moisture and ripening status remain trapped in offline observation.",
            "Logistics Realities: Vehicle hiring costs, road conditions, and unloading wait times are completely disconnected.",
            "The Trap: Farmers are overwhelmed with disconnected notifications but zero actionable decision support."
        ],
        card_type="default"
    )

    create_card(
        slide2,
        left=Inches(4.75),
        top=card_top,
        width=card_w,
        height=card_h,
        title="The Farmer's Unanswered Dilemmas",
        items=[
            "Timing Risk: 'Should I harvest and sell today at ₹2,150/qtl, or wait 5 days for a potential ₹2,320/qtl?'",
            "Downside Weather Threat: 'If 28mm rain arrives in 4 days, will muddy fields trap my tractor and ruin crop moisture?'",
            "Mandi Selection: 'Mandi A pays ₹50 more per quintal than Mandi B, but is 42km farther. Which yields higher NET cash in hand?'",
            "Capital Pressure: 'I have urgent fertilizer bills due this Friday—can I sell 40% now and hold 60% safely?'"
        ],
        card_type="amber"
    )

    create_card(
        slide2,
        left=Inches(8.9),
        top=card_top,
        width=card_w,
        height=card_h,
        title="The Critical Intelligence Gap",
        items=[
            "No Single Source of Truth: Existing apps give isolated advisory without knowing the farmer's actual crop cycle or stored stock.",
            "Black-Box Hallucinations: Generic AI chatbots invent fake certainty and dangerous farm advice.",
            "Hidden Net Realization: Farmers suffer distress sales because transport costs and spoilage are never modeled upfront.",
            "What Kisan Compass Solves: Unifies ground truth, context, and economics into a transparent What-If simulation engine."
        ],
        card_type="green"
    )

    # =========================================================================
    # SLIDE 3: PROPOSED SOLUTION & KEY FEATURES
    # =========================================================================
    print("Editing Slide 3: Proposed Solution & Key Features...")
    slide3 = prs.slides[2]
    to_remove = [s for s in slide3.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)
    for s in slide3.shapes:
        if s.name == "TextBox 8":
            sanitize_element(s)
    add_header_banner(slide3, "PROPOSED SOLUTION: UNIFIED FARM DECISION INTELLIGENCE", 3)

    # Left Card: The Persistent Farm Digital Twin & Solution Overview
    create_card(
        slide3,
        left=Inches(0.6),
        top=Inches(1.35),
        width=Inches(5.6),
        height=Inches(5.35),
        title="The Persistent Farm Digital Twin",
        items=[
            "Single Source of Truth: Persistent profile anchoring real field GPS, acreage (2.5 - 15 Acres), crop variety (Sugarcane HD-2967), sowing date, and available quantity (25 Quintals).",
            "Multi-Source Real-World APIs: Live numerical weather forecasts (Open-Meteo), benchmark mandi prices (AGMARKNET), and road logistics (OSRM routing).",
            "Deterministic Agronomy & Economics: Growing Degree Days (GDD) crop maturity, moisture risk, and true freight costs modeled without hallucination.",
            "Human-in-the-Loop Sovereign Control: 'The system recommends with transparent evidence. The farmer makes the final decision.'",
            "Closed-Loop Evolution: Every decision is recorded into decision memory to calibrate future advice against actual harvest outcomes."
        ],
        card_type="green",
        title_size=13.5,
        item_size=10.5
    )

    # Right Card: The 10 Key Features (Grouped Logically)
    create_card(
        slide3,
        left=Inches(6.5),
        top=Inches(1.35),
        width=Inches(6.2),
        height=Inches(5.35),
        title="10 KEY PLATFORM FEATURES (CAPABILITY MATRIX)",
        items=[
            "1. FARM DIGITAL STATE: Persistent database storing farmer profile, field boundaries, soil class, and verified acreage.",
            "2. CROP AGRONOMY: Thermal time / GDD phenology tracking growth stages from vegetative to harvest readiness.",
            "3. WEATHER INTELLIGENCE: 7-day numerical forecasts with rain probability, wind speed, and soil moisture trends.",
            "4. MARKET INTELLIGENCE: Official AGMARKNET mandi modal prices, arrival volumes, and 30-day historical trends.",
            "5. NET REALIZATION: Real take-home profit computed dynamically (Modal Rate × Qty - Road Freight - Mandi Cess).",
            "6. WHAT-IF SIMULATION: Sandbox evaluating Sell Now vs Wait vs Sell Part across multiple mandis with risk bounds.",
            "7. DECISION EXPLANATION: AI reasoning strictly confined to explaining verified numbers with cited evidence.",
            "8. CONTINUOUS FARM WATCH: Background monitor evaluating weather shifts and price surges to trigger threshold alerts.",
            "9. EXECUTION INTELLIGENCE: Action checklist (labor booking, vehicle hiring, mandi pass, transit moisture protection).",
            "10. DECISION MEMORY: Audit trail tracking farmer actions, actual realized prices, and model accuracy calibration."
        ],
        card_type="blue",
        title_size=13.5,
        item_size=9.8
    )

    # =========================================================================
    # SLIDE 4: TECHNICAL APPROACH (ARCHITECTURE, ENGINE SEPARATION & TECH STACK)
    # =========================================================================
    print("Editing Slide 4: Technical Approach, Architecture & Tech Stack...")
    slide4 = prs.slides[3]
    to_remove = [s for s in slide4.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)
    for s in slide4.shapes:
        if s.name == "TextBox 8":
            sanitize_element(s)
    add_header_banner(slide4, "TECHNICAL APPROACH: SYSTEM ARCHITECTURE & ENGINE SEPARATION", 4)

    # 1. Top System Flow Banner (8-Step Visual Pipeline)
    flow_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.35), Inches(12.15), Inches(0.85))
    flow_box.fill.solid()
    flow_box.fill.fore_color.rgb = COLOR_CARD_BG
    flow_box.line.color.rgb = COLOR_COBALT
    flow_box.line.width = Pt(1.5)
    tf_f = flow_box.text_frame
    tf_f.word_wrap = True
    tf_f.margin_top = Inches(0.06)
    tf_f.margin_bottom = Inches(0.06)
    tf_f.margin_left = Inches(0.10)
    tf_f.margin_right = Inches(0.10)
    tf_f.clear()

    pf_head = tf_f.paragraphs[0]
    pf_head.text = "END-TO-END DATA FLOW PIPELINE"
    pf_head.alignment = PP_ALIGN.CENTER
    pf_head.runs[0].font.name = "Arial"
    pf_head.runs[0].font.size = Pt(11)
    pf_head.runs[0].font.bold = True
    pf_head.runs[0].font.color.rgb = COLOR_COBALT

    pf_flow = tf_f.add_paragraph()
    pf_flow.text = "FARMER DATA  →  PERSISTENT FARM STATE  →  CONTEXT ENGINES  →  DETERMINISTIC ENGINE  →  WHAT-IF SIMULATION  →  EVIDENCE & AI  →  FARMER DECISION  →  EXECUTION & OUTCOME"
    pf_flow.alignment = PP_ALIGN.CENTER
    pf_flow.runs[0].font.name = "Arial"
    pf_flow.runs[0].font.size = Pt(8.5)
    pf_flow.runs[0].font.bold = True
    pf_flow.runs[0].font.color.rgb = COLOR_DARK_GREEN

    # 2. Middle Architecture Cards (Deterministic vs AI Explanation separation)
    mid_top = Inches(2.30)
    mid_h = Inches(3.50)
    mid_w = Inches(5.95)

    create_card(
        slide4,
        left=Inches(0.6),
        top=mid_top,
        width=mid_w,
        height=mid_h,
        title="DETERMINISTIC ENGINE (Pure Math & Verification)",
        items=[
            "Role & Scope: Handles 100% of calculations, agronomy GDD, economics, logistics formulas, and simulation outcome bounds.",
            "Technology: TypeScript & Python calculation core running verifiable mathematical routines.",
            "Input Sources: Real farmer field data (acreage, crop variety) + Open-Meteo numerical weather + AGMARKNET mandi modal prices.",
            "Economic Logic: Computes Net Cash = (Modal Price × Qty) - (Freight per km × Distance + Unloading Fee).",
            "Zero Hallucination Guarantee: No generative AI can tamper with or fabricate financial numbers or crop stages."
        ],
        card_type="green",
        title_size=12.5,
        item_size=9.8
    )

    create_card(
        slide4,
        left=Inches(6.8),
        top=mid_top,
        width=mid_w,
        height=mid_h,
        title="AI / LLM EXPLANATION LAYER (Strictly Constrained)",
        items=[
            "Role & Scope: Natural-language explanation, farmer conversational interface, and multilingual regional translation.",
            "Strict Evidence Binding: Reads structured JSON outputs from the deterministic engine; strictly forbidden from calculating numbers.",
            "Verifiable Rationale: Translates trade-offs into plain farmer dialect: 'Wait recommendation is driven by +8% price upside vs 28mm rain on Day 4.'",
            "Transparent Uncertainty: Always cites data source, freshness timestamp, and confidence error bounds (±X%).",
            "Human-in-the-Loop: Empowers farmer judgment with clear reasoning—never dictates autonomous actions."
        ],
        card_type="blue",
        title_size=12.5,
        item_size=9.8
    )

    # 3. Bottom Compact Tech Stack Banner
    tech_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(5.90), Inches(12.15), Inches(0.85))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = COLOR_CARD_AMBER
    tech_box.line.color.rgb = COLOR_AMBER
    tech_box.line.width = Pt(1.5)
    tf_t = tech_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_top = Inches(0.06)
    tf_t.margin_bottom = Inches(0.06)
    tf_t.margin_left = Inches(0.12)
    tf_t.margin_right = Inches(0.12)
    tf_t.clear()

    pt_head = tf_t.paragraphs[0]
    pt_head.text = "TECH STACK — REAL-WORLD PRODUCTION ARCHITECTURE"
    pt_head.alignment = PP_ALIGN.LEFT
    pt_head.runs[0].font.name = "Arial"
    pt_head.runs[0].font.size = Pt(10.5)
    pt_head.runs[0].font.bold = True
    pt_head.runs[0].font.color.rgb = COLOR_AMBER

    pt_tech = tf_t.add_paragraph()
    pt_tech.text = "React 18 + TypeScript  •  Python / FastAPI  •  Supabase / PostgreSQL (Row-Level Security)  •  Open-Meteo Weather API  •  AGMARKNET / DMI Mandi API  •  Deterministic Decision Engine  •  LLM Explanation Layer"
    pt_tech.alignment = PP_ALIGN.LEFT
    pt_tech.runs[0].font.name = "Arial"
    pt_tech.runs[0].font.size = Pt(9.5)
    pt_tech.runs[0].font.bold = True
    pt_tech.runs[0].font.color.rgb = COLOR_DARK_TEXT

    # =========================================================================
    # SLIDE 5: WHAT-IF / DECISION SIMULATION (DO NOT CHANGE — PRESERVE PROMINENCE)
    # =========================================================================
    print("Editing Slide 5: What-If Simulation (Preserving Prominence)...")
    slide5 = prs.slides[4]
    to_remove = [s for s in slide5.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)
    for s in slide5.shapes:
        if s.name == "TextBox 8":
            sanitize_element(s)
    add_header_banner(slide5, "WHAT-IF SIMULATION: EVALUATING SCENARIO TRADE-OFFS", 5)

    sim_w = Inches(3.85)
    sim_h = Inches(4.3)
    sim_top = Inches(1.35)

    create_card(
        slide5,
        left=Inches(0.6),
        top=sim_top,
        width=sim_w,
        height=sim_h,
        title="SCENARIO A: SELL NOW",
        items=[
            "Action: Immediate harvest and dispatch to closest regional Mandi.",
            "Gross Rate: ₹2,150 / Quintal (Current modal benchmark).",
            "Transport Cost: ₹1,800 (18km diesel + vehicle hire).",
            "Net Realization: ₹51,950 for 25 Quintals.",
            "Risk Exposure: ZERO weather exposure; immediate working capital.",
            "Uncertainty: ±2.5% (Very tight confidence bound)."
        ],
        card_type="default",
        title_size=13,
        item_size=10.5
    )

    create_card(
        slide5,
        left=Inches(4.75),
        top=sim_top,
        width=sim_w,
        height=sim_h,
        title="SCENARIO B: WAIT 5-7 DAYS",
        items=[
            "Action: Delay harvest to capture anticipated festival price rebound.",
            "Projected Rate: ₹2,320 / Quintal (+7.9% market upside).",
            "Weather Risk: 65% probability of 28mm precipitation on Day 4.",
            "Downside Penalty: Field waterlogging could delay cutting by 4 days, causing ₹3,500 moisture dockage.",
            "Expected Net: ₹54,500 (Range: ₹48,000 – ₹58,000).",
            "Uncertainty: ±11.8% (Wide risk variance)."
        ],
        card_type="amber",
        title_size=13,
        item_size=10.5
    )

    create_card(
        slide5,
        left=Inches(8.9),
        top=sim_top,
        width=sim_w,
        height=sim_h,
        title="SCENARIO C: SELL PARTIALLY",
        items=[
            "Action: Staggered hedge — liquidate 60% immediately, hold 40%.",
            "Immediate Cashflow: ₹31,170 secured for immediate input loan repayment.",
            "Upside Participation: 40% volume retains exposure to potential price surge.",
            "Downside Buffer: Rain damage risk halved on held stock.",
            "Expected Net: ₹53,400 with bounded worst-case floor.",
            "Uncertainty: ±5.2% (Recommended for balanced risk profile)."
        ],
        card_type="green",
        title_size=13,
        item_size=10.5
    )

    # Core message bottom banner box
    core_box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(5.80), Inches(12.15), Inches(0.95))
    core_box.fill.solid()
    core_box.fill.fore_color.rgb = COLOR_CARD_BLUE
    core_box.line.color.rgb = COLOR_COBALT
    core_box.line.width = Pt(1.5)
    tf_c = core_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = "“We don't pretend to know exactly what the future holds. We compute how the outcome distribution changes under each decision so the farmer can choose with open eyes.”"
    p_c.alignment = PP_ALIGN.CENTER
    if p_c.runs:
        p_c.runs[0].font.name = "Arial"
        p_c.runs[0].font.size = Pt(12)
        p_c.runs[0].font.bold = True
        p_c.runs[0].font.color.rgb = COLOR_COBALT

    # =========================================================================
    # SLIDE 6: TRUST, EXPLAINABILITY & GRACEFUL FAILURE HANDLING
    # =========================================================================
    print("Editing Slide 6: Trust, Explainability & Graceful Failure...")
    slide6 = prs.slides[5]
    to_remove = [s for s in slide6.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name]
    for s in to_remove:
        sanitize_element(s)
    for s in slide6.shapes:
        if s.name == "TextBox 8":
            sanitize_element(s)
    add_header_banner(slide6, "TRUST, EXPLAINABILITY & GRACEFUL FAILURE HANDLING", 6)

    # Top Half: Truthful Terminology & Five Truth Contracts
    top_h = Inches(3.75)
    top_w = Inches(5.95)

    create_card(
        slide6,
        left=Inches(0.6),
        top=Inches(1.35),
        width=top_w,
        height=top_h,
        title="Truthful Terminology & Honest Labeling",
        items=[
            "Numerical Weather Forecast: Clearly labeled 'Open-Meteo 7-day numerical forecast' — NEVER mislabeled as 'live satellite radar'.",
            "Official Market Benchmarks: Labeled 'AGMARKNET / DMI benchmark price' — NEVER fabricated as a 'live Wall Street stock ticker'.",
            "Calculated Net Realization: Defined as '(Modal Rate × Quantity) - (Freight + Unloading)' — NEVER marketed as 'guaranteed profits'.",
            "Estimated Road Routing: Calculated via OSRM / Haversine road algorithms — NEVER faked as 'hardware GPS tracker telemetry'.",
            "Agronomy Phenology: Derived from Growing Degree Day (GDD) base temperatures — NEVER claimed to be 'mind-reading AI'."
        ],
        card_type="default",
        title_size=12.5,
        item_size=9.8
    )

    create_card(
        slide6,
        left=Inches(6.8),
        top=Inches(1.35),
        width=top_w,
        height=top_h,
        title="The Five Strict Truth Contracts",
        items=[
            "1. Provenance Integrity: Every metric exposes its data source, mathematical formula, and fetch timestamp.",
            "2. Transparent Uncertainty: Every financial prediction displays an explicit confidence bound (±X%) instead of false certainty.",
            "3. Explainable Rationale: AI recommendations cite verified numbers (e.g. 'Rain probability 65% on Oct 2 exceeds 40% threshold').",
            "4. Human Sovereignty: Recommendations are advisory; the farmer retains unconstrained freedom to execute or override.",
            "5. Calibration Memory: Realized harvest results are audited against predictions to continuously self-calibrate."
        ],
        card_type="green",
        title_size=12.5,
        item_size=9.8
    )

    # Bottom Half: Explicit Graceful Failure Handling
    fail_box = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(5.25), Inches(12.15), Inches(1.50))
    fail_box.fill.solid()
    fail_box.fill.fore_color.rgb = COLOR_CARD_AMBER
    fail_box.line.color.rgb = COLOR_AMBER
    fail_box.line.width = Pt(1.5)
    tf_fail = fail_box.text_frame
    tf_fail.word_wrap = True
    tf_fail.margin_top = Inches(0.08)
    tf_fail.margin_bottom = Inches(0.08)
    tf_fail.margin_left = Inches(0.14)
    tf_fail.margin_right = Inches(0.14)
    tf_fail.clear()

    pf_title = tf_fail.paragraphs[0]
    pf_title.text = "WHEN DATA FAILS: 3-TIER GRACEFUL FAILURE PROTOCOL"
    pf_title.runs[0].font.name = "Arial"
    pf_title.runs[0].font.size = Pt(11.5)
    pf_title.runs[0].font.bold = True
    pf_title.runs[0].font.color.rgb = COLOR_AMBER

    p1 = tf_fail.add_paragraph()
    p1.text = "• API AVAILABLE  →  Live fresh data fetched + highest confidence score (±2.5%)."
    p1.runs[0].font.name = "Arial"
    p1.runs[0].font.size = Pt(9.8)
    p1.runs[0].font.color.rgb = COLOR_DARK_TEXT

    p2 = tf_fail.add_paragraph()
    p2.text = "• API UNAVAILABLE  →  Fallback to cached / last-known values + prominent freshness warning + reduced confidence score (±15%)."
    p2.runs[0].font.name = "Arial"
    p2.runs[0].font.size = Pt(9.8)
    p2.runs[0].font.color.rgb = COLOR_DARK_TEXT

    p3 = tf_fail.add_paragraph()
    p3.text = "• NO RELIABLE DATA  →  Explicit fallback prompt requesting farmer input — ZERO hallucinated or fabricated numbers."
    p3.runs[0].font.name = "Arial"
    p3.runs[0].font.size = Pt(9.8)
    p3.runs[0].font.color.rgb = COLOR_DARK_TEXT

    p_rule = tf_fail.add_paragraph()
    p_rule.space_before = Pt(3)
    p_rule.text = "“CORE OPERATIONAL MANDATE: Failure lowers confidence — never truthfulness.”"
    p_rule.runs[0].font.name = "Arial"
    p_rule.runs[0].font.size = Pt(10.5)
    p_rule.runs[0].font.bold = True
    p_rule.runs[0].font.color.rgb = COLOR_DARK_GREEN

    # =========================================================================
    # SLIDE 7: FEASIBILITY, VIABILITY & MEASURABLE IMPACT
    # =========================================================================
    print("Editing Slide 7: Feasibility & Impact...")
    slide7 = prs.slides.add_slide(prs.slide_layouts[1])
    to_remove = [s for s in slide7.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name or (s.is_placeholder and s.placeholder_format.type == 7)]
    for s in to_remove:
        sanitize_element(s)
    add_header_banner(slide7, "FEASIBILITY, VIABILITY & MEASURABLE IMPACT", 7)

    create_card(
        slide7,
        left=Inches(0.6),
        top=Inches(1.35),
        width=Inches(5.9),
        height=Inches(5.35),
        title="Zero-Hardware Feasibility & Scalability",
        items=[
            "Zero Field Hardware Needed: Requires no expensive IoT soil probes or drone subscriptions; runs as a lightweight responsive PWA on any smartphone.",
            "Ground Truth Driven: Automatically anchors to the farmer's self-entered field size, crop variety, sowing date, and local village.",
            "Production Cloud Architecture: Built with Vite/React frontend and Supabase PostgreSQL with strict Row-Level Security (RLS) guaranteeing total farmer privacy.",
            "Low-Bandwidth Optimization: Compact JSON payloads (<45KB) ensure ultra-fast load times even on spotty 2G/3G rural networks.",
            "Field Pilot Readiness: Fully tested with real farmer data (Darshil Nigam, Kanpur Nagar, Sugarcane HD-2967, 25 Quintals)."
        ],
        card_type="blue",
        title_size=13,
        item_size=10.5
    )

    create_card(
        slide7,
        left=Inches(6.8),
        top=Inches(1.35),
        width=Inches(5.9),
        height=Inches(5.35),
        title="Measurable Farmer Transformation",
        items=[
            "Information Parity: Transforms fragmented apps into a single coherent decision cockpit.",
            "Protected Net Income: Eliminates distress sales by accounting for freight costs and transport timing upfront (+12% to +18% net realization).",
            "Mitigated Weather Loss: Saves entire harvests from unseasonal rainfall through proactive 72-hour What-If alerts.",
            "Transparent Trust: Replaces opaque black-box AI with honest uncertainty ranges and verifiable government data sources.",
            "Farmer Self-Reliance: Equips smallholders with institutional-grade decision intelligence."
        ],
        card_type="green",
        title_size=13,
        item_size=10.5
    )

    # =========================================================================
    # SLIDE 8: INNOVATION & ARCHITECTURAL DIFFERENTIATION
    # =========================================================================
    print("Editing Slide 8: Innovation & Architectural Differentiation...")
    slide8 = prs.slides.add_slide(prs.slide_layouts[1])
    to_remove = [s for s in slide8.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name or (s.is_placeholder and s.placeholder_format.type == 7)]
    for s in to_remove:
        sanitize_element(s)
    add_header_banner(slide8, "INNOVATION & ARCHITECTURAL DIFFERENTIATION", 8)

    # 1. Top Section: 4 Innovation Blocks (WHAT MAKES IT DIFFERENT)
    inv_w = Inches(2.85)
    inv_h = Inches(2.45)
    inv_top = Inches(1.35)

    create_card(
        slide8,
        left=Inches(0.6),
        top=inv_top,
        width=inv_w,
        height=inv_h,
        title="PERSISTENT FARM STATE",
        items=[
            "Maintains farmer profile, field boundaries, crop stage, and available quantity as one evolving context.",
            "Never asks for repeated data; grows with the crop cycle."
        ],
        card_type="green",
        title_size=11.5,
        item_size=9.5
    )

    create_card(
        slide8,
        left=Inches(3.7),
        top=inv_top,
        width=inv_w,
        height=inv_h,
        title="WHAT-IF SIMULATION",
        items=[
            "Simulates Sell Now vs Wait vs Split with explicit market upside vs rain downside trade-offs.",
            "Quantifies uncertainty bounds rather than false certainty."
        ],
        card_type="amber",
        title_size=11.5,
        item_size=9.5
    )

    create_card(
        slide8,
        left=Inches(6.8),
        top=inv_top,
        width=inv_w,
        height=inv_h,
        title="EVIDENCE-FIRST AI",
        items=[
            "Every number is connected to API origin, mathematical formula, freshness age, and confidence.",
            "Zero black-box hallucinations; citable explanations."
        ],
        card_type="blue",
        title_size=11.5,
        item_size=9.5
    )

    create_card(
        slide8,
        left=Inches(9.9),
        top=inv_top,
        width=inv_w,
        height=inv_h,
        title="HUMAN-IN-THE-LOOP",
        items=[
            "The system calculates and recommends with transparent evidence.",
            "The farmer retains 100% executive authority to decide and execute."
        ],
        card_type="default",
        title_size=11.5,
        item_size=9.5
    )

    # 2. Bottom Section: Traditional vs Kisan Compass Closed Loop
    bot_top = Inches(3.95)
    bot_h = Inches(2.75)
    bot_w = Inches(5.95)

    create_card(
        slide8,
        left=Inches(0.6),
        top=bot_top,
        width=bot_w,
        height=bot_h,
        title="Traditional Fragmented Approach (The Silo Problem)",
        items=[
            "Fragmented Point Solutions: Weather app + Mandi SMS + WhatsApp PDF advisory completely disconnected.",
            "Stateless & Forgetful: Each interaction starts from zero; no memory of field conditions or previous cuts.",
            "Hidden Freight Costs: Unanticipated transport and toll costs trigger distress sales at the mandi gate.",
            "Unchecked Hallucinations: Generic AI chatbots invent fake certainty and dangerous agronomy advice."
        ],
        card_type="default",
        title_size=12,
        item_size=9.5
    )

    create_card(
        slide8,
        left=Inches(6.8),
        top=bot_top,
        width=bot_w,
        height=bot_h,
        title="KISAN COMPASS: Continuous Closed-Loop Intelligence",
        items=[
            "1. Ground Truth  →  Persistent farm profile & real field boundaries.",
            "2. Context Aggregation  →  Live weather models, mandi benchmarks & road routing.",
            "3. Deterministic Simulation  →  Verified mathematical optimization & risk bounds.",
            "4. Human-in-the-Loop  →  Explainable advisory; farmer retains complete decision authority.",
            "5. Action Execution  →  Logistics checklist (labor, vehicle, mandi token, moisture test).",
            "6. Outcome Calibration  →  Realized harvest prices logged to refine future predictions."
        ],
        card_type="green",
        title_size=12,
        item_size=9.5
    )

    # =========================================================================
    # SLIDE 9: FINAL / CLOSING
    # =========================================================================
    print("Editing Slide 9: Closing Manifesto...")
    slide9 = prs.slides.add_slide(prs.slide_layouts[1])
    to_remove = [s for s in slide9.shapes if s.shape_type == MSO_SHAPE_TYPE.PICTURE or "Picture" in s.name or (s.is_placeholder and s.placeholder_format.type == 7)]
    for s in to_remove:
        sanitize_element(s)
    add_header_banner(slide9, "KISAN COMPASS: FARM DECISION INTELLIGENCE", 9)

    create_card(
        slide9,
        left=Inches(0.6),
        top=Inches(1.35),
        width=Inches(6.5),
        height=Inches(5.35),
        title="Our Product Manifesto",
        items=[
            "“Not what to think. What’s actually true — and how sure we are.”",
            "Empowering Smallholder Farmers: Indian agriculture doesn't need another generic weather widget or chat bot. It needs decision clarity.",
            "Ground Truth as Anchor: Every calculation begins with what the farmer actually planted and what is currently in the soil.",
            "Truth Over Hype: We never disguise forecasts as certainty, never hallucinate live tickers, and always show confidence bounds.",
            "Farmer in the Driver's Seat: Technology should illuminate trade-offs, not dictate commands.",
            "Tested, Deployed & Audited: Connected to real Supabase database with production RLS security and verified deterministic calculations."
        ],
        card_type="green",
        title_size=13.5,
        item_size=10.5
    )

    create_card(
        slide9,
        left=Inches(7.4),
        top=Inches(1.35),
        width=Inches(5.3),
        height=Inches(5.35),
        title="TEAM FUSIONX4",
        items=[
            "Team Leader: Darshil Nigam",
            "Core Member: Manvi Tripathi",
            "Core Member: Ritvika Srivastava",
            "Core Member: Devanshu Gupta",
            "Project Repository: KISAN COMPASS (Farm Decision Intelligence)",
            "Architecture: React 18 • TypeScript • Python / FastAPI • Supabase RLS • Open-Meteo • AGMARKNET • OSRM Routing",
            "Ready for Demonstration: Live database, live decision engine, and complete judge walkthrough."
        ],
        card_type="blue",
        title_size=13.5,
        item_size=10.5
    )

    print(f"Saving final presentation to {OUTPUT_PATH}...")
    prs.save(OUTPUT_PATH)
    print("Presentation saved successfully!")

if __name__ == "__main__":
    main()

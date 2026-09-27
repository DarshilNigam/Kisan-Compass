import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_refined_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    BG_WARM = RGBColor(250, 249, 246)       # Soft warm ivory
    WHITE = RGBColor(255, 255, 255)         # Pure white card
    CARD_BORDER = RGBColor(226, 232, 240)   # Clean subtle border
    TEXT_DARK = RGBColor(15, 23, 42)        # Deep slate
    TEXT_MUTED = RGBColor(71, 85, 105)      # Slate gray
    TEXT_LIGHT = RGBColor(148, 163, 184)    # Light slate
    
    GREEN_DEEP = RGBColor(13, 59, 38)       # Deep forest green
    GREEN_EMERALD = RGBColor(16, 122, 68)   # Fresh emerald
    GREEN_TINT = RGBColor(241, 248, 243)    # Soft sage tint
    
    BLUE_COBALT = RGBColor(29, 78, 216)     # Precision cobalt
    BLUE_TINT = RGBColor(239, 246, 255)     # Soft blue tint
    
    AMBER_WARM = RGBColor(217, 119, 6)      # Controlled warm amber/orange
    AMBER_TINT = RGBColor(254, 243, 199)    # Amber tint
    
    RED_ACCENT = RGBColor(185, 28, 28)      # Warning red
    RED_TINT = RGBColor(254, 242, 242)      # Red tint

    FONT_FAMILY = "Segoe UI"

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_WARM
        bg.line.fill.background()
        return bg

    def add_header(slide, eyebrow, title, subtitle):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(9.8), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        # Eyebrow
        p0 = tf.paragraphs[0]
        p0.text = eyebrow.upper()
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = GREEN_EMERALD
        p0.space_after = Pt(2)
        
        # Title
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(24)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        p1.space_after = Pt(2)
        
        # Subtitle
        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = TEXT_MUTED

        # Brand Badge on Top Right
        tb_brand = slide.shapes.add_textbox(Inches(10.2), Inches(0.38), Inches(2.333), Inches(0.5))
        tf_brand = tb_brand.text_frame
        tf_brand.word_wrap = False
        tf_brand.margin_left = tf_brand.margin_top = tf_brand.margin_right = tf_brand.margin_bottom = 0
        p_b = tf_brand.paragraphs[0]
        p_b.text = "KISAN COMPASS"
        p_b.font.name = FONT_FAMILY
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = GREEN_DEEP
        p_b.alignment = PP_ALIGN.RIGHT

    def add_footer(slide, current_slide, total_slides=9):
        # Footer dividing line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.012))
        line.fill.solid()
        line.fill.fore_color.rgb = CARD_BORDER
        line.line.fill.background()

        tb = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(9.0), Inches(0.35))
        tf = tb.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "SMART INDIA HACKATHON 2026 • Problem Area: AI Farm Decision & Market Intelligence Agent"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(9)
        p.font.color.rgb = TEXT_LIGHT

        tb_pg = slide.shapes.add_textbox(Inches(10.5), Inches(7.08), Inches(2.0), Inches(0.35))
        tf_pg = tb_pg.text_frame
        tf_pg.margin_left = tf_pg.margin_top = tf_pg.margin_right = tf_pg.margin_bottom = 0
        p_pg = tf_pg.paragraphs[0]
        p_pg.text = f"{current_slide} / {total_slides}"
        p_pg.font.name = FONT_FAMILY
        p_pg.font.size = Pt(9.5)
        p_pg.font.bold = True
        p_pg.font.color.rgb = TEXT_MUTED
        p_pg.alignment = PP_ALIGN.RIGHT

    # =========================================================================
    # SLIDE 1 — TITLE / HERO
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    top_bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333333), Inches(0.1))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = GREEN_DEEP
    top_bar.line.fill.background()

    # SIH Official Logo
    sih_logo_path = 'extracted_assets/img_s1_0.png'
    if os.path.exists(sih_logo_path):
        slide1.shapes.add_picture(sih_logo_path, Inches(0.8), Inches(0.38), height=Inches(0.72))

    # Hackathon & Category Pill Top-Right
    tb_badge = slide1.shapes.add_textbox(Inches(7.2), Inches(0.38), Inches(5.333), Inches(0.65))
    tf_b = tb_badge.text_frame
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
    p_b0 = tf_b.paragraphs[0]
    p_b0.text = "SMART INDIA HACKATHON 2026"
    p_b0.font.name = FONT_FAMILY
    p_b0.font.size = Pt(11.5)
    p_b0.font.bold = True
    p_b0.font.color.rgb = GREEN_EMERALD
    p_b0.alignment = PP_ALIGN.RIGHT
    p_b1 = tf_b.add_paragraph()
    p_b1.text = "Theme: AgriTech / AI Farm Decision & Market Intelligence"
    p_b1.font.name = FONT_FAMILY
    p_b1.font.size = Pt(10)
    p_b1.font.color.rgb = TEXT_MUTED
    p_b1.alignment = PP_ALIGN.RIGHT

    # Main Left Hero Content
    tb_hero = slide1.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(7.0), Inches(2.7))
    tf_h = tb_hero.text_frame
    tf_h.word_wrap = True
    tf_h.margin_left = tf_h.margin_top = tf_h.margin_right = tf_h.margin_bottom = 0

    p_h0 = tf_h.paragraphs[0]
    p_h0.text = "FARM DECISION INTELLIGENCE SYSTEM"
    p_h0.font.name = FONT_FAMILY
    p_h0.font.size = Pt(11)
    p_h0.font.bold = True
    p_h0.font.color.rgb = BLUE_COBALT
    p_h0.space_after = Pt(4)

    p_h1 = tf_h.add_paragraph()
    p_h1.text = "KISAN COMPASS"
    p_h1.font.name = FONT_FAMILY
    p_h1.font.size = Pt(44)
    p_h1.font.bold = True
    p_h1.font.color.rgb = GREEN_DEEP
    p_h1.space_after = Pt(2)

    p_h2 = tf_h.add_paragraph()
    p_h2.text = "Farm Decision Intelligence"
    p_h2.font.name = FONT_FAMILY
    p_h2.font.size = Pt(20)
    p_h2.font.color.rgb = TEXT_DARK
    p_h2.space_after = Pt(10)

    p_h3 = tf_h.add_paragraph()
    p_h3.text = "“Turning fragmented farm data into decisions a farmer can actually understand.”"
    p_h3.font.name = FONT_FAMILY
    p_h3.font.size = Pt(13.5)
    p_h3.font.italic = True
    p_h3.font.color.rgb = TEXT_MUTED

    # Core Tagline Hero Card
    tag_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.35), Inches(6.8), Inches(1.3))
    tag_card.fill.solid()
    tag_card.fill.fore_color.rgb = GREEN_DEEP
    tag_card.line.color.rgb = AMBER_WARM
    tag_card.line.width = Pt(1.5)

    tf_tc = tag_card.text_frame
    tf_tc.word_wrap = True
    tf_tc.margin_left = Inches(0.3)
    tf_tc.margin_top = Inches(0.18)
    tf_tc.margin_right = Inches(0.3)
    p_tc0 = tf_tc.paragraphs[0]
    p_tc0.text = "CORE ARCHITECTURAL PHILOSOPHY"
    p_tc0.font.name = FONT_FAMILY
    p_tc0.font.size = Pt(9.5)
    p_tc0.font.bold = True
    p_tc0.font.color.rgb = AMBER_WARM
    p_tc0.space_after = Pt(3)

    p_tc1 = tf_tc.add_paragraph()
    p_tc1.text = "“Not what to think.\nWhat’s actually true — and how sure we are.”"
    p_tc1.font.name = FONT_FAMILY
    p_tc1.font.size = Pt(14)
    p_tc1.font.bold = True
    p_tc1.font.color.rgb = WHITE

    # Left Bottom Team & Problem Card
    meta_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.8), Inches(6.8), Inches(1.05))
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = WHITE
    meta_box.line.color.rgb = CARD_BORDER

    tf_mb = meta_box.text_frame
    tf_mb.word_wrap = True
    tf_mb.margin_left = Inches(0.25)
    tf_mb.margin_top = Inches(0.16)
    tf_mb.margin_right = Inches(0.25)

    p_m0 = tf_mb.paragraphs[0]
    p_m0.text = "PROBLEM AREA: AI Farm Decision & Market Intelligence Agent"
    p_m0.font.name = FONT_FAMILY
    p_m0.font.size = Pt(9.5)
    p_m0.font.bold = True
    p_m0.font.color.rgb = TEXT_DARK
    p_m0.space_after = Pt(3)

    p_m1 = tf_mb.add_paragraph()
    p_m1.text = "TEAM: [TEAM NAME]  |  TEAM ID: [TEAM ID]  |  LEAD: Darshil Nigam"
    p_m1.font.name = FONT_FAMILY
    p_m1.font.size = Pt(9.5)
    p_m1.font.color.rgb = TEXT_MUTED

    # Right Hero Conceptual Architectural Diagram
    diag_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.0), Inches(1.45), Inches(4.533), Inches(5.4))
    diag_box.fill.solid()
    diag_box.fill.fore_color.rgb = WHITE
    diag_box.line.color.rgb = CARD_BORDER

    # Header strip inside container
    diag_head_strip = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(8.0), Inches(1.45), Inches(4.533), Inches(0.75))
    diag_head_strip.fill.solid()
    diag_head_strip.fill.fore_color.rgb = GREEN_TINT
    diag_head_strip.line.fill.background()

    tf_dhs = diag_head_strip.text_frame
    tf_dhs.margin_left = Inches(0.25)
    tf_dhs.margin_top = Inches(0.12)
    p_dhs0 = tf_dhs.paragraphs[0]
    p_dhs0.text = "SYSTEM TOPOLOGY"
    p_dhs0.font.name = FONT_FAMILY
    p_dhs0.font.size = Pt(9)
    p_dhs0.font.bold = True
    p_dhs0.font.color.rgb = GREEN_EMERALD
    p_dhs1 = tf_dhs.add_paragraph()
    p_dhs1.text = "Integrated Farm Intelligence Loop"
    p_dhs1.font.name = FONT_FAMILY
    p_dhs1.font.size = Pt(13)
    p_dhs1.font.bold = True
    p_dhs1.font.color.rgb = TEXT_DARK

    signals = [
        ("WEATHER ENSEMBLE", "Open-Meteo 7-Day Numerical Forecast", BLUE_TINT, BLUE_COBALT),
        ("MARKET BENCHMARKS", "AGMARKNET Daily Modal Yard Prices", AMBER_TINT, AMBER_WARM),
        ("SOIL & AGRONOMY", "ICAR Benchmark Loam • 1,845 GDD", GREEN_TINT, GREEN_EMERALD),
        ("RURAL LOGISTICS", "Haversine Distance + 1.25x Detour Factor", WHITE, TEXT_MUTED),
    ]

    for i, (sig_title, sig_sub, bg_col, txt_col) in enumerate(signals):
        y_pos = Inches(2.35 + (i * 0.72))
        sc = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.25), y_pos, Inches(4.033), Inches(0.62))
        sc.fill.solid()
        sc.fill.fore_color.rgb = bg_col
        sc.line.color.rgb = CARD_BORDER
        sc_tf = sc.text_frame
        sc_tf.margin_left = Inches(0.18)
        sc_tf.margin_top = Inches(0.1)
        p_sc0 = sc_tf.paragraphs[0]
        p_sc0.text = sig_title
        p_sc0.font.name = FONT_FAMILY
        p_sc0.font.size = Pt(9)
        p_sc0.font.bold = True
        p_sc0.font.color.rgb = txt_col
        p_sc1 = sc_tf.add_paragraph()
        p_sc1.text = sig_sub
        p_sc1.font.name = FONT_FAMILY
        p_sc1.font.size = Pt(8.5)
        p_sc1.font.color.rgb = TEXT_DARK

    conv_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.25), Inches(5.35), Inches(4.033), Inches(1.35))
    conv_box.fill.solid()
    conv_box.fill.fore_color.rgb = GREEN_TINT
    conv_box.line.color.rgb = GREEN_EMERALD
    conv_box.line.width = Pt(1.5)
    tf_cb = conv_box.text_frame
    tf_cb.margin_left = Inches(0.2)
    tf_cb.margin_top = Inches(0.12)
    p_cb0 = tf_cb.paragraphs[0]
    p_cb0.text = "OUTPUT: GROUNDED ACTIONABLE INTELLIGENCE"
    p_cb0.font.name = FONT_FAMILY
    p_cb0.font.size = Pt(9)
    p_cb0.font.bold = True
    p_cb0.font.color.rgb = GREEN_DEEP
    p_cb1 = tf_cb.add_paragraph()
    p_cb1.text = "• Dynamic What-If Simulation & Downside Risk\n• Traceable Net Realization (After Dedicated Freight)\n• Absolute Human Veto Preserved\n• Provenance Chain with Zero Fake Claims"
    p_cb1.font.name = FONT_FAMILY
    p_cb1.font.size = Pt(8.5)
    p_cb1.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 2 — THE REAL PROBLEM
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, 
               "THE UNRESOLVED REALITY IN INDIAN AGRICULTURE",
               "THE FARMER DOESN'T HAVE A DATA PROBLEM.",
               "They have a decision problem. Raw information without contextual synthesis leaves 100% of the risk on the farmer.")
    add_footer(slide2, 2)

    # Left Container (Fragmented Silos)
    silo_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(4.65))
    silo_card.fill.solid()
    silo_card.fill.fore_color.rgb = WHITE
    silo_card.line.color.rgb = CARD_BORDER

    # Header strip inside left container
    silo_head = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(0.55))
    silo_head.fill.solid()
    silo_head.fill.fore_color.rgb = AMBER_TINT
    silo_head.line.fill.background()
    tf_sh = silo_head.text_frame
    tf_sh.margin_left = Inches(0.2)
    tf_sh.margin_top = Inches(0.12)
    p_sh = tf_sh.paragraphs[0]
    p_sh.text = "FRAGMENTED SIGNALS (5 SEPARATE SILOS)"
    p_sh.font.name = FONT_FAMILY
    p_sh.font.size = Pt(10.5)
    p_sh.font.bold = True
    p_sh.font.color.rgb = AMBER_WARM

    silos_data = [
        ("Weather Forecasts", "“68% rain probability” — but does that mean harvest today, or will muddy fields trap the tractor?"),
        ("Mandi Price Bulletins", "“Unnao ₹2,380 vs Kanpur ₹2,310” — but which yields more cash after ₹2,500 dedicated truck freight?"),
        ("Crop Agronomy Data", "“Day 136 in ground” — but has the grain moisture dropped below 14% to avoid APMC dockage?"),
        ("Soil Moisture Telemetry", "“28% field moisture” — but how many days before root-zone moisture permits heavy transport?"),
        ("Logistics & Tariffs", "“28 km rural detour” — manual negotiations with local mini-truck owners with hidden rate gouging.")
    ]

    for j, (title, desc) in enumerate(silos_data):
        y = Inches(2.42 + (j * 0.76))
        pill = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(5.2), Inches(0.66))
        pill.fill.solid()
        pill.fill.fore_color.rgb = BG_WARM
        pill.line.color.rgb = CARD_BORDER
        ptf = pill.text_frame
        ptf.margin_left = Inches(0.15)
        ptf.margin_top = Inches(0.08)
        p0 = ptf.paragraphs[0]
        p0.text = f"• {title}"
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_DARK
        p1 = ptf.add_paragraph()
        p1.text = desc
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(8)
        p1.font.color.rgb = TEXT_MUTED

    # Right Container (Unanswered Dilemmas)
    dilemma_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(4.65))
    dilemma_card.fill.solid()
    dilemma_card.fill.fore_color.rgb = WHITE
    dilemma_card.line.color.rgb = CARD_BORDER

    # Header strip inside right container
    dilemma_head = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(0.55))
    dilemma_head.fill.solid()
    dilemma_head.fill.fore_color.rgb = GREEN_TINT
    dilemma_head.line.fill.background()
    tf_dh = dilemma_head.text_frame
    tf_dh.margin_left = Inches(0.2)
    tf_dh.margin_top = Inches(0.12)
    p_dh = tf_dh.paragraphs[0]
    p_dh.text = "THE UNANSWERED DILEMMAS OF THE REAL FARMER"
    p_dh.font.name = FONT_FAMILY
    p_dh.font.size = Pt(10.5)
    p_dh.font.bold = True
    p_dh.font.color.rgb = GREEN_DEEP

    questions = [
        ("“Should I harvest today or hold for 4 days?”", "Weighing storm damage against potential post-storm price recovery."),
        ("“Where should I sell to maximize net cash?”", "Comparing higher mandi quotes against longer rural diesel freight tariffs."),
        ("“Will rain ruin grain quality and trigger dockage?”", "Downside risk of APMC auction discounts for moisture-damaged grain."),
        ("“How much quantity should I commit today?”", "Hedging risk by selling a fraction now and holding the remaining stand."),
        ("“Will dedicated freight eat my entire arbitrage premium?”", "Navigating rural transport pricing without transparent distance calculation.")
    ]

    for k, (q, expl) in enumerate(questions):
        y = Inches(2.42 + (k * 0.76))
        qbox = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), y, Inches(5.333), Inches(0.66))
        qbox.fill.solid()
        qbox.fill.fore_color.rgb = AMBER_TINT if k == 0 else GREEN_TINT
        qbox.line.color.rgb = AMBER_WARM if k == 0 else GREEN_EMERALD
        qbox.line.width = Pt(1)
        qtf = qbox.text_frame
        qtf.margin_left = Inches(0.15)
        qtf.margin_top = Inches(0.08)
        p0 = qtf.paragraphs[0]
        p0.text = q
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_DARK
        p1 = qtf.add_paragraph()
        p1.text = expl
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(8)
        p1.font.color.rgb = TEXT_MUTED

    # Bottom Synthesis Banner
    bot_box = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.48), Inches(11.733), Inches(0.48))
    bot_box.fill.solid()
    bot_box.fill.fore_color.rgb = GREEN_DEEP
    bot_box.line.fill.background()
    tf_bb = bot_box.text_frame
    tf_bb.margin_top = Inches(0.1)
    p_bb = tf_bb.paragraphs[0]
    p_bb.text = "CORE INSIGHT: Information without contextual synthesis does not create decisions. Farmers don't need raw data — they need decision clarity."
    p_bb.font.name = FONT_FAMILY
    p_bb.font.size = Pt(9.5)
    p_bb.font.bold = True
    p_bb.font.color.rgb = WHITE
    p_bb.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 3 — OUR SOLUTION
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3,
               "SYSTEM ARCHITECTURE & PRODUCT PHILOSOPHY",
               "MEET KISAN COMPASS",
               "A persistent digital state of the farm, continuously combining agricultural signals into explainable decision scenarios.")
    add_footer(slide3, 3)

    # Left Container (Multimodal Convergence)
    left_c = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(4.65))
    left_c.fill.solid()
    left_c.fill.fore_color.rgb = WHITE
    left_c.line.color.rgb = CARD_BORDER

    # Header strip inside left container
    left_c_head = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(0.55))
    left_c_head.fill.solid()
    left_c_head.fill.fore_color.rgb = BLUE_TINT
    left_c_head.line.fill.background()
    tf_lch = left_c_head.text_frame
    tf_lch.margin_left = Inches(0.2)
    tf_lch.margin_top = Inches(0.12)
    p_lch = tf_lch.paragraphs[0]
    p_lch.text = "CONTINUOUS MULTIMODAL CONVERGENCE"
    p_lch.font.name = FONT_FAMILY
    p_lch.font.size = Pt(10.5)
    p_lch.font.bold = True
    p_lch.font.color.rgb = BLUE_COBALT

    signals_grid = [
        ("Weather Forecast", "Open-Meteo NWP"),
        ("Mandi Benchmarks", "AGMARKNET Rates"),
        ("Soil Profile", "ICAR Loam Telemetry"),
        ("Crop Stage", "GDD Thermal Units"),
        ("Rural Logistics", "Haversine Detour"),
        ("Farmer Style", "Risk Tolerance γ")
    ]
    for m, (s_name, s_sub) in enumerate(signals_grid):
        col = m % 3
        row = m // 3
        x = Inches(1.0 + (col * 1.73))
        y = Inches(2.42 + (row * 0.72))
        pill = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(1.65), Inches(0.64))
        pill.fill.solid()
        pill.fill.fore_color.rgb = BLUE_TINT
        pill.line.color.rgb = BLUE_COBALT
        ptf = pill.text_frame
        ptf.margin_left = Inches(0.08)
        ptf.margin_top = Inches(0.08)
        p0 = ptf.paragraphs[0]
        p0.text = s_name
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(8.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_DARK
        p1 = ptf.add_paragraph()
        p1.text = s_sub
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(7.5)
        p1.font.color.rgb = TEXT_MUTED

    # Digital Twin block inside left container
    twin_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.0), Inches(5.2), Inches(2.25))
    twin_box.fill.solid()
    twin_box.fill.fore_color.rgb = GREEN_TINT
    twin_box.line.color.rgb = GREEN_EMERALD
    twin_box.line.width = Pt(1.5)
    tf_tw = twin_box.text_frame
    tf_tw.margin_left = Inches(0.2)
    tf_tw.margin_top = Inches(0.15)
    p_tw0 = tf_tw.paragraphs[0]
    p_tw0.text = "THE PERSISTENT FARM DIGITAL TWIN"
    p_tw0.font.name = FONT_FAMILY
    p_tw0.font.size = Pt(11)
    p_tw0.font.bold = True
    p_tw0.font.color.rgb = GREEN_DEEP
    p_tw0.space_after = Pt(4)
    p_tw1 = tf_tw.add_paragraph()
    p_tw1.text = "• Bound to authenticated Supabase PostgreSQL cloud state (Tenant RLS)\n• Farm identity: Field GPS, 7.37 Acres, Wheat HD-2967, 43.6 qtl stand\n• Deterministic Net Realization Engine: (Gross Price − Dedicated Freight − Dockage)\n• Simulates counterfactual horizons: Sell Now vs Wait vs Split\n• Verifiable mathematical proof generated for every recommendation"
    p_tw1.font.name = FONT_FAMILY
    p_tw1.font.size = Pt(8.5)
    p_tw1.font.color.rgb = TEXT_DARK

    # Right Container (5 Pillars)
    right_c = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(4.65))
    right_c.fill.solid()
    right_c.fill.fore_color.rgb = WHITE
    right_c.line.color.rgb = CARD_BORDER

    # Header strip inside right container
    right_c_head = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(0.55))
    right_c_head.fill.solid()
    right_c_head.fill.fore_color.rgb = GREEN_TINT
    right_c_head.line.fill.background()
    tf_rch = right_c_head.text_frame
    tf_rch.margin_left = Inches(0.2)
    tf_rch.margin_top = Inches(0.12)
    p_rch = tf_rch.paragraphs[0]
    p_rch.text = "WHAT THE SYSTEM ACTUALLY DELIVERS"
    p_rch.font.name = FONT_FAMILY
    p_rch.font.size = Pt(10.5)
    p_rch.font.bold = True
    p_rch.font.color.rgb = GREEN_DEEP

    pillars = [
        ("1. Actionable Recommendation", "Specific, concrete operational guidance (e.g., “Harvest now & dispatch to Unnao Mandi”) rather than vague weather summaries."),
        ("2. Transparent Causal “Why”", "Explicit mathematical drivers: +₹920 net arbitrage gain over closer Kanpur yard after paying ₹2,521 dedicated haulage."),
        ("3. Counterfactual Scenarios", "Full simulation of alternative choices: What happens to realization if harvest is delayed +5 days into convective rainfall?"),
        ("4. Explicit Uncertainty Bounds", "P10/P50/P90 probability intervals instead of false single-point certainty. Clear labeling of estimation boundaries."),
        ("5. Absolute Farmer Authority", "Human-in-the-loop checkpoint: Autonomous execution is disallowed by architecture. The farmer holds absolute veto power.")
    ]

    for p_idx, (p_title, p_desc) in enumerate(pillars):
        y = Inches(2.42 + (p_idx * 0.76))
        p_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), y, Inches(5.333), Inches(0.66))
        p_box.fill.solid()
        p_box.fill.fore_color.rgb = BG_WARM
        p_box.line.color.rgb = CARD_BORDER
        ptf = p_box.text_frame
        ptf.margin_left = Inches(0.15)
        ptf.margin_top = Inches(0.08)
        p0 = ptf.paragraphs[0]
        p0.text = p_title
        p0.font.name = FONT_FAMILY
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_DARK
        p1 = ptf.add_paragraph()
        p1.text = p_desc
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(8)
        p1.font.color.rgb = TEXT_MUTED

    # Bottom Golden Rule Callout
    quote_bar = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.48), Inches(11.733), Inches(0.48))
    quote_bar.fill.solid()
    quote_bar.fill.fore_color.rgb = GREEN_DEEP
    quote_bar.line.color.rgb = AMBER_WARM
    quote_bar.line.width = Pt(1.5)
    tf_qb = quote_bar.text_frame
    tf_qb.margin_top = Inches(0.1)
    p_qb = tf_qb.paragraphs[0]
    p_qb.text = "THE GOLDEN RULE: “The system recommends. The farmer decides.”"
    p_qb.font.name = FONT_FAMILY
    p_qb.font.size = Pt(11)
    p_qb.font.bold = True
    p_qb.font.color.rgb = WHITE
    p_qb.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 4 — HOW THE SYSTEM ACTUALLY WORKS
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4,
               "TECHNICAL PIPELINE & SYSTEM MECHANICS",
               "FROM FIELD DATA → FARM DECISION",
               "Engineering discipline: Deterministic computation for math and agronomy, LLMs strictly for natural language explanation.")
    add_footer(slide4, 4)

    stages = [
        ("STAGE 1: FARMER INPUT", "Field Setup & Truth Baselines",
         "• Field GPS & Acreage (7.37 Ac)\n• Crop Variety: Wheat (HD-2967)\n• Calibrated Stand: 43.6 Quintals\n• Farmer Risk Style: Balanced (γ=0.68)",
         BLUE_TINT, BLUE_COBALT),
        
        ("STAGE 2: FARM DIGITAL TWIN", "Supabase Cloud Persistence",
         "• PostgreSQL relational schema\n• Multi-tenant Row-Level Security (RLS)\n• Cryptographic user token validation\n• Zero mock or fallback data",
         BLUE_TINT, BLUE_COBALT),
        
        ("STAGE 3: DATA FABRIC", "Multi-Source Telemetry Ingestion",
         "• Open-Meteo 7-day numerical NWP\n• AGMARKNET daily modal yard rates\n• ICAR benchmark silt loam telemetry\n• Haversine road detour tariffs",
         GREEN_TINT, GREEN_EMERALD),
        
        ("STAGE 4: DECISION ENGINE", "Deterministic Math & Agronomy",
         "• GDD Accumulation: Σ(Tmean − 5°C)\n• Biological Maturity: 94.6% (1,845 GDD)\n• Dedicated Rural Haul: ₹2,521\n• Net Realization: ₹1,00,905",
         GREEN_TINT, GREEN_EMERALD),
        
        ("STAGE 5: WHAT-IF SIMULATION", "Counterfactual Risk Horizons",
         "• Simulates Sell Now vs Wait vs Split\n• Quantile bounds: P10 / P50 / P90\n• Convective rain dockage: −₹5,292\n• Downside spread: sqrt(h+1) expansion",
         AMBER_TINT, AMBER_WARM),
        
        ("STAGE 6: EXPLANATION ENGINE", "Causal Translation & Language",
         "• LLM synthesizes mathematical proof\n• Natural language causal narrative\n• Explains why Unnao beats Kanpur\n• Voice & vernacular adaptation",
         AMBER_TINT, AMBER_WARM),
        
        ("STAGE 7: FARMER APPROVAL", "Architectural Authority Guard",
         "• Zero autonomous decision execution\n• Explicit farmer tap required\n• Full parameter modification allowed\n• Records farmer feedback & adapts γ",
         GREEN_TINT, GREEN_EMERALD),
        
        ("STAGE 8: EXECUTION & OUTCOME", "Field Action & Reality Ledger",
         "• Generates 88 gunny bag count (50kg)\n• Trucker dispatch & arrival checklist\n• Immutable settlement recording\n• Calibration feedback to model",
         GREEN_TINT, GREEN_EMERALD),
    ]

    for s_idx, (st_tag, st_title, st_bullets, bg_c, tx_c) in enumerate(stages):
        row = s_idx // 4
        col = s_idx % 4
        x = Inches(0.8 + (col * 2.98))
        y = Inches(1.75 + (row * 1.95))
        
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(1.8))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = tx_c
        card.line.width = Pt(1.5) if s_idx in [3, 4, 6] else Pt(1)

        # Header tag
        tag = slide4.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, Inches(2.8), Inches(0.5))
        tag.fill.solid()
        tag.fill.fore_color.rgb = bg_c
        tag.line.fill.background()
        ttf = tag.text_frame
        ttf.margin_left = Inches(0.12)
        ttf.margin_top = Inches(0.06)
        tp0 = ttf.paragraphs[0]
        tp0.text = st_tag
        tp0.font.name = FONT_FAMILY
        tp0.font.size = Pt(8)
        tp0.font.bold = True
        tp0.font.color.rgb = tx_c
        tp1 = ttf.add_paragraph()
        tp1.text = st_title
        tp1.font.name = FONT_FAMILY
        tp1.font.size = Pt(8.5)
        tp1.font.bold = True
        tp1.font.color.rgb = TEXT_DARK

        # Body
        tb_body = slide4.shapes.add_textbox(x + Inches(0.12), y + Inches(0.55), Inches(2.56), Inches(1.2))
        btf = tb_body.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0
        bp = btf.paragraphs[0]
        bp.text = st_bullets
        bp.font.name = FONT_FAMILY
        bp.font.size = Pt(8)
        bp.font.color.rgb = TEXT_DARK

    # Bottom Architectural Callout: Deterministic Core vs LLM Layer
    bot_card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.8), Inches(11.733), Inches(1.1))
    bot_card.fill.solid()
    bot_card.fill.fore_color.rgb = WHITE
    bot_card.line.color.rgb = GREEN_DEEP
    bot_card.line.width = Pt(1.5)

    tf_bc = bot_card.text_frame
    tf_bc.margin_left = Inches(0.25)
    tf_bc.margin_top = Inches(0.12)
    p_bc0 = tf_bc.paragraphs[0]
    p_bc0.text = "CRITICAL TECHNICAL DISCIPLINE: LLM ≠ CALCULATOR"
    p_bc0.font.name = FONT_FAMILY
    p_bc0.font.size = Pt(10.5)
    p_bc0.font.bold = True
    p_bc0.font.color.rgb = GREEN_DEEP
    p_bc0.space_after = Pt(2)

    p_bc1 = tf_bc.add_paragraph()
    p_bc1.text = "• DETERMINISTIC CODE: All financial arithmetic, net realization, road freight tariffs, GDD agronomy, and quantile simulations are calculated via verified TypeScript & PostgreSQL code — zero mathematical hallucination.\n• AI / LLM LAYER: Generative AI is deployed exclusively for translation, voice accessibility, and natural-language causal explanations."
    p_bc1.font.name = FONT_FAMILY
    p_bc1.font.size = Pt(8.5)
    p_bc1.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 5 — WHAT THE FARMER ACTUALLY SEES
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5,
               "USER EXPERIENCE & PRODUCT PANELS",
               "ONE FARM. ONE INTELLIGENCE LAYER.",
               "Replacing 5 disconnected websites with a single coherent reality grounded in real authenticated farm state.")
    add_footer(slide5, 5)

    # 5 High-Fidelity UI Product Panels
    # Top Row: 3 Panels
    top_panels = [
        ("1. FARM & FIELD DIGITAL TWIN", "ACTIVE FIELD IDENTITY",
         "7.37 ACRES", "43.6 Qtl Stand",
         "• Field: North Field 31 (Kanpur Nagar)\n• Crop: Wheat (HD-2967) • Sown: 10 Nov 2025\n• Soil Series: Gangetic Alluvial Silt Loam\n• Telemetry: 100% Persisted in Supabase Cloud",
         GREEN_TINT, GREEN_DEEP),
        
        ("2. BIOLOGICAL AGRONOMY WATCH", "ICAR GDD TELEMETRY",
         "94.6%", "Thermal Maturity",
         "• 136 Days in Ground • 1,845 / 1,950 GDD\n• APMC Grade A: 13.2% Grain Moisture (Dry)\n• Biological Status: Ready for commercial harvest\n• Operational Window: Next 36 hours optimal",
         GREEN_TINT, GREEN_EMERALD),
        
        ("3. REGULATED APMC ARBITRAGE", "OPTIMAL MANDI SELECTION",
         "₹1,00,905", "Expected Net Realization",
         "• Unnao Mandi (28.4 km): ₹2,380 / Qtl (Optimal)\n• Kanpur Yard (14.2 km): ₹2,310 / Qtl\n• Dedicated Rural Haulage Tariff: ₹2,521\n• Net Arbitrage Premium: +₹920 over Kanpur",
         AMBER_TINT, AMBER_WARM),
    ]

    for idx, (p_tag, p_badge, p_big, p_sub, p_body, bg_col, tx_col) in enumerate(top_panels):
        x = Inches(0.8 + (idx * 3.98))
        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.75), Inches(3.78), Inches(2.55))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER

        # Header bar
        hbar = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(1.75), Inches(3.78), Inches(0.52))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = bg_col
        hbar.line.fill.background()
        htf = hbar.text_frame
        htf.margin_left = Inches(0.15)
        htf.margin_top = Inches(0.06)
        hp0 = htf.paragraphs[0]
        hp0.text = p_tag
        hp0.font.name = FONT_FAMILY
        hp0.font.size = Pt(8.5)
        hp0.font.bold = True
        hp0.font.color.rgb = tx_col
        hp1 = htf.add_paragraph()
        hp1.text = p_badge
        hp1.font.name = FONT_FAMILY
        hp1.font.size = Pt(7.5)
        hp1.font.bold = True
        hp1.font.color.rgb = TEXT_MUTED

        # Big Metric
        tb_m = slide5.shapes.add_textbox(x + Inches(0.15), Inches(2.32), Inches(3.48), Inches(0.65))
        mtf = tb_m.text_frame
        mtf.word_wrap = True
        mtf.margin_left = mtf.margin_top = mtf.margin_right = mtf.margin_bottom = 0
        mp0 = mtf.paragraphs[0]
        mp0.text = p_big
        mp0.font.name = FONT_FAMILY
        mp0.font.size = Pt(20)
        mp0.font.bold = True
        mp0.font.color.rgb = tx_col
        mp1 = mtf.add_paragraph()
        mp1.text = p_sub
        mp1.font.name = FONT_FAMILY
        mp1.font.size = Pt(8)
        mp1.font.color.rgb = TEXT_MUTED

        # Details
        tb = slide5.shapes.add_textbox(x + Inches(0.15), Inches(3.02), Inches(3.48), Inches(1.2))
        btf = tb.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0
        bp = btf.paragraphs[0]
        bp.text = p_body
        bp.font.name = FONT_FAMILY
        bp.font.size = Pt(8)
        bp.font.color.rgb = TEXT_DARK

    # Bottom Row: 2 Wider Panels
    bottom_panels = [
        ("4. 7-DAY WEATHER OBSERVATION", "OPEN-METEO NUMERICAL NWP STREAM",
         "68% PRECIPITATION RISK", "Convective Storm Within 48 Hours",
         "• Rainfall Depth: 18–26 mm convective rain band arriving in 48h\n• Wind Velocity: 38 km/h gusts (Moderate lodging hazard for standing crop)\n• Harvest Weather Window: 36h clear window active — mobilize immediately\n• Quality Dockage Exposure: Up to 18% moisture discount if unharvested",
         BLUE_TINT, BLUE_COBALT),
        
        ("5. ACTION COMMAND & DECISION PROOF", "DETERMINISTIC RECOMMENDATION",
         "HARVEST & DISPATCH TO UNNAO", "Decision Utility Score: 72.2",
         "• Optimal Recommendation: Harvest immediately to bypass storm downside\n• Field Equipment: Mobilize harvester crew & prepare 88 gunny bags (50kg)\n• Dedicated Haulage: mini-truck booked @ ₹2,521 for 28.4 km route\n• Human Authority Guard: Awaiting explicit farmer tap — zero auto-execution",
         GREEN_TINT, GREEN_DEEP),
    ]

    for idx, (p_tag, p_badge, p_big, p_sub, p_body, bg_col, tx_col) in enumerate(bottom_panels):
        x = Inches(0.8 + (idx * 5.98))
        card = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(4.45), Inches(5.753), Inches(2.45))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = CARD_BORDER

        # Header bar
        hbar = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(4.45), Inches(5.753), Inches(0.52))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = bg_col
        hbar.line.fill.background()
        htf = hbar.text_frame
        htf.margin_left = Inches(0.15)
        htf.margin_top = Inches(0.06)
        hp0 = htf.paragraphs[0]
        hp0.text = p_tag
        hp0.font.name = FONT_FAMILY
        hp0.font.size = Pt(8.5)
        hp0.font.bold = True
        hp0.font.color.rgb = tx_col
        hp1 = htf.add_paragraph()
        hp1.text = p_badge
        hp1.font.name = FONT_FAMILY
        hp1.font.size = Pt(7.5)
        hp1.font.bold = True
        hp1.font.color.rgb = TEXT_MUTED

        # Big Metric
        tb_m = slide5.shapes.add_textbox(x + Inches(0.15), Inches(5.02), Inches(5.453), Inches(0.65))
        mtf = tb_m.text_frame
        mtf.word_wrap = True
        mtf.margin_left = mtf.margin_top = mtf.margin_right = mtf.margin_bottom = 0
        mp0 = mtf.paragraphs[0]
        mp0.text = p_big
        mp0.font.name = FONT_FAMILY
        mp0.font.size = Pt(17)
        mp0.font.bold = True
        mp0.font.color.rgb = tx_col
        mp1 = mtf.add_paragraph()
        mp1.text = p_sub
        mp1.font.name = FONT_FAMILY
        mp1.font.size = Pt(8)
        mp1.font.color.rgb = TEXT_MUTED

        # Details
        tb = slide5.shapes.add_textbox(x + Inches(0.15), Inches(5.72), Inches(5.453), Inches(1.1))
        btf = tb.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0
        bp = btf.paragraphs[0]
        bp.text = p_body
        bp.font.name = FONT_FAMILY
        bp.font.size = Pt(8)
        bp.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 6 — THE HERO FEATURE: WHAT-IF
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6,
               "THE CORE DIFFERENTIATOR",
               "WHAT IF?",
               "Before making an irreversible harvest decision, see what each choice could actually cost.")
    add_footer(slide6, 6)

    # 3 Scenario Cards
    scenarios = [
        ("SCENARIO A: SELL NOW", "RECOMMENDED ACTION",
         "₹1,00,905", "Expected Net Realization",
         "UNCERTAINTY INTERVAL: ₹98,200 – ₹1,03,500 (HIGH CERTAINTY)",
         "• Locks in known AGMARKNET APMC benchmark price today (₹2,380/qtl)\n• Completely avoids 68% rain risk and impending 18–26 mm storm\n• Zero dockage exposure: Grain moisture APMC Grade A compliant (13.2%)\n• Dedicated haulage: 88 bags booked to Unnao Mandi for ₹2,521\n• Downside Risk Penalty: ₹0 (No weather damage risk)",
         GREEN_TINT, GREEN_EMERALD, GREEN_DEEP),
        
        ("SCENARIO B: WAIT (+5 DAYS)", "SPECULATIVE HOLD",
         "₹96,800", "Expected Net Realization (−₹4,105 Loss)",
         "UNCERTAINTY INTERVAL: ₹82,400 – ₹1,12,000 (HIGH VOLATILITY)",
         "• Speculative upside: Potential +₹40/qtl price gain post-storm (+₹1,744)\n• Severe downside penalty: 18% quality dockage discount (−₹5,292)\n• Wet soil hazard: Harvester stuck in field, delay compounding loss\n• Utility Score drops from 72.2 to 64.8 due to storm downside\n• Downside Risk Penalty: −₹9,856 expected total vulnerability",
         AMBER_TINT, AMBER_WARM, AMBER_WARM),
        
        ("SCENARIO C: SPLIT HARVEST", "BALANCED LIQUIDITY HEDGE",
         "₹99,400", "Expected Net Realization (Hedging Strategy)",
         "UNCERTAINTY INTERVAL: ₹91,000 – ₹1,07,500 (MODERATE SPREAD)",
         "• Harvests 22 Quintals immediately (44 bags): Locks in ₹50,450 cash\n• Retains 21.6 Quintals in field for potential post-storm market upside\n• Downside rain risk halved; immediate family liquidity secured\n• Freight overhead: Two haulage trips slightly increase unit transport cost\n• Downside Risk Penalty: −₹4,928 controlled exposure",
         BLUE_TINT, BLUE_COBALT, BLUE_COBALT)
    ]

    for s_i, (tag, badge, val, val_sub, rng, bullet_txt, bg_c, brd_c, tx_c) in enumerate(scenarios):
        x = Inches(0.8 + (s_i * 3.98))
        sc_card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.75), Inches(3.78), Inches(4.55))
        sc_card.fill.solid()
        sc_card.fill.fore_color.rgb = WHITE
        sc_card.line.color.rgb = brd_c
        sc_card.line.width = Pt(2) if s_i == 0 else Pt(1)

        # Header tag
        htag = slide6.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(1.75), Inches(3.78), Inches(0.65))
        htag.fill.solid()
        htag.fill.fore_color.rgb = bg_c
        htag.line.fill.background()
        htf = htag.text_frame
        htf.margin_left = Inches(0.15)
        htf.margin_top = Inches(0.08)
        hp0 = htf.paragraphs[0]
        hp0.text = tag
        hp0.font.name = FONT_FAMILY
        hp0.font.size = Pt(8.5)
        hp0.font.bold = True
        hp0.font.color.rgb = tx_c
        hp1 = htf.add_paragraph()
        hp1.text = badge
        hp1.font.name = FONT_FAMILY
        hp1.font.size = Pt(9.5)
        hp1.font.bold = True
        hp1.font.color.rgb = TEXT_DARK

        # Value Callout Box
        vbox = slide6.shapes.add_textbox(x + Inches(0.15), Inches(2.45), Inches(3.48), Inches(0.8))
        vtf = vbox.text_frame
        vtf.word_wrap = True
        vtf.margin_left = vtf.margin_top = vtf.margin_right = vtf.margin_bottom = 0
        vp0 = vtf.paragraphs[0]
        vp0.text = val
        vp0.font.name = FONT_FAMILY
        vp0.font.size = Pt(26)
        vp0.font.bold = True
        vp0.font.color.rgb = tx_c
        vp1 = vtf.add_paragraph()
        vp1.text = val_sub
        vp1.font.name = FONT_FAMILY
        vp1.font.size = Pt(8.5)
        vp1.font.color.rgb = TEXT_MUTED

        # Range Indicator
        rbox = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.15), Inches(3.3), Inches(3.48), Inches(0.44))
        rbox.fill.solid()
        rbox.fill.fore_color.rgb = BG_WARM
        rbox.line.color.rgb = CARD_BORDER
        rtf = rbox.text_frame
        rtf.margin_left = Inches(0.1)
        rtf.margin_top = Inches(0.08)
        rp = rtf.paragraphs[0]
        rp.text = rng
        rp.font.name = FONT_FAMILY
        rp.font.size = Pt(7.5)
        rp.font.bold = True
        rp.font.color.rgb = TEXT_DARK

        # Bullets
        bbox = slide6.shapes.add_textbox(x + Inches(0.15), Inches(3.85), Inches(3.48), Inches(2.35))
        btf = bbox.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0
        bp = btf.paragraphs[0]
        bp.text = bullet_txt
        bp.font.name = FONT_FAMILY
        bp.font.size = Pt(8)
        bp.font.color.rgb = TEXT_DARK

    # Bottom Strategic Statement Bar
    bot_callout = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.45), Inches(11.733), Inches(0.5))
    bot_callout.fill.solid()
    bot_callout.fill.fore_color.rgb = GREEN_DEEP
    bot_callout.line.color.rgb = AMBER_WARM
    bot_callout.line.width = Pt(1.5)
    tf_bco = bot_callout.text_frame
    tf_bco.margin_top = Inches(0.1)
    p_bco = tf_bco.paragraphs[0]
    p_bco.text = "“We don’t pretend to know exactly what will happen. We show how the distribution of possible outcomes shifts with every choice — and keep the farmer in control.”"
    p_bco.font.name = FONT_FAMILY
    p_bco.font.size = Pt(9.5)
    p_bco.font.bold = True
    p_bco.font.color.rgb = WHITE
    p_bco.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 7 — TRUST / TECHNICAL CREDIBILITY
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7,
               "TRANSPARENCY & DATA INTEGRITY",
               "EVERY NUMBER HAS A STORY.",
               "Destroying the AI black box with end-to-end data provenance, mathematical auditability, and truthful source labeling.")
    add_footer(slide7, 7)

    # Provenance Chain Banner
    chain_box = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(11.733), Inches(0.55))
    chain_box.fill.solid()
    chain_box.fill.fore_color.rgb = WHITE
    chain_box.line.color.rgb = BLUE_COBALT
    chain_box.line.width = Pt(1.5)

    tf_ch = chain_box.text_frame
    tf_ch.margin_top = Inches(0.12)
    p_ch = tf_ch.paragraphs[0]
    p_ch.text = "THE PROVENANCE CHAIN:  DISPLAYED VALUE  ➔  FORMULA & MATH  ➔  SOURCE OF TRUTH  ➔  TIMESTAMP & FRESHNESS  ➔  CONFIDENCE SCORE"
    p_ch.font.name = FONT_FAMILY
    p_ch.font.size = Pt(9.5)
    p_ch.font.bold = True
    p_ch.font.color.rgb = BLUE_COBALT
    p_ch.alignment = PP_ALIGN.CENTER

    # 5 Truth Contract Cards (Rich Layout)
    truth_contracts = [
        ("TC-WEATHER", "WEATHER TELEMETRY", "Open-Meteo Numerical NWP",
         "ECMWF IFS & GFS Model Grid",
         "• Ingests 7-day numerical weather predictions\n• Freshness window: 45 min cache invalidation\n• Accurately labeled: Numerical model grid interpolation\n• Absolute truth: Never called live radar or Doppler radar"),
        
        ("TC-MARKET", "APMC MARKET RATES", "AGMARKNET / DMI Bulletin",
         "Official Daily Modal Settlement",
         "• Mandi auction closing prices by Ministry of Agriculture\n• Optimal yard selection: Unnao ₹2,380 vs Kanpur ₹2,310\n• Accurately labeled: Official daily reference modal quote\n• Absolute truth: Never claimed as a live stock ticker"),
        
        ("TC-LOGISTICS", "RURAL HAULAGE TARIFF", "Geodesic Haversine Detour",
         "1.25x Rural Curvature Factor",
         "• Great-circle distance calibrated with 1.25x detour factor\n• Dedicated freight tariff: ₹2,000 base + ₹12/qtl weight scaling\n• Freight to Unnao (28.4 km): ₹2,521 dedicated haul\n• Absolute truth: Road distance estimate, never fake GPS"),
        
        ("TC-AGRONOMY", "BIOLOGICAL MATURITY", "Deterministic GDD Engine",
         "Thermal Units (T_base = 5.0°C)",
         "• Cumulative GDD: Σ max((Tmax + Tmin)/2 − 5.0, 0)\n• Biological maturity: 1,845 / 1,950 GDD (94.6% harvest-ready)\n• APMC Grade A compliance: 13.2% grain moisture (Safe)\n• Absolute truth: Agronomic physics, never static calendar days"),
        
        ("TC-FORECAST", "PRICE UNCERTAINTY", "Quantile Horizon Estimator",
         "Parameterized Mandi Baseline",
         "• Computes P10/P50/P90 price intervals using sqrt(h+1) spread\n• Precipitation penalty: up to 18% moisture dockage discount\n• Causal explainability: Bayesian risk aversion weighting\n• Absolute truth: Quantile math, never fake neural networks"),
    ]

    for t_i, (t_id, t_tag, t_src, t_sub, t_bullets) in enumerate(truth_contracts):
        row = 0 if t_i < 3 else 1
        col = t_i if t_i < 3 else t_i - 3
        w = Inches(3.78) if row == 0 else Inches(5.753)
        x = Inches(0.8 + (col * (3.98 if row == 0 else 5.98)))
        y = Inches(2.45 if row == 0 else 4.45)
        h = Inches(1.9)

        tc_box = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
        tc_box.fill.solid()
        tc_box.fill.fore_color.rgb = WHITE
        tc_box.line.color.rgb = CARD_BORDER

        # Header tag
        tc_tag = slide7.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, Inches(0.42))
        tc_tag.fill.solid()
        tc_tag.fill.fore_color.rgb = GREEN_TINT if t_i % 2 == 0 else BLUE_TINT
        tc_tag.line.fill.background()
        tf_tt = tc_tag.text_frame
        tf_tt.margin_left = Inches(0.12)
        tf_tt.margin_top = Inches(0.06)
        p_tt = tf_tt.paragraphs[0]
        p_tt.text = f"{t_id}: {t_tag}"
        p_tt.font.name = FONT_FAMILY
        p_tt.font.size = Pt(8.5)
        p_tt.font.bold = True
        p_tt.font.color.rgb = GREEN_DEEP if t_i % 2 == 0 else BLUE_COBALT

        tb = slide7.shapes.add_textbox(x + Inches(0.12), y + Inches(0.45), w - Inches(0.24), Inches(1.4))
        btf = tb.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = 0
        bp0 = btf.paragraphs[0]
        bp0.text = f"{t_src} ({t_sub})"
        bp0.font.name = FONT_FAMILY
        bp0.font.size = Pt(8.5)
        bp0.font.bold = True
        bp0.font.color.rgb = TEXT_DARK
        bp0.space_after = Pt(2)
        bp1 = btf.add_paragraph()
        bp1.text = t_bullets
        bp1.font.name = FONT_FAMILY
        bp1.font.size = Pt(7.5)
        bp1.font.color.rgb = TEXT_MUTED

    # Bottom Safeguard Note
    fail_box = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.5), Inches(11.733), Inches(0.45))
    fail_box.fill.solid()
    fail_box.fill.fore_color.rgb = BG_WARM
    fail_box.line.color.rgb = AMBER_WARM
    tf_fb = fail_box.text_frame
    tf_fb.margin_top = Inches(0.08)
    p_fb = tf_fb.paragraphs[0]
    p_fb.text = "GRACEFUL DEGRADATION: If an external feed fails, KISAN COMPASS flags cached benchmarks, lowers confidence scores, and alerts the user — it NEVER fabricates fake data."
    p_fb.font.name = FONT_FAMILY
    p_fb.font.size = Pt(9)
    p_fb.font.bold = True
    p_fb.font.color.rgb = AMBER_WARM
    p_fb.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 8 — FEASIBILITY + IMPACT
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8,
               "PRACTICAL FEASIBILITY & FARMER IMPACT",
               "BUILT TO WORK IN THE REAL WORLD.",
               "Engineered for immediate deployment across Indian agriculture without expensive hardware dependencies or black-box risk.")
    add_footer(slide8, 8)

    # Left Container: Why It Is Feasible (4 blocks)
    left_feas = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(4.65))
    left_feas.fill.solid()
    left_feas.fill.fore_color.rgb = WHITE
    left_feas.line.color.rgb = CARD_BORDER

    # Header strip inside left container
    left_feas_head = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(0.55))
    left_feas_head.fill.solid()
    left_feas_head.fill.fore_color.rgb = GREEN_TINT
    left_feas_head.line.fill.background()
    tf_lfh = left_feas_head.text_frame
    tf_lfh.margin_left = Inches(0.2)
    tf_lfh.margin_top = Inches(0.12)
    p_lfh = tf_lfh.paragraphs[0]
    p_lfh.text = "WHY IT IS FEASIBLE TODAY"
    p_lfh.font.name = FONT_FAMILY
    p_lfh.font.size = Pt(10.5)
    p_lfh.font.bold = True
    p_lfh.font.color.rgb = GREEN_DEEP

    feas_points = [
        ("Zero In-Field Hardware Dependency", "Does not require expensive IoT soil sensors or weather stations. Operates on farmer-verified inputs and open satellite/NWP public models."),
        ("Lightweight & Low-Bandwidth Optimized", "Built with React + Vite frontend and Supabase cloud. Consumes under 1.1MB total assets; loads reliably over rural 3G/4G connections."),
        ("Postgres Row-Level Security (RLS)", "Multi-tenant cloud architecture with cryptographically enforced tenant isolation. Every farmer's farm and financial data is strictly private."),
        ("Human-in-the-Loop Safeguards", "System provides explainable decision support rather than risky automated execution. Eliminates legal and operational liability.")
    ]

    for f_i, (f_title, f_desc) in enumerate(feas_points):
        y = Inches(2.42 + (f_i * 0.95))
        fbox = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), y, Inches(5.2), Inches(0.82))
        fbox.fill.solid()
        fbox.fill.fore_color.rgb = GREEN_TINT
        fbox.line.color.rgb = GREEN_EMERALD
        ftf = fbox.text_frame
        ftf.margin_left = Inches(0.15)
        ftf.margin_top = Inches(0.08)
        fp0 = ftf.paragraphs[0]
        fp0.text = f_title
        fp0.font.name = FONT_FAMILY
        fp0.font.size = Pt(9.5)
        fp0.font.bold = True
        fp0.font.color.rgb = GREEN_DEEP
        fp1 = ftf.add_paragraph()
        fp1.text = f_desc
        fp1.font.name = FONT_FAMILY
        fp1.font.size = Pt(8)
        fp1.font.color.rgb = TEXT_DARK

    # Right Container: What Changes for the Farmer (Before vs After)
    right_imp = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(4.65))
    right_imp.fill.solid()
    right_imp.fill.fore_color.rgb = WHITE
    right_imp.line.color.rgb = CARD_BORDER

    # Header strip inside right container
    right_imp_head = slide8.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(0.55))
    right_imp_head.fill.solid()
    right_imp_head.fill.fore_color.rgb = BLUE_TINT
    right_imp_head.line.fill.background()
    tf_rih = right_imp_head.text_frame
    tf_rih.margin_left = Inches(0.2)
    tf_rih.margin_top = Inches(0.12)
    p_rih = tf_rih.paragraphs[0]
    p_rih.text = "WHAT CHANGES FOR THE INDIAN FARMER"
    p_rih.font.name = FONT_FAMILY
    p_rih.font.size = Pt(10.5)
    p_rih.font.bold = True
    p_rih.font.color.rgb = BLUE_COBALT

    # Before Card
    before_box = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(2.42), Inches(5.333), Inches(1.85))
    before_box.fill.solid()
    before_box.fill.fore_color.rgb = AMBER_TINT
    before_box.line.color.rgb = AMBER_WARM
    btf = before_box.text_frame
    btf.margin_left = Inches(0.18)
    btf.margin_top = Inches(0.12)
    bp0 = btf.paragraphs[0]
    bp0.text = "BEFORE KISAN COMPASS (FRAGMENTED STATUS QUO)"
    bp0.font.name = FONT_FAMILY
    bp0.font.size = Pt(10)
    bp0.font.bold = True
    bp0.font.color.rgb = AMBER_WARM
    bp0.space_after = Pt(4)
    bp1 = btf.add_paragraph()
    bp1.text = "• Checking 4–5 different apps with contradictory indicators\n• Guessing which mandi yields more money without factoring freight\n• Panic selling or holding blindly into convective storm damage\n• Shocked by 15–20% moisture dockage deductions at the mandi yard\n• Regret after irreversible harvest and transport decisions"
    bp1.font.name = FONT_FAMILY
    bp1.font.size = Pt(8.5)
    bp1.font.color.rgb = TEXT_DARK

    # After Card
    after_box = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(4.42), Inches(5.333), Inches(1.85))
    after_box.fill.solid()
    after_box.fill.fore_color.rgb = GREEN_TINT
    after_box.line.color.rgb = GREEN_EMERALD
    atf = after_box.text_frame
    atf.margin_left = Inches(0.18)
    atf.margin_top = Inches(0.12)
    ap0 = atf.paragraphs[0]
    ap0.text = "AFTER KISAN COMPASS (DECISION INTELLIGENCE)"
    ap0.font.name = FONT_FAMILY
    ap0.font.size = Pt(10)
    ap0.font.bold = True
    ap0.font.color.rgb = GREEN_DEEP
    ap0.space_after = Pt(4)
    ap1 = atf.add_paragraph()
    ap1.text = "• One single unified digital twin representing the farmer's actual field\n• Net realization calculated in rupees after dedicated freight tariffs\n• Simulates counterfactuals before cutting the crop: Sell Now vs Hold vs Split\n• Transparent downside dockage warning protects grain quality value\n• High-confidence decisions backed by clear mathematical proof"
    ap1.font.name = FONT_FAMILY
    ap1.font.size = Pt(8.5)
    ap1.font.color.rgb = TEXT_DARK

    # Bottom Synthesis Line
    bot_synth = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.48), Inches(11.733), Inches(0.48))
    bot_synth.fill.solid()
    bot_synth.fill.fore_color.rgb = GREEN_DEEP
    bot_synth.line.fill.background()
    tf_bs = bot_synth.text_frame
    tf_bs.margin_top = Inches(0.1)
    p_bs = tf_bs.paragraphs[0]
    p_bs.text = "SOCIO-ECONOMIC IMPACT: From information overload to decision clarity — preventing avoidable distress sales across rural India."
    p_bs.font.name = FONT_FAMILY
    p_bs.font.size = Pt(9.5)
    p_bs.font.bold = True
    p_bs.font.color.rgb = WHITE
    p_bs.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 9 — WHY KISAN COMPASS
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9,
               "THE FINAL TAKEAWAY",
               "NOT ANOTHER FARM DASHBOARD.",
               "Dashboards display data. KISAN COMPASS delivers contextual decision intelligence.")
    add_footer(slide9, 9)

    # Left: Traditional Fragmented Tools
    trad_card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(2.8))
    trad_card.fill.solid()
    trad_card.fill.fore_color.rgb = WHITE
    trad_card.line.color.rgb = CARD_BORDER

    # Header strip inside left container
    trad_head = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.6), Inches(0.55))
    trad_head.fill.solid()
    trad_head.fill.fore_color.rgb = BG_WARM
    trad_head.line.fill.background()
    tf_th = trad_head.text_frame
    tf_th.margin_left = Inches(0.2)
    tf_th.margin_top = Inches(0.12)
    p_th = tf_th.paragraphs[0]
    p_th.text = "TRADITIONAL / FRAGMENTED FARM TOOLS"
    p_th.font.name = FONT_FAMILY
    p_th.font.size = Pt(10.5)
    p_th.font.bold = True
    p_th.font.color.rgb = TEXT_MUTED

    tb_tb = slide9.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(2.05))
    tf_tb = tb_tb.text_frame
    tf_tb.word_wrap = True
    tf_tb.margin_left = tf_tb.margin_top = tf_tb.margin_right = tf_tb.margin_bottom = 0
    tp1 = tf_tb.paragraphs[0]
    tp1.text = "• FRAGMENTATION: Weather, mandi rates, and crop data in 4–5 separate apps\n• PRICING ILLUSION: Displays raw commodity quotes ignoring freight tariffs & tolls\n• FAKE CERTAINTY: Single-point forecasts pretending tomorrow's weather is 100% known\n• BLACK-BOX ADVICE: Generic prescriptive commands with zero mathematical proof\n• FARMER BURDEN: Leaves 100% of the cognitive synthesis and financial risk on the farmer"
    tp1.font.name = FONT_FAMILY
    tp1.font.size = Pt(8.5)
    tp1.font.color.rgb = TEXT_DARK

    # Right: KISAN COMPASS
    kc_card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(2.8))
    kc_card.fill.solid()
    kc_card.fill.fore_color.rgb = GREEN_TINT
    kc_card.line.color.rgb = GREEN_EMERALD
    kc_card.line.width = Pt(1.5)

    # Header strip inside right container
    kc_head = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.75), Inches(5.733), Inches(0.55))
    kc_head.fill.solid()
    kc_head.fill.fore_color.rgb = GREEN_EMERALD
    kc_head.line.fill.background()
    tf_kh = kc_head.text_frame
    tf_kh.margin_left = Inches(0.2)
    tf_kh.margin_top = Inches(0.12)
    p_kh = tf_kh.paragraphs[0]
    p_kh.text = "KISAN COMPASS: DECISION INTELLIGENCE"
    p_kh.font.name = FONT_FAMILY
    p_kh.font.size = Pt(10.5)
    p_kh.font.bold = True
    p_kh.font.color.rgb = WHITE

    tb_kb = slide9.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.333), Inches(2.05))
    tf_kb = tb_kb.text_frame
    tf_kb.word_wrap = True
    tf_kb.margin_left = tf_kb.margin_top = tf_kb.margin_right = tf_kb.margin_bottom = 0
    kp1 = tf_kb.paragraphs[0]
    kp1.text = "• UNIFIED DIGITAL TWIN: Persistent farm state bound to real field GPS & stand\n• TRUE NET REALIZATION: Real cash income in rupees after dedicated rural haulage\n• WHAT-IF SIMULATION: Evaluates Sell Now vs Wait vs Split trade-offs before acting\n• AUDITABLE TRUTH: 12-step verifiable mathematical proof sequence for every claim\n• ABSOLUTE HUMAN CONTROL: Autonomous execution disallowed; farmer holds total veto"
    kp1.font.name = FONT_FAMILY
    kp1.font.size = Pt(8.5)
    kp1.font.color.rgb = TEXT_DARK

    # The 6-Step Autonomous Product Loop Bar
    loop_box = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.72), Inches(11.733), Inches(0.65))
    loop_box.fill.solid()
    loop_box.fill.fore_color.rgb = BLUE_TINT
    loop_box.line.color.rgb = BLUE_COBALT
    ltf = loop_box.text_frame
    ltf.margin_top = Inches(0.14)
    lp = ltf.paragraphs[0]
    lp.text = "THE REPRODUCIBLE PRODUCT LOOP:  OBSERVE  ➔  UNDERSTAND  ➔  SIMULATE  ➔  DECIDE  ➔  EXECUTE  ➔  LEARN"
    lp.font.name = FONT_FAMILY
    lp.font.size = Pt(10)
    lp.font.bold = True
    lp.font.color.rgb = BLUE_COBALT
    lp.alignment = PP_ALIGN.CENTER

    # Final Manifesto Card
    man_card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.52), Inches(11.733), Inches(1.35))
    man_card.fill.solid()
    man_card.fill.fore_color.rgb = GREEN_DEEP
    man_card.line.color.rgb = AMBER_WARM
    man_card.line.width = Pt(2)
    mtf = man_card.text_frame
    mtf.margin_top = Inches(0.2)
    mp0 = mtf.paragraphs[0]
    mp0.text = "“KISAN COMPASS doesn't decide for the farmer.”"
    mp0.font.name = FONT_FAMILY
    mp0.font.size = Pt(12)
    mp0.font.color.rgb = AMBER_WARM
    mp0.alignment = PP_ALIGN.CENTER
    mp0.space_after = Pt(4)
    mp1 = mtf.add_paragraph()
    mp1.text = "“Not what to think. What’s actually true — and how sure we are.”"
    mp1.font.name = FONT_FAMILY
    mp1.font.size = Pt(18)
    mp1.font.bold = True
    mp1.font.color.rgb = WHITE
    mp1.alignment = PP_ALIGN.CENTER

    output_path = "KISAN_COMPASS_Final_Judge_Deck.pptx"
    prs.save(output_path)
    print(f"Refined presentation saved successfully to {output_path}!")

if __name__ == "__main__":
    build_refined_deck()

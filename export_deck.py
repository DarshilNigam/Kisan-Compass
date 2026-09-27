import os
import win32com.client

def export_deck():
    ppt_path = os.path.abspath("KISAN_COMPASS_Final_Judge_Deck.pptx")
    pdf_path = os.path.abspath("KISAN_COMPASS_Final_Judge_Deck.pdf")
    img_dir = os.path.abspath("deck_preview")
    os.makedirs(img_dir, exist_ok=True)

    print(f"Opening {ppt_path} in PowerPoint...")
    powerpoint = win32com.client.Dispatch("PowerPoint.Application")
    # Open presentation (ReadOnly=True, Untitled=False, WithWindow=False)
    deck = powerpoint.Presentations.Open(ppt_path, True, False, False)

    # 1. Export as PDF
    # 32 is the enum constant for ppSaveAsPDF
    print(f"Saving PDF to {pdf_path}...")
    deck.SaveAs(pdf_path, 32)
    print("PDF export complete!")

    # 2. Export each slide as PNG
    print(f"Exporting slides to {img_dir}...")
    for idx, slide in enumerate(deck.Slides):
        slide_img = os.path.join(img_dir, f"slide_{idx+1}.png")
        # Export(Path, FilterName, ScaleWidth, ScaleHeight)
        # 1920x1080 for crisp 16:9 full HD preview
        slide.Export(slide_img, "PNG", 1920, 1080)
        print(f"Slide {idx+1} exported: {slide_img}")

    deck.Close()
    powerpoint.Quit()
    print("All exports completed successfully!")

if __name__ == "__main__":
    export_deck()

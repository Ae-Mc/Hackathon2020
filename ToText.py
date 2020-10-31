import fitz
from os import system, remove
from tempfile import TemporaryFile


def imageToText(imageFilename: str) -> str:
    with TemporaryFile(mode='r', encoding="utf-8") as tempfile:
        system('tesseract -l "rus+eng" "{}" "{}"'.format(
            imageFilename, tempfile.name))
        with open(tempfile.name + '.txt', encoding='utf-8') as f:
            return f.read()


def pdfToText(pdfFilename: str) -> str:
    doc: fitz.Document = fitz.open(pdfFilename)
    text = ""
    tempfileName = TemporaryFile().name
    for i in range(len(doc)):
        for j, img in enumerate(doc.getPageImageList(i)):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n > 4:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            pix.writePNG(tempfileName)
            text += imageToText(tempfileName) + '\n'
    remove(tempfileName)
    doc.close()
    return text

from flask import Flask, request


app = Flask(__name__)


@app.route("/text", methods=["GET", "POST"])
def text():
    if "text" in request.form:
        text = request.form["text"]
    else:
        text = request.args.get("text", "")
    return text


@app.route("/documents", methods=["GET", "POST"])
def documents():
    docs = request.files.getlist("documents[]")
    return "Documents request: " + " ".join(map(lambda x: x.filename, docs))

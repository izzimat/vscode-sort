import * as vscode from "vscode";

export function makeRange(start: vscode.Position, end: vscode.Position, document: vscode.TextDocument) {
    if (end.character === 0) {
        end = document.lineAt(end.line - 1).range.end;
    }

    if (start.line !== end.line) {
        start = start.with(start.line, 0);
        end = document.lineAt(end.line).range.end;
    }

    return new vscode.Range(start, end);
}

export function sort(text: string, separator: string, locale: string) {
    const leadRegexp = new RegExp("^" + separator + "+");
    const trailRegexp = new RegExp(separator + "+$");
    const itemRegexp = new RegExp(separator + "+");

    const lead = leadRegexp.exec(text) || "";
    text = text.replace(leadRegexp, "");

    const trail = trailRegexp.exec(text) || "";
    text = text.replace(trailRegexp, "");

    let items = text.split(itemRegexp);
    if (text[text.length - 1] !== ",") {
        const test = text.split(new RegExp("," + separator + "+"));
        if (test.length >= items.length) {
            items = test;
            separator = "," + separator;
        }
    }

    let sorted: string[];
    if (locale !== "") {
        sorted = items.sort((a, b) => a.localeCompare(b, locale));
    } else {
        sorted = items.sort();
    }

    let sortedText = sorted.join(separator);

    if (text === sortedText) {
        sorted = sorted.reverse();
        sortedText = sorted.join(separator);
    }

    return lead + sortedText + trail;
}

export function sorter(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const settings = vscode.workspace.getConfiguration("sort");
    const locale = settings.get("locale", "en");

    const start = textEditor.selection.start;
    const end = textEditor.selection.end;
    const range = makeRange(start, end, textEditor.document);

    const text = textEditor.document.getText(range);
    const eol = text.indexOf("\r\n") > 0 ? "\r\n" : "\n";
    const separator = (range.start.line === range.end.line) ? " " : eol;

    const sortedText = sort(text, separator, locale);

    edit.replace(range, sortedText);
}

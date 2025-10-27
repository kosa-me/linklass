import * as vscode from 'vscode';

export function getClassesFromHtml(): Set<string> {
  const classes = new Set<string>();
  const htmlDocs = vscode.workspace.textDocuments.filter(doc => doc.languageId === 'html');

  for (const doc of htmlDocs) {
    const text = doc.getText();
    const regex = /class\s*=\s*["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(text))) {
      const classList = match[1].split(/\s+/);
      classList.forEach(c => classes.add(c));
    }
  }

  return classes;
}

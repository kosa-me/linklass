import * as vscode from 'vscode';
import { TextDecoder } from 'util';

// HTMLファイルからクラス名をキャッシュし、変更を監視するクラス
export class ClassCache {
  private cache: Map<string, Set<string>> = new Map();
  private watcher: vscode.FileSystemWatcher;
  private readonly regex = /class\s*=\s*["']([^"']+)["']/g;

  constructor(context: vscode.ExtensionContext) {
    this.watcher = vscode.workspace.createFileSystemWatcher(
      '**/*.html',
      false,
      false,
      false
    );

    // ファイルが作成されたらスキャン
    this.watcher.onDidCreate(uri => this.scanFile(uri), this, context.subscriptions);
    // ファイルが削除されたらキャッシュから削除
    this.watcher.onDidDelete(uri => this.removeFileFromCache(uri), this, context.subscriptions);
    
    // 登録したウォッチャーをコンテキストに追加
    context.subscriptions.push(this.watcher);

    // ドキュメントが編集中 (未保存)
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId === 'html') {
          this.scanDocument(e.document);
        }
      })
    );
    
    // ドキュメントが開かれた時 (スキャン対象に追加)
    context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(doc => {
        if (doc.languageId === 'html') {
          this.scanDocument(doc);
        }
      })
    );
    
    // ドキュメントが保存された時 (ファイルシステム上の内容で再スキャン)
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.languageId === 'html') {
          this.scanDocument(doc);
        }
      })
    );

    // 3. 起動時にまず1回、全ファイルをスキャン
    this.initialScan();
  }

  // キャッシュされているすべてのクラス名を取得
  public getClasses(): Set<string> {
    const allClassSet = new Set<string>();
    // Mapに保存されているすべてのSetをマージする
    for (const classSet of this.cache.values()) {
      classSet.forEach(c => allClassSet.add(c));
    }
    return allClassSet;
  }

  // 初回スキャン: ワークスペース内のすべてのHTMLファイルと開かれているエディタをスキャン
  private async initialScan(): Promise<void> {
    console.log('HTML class cache: Initializing...');
    
    // 1. まず、ワークスペース内のすべてのHTMLファイルをスキャン
    const htmlFiles = await vscode.workspace.findFiles('**/*.html', '**/node_modules/**');
    // 並列でスキャン
    await Promise.all(htmlFiles.map(uri => this.scanFile(uri)));

    // 2. 次に、開かれているエディタ内のHTMLをスキャン (未保存分を反映するため)
    for (const doc of vscode.workspace.textDocuments) {
      if (doc.languageId === 'html') {
        this.scanDocument(doc);
      }
    }
    
    console.log(`HTML class cache: Initialized. Found ${this.getClasses().size} classes.`);
  }

  // URIからファイル内容を読み込んでスキャン (ファイルシステム上のファイル用)
  private async scanFile(uri: vscode.Uri): Promise<void> {
    let text: string;
    try {
      // ファイルシステムから読み込む
      const contentBytes = await vscode.workspace.fs.readFile(uri);
      text = new TextDecoder().decode(contentBytes);
    } catch (e) {
      console.warn(`Failed to read file ${uri.fsPath}`, e);
      this.removeFileFromCache(uri); // 読めないファイルはキャッシュから削除
      return;
    }
    // 抽出した内容でキャッシュを更新
    this.updateCacheForFile(uri.toString(), text);
  }

  // URIからドキュメント内容を読み込んでスキャン (エディタ内のファイル用)
  private scanDocument(doc: vscode.TextDocument): void {
    // エディタの現在のテキストを取得 (未保存でもOK)
    const text = doc.getText();
    // 抽出した内容でキャッシュを更新
    this.updateCacheForFile(doc.uri.toString(), text);
  }

  // 指定されたファイルURIに対応するキャッシュを削除
  private removeFileFromCache(uri: vscode.Uri): void {
    const uriString = uri.toString();
    if (this.cache.has(uriString)) {
       this.cache.delete(uriString);
       console.log(`Cache: Removed ${uri.fsPath}`);
    }
  }

  // 指定されたファイルURIに対してクラス名キャッシュを更新
  private updateCacheForFile(uriString: string, text: string): void {
    const classesInFile = new Set<string>();
    let match;
    
    // 正規表現はステートを持つため、lastIndexをリセット
    this.regex.lastIndex = 0; 
    
    while ((match = this.regex.exec(text))) {
      const classList = match[1].split(/\s+/);
      // 空文字を除外して追加
      classList.filter(c => c.length > 0).forEach(c => classesInFile.add(c));
    }

    // このファイルURIに対応するキャッシュを更新
    this.cache.set(uriString, classesInFile);
  }
}
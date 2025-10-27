import * as vscode from 'vscode';
import { ClassCache } from './utils/classCache';

export function activate(context: vscode.ExtensionContext) {
  console.log('HTML→CSS class 補完拡張が有効になりました！');

  // キャッシュ＆ウォッチャーを初期化
  // (コンストラクタ内で初回スキャンが走ります)
  const classCache = new ClassCache(context);

  const provider = vscode.languages.registerCompletionItemProvider(
    'css', // CSSファイルで
    {
      // provideCompletionItems は "同期" (sync) になります
      provideCompletionItems(document, position) {
        
        // (非同期ではなく) 高速なキャッシュからクラス名を取得
        const classes = classCache.getClasses();

        // クラス名を補完候補(CompletionItem)に変換
        const items = Array.from(classes).map(className => {
          const item = new vscode.CompletionItem(`.${className}`, vscode.CompletionItemKind.Class);
          item.insertText = `.${className}`;
          return item;
        });

        return items;
      },
    },
    '.' // 「.」を打ったときに補完を発火
  );

  // 補完プロバイダを登録
  context.subscriptions.push(provider);
}

export function deactivate() {}
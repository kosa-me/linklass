# Linklass 🔗

`Linklass` は、HTMLファイルで定義（または編集中）のCSSクラス名を、CSSファイル側でリアルタイムに補完候補として表示するVSCode拡張機能です。

## ✨ 主な特徴

* **⚡ リアルタイム補完:** HTMLファイルを保存していなくても、入力するそばからCSSの補完候補に反映されます。
* **📂 プロジェクト全体スキャン:** 開いているファイルだけでなく、ワークスペース全体のHTMLファイルを自動でスキャンします。
* **🚀 高速キャッシュ:** 独自のキャッシュ機構により、高速な補完を実現します。

## 使い方

1.  ワークスペース（フォルダ）を開きます。
2.  HTMLファイルにクラスを書きます。
    ```html
    <div class="my-new-class another-class"></div>
    ```
3.  CSSファイルで `.` を入力すると、`my-new-class` や `another-class` が候補に表示されます。

## 📥 インストール方法

1.  このGitHubリポジトリの [**Releasesページ**](https://github.com/kosa-me/linklass/releases) にアクセスします。
2.  最新バージョンの `.vsix` ファイル（例: `linklass-0.1.0.vsix`）をダウンロードします。
3.  VSCodeの「拡張機能」タブを開き、右上の「...」メニューから **「VSIXからインストール...」** を選択し、ダウンロードしたファイルを選びます。

---

## ライセンス

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

© 2025 Kosame
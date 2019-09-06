# Tsukuba-Shukyu.github.io

## はじめに

蹴球のダッシュボードは[Pelican](https://qiita.com/saira/items/71faa202efb4320cb41d)という静的サイトジェネレーターをもとにつくっています。
`./Dashboard`内で`Pelican`コマンドを実行すると、`./Dashboard/content/*.md`ファイルの.yaml部分が（---に挟まれている部分）の情報が読み取られ*.mdファイル分だけのウェブページ(.html)が出来上がっていきます。

これらの.htmlファイルは`./Dashboard/myTheme/templates/article.html`をテンプレートにしているので、このファイルの中身を見ればだいたい構造がつかめるかと思います。{{}}はJinjaテンプレーティングで、`pelican`を実行することによって先程の.mdに書かれているものが差し込まれます。

生成された.htmlはdocsに溜まっていきます。

## 基本方針

基本的には新しいグラフの追加・.mdの更新をすることをメインにしたほうが良いと思います。

それ以外に手をだしてしまうと、沼にハマりますよ。

新しいグラフの追加の仕方は`./Dashboard/generate.py`に関数を追加して、`def main()`でその関数が呼ばれるようにしてください。

`pelican`を実行したときにグラフが生成されるので、`./Dashboard/article.html`にグラフを表示するところに`<img src=""/>`してから実行すれば、新しく生成される`.html`にグラフが追加されます。

## 注意事項

`pelican`を実行したあとにGithubにGPS/Splyzaデータ以外をGithubにAdd, Commit, Pushすることでサイトが更新されます。

Commitしたりす、るとSlackに通知が来るので、適切なタイミングで行ってください。
（英語で短いメッセージもつけることを忘れずに）

なるべく仮想環境を使うこと、requirements.txtに必要なパッケージを入れているので、

````
cd Dashboard
source ./dashboard/bin/activate
pip install -r requirements.txt
````

を実行して、開発者で開発環境を合わせましょう。

仮想環境とrequirments.txtの使い方は[ここ](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/#using-requirements-files)に詳しく書いてあるので参考にしてください。

`pip`を使って新しくパッケージをインストールしたら、requirements.txtを更新してほしいので、
````
pip freeze > requirements.txt
````
を実行してコミットをしてほしい。

また、Githubを活用したいので
```
git fetch
git pull
```
や`branch`を活用していきましょう。


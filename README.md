# Tsukuba-Shukyu.github.io


````
pelican
````
を実行したあとにGithubにGPS/Splyzaデータ以外をGithubにAdd, Commit, Pushすることでサイトが更新される

CommitしたりするとSlackに通知が来るので、適切なタイミングで行うこと。
メッセージもつけることを忘れずに（英語で端的に）。

なるべく仮想環境を使うこと、requirements.txtに必要なパッケージを入れている。

仮想環境とrequirments.txtの使い方は[ここ](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/#using-requirements-files)に詳しく書いてあるので参考に。

基本的には、fetchしたあとに

````
cd Dashboard
source ./dashboard/bin/activate
pip install -r requirements.txt
````
を実行すれば、仮想環境が設定されるはず！

`pip`を使って新しくパッケージをインストールしたら、requirements.txtを更新してほしいので、

````
pip freeze > requirements.txt
````
を実行してコミットをしてほしい。

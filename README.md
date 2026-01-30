## ゼックスアーグス（zxargs）

ゼックスアーグス（zxargs）を用いると、標準入力から受け取ったデータから、別のコマンドを実行することができます。  
lsなどのコマンドからファイル一覧を取得して、そのファイルにたいしてなんらかのコマンドを実行するようなときに便利かもしれません。

## インストール

```bash
$ npm install --global @kokiito0926/zxargs
```

## 実行方法

```bash
$ ls . | zxargs -- echo
$ echo "Hello world!" | zxargs -- echo
$ echo "1,2,3" | zxargs --delimiter "," -- echo
$ echo "apple,banana,cherry" | zxargs --delimiter "," --replace "{}" -- echo "Fruit: {}"
```

## ライセンス

[MIT](LICENSE)

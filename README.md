## zxargs

zxargsは、標準入力から受け取ったデータから、別のコマンドを実行することができるコマンドラインのツールです。  
lsなどのコマンドからファイル一覧を取得して、そのファイルにたいしてなんらかのコマンドを実行するようなときに最適です。

## インストール

```bash
$ npm install --global @kokiito0926/zxargs
```

## 使用方法

デフォルトでは、改行区切りでコマンドが実行されます。

```bash
$ ls . | zxargs -- echo
```

--delimiterのオプションを用いれば、区切り文字を指定することができます。

```bash
$ echo "1,2,3" | zxargs --delimiter "," -- echo
```

--replaceのオプションを用いれば、引数の途中に値を展開することができます。

```bash
$ echo "apple,banana,cherry" | zxargs --delimiter "," --replace "{}" -- echo "Fruit: {}"
```

## ライセンス

[MIT](LICENSE)

---
slug: Rubyish
title: Rubyらしさを学んでみた
date: 2026-01-15
description: Rubyを学び直しました．この記事ではRubyの文法Rubyらしい書き方の好きなところを書き残しておこうと思います．
tags:
  - Ruby
thumbnail: /images/blog/20260115/icatch.png
category: tech
---

# もっとRubyらしく
今年の[抱負](https://www.yuzu621.tech/blog/2026ride-start)でも挙げた通り，Railsチュートリアルに向けたRubyの基礎を学んでいました．Rubyの基本文法，数ある書き方の中からどのようなフォーマットが良い(ベストプラクティス)のか，RoRのアクティブレコードでどのようにしてヘルパーメソッドが利用できるようになっているのかなど，気になった点を都度深堀しながら触っていったため，得られた学びは大きかったと感じています．


今回の記事では学びの中で気づいたRubyらしさの良かったところ，他言語を経験した者がRubyに対して何を思ったのか，また，学びの中で気づいたことなどを備忘録として書き残したいなと思います．


> Rubyを読み書きしていて思ったのはとにかく直感的で表現しやすい良い言語だということ．
オブジェクトの柔軟性と豊富な組み込み関数も相まって，やりたいことがすぐに書けたという所感


## Rubyらしさとは - 設計思想

日本のエンジニアならだれでも知っているRubyは1995年にまつもとゆきひろ氏（Matz）によって日本で生まれたプログラミング言語です。その設計思想は一貫して**「プログラマの生産性と幸福」**を最優先にしています。

> "Rubyの言語仕様策定において最も重視しているのはストレスなくプログラミングを楽しむことである"
> 
> 
> — まつもとゆきひろ『[プログラミング言語 Ruby](https://www.ruby-lang.org/ja/about/)』
> 

この思想を特に感じたのは書いてある記述が直感的に理解しやすい，またこう書いたらこう動くかなとあれこれ試す中で，これもできるんだといったように直感的に動くことが多かった．

これとか👇

```ruby
5.times { puts "Hello" }
"hello".upcase  # => "HELLO"
[1, 2, 3].map { |n| n * 2 }  # => [2, 4, 6]

# Railsでありがちなメソッドチェーンもかなり自然
users.select { |u| u.active? }
     .sort_by { |u| u.created_at }
     .map { |u| u.name }
```

後述メソッドとかも，結論ファーストで気持ちがよかった．日本語で長い話を聞いた挙句結局言いたいことは最後にくる逆茂木型の文章に対して，英語の文法に近い一番言いたい結論を述べた後にその条件が付けくわえられるような記述が組み立てやすかった．👇

```ruby
if user.active? # これだったら何するんだい🤔から入る
  send_email(user)
end

# 送りたいのね🫡 このときに👇
send_email(user) if user.active?
```

これまで触ってきたCやJSといった言語ではできなかった表現で，Perlに強く影響を受けた自然言語に近い表源を重視した文化の表れだといいます．

> **"Rubyは、Perlなどの影響を受けて開発されました"**
> 
> 
> Ruby公式サイト - Rubyについて
> [https://www.ruby-lang.org/ja/about/](https://www.ruby-lang.org/ja/about/)
> 

> **"私はPerlが好きでした。しかし、Perlには満足できませんでした。Perlは本当のオブジェクト指向言語ではありませんでした。"** The Philosophy of Ruby（英語）
[https://www.artima.com/articles/the-philosophy-of-ruby](https://www.artima.com/articles/the-philosophy-of-ruby)
> 

Ruby4.0.0公式リファレンス

[https://docs.ruby-lang.org/ja/4.0/doc/index.html](https://docs.ruby-lang.org/ja/4.0/doc/index.html)

---

# Rubyを感じた文法の覚書

ここからは、私が学習する中で特に「Rubyらしい」と感じた文法や機能について、具体的なコード例とともに深掘りしていきます。Rubyの持つ表現力の高さを感じていただければ幸いです。

## メソッドチェーンで処理をつなげる

まず紹介したいのが、メソッドチェーンです。複数の処理をあたかもパイプラインのようにつなげることで、「何を」「どうしたいか」を宣言的に記述できます。手続き的な中間変数を減らし、コードをスッキリさせることができます。

```ruby
# ❌ 手続き型(C/Java的)
result = []
collection.each do |item|
  result << item if condition
end

# ✅ 関数型(Ruby的)
result = collection.select { |item| condition }
```

```ruby
# map, select, reject, find などを活用
偶数 = (1..100).select(&:even?) # シンボルを使った省略(後述)
2倍 = [1,2,3].map { |n| n * 2 }
奇数除外 = [1,2,3].reject(&:odd?)
```

ワンライナーで宣言的に配列の要素を格納できる

```ruby
# map - 配列を変換（JSのmapと同じ）
doubled = [1, 2, 3].map { |n| n * 2 }  # => [2, 4, 6]

# select - フィルタリング（JSのfilter）
evens = (1..10).select { |n| n.even? }  # => [2, 4, 6, 8, 10]

# reject - 除外（selectの逆）
odds = (1..10).reject { |n| n.even? }   # => [1, 3, 5, 7, 9]

# find - 最初の一致（JSのfind）
first_big = [1, 5, 3, 8].find { |n| n > 4 }  # => 5
```

配列として格納せずにオブジェクトとして扱うには()で

```ruby
# 範囲オブジェクトで繰り返し
(1..5).each { |n| print "#{n} " }    # 1 2 3 4 5
(1...5).each { |n| print "#{n} " }   # 1 2 3 4 (5含まず)

# upto/downto - 指定範囲の繰り返し
1.upto(5) { |i| print "#{i} " }      # 1 2 3 4 5
5.downto(1) { |i| print "#{i} " }    # 5 4 3 2 1

# step - 間隔を指定
0.step(10, 2) { |i| print "#{i} " }  # 0 2 4 6 8 10
```

利点：

- 意図が明確で要素に対して何を処理したいのか比較的わかりやすい
- 短く書ける(インクリメント処理の記述不要)

また，組み込み関数が非常に強力なのもあってこの処理の連鎖が光っているところだとも感じた．

```ruby
# 重複を削除して降順でソート

puts "\n【問題3】重複削除"
arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]

puts arr.sort.uniq.reverse.inspect # さすがにやりすぎ感はある
# > [1, 2, 3, 4, 5, 6, 9]
```

ここまで便利なメソッドが提供されていると、その裏側、つまり内部実装がどうなっているのか気になってきます。Rubyの標準的な処理系であるMRI（Matz's Ruby Implementation）はC言語で書かれており、多くの組み込みメソッドもCで実装されています。

少し寄り道して、配列の要素を合計する`sum`メソッドの内部実装を覗いてみましょう。

実際のCでの実装(簡略版)　[ソース全体はこちら](https://github.com/ruby/ruby/blob/master/enum.c)

```c
// enum.c より抜粋
static VALUE
enum_sum(int argc, VALUE* argv, VALUE obj)
{
    struct enum_sum_memo memo;
    VALUE beg, end;
    int excl;
    
    // 初期値の設定（デフォルトは0）
    memo.sum = (argc == 0) ? LONG2FIX(0) : argv[0];
    memo.block_given = rb_block_given_p();
    
    // 各要素を加算
    if (RTEST(rb_range_values(obj, &beg, &end, &excl))) {
        // 範囲オブジェクトの場合の最適化
        return int_range_sum(beg, end, excl, memo.sum);
    }
    
    // 通常の配列の場合
    rb_block_call(obj, id_each, 0, 0, sum_iter_i, (VALUE)&memo);
    
    return memo.sum;
}

// 各要素の加算処理
static VALUE
sum_iter_i(RB_BLOCK_CALL_FUNC_ARGLIST(i, args))
{
    struct enum_sum_memo *memo = (struct enum_sum_memo *) args;
    memo->sum = rb_funcall(memo->sum, '+', 1, i);
    return Qnil;
}
```

C言語のコードは一見複雑ですが、Rubyの`sum`メソッド一行でこの処理が完結するのは、まさに「プログラマの幸福」を追求するRubyの思想の表れと言えるでしょう。開発者は内部実装を意識することなく、やりたいことに集中できます。

---

## 繰り返しのeach

次に、Rubyの繰り返し処理の基本である`each`イテレータです。他の言語で一般的な`for`ループも使えますが、Rubyコミュニティではよりオブジェクト指向的な`each`や`times`といったメソッドを使うのが一般的です。

```ruby
# ❌ C言語的な書き方（Rubyでも動くけど非推奨）
for i in 0...5
  puts i
end

# ✅ Rubyらしい書き方
5.times do |i|
  puts i
end

# 配列への繰り返しアクセスでもforを使わずに
fruits = ["りんご", "みかん", "バナナ"]

# each - 基本の繰り返し
fruits.each { |fruit| puts fruit }

# each_with_index - インデックス付き
fruits.each_with_index do |fruit, i|
  puts "#{i}: #{fruit}"
end
```

---

## シンボルの利用

Rubyを学ぶ上で欠かせないのがシンボルです。文字列と似て非なるこのオブジェクトは、特にハッシュのキーとして頻繁に利用され、パフォーマンスにも貢献します。

- **ハッシュのキー**
- **クラス名/メソッド名/変数名/定数名**
- **ステータス名**

といった利用

```ruby
sym = :hello
str = "hello"

# 文字列との違い
puts sym.object_id  # 例: 1234560 (常に同じID)
puts sym.object_id  # 例: 1234560 (同じ！)
puts str.object_id  # 例: 70234567890
puts "hello".object_id  # 例: 70234567912 (違うオブジェクト！)
```

これがゆえに比較的メモリ効率が良い

```ruby
# メモリ効率が良い
1000.times do
  :user  # 同じシンボル1つだけメモリに存在
  "user" # 1000個の文字列オブジェクトが作られる
end
```

ハッシュキーとしての利用

```ruby
person = {
  name: "Taro",         # シンボルがキー(:name)
  age: 25,
  city: "Tokyo"
}

puts person[:name]  # Taro　
puts person[:age]   # 25
puts person[:city]  # Tokyo

# 新旧の書き方
old_style = { :name => "Taro", :age => 25 }
new_style = { name: "Taro", age: 25 }  # 同じ意味
```

このように、シンボルは状態管理やハッシュのキーとして非常に便利です。ところで、`person[:name]`のように`[]`で値を取得するのではなく、Railsプロジェクトでよく見かける`person.name`のようなアクセサ形式の呼び出しはどのように実現されているのでしょうか。

その答えは、Railsが提供するヘルパーメソッドにあります。これについては後の「Rubyでのオブジェクト指向」の節で詳しく触れます。

Web開発ではこれを利用した状態管理などがある．

```ruby
# - ハッシュのキー
# - メソッド名
# - 状態の表現 など...
user = { status: :active }  # :pending, :banned など
array.sort_by { |item| item[:name] }
```

[公式リファレンス]([https://docs.ruby-lang.org/ja/latest/class/Symbol.html](https://docs.ruby-lang.org/ja/latest/class/Symbol.html))

[ハッシュの基本]([https://qiita.com/yyykms123/items/2ceaec214f1f8a514011](https://qiita.com/yyykms123/items/2ceaec214f1f8a514011))

参考：[https://qiita.com/yyykms123/items/6a6ae7fe8cd9263a3d1c](https://qiita.com/yyykms123/items/6a6ae7fe8cd9263a3d1c)

---

## シンボルを使った後述処理の省略 &:

シンボルの応用として、非常にRubyらしい省略記法があります。それは`Symbol#to_proc`、通称`&:`（アンドコロン）記法と呼ばれるものです。これはブロックの引数が1つで、その引数に対してメソッドを1つ呼び出すだけの場合にコードを劇的に短くします。

実行速度的には大きな差はないため完全に可読性で判断されることが多い

こんなの👇

```ruby

# 通常の書き方
[1, 2, 3].map { |n| n * 2 }        # [2, 4, 6]
[1, 2, 3].select { |n| n.even? }   # [2]
["a", "b"].map { |s| s.upcase }    # ["A", "B"]

# &:メソッド名 で省略
[1, 2, 3].map(&:even?)             # [false, true, false]
["a", "b"].map(&:upcase)           # ["A", "B"]
[1, 2, 3, 4].select(&:even?)       # [2, 4]
```

### 原理

なぜシンボルに`&`を付けるだけでこのような振る舞いをするのでしょうか。その鍵は、`&`演算子がオブジェクトに対して`to_proc`メソッドを呼び出し、それをブロックに変換しようとするRubyの仕様にあります。

1. :even?はシンボル
2. &は「to_procを呼んでブロックに変換しろ」という意味
3. 内部ではこうなる👇

```ruby
# これが...
[1, 2, 3].map(&:to_s)

# こう展開される
[1, 2, 3].map { |n| n.to_s }
```

### よく省略して書かれる例

この`&:`記法は、特に`map`, `select`, `reject`などのメソッドと組み合わせることで真価を発揮します。

```ruby
# 文字列変換
numbers = [1, 2, 3]
strings = numbers.map(&:to_s)      # ["1", "2", "3"]

# 大文字・小文字
words = ["hello", "world"]
upper = words.map(&:upcase)        # ["HELLO", "WORLD"]
lower = ["HELLO"].map(&:downcase)  # ["hello"]

# 述語メソッド
[1, 2, 3, 4].select(&:even?)       # [2, 4]
[1, 2, 3, 4].reject(&:even?)       # [1, 3]
["", "a", nil].select(&:nil?)      # [nil]
[0, 1, false, true].select(&:zero?) # [0]

# 数値メソッド
[-1, 0, 1].map(&:abs)              # [1, 0, 1]
[1.5, 2.7].map(&:round)            # [2, 3]
[1, 2, 3].map(&:succ)              # [2, 3, 4] (次の数)

# 配列メソッド
[[1, 2], [3, 4]].map(&:first)     # [1, 3]
[[1, 2], [3, 4]].map(&:last)      # [2, 4]
[[1, 2], [3]].map(&:size)         # [2, 1]

# ハッシュ
users = [{name: "Taro"}, {name: "Hanako"}]
names = users.map { |u| u[:name] }  # 通常
# &では直接キーアクセスできない（メソッドじゃないから）
```

この記法は非常に便利ですが、万能ではありません。ブロック内で呼び出すメソッドに引数が必要な場合は、従来通りのブロック記法を使う必要があります。

```ruby
# ❌ これは無理（引数が必要）
[1, 2, 3].map(&:*)  # エラー！ *には引数が必要

# ✅ ブロックで書く
[1, 2, 3].map { |n| n * 2 }

# ❌ これも無理
["hello"].map(&:include?)  # 何をincludeするか不明

# ✅ ブロックで書く
["hello"].map { |s| s.include?("e") }
```

## ハッシュテーブルを返す関数

Rubyでは、メソッドから複数の値を返す際にハッシュが非常に役立ちます。戻り値が何を表しているのかが一目瞭然になり、コードの可読性が向上します。

Pythonでいう辞書型でのリターンや，JSのオブジェクトのようなリターンが可能

```ruby
def stats(input)
  sum = input.sum
  avg = sum / input.length.to_f
  max_val = input.max
  min_val = input.min
  
  # ハッシュで返せる
  { sum: sum, avg: avg, max: max_val, min: min_val }
end

# テスト
result = stats([1, 2, 3, 4, 5])
puts "合計: #{result[:sum]}, 平均: #{result[:avg]}, 最大: #{result[:max]}, 最小: #{result[:min]}"
```

シンボルをキーとして複数の値を返せるため扱いやすい！！

かつsumやmin,maxといった組み込み関数も豊富でありながら前述のメソッドチェーンのおかげでなんの処理なのかがわかりやすく感じる．

もしこれをC言語で実装する場合，構造体を使って定義することになる．

```c
# C言語は複数の値を返せない
//  これは無理
// int stats(int arr[], int len) {
//     return {sum, avg, max, min};  // エラー！
// }

// ✅ 代案1: 構造体を使う
typedef struct {
    int sum;
    double avg;
    int max;
    int min;
} Stats;

Stats stats(int arr[], int len) {
    Stats result;
    result.sum = 0;
    result.max = arr[0];
    result.min = arr[0];
    
    for (int i = 0; i < len; i++) {
        result.sum += arr[i];
        if (arr[i] > result.max) result.max = arr[i];
        if (arr[i] < result.min) result.min = arr[i];
    }
    result.avg = (double)result.sum / len;
    return result;
}

// 呼び出し
Stats result = stats(arr, 5);
printf("合計: %d, 平均: %.1f\n", result.sum, result.avg);
```

C言語との比較を見ると、Rubyがいかに開発者の「書きやすさ」を重視しているかがよくわかります。もちろん、静的型付け言語の厳密さやパフォーマンスが求められる場面もありますが、Rubyのこの表現力は、特にWeb開発のようなスピード感が重視される領域で大きな強みとなります。

## ハッシュを使ったメモ化

ハッシュのもう一つの強力な使い方が「メモ化」です。これは、計算コストの高い処理結果をハッシュにキャッシュしておくことで、同じ計算の繰り返しを避け、プログラムのパフォーマンスを劇的に向上させるテクニックです。フィボナッチ数列の計算は、その良い例です。

これもCで書くとなるとかなり複雑でやはりRubyの読みやすさを感じる．

```ruby
def fib_memo(n, memo = {}) # 空のハッシュを作っとく (配列じゃないよ)
  return n if n <= 1
  return memo[n] if memo[n] # 計算済みならそれを使う ハッシュのキーn

  memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
end

# テスト
puts fib_memo(40)  # 普通の再帰だと遅いが、メモ化すれば一瞬
```

## 配列からハッシュを作成

データ構造を扱う中で、2つの配列からキーとバリューのペアを持つハッシュを作りたい場面はよくあります。Rubyでは`zip`メソッドと`to_h`メソッドを組み合わせることで、これを簡潔に実現できます。

二つの配列どうしをハッシュして連結する際に用いられるzip関数であるが，これ単体での戻り値は配列の配列になって格納される．そのため，結果をハッシュとして利用するにはto_hで変換が必要

```ruby
keys = [:name, :age, :city]
values = ["Taro", 25, "Tokyo"]

hash = keys.zip(values).to_h # zipだけだと戻り値は配列なのではハッシュ化
puts hash[:name]
# > Taro
```

---

## 命名規則

優れたコードは、ロジックだけでなく命名にも現れます。Rubyには、メソッドの振る舞いを名前に反映させる、特徴的な命名慣習があります。

```ruby
# 非破壊的
str = "hello"
str.upcase  # => "HELLO"
puts str    # => "hello" (元のまま)

# 破壊的
str.upcase!
puts str    # => "HELLO" (変更される)
```

```ruby
puts "".empty?        # => true
puts [1, 2].include?(1)  # => true
puts nil.nil?         # => true
```

これらの規約に準拠し，自作メソッドでも命名する．

## Rubyでのオブジェクト指向

ここまで手続き的な側面に焦点を当ててきましたが、Rubyは純粋なオブジェクト指向言語でもあります。その思想は言語の隅々にまで行き渡っています。ここでは、Rubyのオブジェクト指向を特徴づけるいくつかの概念を見ていきましょう。

- `@`で定義した変数はインスタンス変数(同クラスであっても他インスタンスとは独立して管理される)
- `@@`で定義した場合はクラス変数(同クラス間で共有)
- .selfでクラスメソッド(インスタンス外から呼び出し可)を定義．
    - *C#やJavaのstaticメソッドと同じ概念*

```ruby
class Counter
  @@count = 0  # クラス変数（全インスタンスで共有）
  
  def initialize
    @@count += 1
  end
  
  # クラスメソッド（self.をつける）
  def self.total
    @@count
  end
  
  # 別の書き方
  class << self
    def reset
      @@count = 0
    end
  end
end

Counter.new
Counter.new
puts Counter.total  # 2
Counter.reset
puts Counter.total  # 0
```

モジュール化してクラスメソッドを定義することも可能．

```ruby
# extend（クラスメソッドとして追加）
module Greetable
  def greet
    puts "Hello!"
  end
end

class Robot
  extend Greetable  # クラスメソッドになる(インスタンスを生成せずに呼び出せる．)
end

Robot.greet  # Hello!
```

PrivateやProtectといったアクセス制限もC#のようにすべてのメソッドの接頭辞として書く必要がない．

```ruby
class Example
  def public_method1
    # public
  end
  
  private  # この行以降が全てprivateになる
  # protected # この場合は同クラスインスタンス間では利用可能
  
  def private_method1
    # private
  end
  
  def private_method2
    # private
  end
end
```

もちろんC#のように明示的に個別に指定することもできる．

```ruby
class Example
  def method1; end
  def method2; end
  
  private :method1  # method1だけprivateに
end
```

### アクセサメソッド

クラス外からのアクセスが必要な際に定義する．

- attr_writer
- attr_reader
- attr_accessor

```ruby
class Person
  attr_reader :name      # nameの読み取りのみ
  attr_writer :password  # passwordの書き込みのみ
  attr_accessor :age     # ageの読み書き両方
  
  def initialize(name, age)
    @name = name
    @age = age
  end
end

person = Person.new("Taro", 25)
puts person.name        # OK（getter）
person.name = "Jiro"    # エラー（setterがない）

person.age = 26         # OK（setter）
puts person.age         # OK（getter）

person.password = "123" # OK（setter）
puts person.password    # エラー（getterがない）
```

### ダックタイピング

Rubyの柔軟性を象徴するのが「ダックタイピング」という考え方です。オブジェクトの「型」が何であるかよりも、そのオブジェクトが「何ができるか（どんなメソッドを持っているか）」を重視します。

C#では，

```csharp
// C# - 型を明示する必要がある
public void MakeSound(Animal animal) {
    animal.Speak();  // animalはAnimal型でなければならない
}

// Catクラスは Animal を継承していないとエラー
MakeSound(new Robot());  // コンパイルエラー！
```

一方Rubyでは

```ruby
# Ruby - 型は関係ない
def make_sound(animal)
  animal.speak  # speakメソッドがあればOK
end

class Robot2
  def initialize(name)
    @name = name
  end
  
  def speak
    puts "#{@name}: ビービー"
  end
end

make_sound(Cat.new("タマ"))     # タマ: ニャー
make_sound(Robot2.new("R2D2"))  # R2D2: ビービー

```

CatでもRobot2でクラスをもとに作成するインスタンスであっても，speakメソッドさえ持っていればヨシとされる．

C#のように，厳密にクラス(型)を指定しないため，どんな特定のクラスとも紐付かないインタフェースを定義することが出来る柔軟性を持っている(メソッドを定義するときに「引数は何クラスにすべきかな？」という考えではなく、「このメソッドの引数はどんなメソッドを持っているべきかな？」という振る舞いに着目できる)．

この考え方により、異なるクラスのオブジェクトでも同じメソッドさえ持っていれば同様に扱えるため、柔軟で拡張性の高いコードを書くことができます。

### モンキーパッチ(オープンクラスの拡張)

そして、Rubyのオブジェクト指向の中でも特に強力で、諸刃の剣とも言われる機能が「モンキーパッチ」（オープンクラス）です。これは、既存のクラス（Ruby標準の`String`や`Array`クラスでさえも）を後から開き、メソッドを追加したり変更したりできる機能です。

```ruby
class Array
  def average
    return 0 if self.empty? # 明示的にselfを記述しているが暗黙的に省略可能
    self.sum.to_f / self.size
  end
end 

# テスト
puts [1, 2, 3, 4, 5].average  # => 3.0
```

**利用例：日付・時刻の拡張など**

この機能は、使い方を誤るとコードの挙動を予測困難にするため注意が必要ですが、適切に用いれば非常に強力です。
実際に、Ruby on Railsフレームワークではこの仕組みを積極的に活用し、開発者に便利なメソッドを提供しています。例えば、`3.days.ago`のように直感的な日付操作ができるのは、RailsがRubyの`Numeric`クラスをモンキーパッチで拡張しているからです。

```ruby
class Numeric
# -----------抜粋---------
  # Returns a Duration instance matching the number of days provided.
  #
  #   2.days # => 2 days
  def days
    ActiveSupport::Duration.days(self)
  end
  alias :day :days

  # Returns a Duration instance matching the number of weeks provided.
  #
  #   2.weeks # => 2 weeks
  def weeks
    ActiveSupport::Duration.weeks(self)
  end
  alias :week :weeks
end

# -------使用例-------------
expires_at = Time.now + 3.days
valid_until = Time.now + 2.weeks
```

---

## その他：覚えておきたいメソッド

最後に、学習中につまずいた点や、覚えておくと便利なメソッドをいくつか紹介します。

### .join

sqlの結合で使うJOINのような挙動をイメージしたが，これは，配列を任意の文字列で結合する(戻り値はstr)関数．

```ruby
arr = [1, 2, 3]
puts arr.join("+")
# > 1+2+3

text = "Hello World Ruby"
puts text.split.reverse.join(" ")
# > Ruby World Hello
# split ↔ join の関係(文字列から配列 ↔ 配列から文字列)
```

# まとめ

今回の記事では、Rubyを学ぶ中で出会った「Rubyらしさ」を感じる文法や設計思想について、備忘録として書き出してみました。

- **直感的な記述:** 後置`if`や`times`メソッドなど、自然言語に近い表現力。
- **強力なメソッドチェーン:** `map`や`select`を繋げることで、宣言的にデータを操作できる。
- **シンボルとハッシュ:** メモリ効率の良いシンボルと、柔軟なデータ構造としてのハッシュの活用。
- **柔軟なオブジェクト指向:** ダックタイピングやモンキーパッチがもたらす高い拡張性。

「プログラマの幸福」を追求するRubyの思想は、コードの書きやすさや楽しさに直結していると感じます。これらの特徴をしっかり身につけ、次のステップであるRuby on Railsの学習をさらに楽しんでいきたいと思います。


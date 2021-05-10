---
title: 0002 如何「正确」的反转字符串
date: 2021-05-03 20:33
---

### Byte
首先想到是直接反向遍历字符串，然后重新组装

```golang
func ReverseSimple(input string) string {
	length := len(input)
	output := make([]byte, length)
	for i := 0; i < length; i++ {
		output[i] = input[length-i-1]
	}
	return string(output)
}
```

我们测试一下英文字符串，可以正常反转

```
'ABCD'的反转字符串是: DCBA
```

但当我们输入中文字符时候，出错了

```
'你好'的反转字符串是: ��堽�
```

原因是不同的编码方式下一个码位可能包含多个字节，go 默认是按 utf8 编码的，中文需要三字节，按字节反转之后肯定是错乱的。这里解释下为什么会出现[堽]这个字的，如果我们在输出过程中打印字节，会发现中间三个utf8编码正好是0xe5 0xa0 0xbd，所以能够显示。

### Rune

既然按字节遍历不行，那我们按「字符」遍历好了
```Go
func ReverseRune(input string) string {
	inputR := []rune(input)
	length := len(inputR)
	output := make([]rune, length)
	for i := 0; i < length; i++ {
		output[i] = inputR[length-i-1]
	}
	return string(output)
}
```
我们跑一下测试
```
'ABCD'的反转字符串是: DCBA
'你好'的反转字符串是: 好你
'🙂🙃'的反转字符串是: 🙃🙂
'🇬🇧'的反转字符串是: 🇧🇬
```
前面的都正常，到英国国旗的时候出问题了，英国国旗的 emoji 反转之后居然是保加利亚国旗。



| 国家编码 | Emoji | 码位  | 国家名称  |
|------|-------|-----------------|----------------|
| BG   | 🇧🇬  | U+1F1E7 U+1F1EC | Bulgaria       |
| GB   | 🇬🇧  | U+1F1E7 U+1F1EC | United Kingdom |
当然我们对比下这两个国旗的 unicode 码位就一目了然了。国旗的 emoji 大多由两个码位组成，所以直接按码位反转肯定是不行的，那怎么办

### Grapheme
这里要引出一个新的概念[字位簇](https://unicode.org/reports/tr29/) ，字位簇(grapheme) 是由一个或者多个连续码位组成的用来表示一个单一的图像单元，在书写系统上表示最小的功能单元。

在上面的例子中，国旗虽然包含多个码位，但是它是一个字位簇，那么问题就变成了如何按字位簇反转字符串。

一些支持unicode比较好的语言，比如swift，自带函数也是支持的
```swift
func ReverseGraph(person: String) -> String {
    let bg = "🇬🇧123我们"
    let reversed = String(bg.reversed())
    print(reversed)
}
```
```
们我321🇬🇧
```

由于 Go 自身没有 grapheme 官方库，我们找一个第三方库来实现

```rust
func ReverseGraph(input string) string {
	g := uniseg.NewGraphemes(input)
	output := make([]rune, 0)
	for g.Next() {
		output = append(g.Runes(), output...)
	}
	return string(output)
}
```
测试结果如下
```
'你好'的反转字符串是: 好你
'🙂🙃'的反转字符串是: 🙃🙂
'🇬🇧'的反转字符串是: 🇬🇧
```
## 所见非所得
到了 Grapheme 这一层，反转的过程就结束了，作为书写系统的最小单元，但是字符串作为一个图像系统，依旧存在大量的例外。

### Ligature
合字是指在西方字体排印学中一般表示将多于一个字母的合成一个字形，比如我们常见的编辑器中都支持合字的选项，开启时!=会变成≠。但是，合字是有自己的码位的

| 普通字符 | 合字 | 合字码位   |
|------|-------|----------------|
|f‌f‌i|	ﬃ	| U+FB03 |
|!= |  ≠ | U+2260 |

遇到合字的时候我们按什么维度去反转呢? 

### Bidi explict markers
由于某一些文字，比如阿拉伯文是从右往左书写的。所以当在同一段落混合使用这两种文字且其各自使用自己的书写方向时，我们需要显示的指定一些文字的显示方向，最常见的就是 Right-to-left mark(unicode: U+202e)

这个特性给我们反转字符串的带来不少麻烦，最直接的问题就是当一个文档中包含 RTL 时，我们是否要反转。使用之前的 ReverseRune 函数直接尝试可以看出反转是有问题的
![](../public/_image/posts/0002/2021-05-04-11-01-14@2x.png)![](./_image/posts/0002/2021-05-04/2021-05-04-11-01-21@2x.png)


### Contextual character shaping
还是阿拉伯文，阿拉伯文还有个特性是 contextual character shaping，简单来说就是字形会随着码位所在的位置发生改变，如果我们直接反转，其实根本就不一样了

```
'رائع'的反转字符串是: عئار
```



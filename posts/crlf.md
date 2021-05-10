---
title: 0001 「换行」的前世今生
date: 2021-05-01 20:33
---

早些年我同时使用MasOS和Windows系统，当把MasOS上的文件拷贝到Windows上时，所有文件的内容都变成了一行，导致文件的格式就乱了。这个问题的原因想必大家也都清楚，其实是因为不可见字符「新行」引起的。不过非常幸运的是，这个问题在 Windows 10 1809 这个版本得到的修复，微软的[官方博客](https://devblogs.microsoft.com/commandline/extended-eol-in-notepad/)也提到了类似的现象，所以我特意安装了win7来复现这个问题
![mac file](https://i.loli.net/2021/04/22/M94FU1HsGCnuoxA.png)
![windows file](https://i.loli.net/2021/04/22/pCWxU5kyuD7zLrJ.png)

## 打字机
为了说明「新行」的来源，我们先从打字机时代说起。从打字机[打字视频](https://www.bilibili.com/video/BV1Fv411E72k/) 上可以看出早期的英文打字机的工作模式，打字滚筒左边的手柄兼具「回车」和「换行」的功能，手柄从左向右平推可以将滚轮向右推送，这就是「回车」；手柄从左向右扳动带点轻微的顺时针扳动可以转动滚轮，这就是「换行」，扳动的轻一点可以换半行或者四分之一行，打字时当滚动行进行到接近末尾时，会有叮的一声，提示你该换行了（顺便说下，Ascii码的007Bell来源于此）。

![typewriter](https://i.loli.net/2021/04/22/oyzrTlmIqswAHKa.png)

从这里就可以看出早期的「回车」和「换行」其实是两个动作
回车：就是把字车回到开始的位置，被称为Carriage Return，也就是CR
换行：把滚筒向后滚，但实现的输入位置移到下一行，被称为Line Feed，也就是LF


![telewriter](https://i.loli.net/2021/04/22/vs4UGCRQEnuI7kK.png)
到了电传打字机时代，由于没有实体字车的存在，回车和换行就变成两个独立的按键了。但是到了现代的键盘，回车和换行的动作行为愈加模糊，毕竟在一个屏幕上，下一行的行首和行尾其实是一个位置，于是回车和换行就又合并了一个键了，也就是键盘上Enter键，但换行和回车两个概念依然保留，就是我们熟悉的ASCII中的两个空白字符


|      | 缩写 | 转义字符 | Ascii |
|------|------|----------|-------|
| 换行 | CR   | \r       | 13    |
| 回车 | LF   | \n       | 10    |




## Enter
看到这里就有个问题，那么现代键盘上的Enter的具体含义是什么呢？有的键盘也是会在Enter键上刻两个符号的，而且是Return在下，Enter在上。
![return](https://i.loli.net/2021/04/22/zHv7xBKgDY9PnAb.jpg)

另外如果各位手上的是带数字区的键盘，那个键盘上面也有一个Enter键，为什么一个键盘上要放两个相同的按键呢？

在我看来现代键盘上的Enter应该包含三个语义

1. 新行，也就是新建一行，然后把光标挪到新的一行上
2. 回车，把光标移到下一行的行首
3. 输入或者说指令下达，比如在终端敲下回车意味该指令的触发

大部分情况下这三个语义是同时触发的，但是其实我们也有单独「换行」的需求，比如常见的聊天软件窗口毕竟是个多行文字输入框，这个时候各个软件就会自定义Enter这个语义，如下图。在MacOS下最常见是用Option+Enter就可以触发「新行」但输入这个行为
![option-return](https://i.loli.net/2021/04/22/duwmSDHQ7qBO2vL.png)

但其实最早主键盘的Enter原意是只有「新行」这个语义的，我尝试了比较多的软件，只有MacOS上的Photoshop是严格按照这个语义的，在Photoshop的文本框中，按下主键盘区的Enter是只会换行的，而按下数字区的Enter会完成输入然后光标跳出文本框。虽然操作系统会区分这两个按键的信息，但现代大部分软件并没有区分这两个按键的意义，所以其实这两个按键绝大部分情况都是相同的效果
![return](https://i.loli.net/2021/04/22/jHLE25asdlhrXy4.gif)
![enter](https://i.loli.net/2021/04/22/91Fq6TtjpID4chz.gif)

## 先回车还是先换行
![CRLF](https://i.loli.net/2021/04/22/k9ahXc2GSM6j8xN.png)
既然回车和换行是两个ascii码，但是又是合并表达同一件事情，那么组合其实就有以上四种情况。不考虑单独一个字符表达「新行」这种情况，实际上最早的几个标准都定义的是CRLF，包括http协议里也是CR在前，LF在后。

根据[维基百科](https://en.wikipedia.org/wiki/Newline#History)上的介绍，最早打字机的操作过程中，CR所需要的时间远多于LF，把字车移动到行首需要超过一个字符的时间，先做一个时间上的动作明显更合理。即使到了电传打字机，开始新一行的内容时也是必须保证打字头回到了初始位置，所以甚至有些打字机会在CR和LF之间加很多NULL字符来提供更充足的时间



## 混行换行
现在我们知道「换行」可以有多种组合了，如果我们获取一个混合了上面所有四种可能的换行的一个文件会发生什么？

其实什么也不会发生，我尝试了很多软件(vscode,sublime,notepad++)去打开这个文件，都能正常打开，就是行为不太一致
![chaos1](https://i.loli.net/2021/04/22/HupfeMq8cUTtyGd.png)
![chaos2](https://i.loli.net/2021/04/22/YGVwULiC8l5DeJo.png)
这些行为似乎也没什么规律，总结下来就是如果碰到混合换行，大部分文本编辑器都能检测出这四种情况，然后文本编辑器会选一个自己默认的换行直接替换掉，问题不大。只有windows下的visual studio会提示行尾不一致，让用户修改
![vs](https://i.loli.net/2021/04/22/aCT6SItZcXv9Ep3.png)

## 故纸堆
除了CR和LF外，ASCII里还有其他符号表达类似「新行」这个概念，这些符号的来源比较复杂，这里不展开。
![old](https://i.loli.net/2021/04/22/CVm6oD7Hwry4sZ3.png)当然大部分软件也是能检测到这种不常见的「新行」行为，只是如果我们写代码去解析一个文本文件的时候，可能就没那么幸运了
![error](https://i.loli.net/2021/04/22/ghslZ7S3CP8adfq.png)

在[Ecma262](https://262.ecma-international.org/5.1/#sec-7.3)提到一个字符串可以包含任何东西，只要它不是一个引号，一个反斜线或一个行终止符，所以JavaScript里没有字符串可以包括U+2028和U+2029字符的。但是JSON的[规范](https://tools.ietf.org/html/rfc8259)并没有区别对待这两个字符，JSON中的字符串是可以包含上述两个字符的。


当然解决这个问题比较简单，无论什么情况我们都转义这两个字符就好了，但实际上各类语言和框架在实作的时候都会踩坑，比如go也有相关[issue](https://github.com/golang/go/commit/d754647963d41bcd96ea4d12d824f01e8c50f076)也是因为这个引起的


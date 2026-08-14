> [!NOTE]
> 本文是阶段性竞品研究，产品信息可能随时间变化，也不代表首版功能范围。当前产品决定以 [文档索引](./README.md) 和 [PRD](./Mainline_产品prd.md) 为准。

我认真查了一圈，结论比我刚才单纯从创意角度判断更有意思：

**这个方向不是没人做，甚至 2026 年明显正在变热；但你刚才描述的完整形态，目前我没有找到一个真正完全重合的产品。**

更准确地说，现在市场上已经有大量「人生 RPG / 游戏化 Todo」，也开始出现「AI + 人生 RPG」，所以 **“把人生做成游戏”本身不能作为核心创新点**。真正可能成为你产品差异化的，是：

> **把 AI 做成现实人生的 Game Master / 导演，让真实世界发生的事情进入任务系统，并动态判断：这是主线、支线、随机事件、挑战、日常，还是根本不是任务；再根据现实变化实时改写你的任务剧情。**

这个定位，我觉得反而比我们上一轮聊完之后更加清晰。

---

# 先给你看竞争格局

我大概可以把目前市场分成四代。

| 类型         | 代表产品                             | 做到了什么                                                          | 跟你的重合度 |
| ------------ | ------------------------------------ | ------------------------------------------------------------------- | ------------ |
| 第一代       | Habitica                             | Todo + RPG + XP + 金币 + 装备                                       | ★★☆☆☆        |
| 第二代       | MainlineUp / 人升 / ulives           | 高度自定义属性、技能、金币、现实奖励商店                            | ★★★☆☆        |
| 第三代       | MainQuest                            | Main/Side/Daily/Boss 等任务体系 + 剧情化                            | ★★★★☆        |
| 第四代       | RPG Mainline / Questify / Skill Tree | AI 自动生成任务、技能树、目标拆解                                   | ★★★★☆        |
| **你的方向** | **Mainline / 人生任务系统**          | **AI理解现实 → 主支线 → 随机事件 → 动态改线 → 现实奖惩 → 人生剧情** | —            |

最值得你研究的不是 Habitica。

而是下面这几个。

---

# 1. MainQuest：目前我发现和你最像的

这个一定要重点研究。

MainQuest 的官方描述直接就是：

> 把现实任务转换成智能、剧情驱动的 RPG Quests。

更关键的是，它已经把任务分成：

**Main Quest**
主线

**Side Quest**
支线

**Daily Quest**
日常

**Boss Quest**
Boss挑战

**Timed Quest**
限时任务

**Hidden Quest**
隐藏任务

跟我们刚才脑暴出来的体系非常像。 ([mainquest.net][1])

它甚至已经设计：

```text
任务
│
├─ Type
├─ Difficulty
├─ Stat
├─ XP
├─ Gold
├─ Deadline
└─ Completion Criteria
```

而且它还明确宣传：

> narrative chains weave individual tasks into a personal saga

也就是：

**把一个个任务串成个人剧情。** ([mainquest.net][1])

它现在还有：

- XP
- 等级
- HP
- Mana
- Streak
- Inventory
- Achievement
- Leaderboard
- Reward
- Quest Chain

甚至已经规划：

- AI Generated Quests
- Guild Quest
- Seasonal World Events
- Branching Storylines

官方路线图把 AI 生成任务标记为 2026 年方向，Branching Storylines 也在规划中。 ([mainquest.net][1])

所以你如果只是做：

> 主线 + 支线 + 日常 + XP

那我会直接说：

**竞争力不够，MainQuest 已经踩进来了。**

---

# 2. RPG Mainline：AI + 人生 RPG，和你的 AI 思路很接近

这个也是非常值得警惕的。

它的 slogan 就是：

> Turn Your Mainline Into An Epic RPG

它让用户描述：

> **“我想成为怎样的人 / 我想过怎样的人生。”**

然后 AI 自动生成：

**Skill Tree → Questline → AI Coach**

官方明确说：

> AI coach analyzes your ideal Mainline vision and creates personalized skill trees.

同时根据：

- 你的目标
- 你的角色
- 甚至你的位置

生成个性化 Quest。 ([RPG Mainline][2])

App Store 的描述更加直接：

> You describe the Mainline you want. We build you a skill tree, a questline, and an AI coach.

也就是说：

```text
我想成为优秀程序员
        ↓
AI
        ↓
技能树
        ↓
任务线
        ↓
完成
        ↓
XP
        ↓
升级
```

这个已经和你说的：

> “我布置一个周期目标，AI帮我生成建议任务”

高度重合。 ([App Store][3])

---

# 3. Questify：甚至已经开始做“AI根据主线给下一步”

还有一个叫 Questify。

它现在的逻辑是：

> 输入或者直接说出你的任务，然后 AI 根据你的 Main Quest 和最近完成的 Daily Tasks，帮你组织今天、推荐下一步。

而且可以“Reroll”，重新生成方向。 ([App Store][4])

它还有世界观主题：

- Fantasy
- Sci-Fi
- Superhero
- Zombie

也就是说它已经不是纯 Todo UI，而是在尝试：

> **任务管理 + 世界观包装 + AI规划。** ([App Store][5])

---

# 4. Skill Tree：AI负责拆解长期目标

这个几乎对应你说的：

> “我给一个周期目标，AI帮我分阶段。”

Skill Tree 的逻辑：

```text
大目标
↓
Skill Tree
↓
Node
↓
Concrete Task
↓
完成节点
↓
解锁下一个节点
↓
XP / 属性成长
```

而且已经支持 AI-assisted skill tree。

例如：

```text
Become a frontend engineer

        Web Foundation
             │
      ┌──────┴──────┐
 JavaScript       CSS
      │
 TypeScript
      │
    React
      │
   Next.js
```

AI 可以直接先给你生成一棵树。 ([Google Play][6])

所以：

**AI目标拆解本身也不能成为你的唯一卖点。**

---

# 5. MainlineUp / 人升：现实奖励这一块非常强

这个和你说的：

> “完成现实任务得到奖励，不完成就错过奖励。”

有明显重合。

《人升》已经有：

- 属性
- EXP
- 技能
- 金币
- 成就
- 宝箱
- 商店
- 自定义奖励

而且最关键的是：

> 金币可以购买**你自己设置的现实奖励**。

比如：

```text
健身
+30金币

完成项目
+100金币

----------------

奖励商店

奶茶          60
玩游戏2小时   100
买游戏        800
周末出去玩    1200
```

这和你设想的现实奖惩机制非常接近。 ([MainlineUp][7])

现在它的 iOS 后继产品 ulives 甚至已经支持：

> 自定义属性、技能、货币、奖励、成就、战利品箱、自定义概率、任务历史、反思、统计。

奖励商店里可以直接设置：

- 休息
- 电影
- 零食
- 更大的现实奖励

甚至可以用随机战利品箱决定奖励。 ([App Store][8])

所以这一块市场也已经验证过。

---

# 6. Habitica：这个赛道的“老祖宗”

Habitica 本身已经非常成熟：

> 创建现实中的任务、家务、目标，完成之后获得 Gold、Experience 和游戏物品。

本质就是：

```text
现实行为
↓
任务
↓
XP
↓
金币
↓
装备
↓
角色升级
```

它重点还是经典 RPG + Todo，而不是 AI Game Master。 ([Habitica][9])

所以我反而不认为 Habitica 是你最危险的竞争对手。

它更多证明了一件事：

> **“游戏化现实任务”这个需求长期存在。**

---

# 7. 更重要的是：国内居然已经出现了一个很新的「地球Online」

这个你尤其应该看看。

我查到 App Store 上一个 2026 年 7 月发布的产品：

# 地球Online

它的宣传文案几乎就是：

> **把你的人生，活成一场史诗冒险。**

它已经有：

```text
每日任务
长期目标
人生清单

↓

体魄
智识
事业
关系
心境

↓

EXP
等级
成就
```

还有：

> 出生日期 → 已登陆人生天数

以及：

> 早鸟 Buff：5:00–7:00 起床 +20% EXP

> 熬夜 Debuff：凌晨 2 点后未睡，次日 -10% EXP

甚至还有：

**AI 叙事。**

可以选择：

- 温柔治愈
- 毒舌幽默
- 哲学诗意

AI 根据你的行为给出叙述。 ([App Store][10])

这个已经很接近我们说的：

> DAY 8421
>
> 今日人生状态……

所以你一定不要抱着：

**“国内没人做。”**

这个假设去开发。

已经有人在冲这个方向了，而且是**今年刚出来的产品**。 ([App Store][10])

---

# 但我为什么看完这些之后，还是觉得你的想法值得做？

因为我发现这些产品绝大多数都停留在同一个范式：

# 「把 Todo 游戏化」

不管界面多酷，本质还是：

```text
用户创建 Task
↓
给 Task 加 XP
↓
完成 Task
↓
升级
```

AI加入以后变成：

```text
用户输入 Goal
↓
AI生成 Task
↓
完成 Task
↓
XP
```

这离你刚刚跟我描述的东西，实际上**还有一层非常大的距离**。

你真正有意思的是：

# 「把现实解释成游戏。」

注意这两个完全不同。

---

# 你真正应该抢的定位

不要把产品定义成：

> AI Gamified Todo App

因为已经一堆人在做。

你应该定义成：

> **AI-powered Real Mainline Game Master**

中文我甚至喜欢：

# 「AI 人生导演」

或者：

# 「你的现实世界 Game Master」

AI不是帮用户管理 Todo。

而是在不断回答：

> **“你现实世界刚刚发生的这个事情，在你当前的人生剧情里意味着什么？”**

这才是核心。

---

# 举一个特别鲜明的区别

## MainQuest / Habitica / MainlineUp

用户：

> 创建任务：今晚写公众号。

系统：

```text
支线任务

写公众号
+50 XP
+20 Gold
```

结束。

---

## 你的系统

用户：

> 今天老板突然说下周让我负责一个新的AI功能，我以前没独立负责过。

AI不是简单创建 Todo。

AI应该先理解：

```text
现实事件分析

事件：
获得新的项目责任

类型：
关键剧情事件

影响：
职业主线 ↑↑↑

当前人生章节：
「职场第一年」

影响当前主线：
「成为能够独立负责项目的工程师」

剧情判断：
这是主线推进事件。
```

然后：

```text
🎬 MAIN QUEST UPDATED

原主线：
提升独立开发能力

↓

新任务链：

Chapter Mission
「第一次独立负责 AI 功能」

01 理解需求
02 技术方案
03 原型开发
04 联调
05 测试
06 上线
07 项目复盘

最终奖励：

Career XP +500

解锁可能成就：
「独当一面」
```

同时：

> 由于该任务预计本周额外占用 6 小时，建议暂停：

```text
支线：
公众号更新

周三 → 周六
```

**这就完全不是 Todo 游戏化了。**

这是：

> **AI在实时维护你的“人生世界状态”。**

这就是我认为你的最大机会。

---

# 更进一步：随机事件是目前竞品普遍没有做深的东西

你刚才提到 GTA 的路边随机事件，我现在觉得这个想法其实是你整个产品非常关键的差异。

因为现实中每天发生大量：

```text
老板突然安排需求

朋友临时喊吃饭

认识了一个新的人

看到一个很感兴趣的活动

突然生病

家里有事

发现一个工作机会

有人找你合作

突然有灵感

同事给你推荐一项技术

路过一家想吃很久的店

某个平台突然搞优惠

收到一封重要邮件
```

传统 Todo 不知道怎么处理这些东西。

AI完全可以。

用户说：

> 老同学刚问今晚要不要吃饭，不过本来今晚准备健身和写公众号。

系统：

```text
🎲 RANDOM EVENT

「久违的邀请」

人物：
大学同学

事件：
今晚聚餐

预计：
2.5h

━━━━━━━━━━━━

当前计划冲突：

🏋 健身
📝 公众号

━━━━━━━━━━━━

AI分析：

该好友已较长时间未互动，
此次活动具有一定社交价值。

如果接受：

社交 ++
情绪恢复 +
时间 -2.5h
预算约 -¥150

建议：

接受聚会
公众号移动至周六
健身改为午休后30分钟
```

然后用户真的去了。

回来告诉 AI：

> 原来他公司最近正好在招前端，他问我有没有兴趣。

系统：

```text
✨ UNEXPECTED OUTCOME

随机事件产生重要结果

职业机会 +1

━━━━━━━━━━━━

新支线已发现：

「了解 XX 公司机会」

□ 查看岗位JD
□ 了解薪资
□ 询问团队情况
□ 决定是否进一步交流
```

**我目前调研的这些成熟/新兴产品里，没有看到谁把这一整套机制做成核心体验。**

这是非常重要的一点。

---

# 第二个空缺：AI“判断是否是任务”

现在大量 AI Todo 是：

> 给我目标 → AI拆任务。

但你的设计可以允许用户根本不考虑“我要创建什么任务”。

直接说：

> 最近感觉每天晚上回来都很累，想学AI，但是又不知道应该从哪里开始。

AI：

```text
这更像是一个「状态 + 潜在目标」，
而不是具体任务。

识别：

状态：
下班后精力不足

潜在目标：
提升 AI 开发能力

冲突：
目标投入需求
vs
当前晚间精力

建议建立：

🟡 支线
AI 工程能力提升

而不是每日学习2小时。

建议第一阶段：

每周二/四
30分钟

周末
90分钟项目实践
```

用户只负责：

> **描述人生。**

AI负责把人生结构化。

这个交互方向我非常看好。

---

# 第三个空缺：真正严格的“主线”

现在很多产品里的 Main Quest，其实就是：

> Priority = High

换了一层 RPG 皮。

而你完全可以定义得非常严格：

# 同时只能存在 1～3 条人生主线。

例如：

```text
CURRENT CHAPTER

「职场第一年」

━━━━━━━━━━━━

MAIN QUEST 01

成为能够独立负责项目的工程师

68%

━━━━━━━━━━━━

MAIN QUEST 02

建立稳定健康的生活节奏

41%
```

然后用户突然：

> 我要学摄影。

AI：

```text
建议分类：

🟡 Side Quest

原因：

它符合你的长期兴趣，
但目前不影响人生核心阶段目标。

是否加入：
「摄影入门」支线？
```

这样 AI 就在帮助用户回答一个很多人真正解决不了的问题：

> **“这件事情到底值不值得我现在做？”**

这比帮他生成 Todo 有价值得多。

---

# 第四个空缺：任务之间应该有“剧情因果”

普通系统：

```text
完成 A
完成 B
完成 C
```

你的系统：

```text
完成 A
  ↓
改变人生状态
  ↓
触发 B
  ↓
发生现实随机事件 C
  ↓
改变原计划
  ↓
解锁 D
```

例如：

```text
学习 Next.js
↓
做个人项目
↓
发布 GitHub
↓
朋友看到
↓
朋友介绍一个外包
↓
完成外包
↓
获得第一笔副业收入
↓
解锁

NEW STORYLINE

「探索独立开发」
```

**这就产生人生剧情了。**

而不是人为提前编好的剧情。

剧情来自用户现实发生的事情。

这也是 AI 最适合干的事情。

---

# 第五个很好的差异：奖励不是“金币”，而是现实契约

MainlineUp 已经证明“现实奖励商店”是可行方向。 ([App Store][8])

但你还可以进一步。

不是：

> +100 Gold

而是：

```text
TODAY REWARD

🎮 今晚游戏 2 小时

解锁条件：

✅ 工作主线
✅ 健身
⬜ 公众号

有效期：

Tonight 21:30
—
23:30
```

如果完成：

```text
🔓 REWARD UNLOCKED
```

如果没完成：

```text
🔒 REWARD MISSED

奖励已经失效。
```

第二天不能补。

这个其实非常符合游戏：

> **限时奖励。**

而且是真实世界行为契约。

我认为这个东西比抽一个：

> Epic Sword +1

实际得多。

---

# 我给你画一下目前的市场位置

大概是这样：

```text
                    AI强
                     ↑
                     │
        Skill Tree   │   RPG Mainline
                     │
                     │       Questify
                     │
                     │
                     │           ★你的方向
                     │
普通任务 ────────────┼──────────────→ 人生世界模拟
                     │
                     │
        Habitica     │ MainQuest
                     │
                     │
        MainlineUp
                     │
                     ↓
                  AI较弱
```

你的目标不是去左上角：

> “AI帮我生成Todo。”

而是应该疯狂往：

# **右上角**

走。

也就是：

> **AI + Reality RPG Simulation**

---

# 一个非常关键的竞争判断

我现在会把这个项目的机会评价分成这样：

**“人生 RPG”概念创新：4/10**

已经很多人做了。 ([RPG Mainline][2])

**“游戏化任务管理”创新：2/10**

Habitica、MainlineUp 等已经很成熟。 ([Habitica][9])

**“AI拆解人生目标”创新：5/10**

RPG Mainline、Questify、Skill Tree 都开始在做。 ([RPG Mainline][2])

**“AI动态解释现实人生 + Game Master”创新：8/10**

目前我没查到成熟产品真正把它作为核心闭环。

**“GTA式主线/支线/随机事件 + 现实世界状态变化”创新：8.5/10**

MainQuest 在任务类型上已经非常接近，但它目前更像“剧情化任务管理”，而不是“现实事件驱动的人生开放世界”。 ([mainquest.net][1])

---

# 所以我甚至建议你现在改变一句产品定义

之前我们的：

> **把人生，玩成一个开放世界。**

可以继续作为 Slogan。

但产品定义不要写：

> AI 游戏化任务管理软件。

应该写成：

> **一个由 AI 驱动的现实人生 RPG 系统。AI 作为你的 Game Master，理解现实中发生的事情，将人生组织成主线、支线、日常、挑战和随机事件，并根据现实变化持续调整你的下一步行动。**

英文就是：

> **An AI Game Master for real Mainline.**

这句话就开始明显区别于：

Habitica：

> Gamify your tasks.

RPG Mainline：

> AI-generated skill trees & quests.

MainlineUp：

> Customize your gamified to-do system.

而你：

# **AI understands your Mainline as it happens.**

我觉得这个才是方向。

---

## 而且有一个市场信号对你非常有利

2026 年 2 月，Tom's Guide 甚至专门做了一个实验：让 ChatGPT 当 RPG Dungeon Master，把记者自己的现实生活变成 RPG，包括人物属性、XP、Daily Quest、Boss Battle 和现实行为惩罚。作者测试一周后认为这种方式明显提高了自己的行动动力。 ([Tom's Guide][11])

这件事很有意思。

因为它意味着已经有人在**手动用 ChatGPT 做你这个产品想自动完成的事情**：

```text
用户
↓
把生活情况告诉 ChatGPT
↓
ChatGPT 当 Dungeon Master
↓
生成现实 Quest
↓
用户现实执行
↓
回来汇报
↓
AI更新状态
```

而你的产品，本质上就是把这种目前靠 Prompt 拼起来的体验：

# 产品化。

这往往是一个不错的产品信号。

---

# 所以我的判断

我现在反而比刚才更加建议你继续研究这个方向。

但有一个前提：

**千万不要做成「另一个 Habitica / MainlineUp」。**

也千万不要把主要精力花在：

- 装备
- 商城
- 宠物
- 武器
- 华丽 XP
- 一堆 RPG 数值

这些别人已经做得很多了。

你真正应该死磕的是这五个东西：

1. **AI识别现实事件**
2. **AI严格判断主线 / 支线 / 随机事件 / 挑战 / 日常**
3. **AI把长期目标形成动态 Mission Chain**
4. **现实情况变化后，AI动态重新规划，而不是静态 Todo**
5. **所有现实事件最终形成真正属于这个人的 Mainline Story**

如果这五个做出来，我觉得产品就会从：

> “挺有意思的游戏化 Todo。”

变成：

> **“卧槽，它真的像是在把我的人生当成一个游戏运行。”**

这两者的产品体验差距非常大。

而且还有一个很重要的现实情况：**MainQuest、RPG Mainline、Questify，以及国内刚出现的「地球Online」都非常新，说明这个赛道现在不是已经完全成熟，而是正在快速出现一批探索者。** ([MainQuest][1])

所以现在做并不算早得没人理解，也不算晚到完全没有空间。我会把它判断成：**已有需求验证，但产品范式还没定型的窗口期。**

如果你准备认真把它做成作品，我下一步最建议做的不是马上写代码，而是我可以继续帮你把 **Habitica / MainlineUp / MainQuest / RPG Mainline / Questify / 地球Online 这 6 个竞品做成一份非常详细的竞品矩阵**，逐项拆「任务体系、AI能力、奖励、剧情、随机事件、UI、商业模式、你的机会点」，然后直接反推出你的 **MVP 产品需求文档和页面结构**。这一步会很有价值。

[1]: https://www.mainquest.net/quests?utm_source=chatgpt.com "Smart, Story-Driven Quest System"
[2]: https://rpgMainline.ai/?utm_source=chatgpt.com "RPGMainline.ai | Mainline RPG App for Skill Tracking & Personalized ..."
[3]: https://apps.apple.com/us/app/rpg-Mainline/id6755051094?utm_source=chatgpt.com "RPG Mainline - App Store"
[4]: https://apps.apple.com/ar/app/questify-task-rpg/id6760564589?l=en-GB&platform=watch&utm_source=chatgpt.com "Questify - Task RPG - App Store - Apple"
[5]: https://apps.apple.com/ca/app/questify-task-rpg/id6760564589?utm_source=chatgpt.com "Questify - Task RPG - App Store - Apple"
[6]: https://play.google.com/store/apps/details?hl=en_US&id=com.skilltreeimprove.app&utm_source=chatgpt.com "Skill Tree: Improve & Level Up - Apps on Google Play"
[7]: https://www.Mainlineupapp.fun/en/index.html?utm_source=chatgpt.com "Upgrade Your Mainline - Gamify To-Do App - MainlineUp"
[8]: https://apps.apple.com/us/app/ulives-%E9%81%8A%E6%88%B2%E5%8C%96%E5%BE%85%E8%BE%A6%E8%88%87%E7%BF%92%E6%85%A3/id6743084261?l=zh-Hant-TW&utm_source=chatgpt.com "ulives: 遊戲化待辦與習慣 - App Store"
[9]: https://habitica.com/?utm_source=chatgpt.com "Habitica - Gamify Your Mainline"
[10]: https://apps.apple.com/us/app/%E5%9C%B0%E7%90%83online-%E6%8A%8A%E7%94%9F%E6%B4%BB%E5%8F%98%E6%88%90rpg%E5%86%92%E9%99%A9/id6789109191?utm_source=chatgpt.com "地球Online - 把生活变成RPG冒险 - App Store"
[11]: https://www.tomsguide.com/ai/i-used-chatgpt-to-turn-my-Mainline-into-a-video-game-for-7-days-and-it-helped-boost-my-productivity?utm_source=chatgpt.com "I turned my Mainline into a video game with ChatGPT for 7 days - and I got more done than ever"

对，如果明确**面向国内用户**，我会把“产品形态”本身也当成产品设计的一部分，而不是单纯纠结 Web 还是 App。

我的判断比较明确：

> **最终形态：移动 App 为核心 + Web 作为规划/复盘端。**
>
> **MVP：先做移动端 Web/PWA 或 H5，把核心玩法验证出来；不要一开始同时开发 App + Web + 小程序。**
>
> **微信小程序可以做，但我不建议把它作为最终主阵地。**

原因和你这个产品的使用场景关系非常大。

---

# 一、先想一个问题：用户什么时候会打开“人生任务系统”？

它和 Notion、项目管理系统不一样。

用户不是每天坐到电脑前才使用。

而是一天会发生很多次：

```text
08:20 起床
→ 看今日任务

09:30 到公司
→ 开始主线任务

11:20
→ 临时收到老板需求
→ 记录随机事件

12:30
→ AI重新规划下午任务

18:30 下班
→ 主线完成
→ 获得奖励

19:10
→ 朋友突然喊吃饭
→ 随机事件

21:30
→ 健身完成
→ 日常任务 +1

23:20
→ 今日结算
→ AI生成今天的人生旁白
```

所以它天然是一个：

> **高频、碎片化、随时记录、随时反馈的移动产品。**

因此从产品最终形态来看：

# 手机一定应该是主端。

电脑反而是辅助端。

---

# 二、我会把产品设计成“一大一小两个场景”

手机解决：

> **今天我要干什么 + 刚刚发生了什么。**

电脑解决：

> **我的人生到底要往哪里走。**

这样产品结构就非常清楚。

---

# 三、手机端：像“人生 GTA HUD”

这是最核心的产品。

用户打开手机，不应该看到传统 Todo：

> ☑ 买东西
> ☑ 开会
> ☑ 健身
> ☑ 写文章

而应该马上进入：

```text
Mainline

DAY 8,421

CHAPTER 03
「职场第一年」

Lv.17

━━━━━━━━━━━━━━━━

🎯 MAIN QUEST

AI Delivery Agent V3

████████░░ 78%

今日目标
完成任务调度模块

━━━━━━━━━━━━━━━━

TODAY

🔴 主线        2 / 3
🟡 支线        1 / 2
🔥 日常        3 / 4
⚔️ 挑战        0 / 1

━━━━━━━━━━━━━━━━

🎁 TODAY REWARD

完成全部核心任务

→ 今晚游戏 2 小时

━━━━━━━━━━━━━━━━

        ＋

    发生了什么？
```

最后这个：

# 「发生了什么？」

我认为甚至可以成为整个产品最重要的按钮。

---

# 四、因为我越来越觉得：不要让用户自己“创建任务”

这是我们和传统 Todo 最大的区别。

普通软件：

> ＋ 创建任务

我们的产品：

> **＋ 发生了什么？**

点进去直接出现 AI：

> **告诉我刚刚发生了什么。**

用户可以打字，也可以语音：

> “老板刚刚跟我说，月底之前需要研究一下新的播放器方案，不是特别急，但是最好下周先给他一个初步结论。”

然后 AI 自动：

```text
AI 正在分析事件……

━━━━━━━━━━━━━━

检测到新任务

🟡 SIDE QUEST

「播放器技术方案调研」

为什么是支线？

该事项与当前工作有关，
但不会阻塞当前核心项目，
且截止时间较宽松。

━━━━━━━━━━━━━━

Deadline
8 月 31 日

建议阶段：

01 当前方案问题整理
02 候选播放器调研
03 兼容性测试
04 方案对比
05 输出结论

━━━━━━━━━━━━━━

建议本周行动：

周四
整理当前播放器问题

预计 30 min

[ 加入任务 ]   [ 调整 ]
```

这就是 AI Native。

不是：

> Todo App + 一个 AI 对话框。

---

# 五、甚至首页底部导航我都不想放太多

第一版我会考虑：

```text
┌────────────────────────┐

  今天     世界     +     成长     我的

└────────────────────────┘
```

### 「今天」

就是你每天最常打开的地方：

- 今日主线
- 支线
- Daily
- Challenge
- Reward
- AI安排

---

### 「世界」

这是我认为最有 GTA 味道的页面。

不是任务列表。

而是：

# MY WORLD

```text
            🏢 职业
             Lv.12
               │
               │
     🎨 兴趣 ─ Mainline ─ 💪 健康
      Lv.6           Lv.9
               │
               │
            👥 社交
             Lv.8
```

进去职业：

```text
CAREER

当前章节

「职场第一年」

━━━━━━━━━━━━

🎯 MAIN QUEST

成为可以独立负责项目的工程师

███████░░░ 72%

━━━━━━━━━━━━

MISSIONS

AI Agent V3
████████░░

第三方牌谱
██████████

播放器调研
███░░░░░░░
```

这样就真的开始有“开放世界”的感觉。

---

# 六、中间那个「+」应该是 AI 入口

不是：

> 添加任务

而是一个类似游戏中的交互按钮。

点击：

```text
┌────────────────────────┐

       发生什么了？

 🎙 直接告诉我

────────────────────────

例如：

“老板刚刚给我安排了一个需求”

“最近我想开始学摄影”

“朋友周末喊我出去玩”

“最近晚上总是睡得很晚”

“我想三个月减重5kg”

“刚刚项目终于上线了”

└────────────────────────┘
```

注意最后一个：

> **“项目终于上线了。”**

这甚至不是创建任务。

AI应该识别：

```text
🎉 MILESTONE DETECTED

主线节点完成

「AI Agent V3 上线」

Career XP +200

━━━━━━━━━━━━━━

Achievement Unlocked

🏆「又一次交付」

━━━━━━━━━━━━━━

是否结束该任务链？

[ 查看结算 ]
```

这就非常重要。

AI入口不是：

> **“你想创建什么？”**

而是：

> **“你的人生发生什么了？”**

---

# 七、「成长」页面借鉴 MainlineUp + RPG Mainline

这一块可以吸收它们做得好的地方。

但不要太复杂。

例如：

```text
CHARACTER

麦旻轩

Lv. 17

━━━━━━━━━━━━━━

职业
████████░░  Lv.12

健康
██████░░░░  Lv.8

知识
███████░░░  Lv.10

创造
█████░░░░░  Lv.6

社交
██████░░░░  Lv.7

━━━━━━━━━━━━━━

SKILLS

Frontend        Lv.14
AI Engineering  Lv.7
Writing         Lv.4
Fitness         Lv.6
```

然后 AI 自动根据现实任务增加对应 XP。

用户不应该天天手工选择：

> “这个任务 +10 智力还是 +20 创造力？”

**太麻烦了。**

让 AI 判断。

用户只负责生活。

---

# 八、Web 端则完全换一种体验

这时候电脑的大屏幕优势就出来了。

Web 不需要追求高频。

它主要解决：

# 「规划与复盘」

例如：

```text
┌─────────────────────────────────────────────┐
│ Mainline                        Chapter 03       │
├─────────┬───────────────────────────────────┤
│         │                                   │
│ Today   │        Mainline ROADMAP               │
│         │                                   │
│ World   │   2026                            │
│         │     │                             │
│ Quest   │   职场第一年                      │
│         │     │                             │
│ Growth  │     ├── 独立负责项目              │
│         │     │      ├─ AI Agent            │
│ Review  │     │      └─ Poker Upload        │
│         │     │                             │
│ Story   │     ├── AI能力                    │
│         │     │      └─ Mainline RPG            │
│         │     │                             │
│         │     └── 个人输出                  │
│         │            └─ 公众号              │
│         │                                   │
└─────────┴───────────────────────────────────┘
```

电脑非常适合看：

- 人生 Roadmap
- 甘特图
- Quest Tree
- Skill Tree
- 月度复盘
- 周度复盘
- 人生时间线
- 数据统计
- AI 深度规划

---

# 九、比如周日晚上，用户打开 Web

进入：

# WEEK 32 REVIEW

```text
本周人生状态

主线任务
█████████░ 91%

支线任务
██████░░░░ 63%

日常任务
████████░░ 82%

挑战任务
████░░░░░░ 40%

━━━━━━━━━━━━━━━━━━━━

时间投入

工作成长       21.5h
健康            4.2h
个人项目        5.6h
社交            6.1h
娱乐           12.3h

━━━━━━━━━━━━━━━━━━━━

AI REVIEW

本周职业主线推进明显。

但是你的「个人项目」支线已经连续
两周低于计划进度。

原因主要不是时间不足，而是工作日
晚间任务安排过多。

建议下周：

减少两个工作日晚间学习任务，
将 Mainline 项目集中到周六上午。
```

这种东西手机也能看。

但是：

**电脑体验明显更好。**

所以我会把：

> **Mobile = Play**

> **Web = Plan & Review**

作为产品设计原则。

---

# 十、那微信小程序呢？

我觉得：

# 非常适合冷启动，但不适合成为最终产品本体。

小程序最大的优势太明显：

**不用下载。**

朋友给你发：

> “这个东西挺有意思，你测一下你现在的人生等级。”

点开微信：

```text
授权
↓
输入出生日期
↓
AI了解当前情况
↓
生成

Mainline PROFILE

DAY 8,421

当前章节
「职场第一年」

职业 Lv.12
健康 Lv.8
知识 Lv.10
社交 Lv.7

当前可能的主线：

「建立自己的职业竞争力」
```

一下就能体验。

---

# 十一、小程序特别适合做“传播入口”

例如年度总结：

```text
2026 Mainline REPORT

这一年

你完成：

47 个主线任务
126 个支线任务
219 个日常任务
31 个挑战

━━━━━━━━━━━━

最大成长属性

💻 CAREER

Lv.8 → Lv.16

━━━━━━━━━━━━

年度成就

🏆「职场第一年」
🏆「连续健身30天」
🏆「第一次副业收入」
🏆「持续输出者」

━━━━━━━━━━━━

2026 TITLE

「正在建立自己世界的人」
```

生成一张特别漂亮的卡片：

> 分享到微信好友 / 朋友圈。

这种东西在国内非常适合小程序传播。

---

# 十二、但是为什么我不建议只做小程序？

因为你的产品最终会涉及：

- 推送
- 通知
- 桌面 Widget
- 锁屏组件
- 日历
- 健康数据
- 系统快捷指令
- 定位
- 相册
- 语音
- 后台任务
- App Shortcut
- AI语音输入

这些能力越往后走，Native App 的价值越明显。

例如未来：

用户早上拿起手机，锁屏就看到：

```text
Mainline · DAY 8422

🎯 今日主线

完成接口联调

2 / 4
```

这才是真的：

> **游戏 HUD 进入现实世界。**

---

# 十三、Apple Watch / 手表甚至以后都很适合

想象一下：

你健身结束。

手表：

```text
MISSION COMPLETE

🏋️ Workout

45 min

Health XP +30

🔥 Streak 7 Days
```

这就已经非常有“现实游戏”的感觉。

所以从长期产品想象力来看：

**App > 小程序 > 单纯 Web。**

---

# 十四、但是从你现在“做作品”的角度，我反而建议 Web/PWA 先行

这里要区分：

**最终产品形态**

和

**你现在应该开发什么。**

如果现在直接：

```text
iOS
Android
Web
微信小程序
后端
AI
```

很容易半年过去还在搞工程。

你现在最需要验证的其实是：

> **这个玩法到底爽不爽。**

---

# 十五、所以我建议 V0.1：Mobile First Web / PWA

直接做：

```text
Next.js
+
NestJS / Node
+
MongoDB/PostgreSQL
+
LLM
```

整个 UI：

**完全按照手机 App 设计。**

PC打开：

```text
        ┌──────────┐
        │          │
        │  Mainline    │
        │          │
        │ 手机布局 │
        │          │
        │          │
        └──────────┘
```

但是它本质是 Web。

这样有几个巨大好处：

### 1. 开发最快

你本来就熟 React / Next.js。

不用先去搞：

- Flutter
- Swift
- Kotlin
- React Native
- 小程序生态

---

### 2. 手机直接能用

发一个网址：

> Mainline.xxx.com

微信打开就能体验。

---

### 3. PC也能用

直接响应式。

---

### 4. AI能力完全一样

反正真正核心都在服务端：

```text
用户输入
 ↓
AI Director
 ↓
Event Analyzer
 ↓
Mission Engine
 ↓
Reward Engine
 ↓
Mainline State
```

客户端只是展示。

---

# 十六、等 V1 验证成立，再做真正 App

我的路线会是：

```text
Phase 0
产品原型
Figma

↓

Phase 1
Mobile First Web / PWA
验证核心玩法

↓

Phase 2
微信小程序
降低国内传播门槛

↓

Phase 3
iOS / Android App
成为真正主产品

↓

Phase 4
Web Desktop
强化规划 / 数据 / 复盘

↓

Phase 5
Widget / Watch / Calendar / Health
真正让“人生HUD”进入现实
```

当然 Phase 2 和 Phase 3 谁先谁后，可以看第一批用户。

---

# 十七、我甚至觉得这个产品要有一个非常明确的“三级交互”

这是结合刚才那些竞品之后，我现在觉得特别适合你的设计。

## 第一层：极速操作

每天 80% 的使用：

```text
完成任务
添加事件
查看今日
领取奖励
```

**3 秒内完成。**

---

## 第二层：AI对话

用户不知道怎么处理：

> “最近工作有点忙，但我又想继续学AI，怎么安排？”

进入：

# AI Game Master

它知道你的：

- 主线
- 支线
- 时间
- 最近完成率
- 当前任务
- 历史情况

所以不是普通 ChatGPT。

它回答：

> 本周不建议增加新的每日任务。
>
> 你的工作主线已经占用了较多晚间时间。
>
> 我建议把 AI 学习调整为周六上午的 2 小时支线。
>
> 是否调整？

**[执行调整]**

---

## 第三层：人生全局

低频，但很重要：

```text
人生章节
目标
任务树
技能树
属性
时间线
周报
月报
年度报告
```

这部分 Web 特别合适。

---

# 十八、我现在对这个产品还有一个新的判断

**不要把它做成特别二次元或者特别重度 RPG。**

国内其实有不少用户看到：

> HP +100
> 魔法 +20
> 打怪
> 装备

会觉得：

> “有点幼稚。”

你面向的其实可以是：

**18–35 岁，学生 / 初入职场 / 程序员 / 创作者 / 自我提升型年轻人。**

视觉风格反而应该：

> **GTA UI × Apple 极简 × 游戏 HUD × Notion 信息结构**

有游戏味。

但不要：

> 大宝剑 + 骷髅 + 魔法 + 龙。

---

# 十九、举个例子：普通 Todo 和我们的区别

用户周六突然说：

> 今天下午朋友喊我去深圳看展，但是我原本想下午写项目。

普通 Todo：

```text
□ 写项目
□ 看展
```

我们：

```text
🎲 RANDOM EVENT

「周末的临时邀请」

━━━━━━━━━━━━━━

朋友邀请你下午去看展。

时间：
14:00 – 18:00

冲突：

🟡 Side Quest
Mainline 项目开发
预计 3h

━━━━━━━━━━━━━━

AI GAME MASTER

你本周的核心工作任务已经完成。

Mainline 项目属于长期支线，
当前进度没有明显落后。

这次活动属于低频社交 + 兴趣事件。

建议：

✓ 接受

并将 Mainline 项目移动至：

周日上午
09:30 – 12:00

━━━━━━━━━━━━━━

[A] 接受事件

[B] 坚持原计划

[C] 自己决定
```

用户选择 A。

晚上回来：

> 展还不错，认识了朋友的一个做产品的同事，聊到了我的 Mainline 想法。

AI：

```text
EVENT UPDATED

「周末的临时邀请」

结果：

✓ 社交活动完成
✓ 新人物出现
✓ 产生产品讨论

━━━━━━━━━━━━━━

✨ NEW OPPORTUNITY

是否创建支线：

「和新认识的产品同学聊一次 Mainline 产品」

预计价值：
中

时间成本：
低

[加入支线] [忽略]
```

**这个才是我要你抓住的产品灵魂。**

---

# 二十、所以如果让我现在拍板

我会这么定：

> **产品定位**
>
> 面向国内年轻人的 AI 现实人生 RPG。

> **核心设备**
>
> 📱 手机。

> **第一版载体**
>
> **Mobile First Web / PWA。**

> **成熟后的核心载体**
>
> **iOS / Android App。**

> **微信小程序**
>
> 做低门槛体验、分享、拉新和轻量操作。

> **PC Web**
>
> 做人生规划、任务树、周/月复盘、数据统计。

最终形成：

```text
                 Mainline

        AI REAL-Mainline GAME MASTER

                  │
        ┌─────────┴─────────┐
        │                   │
     📱 Mobile            💻 Web
       PLAY               PLAN
        │                   │
 今日任务               人生地图
 随机事件               Quest Tree
 AI记录                 Skill Tree
 奖励领取               数据分析
 每日结算               周/月复盘
        │                   │
        └─────────┬─────────┘
                  │
              Mainline CORE
                  │
         AI Game Master
         Mission Engine
         Reward Engine
         Mainline Timeline
```

而且因为你的核心竞争力最终不是“客户端用了什么技术”，所以**第一版千万别在跨端技术选型上消耗太多时间**。先用你最熟悉的 Web 技术把「发生了什么 → AI理解 → 生成/调整人生任务 → 执行 → 奖励 → 每日结算」这个核心循环跑通。

**只要这个循环第一次让你自己产生“卧槽，我今天真的像在玩自己的人生”的感觉，这个产品就算找到灵魂了。**

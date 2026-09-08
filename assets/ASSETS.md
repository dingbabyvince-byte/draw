# 原创素材清单与许可证 (ORIGINAL_ASSET)

> 本目录下所有素材均为**项目内手写原创 SVG / 原创 Web Audio 合成音色**，无任何外部图片、截图或第三方角色素材。
> 刻意避开《爱心萌可》官方角色的名称、脸型、发型、服装、配色与标志性图案，不抓取、不下载、不截图、不去水印、不抠图、不临摹任何官方素材。

## 许可证
- 所有 SVG 与代码：项目原创（ORIGINAL_ASSET），归本项目所有，无第三方授权要求。
- 音效：均为 Web Audio API 实时合成（boing/slide/chime/piano/slip/sparkle/reward/meow），无 `.wav` 文件、无外部音源。

## 角色 (characters/)
| 文件 | 角色 | 状态 | 来源 | 许可 |
|---|---|---|---|---|
| original-princess-base.svg | 彩虹小公主 | base | 原创 | ORIGINAL_ASSET |
| princess-idle/walk/happy/surprised/slip/swim/dance.svg | 彩虹小公主 | 7 状态 | 原创 | ORIGINAL_ASSET |
| original-pink-mascot-base.svg | 粉心星宝 | base | 原创 | ORIGINAL_ASSET |
| mascot-idle/walk/happy/surprised/slip/swim/dance.svg | 粉心星宝 | 7 状态 | 原创 | ORIGINAL_ASSET |

## 服装 (clothes/)
### 公主 princess/
crown, hairpin, pink-dress, blue-dress, cape, wings, necklace, shoes, wand, swimsuit, beach-outfit — 全部 ORIGINAL_ASSET
### 萌宠 mascot/
crown, dress, cape, wings, shoes, chef-outfit, beach-outfit — 全部 ORIGINAL_ASSET

## 场景 (scenes/)
pool, beach, restaurant, kitchen, living-room — 全部 ORIGINAL_ASSET

## 互动对象 (objects/)
banana, treasure-chest, piano, swimming-ring, magic-door, cat, table-food, pot, plant, ball, tree, star-egg, mushroom — 全部 ORIGINAL_ASSET

## 厨房与美食贴纸 (stickers/)
cake, strawberry, ice-cream, donut, cookie, milk, juice, bread, pizza, onigiri, fried-egg, carrot, tomato, corn, pot, teapot, cup, spoon, fork, knife, plate, rolling-pin, whisk, chef-hat, cupcake, popsicle, bento, jam-jar — 共 28 枚，全部 ORIGINAL_ASSET。清单与稀有度见 `data/stickers.js`。

## 尺寸与锚点约定
- 角色框统一：公主 200×320，星宝 200×200；锚点 `anchor.x/y` 为相对框的比例，`y=0.96` 为脚底。
- 服装 `anchor` 为相对角色框的定位比例，`z` 为图层顺序（小→大叠加）。
- 场景对象坐标为 0~1 相对比例，适配横竖屏。

## 生成脚本
`_gen_assets.py` 用于批量生成/刷新占位 SVG，可重复运行覆盖。

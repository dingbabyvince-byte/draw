# 关卡奖励语音

- 1 星：`good-job.wav` — Good job!
- 2 星：`amazing.wav` — Amazing!
- 3 星：`unbelievable.wav` — Unbelievable!

由本机已安装的 Microsoft Zira Desktop 英语语音合成生成，语速 -8%、音高 +12%、音量 85%。WAV 随网页离线提供，单文件构建时内联为 data URI；播放失败时尝试设备英语语音。

背景音乐由 `kids-audio.js` 的原创音序实时合成，三种关卡和厨房分别使用不同旋律。首次点击或键盘操作后播放，奖励语音期间降低背景音乐音量，静音和页面切到后台时停止播放。

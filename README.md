# Baccarat 百家乐

精致的单人百家乐网页小游戏 —— 深夜赌场风：墨绿绒面桌面、香槟金描边、3D 翻牌发牌动画、筹码堆叠下注与合成音效。

## 玩法

- 标准 8 副牌靴（剩约一副时自动重洗）
- 完整百家乐规则：A 计 1 点，10/J/Q/K 计 0 点，取个位数；闲 ≤5 补牌，庄家按补牌表行动；首两张 8/9 为天生赢家
- 下注区域：闲（1 赔 1）、庄（1 赔 0.95）、和（1 赔 8）、闲对 / 庄对（各 1 赔 11）
- 和局退回闲 / 庄注码；庄赢抽 5% 水
- 筹码面额 5 / 25 / 100 / 500 / 1000，起始余额 10,000
- 路单（珠盘式）+ 庄 / 闲 / 和统计 + 最高余额记录
- 余额与战绩存于浏览器 localStorage；破产后可一键领取新筹码重新开局

## 技术

- React 19 + TypeScript + Vite 7 + Tailwind CSS 3（shadcn/ui 主题）
- 纯前端，无后端；游戏逻辑在 `src/game/baccarat.ts`（纯函数，可测）
- 状态机在 `src/hooks/useBaccarat.ts`，UI 组件在 `src/components/game/`
- Web Audio 合成音效（`src/game/sound.ts`），无任何音频资源文件

## 运行

```bash
npm install
npm run dev      # 开发预览
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

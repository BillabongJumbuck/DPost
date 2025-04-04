### 🤖 Assistant

以下是为该 Tabs 组件生成的 API 文档：

---

# Tabs 组件文档

## 功能概述

- 可拖拽排序的标签页系统
- 支持动态添加/删除标签页
- 响应式滚动条控制
- 深色/浅色主题支持
- 自定义图标和操作按钮

---

## Props

| 属性名                 | 类型    | 默认值 | 说明                                        |
| ---------------------- | ------- | ------ | ------------------------------------------- |
| `model-value`          | String  | -      | 当前激活的标签页 ID (v-model 绑定)          |
| `styles`               | String  | ""     | 自定义 CSS 类名                             |
| `render-inactive-tabs` | Boolean | false  | 是否渲染非激活状态的标签页内容              |
| `can-add-new-tab`      | Boolean | true   | 是否显示新增标签页按钮                      |
| `new-text`             | String  | null   | 自定义新增按钮文字 ("New" 的替代文本)       |
| `close-text`           | String  | null   | 自定义关闭按钮提示文字 ("Close" 的替代文本) |

---

## Events

| 事件名              | 参数                                     | 说明                     |
| ------------------- | ---------------------------------------- | ------------------------ |
| `update:modelValue` | `newTabID: string`                       | 切换激活标签页时触发     |
| `sort`              | `{ oldIndex: number, newIndex: number }` | 标签页拖拽排序时触发     |
| `removeTab`         | `tabID: string`                          | 点击关闭按钮时触发       |
| `addTab`            | -                                        | 点击新增标签页按钮时触发 |

---

## Slots

### 默认插槽

用于放置标签页内容，通过 `TabProvider` 上下文控制渲染：

```vue
<template v-for="(tab, id) in tabs" :key="id">
  <div v-if="activeTabID === id || renderInactive">
    <!-- 标签页内容 -->
  </div>
</template>
```

### `#actions`

在标签栏右侧添加自定义操作按钮：

```vue
<template #actions>
  <button class="custom-action">...</button>
</template>
```

---

## 样式定制

通过 CSS 变量控制主题颜色：

```css
:root {
  --primary-color: #3b82f6;       /* 主色 */
  --secondary-color: #64748b;     /* 次要色 */
  --divider-light-color: #e5e7eb; /* 分割线颜色 */
}
```

---

## 使用示例

### 基础用法

```vue
<Tabs v-model="activeTab">
  <template v-for="tab in tabs" :key="tab.id">
    <div>{{ tab.content }}</div>
  </template>
</Tabs>
```

### 自定义按钮文本

```vue
<Tabs
  new-text="新建"
  close-text="关闭"
/>
```

### 添加操作按钮

```vue
<Tabs>
  <template #actions>
    <button @click="exportAll">导出全部</button>
  </template>
</Tabs>
```

---

## 类型定义

### TabMeta 类型

```ts
interface TabMeta {
  label: string | null
  icon: Slot | undefined
  suffix: Slot | undefined
  tabhead: Slot | undefined
  info: string | null
  isRemovable: boolean
  closeVisibility: "hover" | "always" | "never"
}
```

---

## 注意事项

1. 标签页内容需要通过 `TabProvider` 上下文控制渲染
2. 深色模式自动继承父级元素的 `dark` 类
3. 滚动条滑块宽度自动根据内容长度计算
4. 标签页最小宽度为 184px (通过 `TAB_WIDTH` 常量控制)
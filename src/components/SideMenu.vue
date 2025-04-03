<template>
  <!-- 新增包裹层控制布局 -->
  <div class="menu-container">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      router
      @open="handleOpen"
      @close="handleClose"
      active-text-color="#409EFF"
    >
      <!-- 菜单项保持原样 -->
      <el-menu-item index="/restful">
        <el-icon><Link /></el-icon>
        <template #title>RESTFul</template>
      </el-menu-item>
      <el-menu-item index="/setting">
        <el-icon><Setting /></el-icon>
        <template #title>Setting</template>
      </el-menu-item>
    </el-menu>

    <el-button style="border: none" class="collapse-btn">
      <div v-if="isCollapse" @click="()=>{isCollapse = false}">
        <el-icon>
          <arrow-right-bold/>
        </el-icon>
      </div>
      <div v-else  @click="()=>{isCollapse = true}">
        <el-icon>
          <arrow-left-bold/>
        </el-icon>
      </div>
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  ArrowLeftBold,
  ArrowRightBold,
  Link,
  Setting
} from '@element-plus/icons-vue'

import { useRoute } from 'vue-router'
const route = useRoute()

const activeIndex = computed(() => {
  return route.path // 直接使用当前路径匹配
})


const isCollapse = ref(true)

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
/* 关键布局样式 */
.menu-container {
  height: 100%; /* 继承父容器高度 */
  display: flex;
  flex-direction: column; /* 垂直排列 */
}
.el-menu-vertical-demo {
  flex: 1; /* 占据剩余空间 */
  overflow: auto; /* 防止内容溢出 */
  border: none;
}
.collapse-btn {
  margin-top: auto; /* 自动顶到容器底部 */
  padding: 12px;
  border-top: 1px solid var(--el-border-color);
}

.el-menu-item {
  transition: all 0.3s; /* 过渡动画 */
  position: relative; /* 为伪元素定位 */
}

.el-menu-item.is-active {
  background: #e8e6e6 !important; /* 灰色背景 */
}
.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px; /* 左边框宽度 */
  background: #409EFF; /* 蓝色边框 */
  border-radius: 0 4px 4px 0; /* 右侧圆角 */
}
/* 折叠状态适配 */
.el-menu--collapse .el-menu-item.is-active::before {
  left: -2px; /* 微调位置适应折叠状态 */
  width: 6px;
}
</style>

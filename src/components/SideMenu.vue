<template>
  <!-- 新增包裹层控制布局 -->
  <div class="menu-container">
    <el-menu
      default-active="1"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      active-text-color="#409EFF"
    >
      <!-- 菜单项保持原样 -->
      <el-menu-item index="1">
        <el-icon><Link /></el-icon>
        <template #title>RESTFul</template>
      </el-menu-item>
      <el-menu-item index="2">
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
import { ref } from 'vue'
import {
  ArrowLeftBold,
  ArrowRightBold,
  Link,
  Setting
} from '@element-plus/icons-vue'

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
  border-right: 1px #afafaf solid;
}
.el-menu-vertical-demo {
  flex: 1; /* 占据剩余空间 */
  overflow: auto; /* 防止内容溢出 */
}
.collapse-btn {
  margin-top: auto; /* 自动顶到容器底部 */
  padding: 12px;
  border-top: 1px solid var(--el-border-color);
}

/* 折叠状态适配 */
.el-menu--collapse .el-menu-item.is-active::before {
  left: -2px; /* 微调位置适应折叠状态 */
  width: 3px;
}
</style>

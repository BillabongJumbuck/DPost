<script setup lang="ts">
import Menu from '@/components/Menu.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <el-container class="h-full w-full"> <!-- 改为继承父容器尺寸 -->
    <el-header class="h-15" style="border-bottom: 1px #afafaf solid;"><Header/></el-header>
    <el-container class="flex-1 min-h-0">
      <el-aside width="auto"><Menu/></el-aside>
      <el-container>
        <el-main>Main</el-main>
        <el-footer class="h-15">Footer</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>
<style scoped>
/* 强制 Element 容器高度继承 */
.el-container {
  height: 100%;
}
/* 处理滚动条 */
.el-main {
  overflow: auto;
  height: calc(100% - 60px); /* 根据 header/footer 高度调整 */
}
</style>

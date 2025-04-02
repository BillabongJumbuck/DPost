<script setup lang="ts">
import Menu from '@/components/SideMenu.vue'
import Header from '@/components/AppHeader.vue'
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
</style>

<script setup lang="ts">
import Menu from '@/components/SideMenu.vue'
import Header from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <el-container class="h-full w-full">
    <el-header class="h-15" style="border-bottom: 1px #d6d6d6 solid;"><Header/></el-header>
    <el-container class="flex-1 min-h-0">
      <el-aside width="auto" style="border-right: 1px #d6d6d6 solid;"><Menu/></el-aside>
      <el-container>
        <el-main class="!p-0"><RouterView class="w-full h-full m-0 p-0"/></el-main>
        <el-footer height="30px" style="border-top: 1px #d6d6d6 solid;"><AppFooter/></el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>
<style scoped>
</style>

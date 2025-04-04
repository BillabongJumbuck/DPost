<template>
  <div class="h-full w-full">
    <div class="flex h-full gap-x-[10px]">
      <!-- 第一列 -->
      <div class="flex-1 h-full flex items-center ">
        <img width="48" height="48"
             src="/logo.svg" alt="Logo">
        <div class="font-extrabold text-indigo-950 text-4xl truncate pl-5">
          DPost
        </div>
      </div>

      <!-- 第二列 -->
      <div class="flex-1 h-full flex items-center justify-center">
        <el-input
          style="width: 400px; --el-color-info-light-9: rgb(232.8, 233.4, 234.6)"
          placeholder="搜索"
          :prefix-icon="Search"
        />
      </div>

      <!-- 第三列 -->
      <div class="flex-1 h-full flex items-center justify-end ">
        <el-button type="success" plain>
          <el-icon style="width: 24px; height: 24px">
            <UploadFilled />
          </el-icon>
          保存我的工作区
        </el-button>
        <el-button type="primary" style="width: auto">登录</el-button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { Search, UploadFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
</style>

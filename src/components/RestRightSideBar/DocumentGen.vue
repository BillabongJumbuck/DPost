<template>
  <div class="flex flex-col">
    <div class="mt-4 relative docgen-loading-container" v-loading="isLoading" element-loading-text="正在生成API文档...">
      <div
        v-if="errorState"
        class="w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-red-400"
      >
        {{ outputContent }}
      </div>
      <div v-else-if="!errorState && renderedHtmlContent" class="rounded border border-dividerLight"> <div class="flex items-center justify-between pl-4 border-b border-dividerLight"> <label class="truncate font-semibold text-secondaryLight py-2"> API 文档 </label> <div class="flex items-center">
        <HoppButtonSecondary
          v-tippy="{ theme: 'tooltip', allowHTML: true }"
          :title="'复制文档内容'"
          :icon="copyIcon"
          @click="copyDocumentation"
        />
      </div>
      </div>
        <div class="p-4 docgen-content-html"> <div v-html="renderedHtmlContent"></div> </div>
      </div>
      <div v-else class="mt-4 w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-secondaryLight">
        // 请先选择一个请求来生成文档
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { HoppButtonSecondary } from '@/components/Hopp';
// 引入 docegen 函数和 DHttpRequestDoc 类型
import { docegen } from '@/utility/helper/Docgen';
import type { DHttpRequestDoc } from '@/utility/model';

import { marked } from 'marked'; // *** 导入 marked 库 ***
// *** 导入图标和复制工具函数 ***
import { CopyIcon as IconCopy, CheckIcon as IconCheck } from 'lucide-vue-next';
import { copyToClipboard } from '@/utility/helper/clipboards';


// 声明组件接收的 prop
const props = defineProps<{
  request: DHttpRequestDoc | null
}>();

// 状态变量
const rawMarkdownContent = ref(''); // 用于存储后端返回的原始 Markdown 字符串
const renderedHtmlContent = ref(''); // 用于存储 Markdown 渲染后的 HTML 字符串
const outputContent = ref(''); // 用于存储错误信息或初始提示文本 (非 HTML 内容)
const isLoading = ref(false); // 加载状态标志
const errorState = ref(false); // 错误状态标志
const copyIcon = ref(IconCopy); // *** 新增: 复制按钮的图标状态 ***


// --- 辅助函数：生成文档并处理结果 ---
const generateAndDisplayDoc = async (request: DHttpRequestDoc | null) => {
  console.log('docgenViewer: 尝试生成文档...');

  isLoading.value = true; // 开始加载
  errorState.value = false; // 重置错误状态
  rawMarkdownContent.value = ''; // 清空旧内容
  renderedHtmlContent.value = ''; // 清空旧渲染内容
  outputContent.value = ''; // 清空旧输出（错误或提示）


  if (!request) {
    console.log('docgenViewer: 没有选中的请求，无法生成文档。');
    outputContent.value = '// 请先选择一个请求来生成文档'; // 显示占位符
    isLoading.value = false; // 隐藏加载
    return;
  }

  try {
    // 调用异步 docegen 函数并等待结果 (假设成功时返回 Markdown 字符串)
    const docOrError = await docegen(request);

    if (docOrError instanceof Error) {
      // 如果返回的是 Error 对象，表示生成失败
      console.error('docgenViewer: 文档生成失败:', docOrError);
      errorState.value = true;
      outputContent.value = `// 文档生成失败: ${docOrError.message}`; // 在页面上显示错误信息
      renderedHtmlContent.value = ''; // 错误时清空渲染内容
    } else {
      // 如果返回的是字符串，表示生成成功 (假设是 Markdown 字符串)
      console.log('docgenViewer: 文档生成成功。');
      rawMarkdownContent.value = docOrError; // 存储原始 Markdown

      // *** 使用 marked 库将 Markdown 异步渲染为 HTML 并等待结果 ***
      renderedHtmlContent.value = await marked.parse(rawMarkdownContent.value);

      errorState.value = false; // 确保不是错误状态
      outputContent.value = ''; // 成功时，outputContent 不用于显示

      console.log('docgenViewer: 生成的文档内容已显示.');
    }
  } catch (err) {
    // 捕获 await 或 docegen 函数中可能发生的任何意外错误
    console.error('docgenViewer: 在 generateAndDisplayDoc 中发生意外错误:', err);
    errorState.value = true;
    outputContent.value = `// 发生意外错误: ${err instanceof Error ? err.message : String(err)}`;
    renderedHtmlContent.value = ''; // 异常时清空渲染内容
  } finally {
    isLoading.value = false; // 无论成功或失败，都在 finally 中隐藏加载状态
    console.log('docgenViewer: 文档生成调用完成.');
  }
};

// --- Watcher ---

// 监听 request prop 的变化，并在变化时触发文档生成
watch(
  () => props.request,
  (newRequest) => {
    console.log('docgenViewer: 请求 prop 变化:', newRequest ? newRequest.id : 'null');
    nextTick(() => {
      generateAndDisplayDoc(newRequest);
    });
  },
  { deep: true, immediate: true } // immediate: true 在组件挂载时立即执行一次
);

// onMounted 钩子，由于 immediate: true watcher 会在挂载时触发，这里可以不做额外处理
onMounted(() => {
  console.log('DocgenViewer 组件已挂载.');
});

// *** 新增: 复制文档内容函数 ***
const copyDocumentation = async () => {
  // 复制渲染后的 HTML 字符串
  const success = await copyToClipboard(renderedHtmlContent.value);
  if (success) {
    copyIcon.value = IconCheck; // 复制成功后显示打钩图标
    setTimeout(() => {
      copyIcon.value = IconCopy; // 2 秒后恢复复制图标
    }, 2000);
  }
};


// Script setup 会自动暴露 ref 和函数到模板中
</script>

<style>
/* 目标：覆盖 el-loading-spinner 的定位样式，使其距离顶部 100px */
.docgen-loading-container .el-loading-spinner {
  top: 100px !important;
  transform: translate(-50%, 0) !important;
  left: 50% !important;
  position: absolute !important;
}
</style>

<style scoped>
/* scoped 样式用于组件自身的样式 */
.relative {
  position: relative; /* 为 v-loading 蒙层提供定位上下文 */
}

/* 您可以根据需要添加样式来控制生成的 HTML 内容的容器 */
.docgen-content-html {
  background-color: #fff;
  color: #333;
  font-family: sans-serif;
  line-height: 1.6;
  overflow-x: auto; /* 使代码块可以滚动 */
}
</style>

<template>
  <div class="flex flex-col">
    <div class="mt-4 relative docgen-loading-container" v-loading="isLoading" element-loading-text="正在生成API文档...">
      <div
        v-if="errorState"
        class="w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-red-400"
      >
        {{ outputContent }}
      </div>
      <div v-else-if="!errorState && renderedHtmlContent" class="rounded border border-dividerLight">
        <div class="flex items-center justify-between pl-4 border-b border-dividerLight">
          <label class="truncate font-semibold text-secondaryLight py-2"> API 文档 </label>
          <div class="flex items-center">
            <HoppButtonSecondary
              v-tippy="{ theme: 'tooltip', allowHTML: true }"
              :title="'复制文档内容'"
              :icon="copyIcon"
              @click="copyDocumentation"
            />
          </div>
        </div>
        <div class="p-4 docgen-content-html">
          <div v-html="renderedHtmlContent"></div> </div>
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
import { docegen } from '@/utility/helper/Docgen';
import type { DHttpRequestDoc } from '@/utility/model';

import { marked } from 'marked';
import { CopyIcon as IconCopy, CheckIcon as IconCheck } from 'lucide-vue-next';
import { copyToClipboard } from '@/utility/helper/clipboards';


const props = defineProps<{
  request: DHttpRequestDoc | null
}>();

// 状态变量
const rawMarkdownContent = ref('');
const renderedHtmlContent = ref('');
const outputContent = ref('');
const isLoading = ref(false);
const errorState = ref(false);
const copyIcon = ref(IconCopy);


// --- 辅助函数：生成文档并处理结果 ---
const generateAndDisplayDoc = async (request: DHttpRequestDoc | null) => {
  console.log('docgenViewer: 尝试生成文档...');

  isLoading.value = true;
  errorState.value = false;
  rawMarkdownContent.value = '';
  renderedHtmlContent.value = '';
  outputContent.value = '';


  if (!request) {
    console.log('docgenViewer: 没有选中的请求，无法生成文档。');
    outputContent.value = '// 请先选择一个请求来生成文档';
    isLoading.value = false;
    return;
  }

  try {
    const docOrError = await docegen(request);

    if (docOrError instanceof Error) {
      console.error('docgenViewer: 文档生成失败:', docOrError);
      errorState.value = true;
      outputContent.value = `// 文档生成失败: ${docOrError.message}`;
      renderedHtmlContent.value = '';
    } else {
      console.log('docgenViewer: 文档生成成功。');
      rawMarkdownContent.value = docOrError;

      // 使用 marked 库将 Markdown 异步渲染为 HTML 并等待结果
      renderedHtmlContent.value = await marked.parse(rawMarkdownContent.value);

      errorState.value = false;
      outputContent.value = '';

      console.log('docgenViewer: 生成的文档内容已显示.');
    }
  } catch (err) {
    console.error('docgenViewer: 在 generateAndDisplayDoc 中发生意外错误:', err);
    errorState.value = true;
    outputContent.value = `// 发生意外错误: ${err instanceof Error ? err.message : String(err)}`;
    renderedHtmlContent.value = '';
  } finally {
    isLoading.value = false;
    console.log('docgenViewer: 文档生成调用完成.');
  }
};

// --- Watcher ---
watch(
  () => props.request,
  (newRequest) => {
    console.log('docgenViewer: 请求 prop 变化:', newRequest ? newRequest.id : 'null');
    nextTick(() => {
      generateAndDisplayDoc(newRequest);
    });
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  console.log('DocgenViewer 组件已挂载.');
});

// --- 复制文档内容函数 ---
const copyDocumentation = async () => {
  const success = await copyToClipboard(renderedHtmlContent.value);
  if (success) {
    copyIcon.value = IconCheck;
    setTimeout(() => {
      copyIcon.value = IconCopy;
    }, 2000);
  }
};
</script>

<style>
.docgen-loading-container .el-loading-spinner {
  top: 100px !important;
  transform: translate(-50%, 0) !important;
  left: 50% !important;
  position: absolute !important;
}
</style>

<style scoped>
.relative {
  position: relative;
}

/* 容器基础样式 */
.docgen-content-html {
  background-color: #fff;
  color: #333;
  font-family: sans-serif;
  line-height: 1.6;
  overflow-x: auto; /* 使代码块可以滚动 */
}

/* *** 使用 :deep() 穿透 scoped 样式，美化 Markdown 渲染出的 HTML 元素 *** */

/* 标题样式 */
.docgen-content-html :deep(h1) {
  font-size: 1.8em;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.docgen-content-html :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.docgen-content-html :deep(h3) {
  font-size: 1.2em;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.docgen-content-html :deep(h4),
.docgen-content-html :deep(h5),
.docgen-content-html :deep(h6) {
  font-size: 1em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}


/* 段落样式 */
.docgen-content-html :deep(p) {
  margin-bottom: 1em;
}

/* 列表样式 */
.docgen-content-html :deep(ul),
.docgen-content-html :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
  padding-left: 0; /* 确保列表项前的标记/数字显示 */
}

.docgen-content-html :deep(li) {
  margin-bottom: 0.5em;
}

/* 强调样式 */
.docgen-content-html :deep(strong),
.docgen-content-html :deep(b) {
  font-weight: bold;
}

.docgen-content-html :deep(em),
.docgen-content-html :deep(i) {
  font-style: italic;
}

/* 代码块样式 */
.docgen-content-html :deep(pre) {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto; /* 确保代码块可以滚动 */
  margin-bottom: 1em;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; /* 更好的等宽字体 */
  font-size: 0.9em;
}

.docgen-content-html :deep(code) {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  background-color: #f0f0f0; /* 行内代码背景 */
  padding: 2px 4px;
  border-radius: 3px;
}

.docgen-content-html :deep(pre code) {
  /* Styles specifically for code inside pre blocks */
  background-color: transparent; /* 不重复背景 */
  padding: 0; /* 不重复内边距 */
  border-radius: 0;
  font-size: 1em; /* 相对于父元素 pre 的大小 */
}


/* 表格样式 */
.docgen-content-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
  display: block; /* 使表格容器可滚动 */
  overflow-x: auto;
}

.docgen-content-html :deep(th),
.docgen-content-html :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.docgen-content-html :deep(th) {
  background-color: #f2f2f2;
  font-weight: bold;
}

.docgen-content-html :deep(tr:nth-child(even)) {
  background-color: #f9f9f9; /* 交替行颜色 */
}

/* 链接样式 */
.docgen-content-html :deep(a) {
  color: #3498db;
  text-decoration: none;
}

.docgen-content-html :deep(a:hover) {
  text-decoration: underline;
}

/* 引用块样式 */
.docgen-content-html :deep(blockquote) {
  border-left: 4px solid #ccc;
  padding: 10px 15px;
  margin: 1em 0;
  color: #555;
  background-color: #f9f9f9;
  font-style: italic;
}

/* 图片样式 (如果 Markdown 中包含图片) */
.docgen-content-html :deep(img) {
  max-width: 100%; /* 确保图片不会超出容器 */
  height: auto;
  display: block; /* 使图片独占一行 */
  margin: 1em 0;
}

</style>

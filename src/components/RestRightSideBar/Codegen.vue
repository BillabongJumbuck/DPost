<template>
  <div class="flex flex-col">
    <tippy interactive trigger="click" theme="popover" placement="bottom" :on-shown="() => {}">
      <HoppSelectWrapper>
        <HoppButtonSecondary
          :label="CodegenDefinitions.find((x) => x.name === codegenType)!.caption"
          outline
          class="flex-1 pr-8"
        />
      </HoppSelectWrapper>
      <template #content="{ hide }">
        <div class="flex flex-col space-y-2">
          <div
            ref="tippyActions"
            class="flex flex-col focus:outline-none"
            tabindex="0"
            @keyup.escape="hide()"
          >
            <HoppItem
              v-for="codegen in CodegenDefinitions"
              :key="codegen.name"
              :label="codegen.caption"
              :info-icon="codegen.name === codegenType ? IconCheck : undefined"
              :active-info-icon="codegen.name === codegenType"
              @click="
                () => {
                  codegenType = codegen.name
                  hide()
                }
              "
            />
          </div>
        </div>
      </template>
    </tippy>

    <div class="mt-4 relative" v-loading="isLoading"  element-loading-text="正在生成请求代码...">
      <div
        v-if="errorState"
        class="w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-red-400"
      >
        {{ generatedContent }}
      </div>
      <div v-else-if="codegenType" class="rounded border border-dividerLight">
        <div class="flex items-center justify-between pl-4">
          <label class="truncate font-semibold text-secondaryLight"> 已生成代码 </label>
          <div class="flex items-center">
            <HoppButtonSecondary
              v-tippy="{ theme: 'tooltip', allowHTML: true }"
              :title="'复制'"
              :icon="copyIcon"
              @click="copyResponse"
            />
          </div>
        </div>
        <div ref="generatedCode" class="rounded-b border-t border-dividerLight"></div>
      </div>
      <div v-else class="mt-4 w-full overflow-auto whitespace-normal rounded bg-primaryLight px-4 py-2 font-mono text-secondaryLight">
        // 请先选择一个代码生成类型
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { HoppSelectWrapper, HoppButtonSecondary, HoppItem } from '@/components/Hopp'
import { Tippy } from 'vue-tippy'
// 假设 codegen 定义已经包含在 helper/codegen 中并正确导出
import { CodegenDefinitions, type CodegenName, codegen } from '@/utility/helper/codegen'
import { useCodemirror } from '@/utility/helper/useCodemirror'
import { CopyIcon as IconCopy, CheckIcon as IconCheck } from 'lucide-vue-next'
import { copyToClipboard } from '@/utility/helper/clipboards'
import type { DHttpRequestDoc } from '@/utility/model'

const props = defineProps<{
  request: DHttpRequestDoc | null
}>()

// State
const codegenType = ref<CodegenName>('shell-curl') // 默认使用 shell-curl
const generatedCode = ref<HTMLElement>() // CodeMirror 容器的 ref
const generatedContent = ref('') // 实际生成的代码字符串或错误信息
const copyIcon = ref(IconCopy) // 复制按钮的图标
const errorState = ref(false) // 代码生成是否出错的标志
const isLoading = ref(false); // *** 新增: 加载状态标志 ***

// CodeMirror 集成
// useCodemirror 会监听 generatedContent 并更新编辑器内容
const { view } = useCodemirror(generatedCode, generatedContent, {
  langMime: 'text/plain', // 初始 MIME 类型，如果需要根据生成类型改变高亮，可能需要更复杂的逻辑
  readOnly: true,
  lineWrapping: true,
});

// --- 辅助函数：生成代码并处理结果 ---
const generateAndDisplayCode = async (request: DHttpRequestDoc | null, type: CodegenName) => {
  console.log(`尝试通过 codegen 函数为类型 "${type}" 生成代码 (调用后端)...`);

  // *** 设置加载状态为 true ***
  isLoading.value = true;

  if (!request) {
    console.log('没有选中的请求，无法生成代码。');
    generatedContent.value = '// 请先选择一个请求'; // 显示占位符
    errorState.value = false; // 不是错误状态
    // *** 隐藏加载状态 ***
    isLoading.value = false;
    return;
  }

  try {
    const codeOrError = await codegen(request, codegenType.value.toString());

    if (codeOrError instanceof Error) {
      // 如果返回的是 Error 对象，表示生成失败
      console.error('代码生成失败:', codeOrError);
      errorState.value = true;
      generatedContent.value = `// 代码生成失败: ${codeOrError.message}`; // 在 CodeMirror 中显示错误信息
    } else {
      // 如果返回的是字符串，表示生成成功
      console.log('代码生成成功。');
      errorState.value = false;
      generatedContent.value = codeOrError; // 在 CodeMirror 中显示生成的代码
      console.log('生成的代码已显示.');
    }
  } catch (err) {
    // 捕获 await 或 codegen 函数中可能发生的任何意外错误
    console.error('在 generateAndDisplayCode 中发生意外错误:', err);
    errorState.value = true;
    generatedContent.value = `// 发生意外错误: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    // *** 无论成功或失败，都在 finally 中隐藏加载状态 ***
    isLoading.value = false;
    console.log('codegen 调用完成.');
  }
};

// --- Watchers ---

// 监听选中的代码生成类型变化
watch(codegenType, (newType) => {
  console.log('代码生成类型变化:', newType);
  // 当 codegenType 变化时，使用当前的 props.request 来生成代码
  generateAndDisplayCode(props.request, newType); // 调用异步函数
});

// 监听 request prop 的变化
// 这个监听器也调用异步函数
watch(
  () => props.request,
  (newRequest) => {
    console.log('请求 prop 变化:', newRequest ? newRequest.id : 'null');
    // 当 request 变化时，使用当前的 codegenType 来生成代码
    nextTick(() => {
      generateAndDisplayCode(newRequest, codegenType.value); // 调用异步函数
    });
  },
  { deep: true, immediate: true }, // deep: true 监听对象内部变化，immediate: true 在组件挂载时立即执行一次
);

// --- Lifecycle Hook ---

// onMounted 在组件挂载后执行。由于 watch(..., { immediate: true }) 会在挂载时触发一次代码生成，
// 所以 onMounted 中不需要再次手动调用 generateAndDisplayCode
onMounted(() => {
  console.log('Codegen 组件已挂载. 初始生成由 immediate watcher 处理.');
  // 可以在这里做一些 CodeMirror 的初始化或配置，如果 useCodemirror 还没有完全处理
});


// --- 复制生成的代码 ---
const copyResponse = async () => {
  // 复制生成的代码字符串
  const success = await copyToClipboard(generatedContent.value)
  if (success) {
    copyIcon.value = IconCheck
    setTimeout(() => {
      copyIcon.value = IconCopy
    }, 2000) // 2 秒后恢复图标
  }
}

// Script setup 会自动暴露这里的 ref 和函数到模板中
</script>

<style scoped>
/* 确保 .mt-4.relative 或其父元素有适当的高度，否则加载蒙层可能无法完全覆盖 */
/* 如果 CodeMirror 容器高度是动态的，确保这个父元素也能够随之调整高度 */
/* scoped 样式仅应用于当前组件 */
.relative {
  position: relative;
}
</style>

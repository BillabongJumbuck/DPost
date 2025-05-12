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

    <div class="mt-4 relative codegen-loading-container" v-loading="isLoading"  element-loading-text="正在生成请求代码...">
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
const isLoading = ref(false); // 加载状态标志

// CodeMirror 集成
// useCodemirror 会监听 generatedContent 并更新编辑器内容
const { view } = useCodemirror(generatedCode, generatedContent, {
  langMime: 'text/plain',
  readOnly: true,
  lineWrapping: true,
});

// --- 辅助函数：生成代码并处理结果 ---
const generateAndDisplayCode = async (request: DHttpRequestDoc | null, type: CodegenName) => {
  console.log(`尝试通过 codegen 函数为类型 "${type}" 生成代码 (调用后端)...`);

  isLoading.value = true;

  if (!request) {
    console.log('没有选中的请求，无法生成代码。');
    generatedContent.value = '// 请先选择一个请求';
    errorState.value = false;
    isLoading.value = false;
    return;
  }

  try {
    // 调用异步 codegen 函数
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
      // Optional: Update CodeMirror language mode here
    }
  } catch (err) {
    // 捕获 await 或 codegen 函数中可能发生的任何意外错误
    console.error('在 generateAndDisplayCode 中发生意外错误:', err);
    errorState.value = true;
    generatedContent.value = `// 发生意外错误: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    // 无论成功或失败，都在 finally 中隐藏加载状态
    isLoading.value = false;
    console.log('codegen 调用完成.');
  }
};

// --- Watchers ---

// 监听选中的代码生成类型变化
watch(codegenType, (newType) => {
  console.log('代码生成类型变化:', newType);
  // 当 codegenType 变化时，使用当前的 props.request 来生成代码
  generateAndDisplayCode(props.request, newType);
});

// 监听 request prop 的变化
watch(
  () => props.request,
  (newRequest) => {
    console.log('请求 prop 变化:', newRequest ? newRequest.id : 'null');
    // 当 request 变化时，使用当前的 codegenType 来生成代码
    nextTick(() => {
      generateAndDisplayCode(newRequest, codegenType.value);
    });
  },
  { deep: true, immediate: true }, // deep: true 监听对象内部变化，immediate: true 在组件挂载时立即执行一次
);

// --- Lifecycle Hook ---

onMounted(() => {
  console.log('Codegen 组件已挂载.');
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
</script>

<style>
/* 目标：覆盖 el-loading-spinner 的定位样式，使其距离顶部 100px */
.codegen-loading-container .el-loading-spinner {
  /* Element Plus uses transform: translate(-50%, -50%) to center by default */
  /* Set top to 100px */
  top: 100px !important; /* Use !important if necessary to ensure override */
  /* Adjust transform to keep horizontal centering but remove vertical translation */
  transform: translate(-50%, 0) !important; /* Use !important if necessary */
  /* Keep left: 50% for horizontal centering */
  left: 50% !important; /* Use !important if necessary */
  /* Ensure it's absolutely positioned within the mask */
  position: absolute !important; /* Use !important if necessary */
}

/* 您也可以选择性地调整文本的样式，但通常 spinner 的定位会带动文本 */
</style>

<style scoped>
/* scoped 样式用于组件自身的其他样式 */
.relative {
  position: relative;
}
/* 确保 .mt-4.relative 或其父元素有适当的高度，否则加载蒙层可能无法完全覆盖 */
/* 如果 CodeMirror 容器高度是动态的，确保这个父元素也能够随之调整高度 */
</style>

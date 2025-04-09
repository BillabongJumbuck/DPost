import { ref, type Ref, onMounted, onBeforeUnmount, watch } from "vue"
import { EditorView, keymap } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { json } from "@codemirror/lang-json"
import { xml } from "@codemirror/lang-xml"
import { autocompletion, startCompletion } from "@codemirror/autocomplete"
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"
import { indentUnit } from "@codemirror/language"

// 基础编辑器配置
const basicSetup = [
  autocompletion(),
  EditorView.lineWrapping,
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of("  "),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([
    {
      key: "Ctrl-Space",
      run: (view: EditorView) => {
        // 正确触发补全的方式
        startCompletion(view)
        return true
      }
    },
    { key: "Mod-Enter", run: () => true }
  ])
]
export function useCodemirror(
  el: Ref<HTMLElement | undefined>,
  content: Ref<string>,
  options: { language: 'json' | 'xml'; lineWrapping?: boolean }
) {
  const view = ref<EditorView>()
  const language = new Compartment()
  const lineWrap = new Compartment()
  // 初始化编辑器
  const initEditor = () => {
    if (!el.value) return
    const extensions = [
      basicSetup,
      language.of(options.language === 'json' ? json() : xml()),
      lineWrap.of(options.lineWrapping ? [EditorView.lineWrapping] : [])
    ]
    view.value = new EditorView({
      parent: el.value,
      state: EditorState.create({
        doc: content.value,
        extensions
      })
    })
  }
  // 响应式更新
  watch(content, (newVal) => {
    if (view.value && newVal !== view.value.state.doc.toString()) {
      view.value.dispatch({
        changes: {
          from: 0,
          to: view.value.state.doc.length,
          insert: newVal
        }
      })
    }
  })
  onMounted(initEditor)
  onBeforeUnmount(() => view.value?.destroy())
  return { view }
}

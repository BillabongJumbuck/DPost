import { ref, type Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { javascript } from '@codemirror/lang-javascript'
import { yaml } from '@codemirror/lang-yaml'
import { autocompletion, closeBrackets, startCompletion } from '@codemirror/autocomplete'
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { indentUnit } from '@codemirror/language'
import { insertTab, indentLess, indentMore } from '@codemirror/commands' // Include indentMore
import { vscodeLight } from '@uiw/codemirror-theme-vscode'
import { isJSONContentType } from '@/utility/helper/contenttypes'

// Determine the language extension based on MIME type
const getLanguage = (langMime: string) => {
  if (isJSONContentType(langMime)) {
    return json()
  }
  switch (langMime) {
    case 'application/xml':
      return xml()
    case 'application/javascript':
      return javascript()
    case 'text/yaml':
    case 'application/x-yaml':
      return yaml()
    case 'text/plain':
      return null // Explicitly return null for plain text
    default:
      return null // Return null for unrecognized MIME types (plain text mode)
  }
}

// Base setup with explicit 2-space indentation
const basicSetup = [
  lineNumbers(),
  EditorView.lineWrapping,
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of('  '), // Explicitly set to 2 spaces
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  vscodeLight,
  keymap.of([
    {
      key: 'Tab',
      preventDefault: true,
      run: (view: EditorView) => {
        // If there's a selection, indent by 2 spaces; otherwise, insert 2 spaces
        if (view.state.selection.ranges.some(range => !range.empty)) {
          return indentMore(view) // Indents selection by 2 spaces
        }
        return insertTab(view) // Inserts 2 spaces at cursor
      }
    },
    {
      key: 'Shift-Tab',
      preventDefault: true,
      run: indentLess // Outdents by 2 spaces
    },
    {
      key: 'Ctrl-Space',
      run: (view: EditorView) => {
        startCompletion(view)
        return true
      }
    },
    { key: 'Mod-Enter', run: () => true }
  ]),
  // Language-specific features (disabled for plain text)
  closeBrackets(),
  bracketMatching(),
  indentOnInput(),
  autocompletion({ activateOnTyping: true })
]

export function useCodemirror(
  el: Ref<HTMLElement | undefined>,
  content: Ref<string>,
  options: {
    langMime: string;
    lineWrapping?: boolean;
    readOnly?: boolean;
    placeholder?: string;
  }
) {
  const view = ref<EditorView>()
  const language = new Compartment()
  const lineWrap = new Compartment()
  const readOnly = new Compartment()
  const placeholderConfig = new Compartment()

  const initEditor = () => {
    if (!el.value) return

    const langExtension = getLanguage(options.langMime)
    const extensions = [
      basicSetup,
      language.of(langExtension ?? []),
      lineWrap.of(options.lineWrapping ? [EditorView.lineWrapping] : []),
      readOnly.of(options.readOnly ? [EditorState.readOnly.of(true)] : []),
      placeholderConfig.of(options.placeholder ? [placeholder(options.placeholder)] : []),
      EditorView.theme({
        '&': { height: '100%', width: '100%' },
        '.cm-scroller': { height: '100%', overflow: 'auto' }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          if (newContent !== content.value) {
            content.value = newContent
          }
        }
      })
    ]

    view.value = new EditorView({
      parent: el.value,
      state: EditorState.create({
        doc: content.value,
        extensions
      })
    })
  }

  watch(
    content,
    (newVal) => {
      if (view.value && newVal !== view.value.state.doc.toString()) {
        view.value.dispatch({
          changes: {
            from: 0,
            to: view.value.state.doc.length,
            insert: newVal
          }
        })
      }
    },
    { immediate: true }
  )

  // Watch langMime to dynamically update language
  watch(
    () => options.langMime,
    (newLangMime) => {
      const langExtension = getLanguage(newLangMime)
      view.value?.dispatch({
        effects: language.reconfigure(langExtension ?? [])
      })
    }
  )

  // Watch readOnly
  watch(
    () => options.readOnly,
    (newReadOnly) => {
      view.value?.dispatch({
        effects: readOnly.reconfigure(newReadOnly ? [EditorState.readOnly.of(true)] : [])
      })
    }
  )

  // Watch placeholder
  watch(
    () => options.placeholder,
    (newPlaceholder) => {
      view.value?.dispatch({
        effects: placeholderConfig.reconfigure(newPlaceholder ? [placeholder(newPlaceholder)] : [])
      })
    }
  )

  onMounted(initEditor)
  onBeforeUnmount(() => view.value?.destroy())

  return { view }
}

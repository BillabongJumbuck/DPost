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
import { vscodeLight } from '@uiw/codemirror-theme-vscode';

const getLanguage = (langMime: string) => {
  switch (langMime) {
    case 'application/json':
    case 'application/ld+json':
    case 'application/hal+json':
    case 'application/vnd.api+json':
      return json()
    case 'application/xml':
      return xml()
    case 'application/javascript':
      return javascript()
    case 'text/yaml':
    case 'application/x-yaml':
      return yaml()
    default:
      return json() // Fallback
  }
}

const basicSetup = [
  lineNumbers(),
  closeBrackets(),
  bracketMatching(),
  indentOnInput(),
  autocompletion({ activateOnTyping: true }),
  EditorView.lineWrapping,
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of('  '),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  vscodeLight,
  keymap.of([
    {
      key: 'Ctrl-Space',
      run: (view: EditorView) => {
        startCompletion(view)
        return true
      }
    },
    { key: 'Mod-Enter', run: () => true }
  ])
]

export function useCodemirror(
  el: Ref<HTMLElement | undefined>,
  content: Ref<string>,
  options: {
    langMime: string; // Use MIME type
    lineWrapping?: boolean;
    readOnly?: boolean; // Add read-only option
    placeholder?: string; // Add placeholder
  }
) {
  const view = ref<EditorView>()
  const language = new Compartment()
  const lineWrap = new Compartment()
  const readOnly = new Compartment()
  const placeholderConfig = new Compartment()

  const initEditor = () => {
    if (!el.value) return

    const extensions = [
      basicSetup,
      language.of(getLanguage(options.langMime)),
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
      view.value?.dispatch({
        effects: language.reconfigure(getLanguage(newLangMime))
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

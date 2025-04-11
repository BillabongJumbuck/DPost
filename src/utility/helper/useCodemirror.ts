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
import { insertTab, indentLess, indentMore } from '@codemirror/commands'
import { linter, type Diagnostic } from '@codemirror/lint'
import { vscodeLight } from '@uiw/codemirror-theme-vscode'
import { isJSONContentType } from '@/utility/helper/contenttypes'
import xmlFormat from 'xml-formatter'

// JSON linter: Detects syntax errors and marks them
const jsonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []
  const content = view.state.doc.toString()

  if (!content) return diagnostics // Skip empty content

  try {
    JSON.parse(content)
  } catch (e: any) {
    const pos = e.mark?.position || 0 // Approximate error position
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: e.message || 'Invalid JSON syntax'
    })
  }
  return diagnostics
})

// XML linter: Uses xmlFormat for validation
const xmlLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []
  const content = view.state.doc.toString()

  if (!content) return diagnostics

  try {
    xmlFormat(content, { indentation: '  ' })
  } catch (e: any) {
    const pos = e.location?.startOffset || 0 // Approximate position
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: e.message || 'Invalid XML syntax'
    })
  }
  return diagnostics
})

// Determine the language and linter based on MIME type
const getLanguageAndLinter = (langMime: string) => {
  if (isJSONContentType(langMime)) {
    return { language: json(), linter: jsonLinter }
  }
  switch (langMime) {
    case 'application/xml':
      return { language: xml(), linter: xmlLinter }
    case 'application/javascript':
      return { language: javascript(), linter: null } // No linter for JS yet
    case 'text/yaml':
    case 'application/x-yaml':
      return { language: yaml(), linter: null } // No linter for YAML yet
    case 'text/plain':
      return { language: null, linter: null } // No linting for plain text
    default:
      return { language: null, linter: null } // Plain text mode
  }
}

// Base setup with 2-space indentation
const basicSetup = [
  lineNumbers(),
  EditorView.lineWrapping,
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of('  '),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  vscodeLight,
  keymap.of([
    {
      key: 'Tab',
      preventDefault: true,
      run: (view: EditorView) => {
        if (view.state.selection.ranges.some(range => !range.empty)) {
          return indentMore(view)
        }
        return insertTab(view)
      }
    },
    {
      key: 'Shift-Tab',
      preventDefault: true,
      run: indentLess
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
  const linterConfig = new Compartment()

  const initEditor = () => {
    if (!el.value) return

    const { language: langExtension, linter: lintExtension } = getLanguageAndLinter(options.langMime)
    const extensions = [
      basicSetup,
      language.of(langExtension ?? []),
      linterConfig.of(lintExtension ? [lintExtension] : []),
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

  // Watch langMime to dynamically update language and linter
  watch(
    () => options.langMime,
    (newLangMime) => {
      const { language: langExtension, linter: lintExtension } = getLanguageAndLinter(newLangMime)
      view.value?.dispatch({
        effects: [
          language.reconfigure(langExtension ?? []),
          linterConfig.reconfigure(lintExtension ? [lintExtension] : [])
        ]
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

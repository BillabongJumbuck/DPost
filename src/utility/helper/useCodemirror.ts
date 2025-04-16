import { ref, type Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { yaml } from '@codemirror/lang-yaml'
import { autocompletion, closeBrackets, startCompletion } from '@codemirror/autocomplete'
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import { indentUnit, getIndentUnit } from '@codemirror/language'
import { insertTab, indentLess, indentMore, insertNewlineAndIndent } from '@codemirror/commands'
import { linter, type Diagnostic } from '@codemirror/lint'
import { vscodeLight } from '@uiw/codemirror-theme-vscode'
import { isJSONContentType } from '@/utility/helper/contenttypes'
import xmlFormat from 'xml-formatter'

// JSON linter
const jsonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []
  const content = view.state.doc.toString()
  if (!content) return diagnostics
  try {
    JSON.parse(content)
  } catch (e: any) {
    const pos = e.mark?.position || 0
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: e.message || 'Invalid JSON syntax',
    })
  }
  return diagnostics
})

// XML linter
const xmlLinter = linter((view) => {
  const diagnostics: Diagnostic[] = []
  const content = view.state.doc.toString()
  if (!content) return diagnostics
  try {
    xmlFormat(content, { indentation: '  ' })
  } catch (e: any) {
    const pos = e.location?.startOffset || 0
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: e.message || 'Invalid XML syntax',
    })
  }
  return diagnostics
})

// Determine language and linter based on MIME type
const getLanguageAndLinter = (langMime: string) => {
  if (isJSONContentType(langMime)) {
    return { language: json(), linter: jsonLinter }
  }
  switch (langMime) {
    case 'application/xml':
      return { language: xml(), linter: xmlLinter }
    case 'text/html':
      return { language: html(), linter: null }
    case 'application/javascript':
      return { language: javascript(), linter: null }
    case 'text/yaml':
    case 'application/x-yaml':
      return { language: yaml(), linter: null }
    case 'text/plain':
      return { language: null, linter: null }
    default:
      return { language: null, linter: null }
  }
}

// Custom Enter keybinding for bracket-aware indentation
const smartIndentOnEnter = (view: EditorView) => {
  const state = view.state
  const cursor = state.selection.main.head
  const line = state.doc.lineAt(cursor)
  const beforeCursor = state.sliceDoc(line.from, cursor)

  // Check if cursor is inside brackets
  const openBrackets = beforeCursor.match(/[\{\[\(]/g)?.length || 0
  const closeBrackets = beforeCursor.match(/[\}\]\)]/g)?.length || 0
  const isInsideBrackets = openBrackets > closeBrackets

  if (isInsideBrackets) {
    // Get the indentation of the line with the opening bracket
    const openingLineMatch = beforeCursor.match(/^(\s*)/)
    const baseIndent = openingLineMatch ? openingLineMatch[0].length : 0
    const indentSize = getIndentUnit(state) // 2 spaces from indentUnit

    // Insert newline and indent one level deeper
    view.dispatch({
      changes: { from: cursor, insert: '\n' + ' '.repeat(baseIndent + indentSize) + '\n' },
      selection: { anchor: cursor + 1 + baseIndent + indentSize },
    })
    return true
  }

  // Fallback to default newline and indent behavior
  return insertNewlineAndIndent(view)
}

// Base setup with 2-space indentation
const basicSetup = [
  lineNumbers(),
  EditorView.lineWrapping,
  EditorState.allowMultipleSelections.of(true),
  indentUnit.of('  '), // 2-space indent unit
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  vscodeLight,
  keymap.of([
    {
      key: 'Tab',
      preventDefault: true,
      run: (view: EditorView) => {
        if (view.state.selection.ranges.some((range) => !range.empty)) {
          return indentMore(view)
        }
        return insertTab(view)
      },
    },
    {
      key: 'Shift-Tab',
      preventDefault: true,
      run: indentLess,
    },
    {
      key: 'Enter',
      preventDefault: true,
      run: smartIndentOnEnter,
    },
    {
      key: 'Ctrl-Space',
      run: (view: EditorView) => {
        startCompletion(view)
        return true
      },
    },
    { key: 'Mod-Enter', run: () => true },
  ]),
  closeBrackets(),
  bracketMatching(),
  indentOnInput(),
  autocompletion({ activateOnTyping: true }),
]

export function useCodemirror(
  el: Ref<HTMLElement | undefined>,
  content: Ref<string>,
  options: {
    langMime: string
    lineWrapping?: boolean
    readOnly?: boolean
    placeholder?: string
  },
) {
  const view = ref<EditorView>()
  const language = new Compartment()
  const lineWrap = new Compartment()
  const readOnly = new Compartment()
  const placeholderConfig = new Compartment()
  const linterConfig = new Compartment()

  const initEditor = () => {
    if (!el.value) return

    const { language: langExtension, linter: lintExtension } = getLanguageAndLinter(
      options.langMime,
    )
    const extensions = [
      basicSetup,
      language.of(langExtension ?? []),
      linterConfig.of(lintExtension ? [lintExtension] : []),
      lineWrap.of(options.lineWrapping ? [EditorView.lineWrapping] : []),
      readOnly.of(options.readOnly ? [EditorState.readOnly.of(true)] : []),
      placeholderConfig.of(options.placeholder ? [placeholder(options.placeholder)] : []),
      EditorView.theme({
        '&': { height: '100%', width: '100%' },
        '.cm-scroller': { height: '100%', overflow: 'auto' },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          if (newContent !== content.value) {
            content.value = newContent
          }
        }
      }),
    ]

    view.value = new EditorView({
      parent: el.value,
      state: EditorState.create({
        doc: content.value,
        extensions,
      }),
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
            insert: newVal,
          },
        })
      }
    },
    { immediate: true },
  )

  watch(
    () => options.langMime,
    (newLangMime) => {
      const { language: langExtension, linter: lintExtension } = getLanguageAndLinter(newLangMime)
      view.value?.dispatch({
        effects: [
          language.reconfigure(langExtension ?? []),
          linterConfig.reconfigure(lintExtension ? [lintExtension] : []),
        ],
      })
    },
  )

  watch(
    () => options.readOnly,
    (newReadOnly) => {
      view.value?.dispatch({
        effects: readOnly.reconfigure(newReadOnly ? [EditorState.readOnly.of(true)] : []),
      })
    },
  )

  watch(
    () => options.placeholder,
    (newPlaceholder) => {
      view.value?.dispatch({
        effects: placeholderConfig.reconfigure(newPlaceholder ? [placeholder(newPlaceholder)] : []),
      })
    },
  )

  onMounted(initEditor)
  onBeforeUnmount(() => view.value?.destroy())

  return { view }
}

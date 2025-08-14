"use client";

import React, { useEffect, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection } from "lexical";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { mergeRegister } from "@lexical/utils";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

function Placeholder({ text }) {
  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        opacity: 0.4,
        left: 12,
        top: 12,
        fontSize: "0.95em",
      }}
    >
      {text}
    </div>
  );
}

export default function RichTextEditor({
  initialHTML = "",
  onHTMLChange,
  style,
  className,
  placeholder = "Type here...",
  showInlineToolbar = false,
  registerAPI,
}) {
  const initialConfig = useMemo(
    () => ({
      namespace: "wysiwyg-text",
      theme: {
        // Keep it minimal. We inherit sizing via inline styles.
        paragraph: "",
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
        },
      },
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        CodeNode,
      ],
      editorState: (editor) => {
        if (!initialHTML) return;
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialHTML, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            root.append(...nodes);
          });
        } catch {
          // fallback: set a paragraph with plain text if parsing fails
          editor.update(() => {
            const root = $getRoot();
            root.clear();
          });
        }
      },
    }),
    [initialHTML]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div style={{ position: "relative", height: "100%" }}>
        {showInlineToolbar ? <FormattingToolbar /> : null}
        <APIRegistrar registerAPI={registerAPI} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              data-no-drag
              className={className}
              style={{
                outline: "none",
                minHeight: 0,
                height: "100%",
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
                ...(showInlineToolbar ? { paddingTop: 28 } : {}),
                ...style,
              }}
            />
          }
          placeholder={<Placeholder text={placeholder} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            try {
              const html = editorState.read(() =>
                $generateHtmlFromNodes(editor)
              );
              onHTMLChange?.(html);
            } catch {
              // ignore
            }
          }}
        />
      </div>
    </LexicalComposer>
  );
}

function FormattingToolbar() {
  const [editor] = useLexicalComposerContext();
  const btn = {
    marginRight: 6,
    padding: "2px 8px",
    borderRadius: 6,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.8)",
    cursor: "pointer",
  };
  const wrap = {
    position: "absolute",
    top: 6,
    left: 6,
    display: "flex",
    alignItems: "center",
    zIndex: 20,
    backdropFilter: "blur(6px)",
    padding: 4,
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  };
  return (
    <div style={wrap} data-no-drag>
      <button
        type="button"
        style={btn}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        aria-label="Bold"
      >
        B
      </button>
      <button
        type="button"
        style={btn}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        aria-label="Italic"
      >
        I
      </button>
      <button
        type="button"
        style={btn}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        aria-label="Underline"
      >
        U
      </button>
    </div>
  );
}

function APIRegistrar({ registerAPI }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!registerAPI) return;
    const api = {
      formatBold: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
      formatItalic: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
      formatUnderline: () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
    };
    registerAPI(api);
    return () => {
      registerAPI(null);
    };
  }, [editor, registerAPI]);
  return null;
}

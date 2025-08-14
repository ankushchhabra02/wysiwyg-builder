"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Blocks,
  Image as ImageIcon,
  Type as TypeIcon,
  Square as ButtonIcon,
  Video as VideoIcon,
  Sun,
  Moon,
  Grid as GridIcon,
  Move,
  Download,
  Trash2,
  Settings,
} from "lucide-react";

// -------- Config --------
const GRID = 8; // snap-to-grid size
const STORAGE_KEY = "modern-builder-v1";

const ItemTypes = {
  TOOL: "TOOL",
};

// No external rich text editor to avoid React 19 findDOMNode; using contentEditable + toolbar

// ---- Component Definitions ----
const TOOLBOX = [
  {
    id: "tool-text",
    type: "text",
    label: "Text",
    icon: <TypeIcon size={16} />,
  },
  {
    id: "tool-image",
    type: "image",
    label: "Image",
    icon: <ImageIcon size={16} />,
  },
  {
    id: "tool-button",
    type: "button",
    label: "Button",
    icon: <ButtonIcon size={16} />,
  },
  { id: "tool-card", type: "card", label: "Card", icon: <Blocks size={16} /> },
  {
    id: "tool-video",
    type: "video",
    label: "Video",
    icon: <VideoIcon size={16} />,
  },
];

// Default props per component type
function defaultPropsFor(type) {
  switch (type) {
    case "text":
      return {
        html: "<h2>Write something great ✨</h2><p>This is a rich text block. Double‑click to edit.</p>",
        color: "#0f172a",
        align: "left",
        fontSize: 18,
        padding: 12,
        radius: 12,
        bg: "#ffffffb3", // translucent white
        shadow: true,
      };
    case "image":
      return {
        src: "",
        alt: "",
        objectFit: "cover",
        radius: 16,
        shadow: true,
      };
    case "button":
      return {
        label: "Click Me",
        href: "#",
        variant: "primary", // primary | outline | ghost
        radius: 14,
        paddingX: 16,
        paddingY: 10,
      };
    case "card":
      return {
        title: "Beautiful Card",
        body: "A modern card with image, text and action.",
        img: "",
        cta: "Learn more",
        href: "#",
        radius: 20,
        shadow: true,
        padding: 16,
        bg: "#ffffffcc",
        titleColor: "#0f172a",
        bodyColor: "#52525b",
        ctaColor: "#4f46e5",
        titleSize: 18,
        bodySize: 14,
        titleBold: true,
        bodyBold: false,
        titleItalic: false,
        bodyItalic: false,
      };
    case "video":
      return { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", radius: 16 };
    default:
      return {};
  }
}

// ---- Helpers ----
function inferTypeFromProps(p = {}) {
  if (!p) return "text";
  if (Object.prototype.hasOwnProperty.call(p, "html")) return "text";
  if (Object.prototype.hasOwnProperty.call(p, "src")) return "image";
  if (Object.prototype.hasOwnProperty.call(p, "label")) return "button";
  if (
    Object.prototype.hasOwnProperty.call(p, "img") &&
    Object.prototype.hasOwnProperty.call(p, "title")
  )
    return "card";
  if (Object.prototype.hasOwnProperty.call(p, "url")) return "video";
  return "text";
}

function normalizeItem(it = {}) {
  const type = it.type || inferTypeFromProps(it.props);
  return { ...it, type };
}

function snap(n) {
  return Math.round(n / GRID) * GRID;
}

function ghostStyle() {
  return "border-2 border-dashed border-indigo-400/60 bg-indigo-400/5";
}

// ---- Tool in Sidebar ----
function Tool({ tool }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TOOL,
    item: { toolType: tool.type },
    collect: (m) => ({ isDragging: m.isDragging() }),
  }));
  return (
    <div
      ref={drag}
      className={`flex cursor-grab items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-sm backdrop-blur-md transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/70 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="text-indigo-600 dark:text-indigo-400">{tool.icon}</div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {tool.label}
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Drag to canvas
        </div>
      </div>
    </div>
  );
}

// ---- Top Bar ----
function TopBar({
  mode,
  setMode,
  dark,
  setDark,
  showGrid,
  setShowGrid,
  canvasBg,
  setCanvasBg,
  exportJSON,
  exportHTML,
  clearAll,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/70">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
          Modern Website Builder
        </div>
        <div className="flex overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            className={`px-3 py-1 text-sm ${
              mode === "design"
                ? "bg-zinc-100 font-semibold dark:bg-zinc-800"
                : ""
            }`}
            onClick={() => setMode("design")}
          >
            Design
          </button>
          <button
            className={`px-3 py-1 text-sm ${
              mode === "preview"
                ? "bg-zinc-100 font-semibold dark:bg-zinc-800"
                : ""
            }`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
        <button
          className="ml-2 inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={() => setShowGrid((s) => !s)}
        >
          <GridIcon size={16} /> Grid
        </button>
        <label className="ml-2 inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700">
          <span>Canvas</span>
          <input
            aria-label="Canvas Background"
            type="color"
            className="h-6 w-6 cursor-pointer rounded"
            value={toSixHex(canvasBg) || "#ffffff"}
            onChange={(e) => setCanvasBg(e.target.value)}
          />
        </label>
        <button
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}{" "}
          {dark ? "Light" : "Dark"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={exportHTML}
        >
          <Download size={16} /> HTML
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={exportJSON}
        >
          <Download size={16} /> JSON
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1 text-sm hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          onClick={clearAll}
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>
    </div>
  );
}

// ---- Sidebar ----
function Sidebar() {
  return (
    <div className="flex h-[calc(100vh-88px)] w-64 flex-col gap-3 overflow-auto rounded-2xl border border-zinc-200 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/70">
      <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        Components
      </div>
      <div className="grid gap-3">
        {TOOLBOX.map((t) => (
          <Tool key={t.id} tool={t} />
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Tip: Drag a component to the canvas. Double-click text to edit. Use the
        floating toolbar for styles.
      </p>
    </div>
  );
}

// ---- Canvas & Items ----
function Canvas({
  items,
  setItems,
  selectedId,
  setSelectedId,
  mode,
  showGrid,
  canvasBg,
}) {
  const canvasRef = useRef(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TOOL,
    drop: (item, monitor) => {
      const client = monitor.getClientOffset();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!client || !rect) return;
      const id = `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const x = snap(client.x - rect.left);
      const y = snap(client.y - rect.top);
      const base = {
        id,
        type: item.toolType,
        x,
        y,
        w: 320,
        h: 120,
        props: defaultPropsFor(item.toolType),
      };
      // better default sizes per type
      if (item.toolType === "image") (base.w = 360), (base.h = 220);
      if (item.toolType === "button") (base.w = 160), (base.h = 56);
      if (item.toolType === "card") (base.w = 420), (base.h = 260);
      if (item.toolType === "video") (base.w = 480), (base.h = 270);
      setItems((prev) => [...prev, base]);
      setSelectedId(id);
    },
    collect: (m) => ({
      isOver: m.isOver({ shallow: true }),
      canDrop: m.canDrop(),
    }),
  }));

  drop(canvasRef);

  const gridOverlay = useMemo(() => {
    const style = showGrid
      ? {
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }
      : undefined;
    return (
      <div className="pointer-events-none absolute inset-0" style={style} />
    );
  }, [showGrid]);

  return (
    <div
      ref={canvasRef}
      className={`relative h-[calc(100vh-88px)] w-full overflow-auto rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-700`}
      style={{ background: canvasBg || "#ffffff" }}
      onMouseDown={(e) => {
        if (e.target === canvasRef.current) setSelectedId(null);
      }}
    >
      {gridOverlay}

      {/* drop ghost */}
      {isOver && canDrop && (
        <div className={`absolute inset-4 rounded-2xl ${ghostStyle()}`} />
      )}

      {items.map((it) => (
        <CanvasItem
          key={it.id}
          item={it}
          selected={selectedId === it.id}
          setSelected={() => setSelectedId(it.id)}
          updateItem={(patch) =>
            setItems((prev) =>
              prev.map((ci) => (ci.id === it.id ? { ...ci, ...patch } : ci))
            )
          }
          onDelete={() =>
            setItems((prev) => prev.filter((ci) => ci.id !== it.id))
          }
          mode={mode}
        />
      ))}
    </div>
  );
}

function CanvasItem({
  item,
  selected,
  setSelected,
  updateItem,
  onDelete,
  mode,
}) {
  const enableDragging = mode === "design";
  return (
    <DraggableResizable
      x={item.x}
      y={item.y}
      w={item.w}
      h={item.h}
      grid={GRID}
      disabled={!enableDragging}
      selected={selected}
      onChange={({ x, y, w, h }) => updateItem({ x, y, w, h })}
      onMouseDown={(e) => {
        e.stopPropagation();
        setSelected();
      }}
    >
      <div
        className={`relative h-full w-full ${
          selected && enableDragging ? "ring-2 ring-indigo-500" : ""
        }`}
      >
        {item.type === "text" && (
          <TextBlock {...{ item, updateItem, selected, mode }} />
        )}
        {item.type === "image" && <ImageBlock {...{ item, updateItem }} />}
        {item.type === "button" && <ButtonBlock {...{ item, updateItem }} />}
        {item.type === "card" && <CardBlock {...{ item, updateItem }} />}
        {item.type === "video" && <VideoBlock {...{ item, updateItem }} />}

        {selected && enableDragging && (
          <FloatingToolbar
            item={item}
            updateItem={updateItem}
            onDelete={onDelete}
          />
        )}
      </div>
    </DraggableResizable>
  );
}

// Lightweight React 19–safe draggable + resizable wrapper
function DraggableResizable({
  x,
  y,
  w,
  h,
  grid = 8,
  disabled,
  selected,
  onChange,
  children,
  onMouseDown,
}) {
  const ref = useRef(null);
  const posRef = useRef({ x, y, w, h });
  useEffect(() => {
    posRef.current = { x, y, w, h };
  }, [x, y, w, h]);

  const clampToParent = (nx, ny, nw, nh) => {
    const el = ref.current;
    const p = el?.parentElement;
    const pw = p?.clientWidth ?? Infinity;
    const ph = p?.clientHeight ?? Infinity;
    nx = Math.max(0, Math.min(nx, pw - nw));
    ny = Math.max(0, Math.min(ny, ph - nh));
    return { nx, ny, nw: Math.max(40, nw), nh: Math.max(40, nh) };
  };

  const startDrag = (e) => {
    if (disabled) return;
    if (e.button !== 0) return;
    // Always select the item first
    onMouseDown?.(e);
    // Don't start drag when interacting with editable/interactive elements
    const target = e.target;
    if (
      target.closest(
        "[data-no-drag], [contenteditable=true], input, textarea, select, button, a"
      )
    ) {
      return;
    }
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...posRef.current };
    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = start.x + dx;
      let ny = start.y + dy;
      // live snap
      nx = snap(nx);
      ny = snap(ny);
      const c = clampToParent(nx, ny, start.w, start.h);
      onChange?.({ x: c.nx, y: c.ny, w: start.w, h: start.h });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const startResize = (e, dir) => {
    if (disabled) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...posRef.current };
    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = start.x;
      let ny = start.y;
      let nw = start.w;
      let nh = start.h;
      if (dir.includes("e")) nw = start.w + dx;
      if (dir.includes("s")) nh = start.h + dy;
      if (dir.includes("w")) {
        nw = start.w - dx;
        nx = start.x + dx;
      }
      if (dir.includes("n")) {
        nh = start.h - dy;
        ny = start.y + dy;
      }
      // snap
      nx = snap(nx);
      ny = snap(ny);
      nw = Math.max(40, snap(nw));
      nh = Math.max(40, snap(nh));
      const c = clampToParent(nx, ny, nw, nh);
      onChange?.({ x: c.nx, y: c.ny, w: c.nw, h: c.nh });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const handleClass =
    "absolute z-30 h-3 w-3 -mt-1.5 -ml-1.5 rounded-sm bg-indigo-500 border-2 border-white shadow dark:border-zinc-900 cursor-pointer";

  return (
    <div
      ref={ref}
      style={{ left: x, top: y, width: w, height: h, position: "absolute" }}
      className={`group ${selected ? "z-20" : "z-10"}`}
      onPointerDown={startDrag}
    >
      {children}
      {!disabled && selected && (
        <>
          {/* corners */}
          <div
            className={`${handleClass} cursor-nwse-resize`}
            style={{ left: 0, top: 0 }}
            onPointerDown={(e) => startResize(e, "nw")}
          />
          <div
            className={`${handleClass} cursor-nesw-resize`}
            style={{ left: "100%", top: 0 }}
            onPointerDown={(e) => startResize(e, "ne")}
          />
          <div
            className={`${handleClass} cursor-nwse-resize`}
            style={{ left: "100%", top: "100%" }}
            onPointerDown={(e) => startResize(e, "se")}
          />
          <div
            className={`${handleClass} cursor-nesw-resize`}
            style={{ left: 0, top: "100%" }}
            onPointerDown={(e) => startResize(e, "sw")}
          />
        </>
      )}
    </div>
  );
}

// ---- Blocks ----
function TextBlock({ item, updateItem, selected, mode }) {
  const { html, color, align, fontSize, padding, radius, bg, shadow } =
    item.props;
  const isPreview = mode === "preview";
  const ref = useRef(null);

  // Initialize editor content only when entering edit mode or switching item
  useEffect(() => {
    if (!isPreview && selected && ref.current) {
      // Only set if different to avoid caret jump
      if (ref.current.innerHTML !== html) {
        ref.current.innerHTML = html || "";
      }
      // Place caret at end on first focus if empty
      // Avoid forcing selection on every render
    }
  }, [isPreview, selected, item.id]);

  return (
    <div
      className={`h-full w-full overflow-auto ${shadow ? "shadow-md" : ""}`}
      style={{ background: bg, color, borderRadius: radius, padding }}
    >
      {isPreview || !selected ? (
        <div
          data-no-drag
          className="cursor-text"
          style={{ fontSize, textAlign: align }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          ref={ref}
          className="editable outline-none cursor-text"
          contentEditable
          suppressContentEditableWarning
          data-no-drag
          style={{ fontSize, textAlign: align }}
          onInput={(e) => {
            // Read live DOM content; do not re-apply as innerHTML to preserve caret
            const val = e.currentTarget.innerHTML;
            updateItem({ props: { ...item.props, html: val } });
          }}
          onBlur={(e) => {
            const val = e.currentTarget.innerHTML;
            updateItem({ props: { ...item.props, html: val } });
          }}
        />
      )}
    </div>
  );
}

function ImageBlock({ item, updateItem }) {
  const { src, alt, objectFit, radius, shadow } = item.props;
  return src ? (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full ${shadow ? "shadow" : ""}`}
      style={{ objectFit, borderRadius: radius }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
      No image. Use toolbar to upload or paste URL.
    </div>
  );
}

function ButtonBlock({ item, updateItem }) {
  const { label, href, variant, radius, paddingX, paddingY } = item.props;
  const base =
    "inline-flex h-full w-full items-center justify-center font-semibold transition";
  const cls = {
    primary: `${base} rounded-xl bg-indigo-600 text-white hover:bg-indigo-700`,
    outline: `${base} rounded-xl border border-indigo-600 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-500 dark:hover:bg-indigo-950`,
    ghost: `${base} rounded-xl text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950`,
  }[variant || "primary"];
  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      className={cls}
      style={{
        borderRadius: radius,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      {label}
    </a>
  );
}

function CardBlock({ item, updateItem }) {
  const {
    title,
    body,
    img,
    cta,
    href,
    radius,
    shadow,
    padding,
    bg,
    titleColor,
    bodyColor,
    ctaColor,
    titleSize,
    bodySize,
    titleBold,
    bodyBold,
    titleItalic,
    bodyItalic,
  } = item.props;
  return (
    <div
      className={`flex h-full w-full gap-3 ${shadow ? "shadow-md" : ""}`}
      style={{ borderRadius: radius, background: bg, padding }}
    >
      <div className="h-full w-2/5 overflow-hidden rounded-xl bg-zinc-100">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            Image
          </div>
        )}
      </div>
      <div className="flex w-3/5 flex-col" data-no-drag>
        <h3
          className="mb-1"
          style={{
            color: titleColor,
            fontSize: titleSize,
            fontWeight: titleBold ? 700 : 500,
            fontStyle: titleItalic ? "italic" : "normal",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: bodyColor,
            fontSize: bodySize,
            fontWeight: bodyBold ? 600 : 400,
            fontStyle: bodyItalic ? "italic" : "normal",
            margin: 0,
          }}
        >
          {body}
        </p>
        <div className="mt-auto">
          <a
            href={href}
            onClick={(e) => e.preventDefault()}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: ctaColor }}
          >
            {cta}
          </a>
        </div>
      </div>
    </div>
  );
}

function VideoBlock({ item }) {
  const { url, radius } = item.props;
  return (
    <iframe
      src={url}
      className="h-full w-full"
      style={{ borderRadius: radius }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

// ---- Floating Toolbar (contextual) ----
function Row({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function Label({ children }) {
  return (
    <label className="text-[11px] text-zinc-500 dark:text-zinc-400">
      {children}
    </label>
  );
}

function FloatingToolbar({ item, updateItem, onDelete }) {
  const common = item.props || {};
  const fileRef = useRef(null);
  const cardFileRef = useRef(null);

  return (
    <div className="absolute top-0 left-full ml-2 z-30 rounded-2xl border border-zinc-200 bg-white/90 p-2 text-xs shadow-lg backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/90">
      <Row>
        <Move size={14} className="text-zinc-500" />
        <span className="px-1 text-[11px] text-zinc-600 dark:text-zinc-300">
          {item.type ? String(item.type).toUpperCase() : "ITEM"}
        </span>
        <span className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          title="Delete"
          onClick={() => onDelete?.()}
          className="rounded border border-zinc-200 px-2 py-0.5 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <Trash2 size={14} />
        </button>
        <span className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
        {/* Common controls */}
        <Label>Radius</Label>
        <input
          className="w-14 rounded border border-zinc-200 px-1 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          type="number"
          value={common.radius || 0}
          onChange={(e) =>
            updateItem({
              props: { ...item.props, radius: Number(e.target.value) || 0 },
            })
          }
        />
        {item.type !== "button" && (
          <>
            <Label>BG</Label>
            <input
              type="color"
              value={toSixHex(common.bg) || "#ffffff"}
              onChange={(e) =>
                updateItem({ props: { ...item.props, bg: e.target.value } })
              }
            />
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={!!common.shadow}
                onChange={(e) =>
                  updateItem({
                    props: { ...item.props, shadow: e.target.checked },
                  })
                }
              />
              Shadow
            </label>
          </>
        )}
        {item.type === "text" && (
          <>
            <Label>Color</Label>
            <input
              type="color"
              value={common.color}
              onChange={(e) =>
                updateItem({ props: { ...item.props, color: e.target.value } })
              }
            />
            <button
              className="rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() =>
                document.execCommand && document.execCommand("bold")
              }
              type="button"
            >
              B
            </button>
            <button
              className="rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() =>
                document.execCommand && document.execCommand("italic")
              }
              type="button"
            >
              I
            </button>
            <Label>Size</Label>
            <input
              className="w-14 rounded border border-zinc-200 px-1 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              type="number"
              value={common.fontSize}
              onChange={(e) =>
                updateItem({
                  props: {
                    ...item.props,
                    fontSize: Number(e.target.value) || 16,
                  },
                })
              }
            />
            <select
              className="rounded border border-zinc-200 px-1 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.align}
              onChange={(e) =>
                updateItem({ props: { ...item.props, align: e.target.value } })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </>
        )}
        {item.type === "image" && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const reader = new FileReader();
                  reader.onload = () =>
                    updateItem({
                      props: { ...item.props, src: String(reader.result) },
                    });
                  reader.readAsDataURL(f);
                }
              }}
            />
            <button
              className="rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            <input
              className="w-52 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Image URL"
              value={common.src || ""}
              onChange={(e) =>
                updateItem({ props: { ...item.props, src: e.target.value } })
              }
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted.startsWith("http")) {
                  updateItem({ props: { ...item.props, src: pasted } });
                }
              }}
            />
            <select
              className="rounded border border-zinc-200 px-1 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.objectFit}
              onChange={(e) =>
                updateItem({
                  props: { ...item.props, objectFit: e.target.value },
                })
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </>
        )}
        {item.type === "button" && (
          <>
            <input
              className="w-40 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.label}
              onChange={(e) =>
                updateItem({ props: { ...item.props, label: e.target.value } })
              }
            />
            <input
              className="w-48 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.href}
              onChange={(e) =>
                updateItem({ props: { ...item.props, href: e.target.value } })
              }
              placeholder="https://..."
            />
            <select
              className="rounded border border-zinc-200 px-1 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.variant}
              onChange={(e) =>
                updateItem({
                  props: { ...item.props, variant: e.target.value },
                })
              }
            >
              <option value="primary">Primary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </>
        )}
        {item.type === "card" && (
          <>
            <input
              ref={cardFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const reader = new FileReader();
                  reader.onload = () =>
                    updateItem({
                      props: { ...item.props, img: String(reader.result) },
                    });
                  reader.readAsDataURL(f);
                }
              }}
            />
            <button
              className="rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => cardFileRef.current?.click()}
              type="button"
            >
              Upload
            </button>
            <Label>Title Size</Label>
            <input
              className="w-14 rounded border border-zinc-200 px-1 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              type="number"
              value={common.titleSize || 18}
              onChange={(e) =>
                updateItem({
                  props: {
                    ...item.props,
                    titleSize: Number(e.target.value) || 18,
                  },
                })
              }
            />
            <Label>Body Size</Label>
            <input
              className="w-14 rounded border border-zinc-200 px-1 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              type="number"
              value={common.bodySize || 14}
              onChange={(e) =>
                updateItem({
                  props: {
                    ...item.props,
                    bodySize: Number(e.target.value) || 14,
                  },
                })
              }
            />
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={!!common.titleBold}
                onChange={(e) =>
                  updateItem({
                    props: { ...item.props, titleBold: e.target.checked },
                  })
                }
              />
              Title Bold
            </label>
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={!!common.titleItalic}
                onChange={(e) =>
                  updateItem({
                    props: { ...item.props, titleItalic: e.target.checked },
                  })
                }
              />
              Title Italic
            </label>
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={!!common.bodyBold}
                onChange={(e) =>
                  updateItem({
                    props: { ...item.props, bodyBold: e.target.checked },
                  })
                }
              />
              Body Bold
            </label>
            <label className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={!!common.bodyItalic}
                onChange={(e) =>
                  updateItem({
                    props: { ...item.props, bodyItalic: e.target.checked },
                  })
                }
              />
              Body Italic
            </label>
            <input
              className="w-32 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.title}
              onChange={(e) =>
                updateItem({ props: { ...item.props, title: e.target.value } })
              }
              placeholder="Title"
            />
            <input
              className="w-40 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.body}
              onChange={(e) =>
                updateItem({ props: { ...item.props, body: e.target.value } })
              }
              placeholder="Body"
            />
            <Label>Title</Label>
            <input
              type="color"
              value={common.titleColor || "#0f172a"}
              onChange={(e) =>
                updateItem({
                  props: { ...item.props, titleColor: e.target.value },
                })
              }
            />
            <Label>Text</Label>
            <input
              type="color"
              value={common.bodyColor || "#52525b"}
              onChange={(e) =>
                updateItem({
                  props: { ...item.props, bodyColor: e.target.value },
                })
              }
            />
            <Label>CTA</Label>
            <input
              type="color"
              value={common.ctaColor || "#4f46e5"}
              onChange={(e) =>
                updateItem({
                  props: { ...item.props, ctaColor: e.target.value },
                })
              }
            />
            <input
              className="w-36 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.cta || ""}
              onChange={(e) =>
                updateItem({ props: { ...item.props, cta: e.target.value } })
              }
              placeholder="CTA text"
            />
            <input
              className="w-48 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.href || ""}
              onChange={(e) =>
                updateItem({ props: { ...item.props, href: e.target.value } })
              }
              placeholder="CTA link (https://...)"
            />
            <input
              className="w-40 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.img || ""}
              onChange={(e) =>
                updateItem({ props: { ...item.props, img: e.target.value } })
              }
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted.startsWith("http")) {
                  updateItem({ props: { ...item.props, img: pasted } });
                }
              }}
              placeholder="Image URL"
            />
          </>
        )}
        {item.type === "video" && (
          <>
            <input
              className="w-72 rounded border border-zinc-200 px-2 py-0.5 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={common.url || ""}
              onChange={(e) =>
                updateItem({
                  props: {
                    ...item.props,
                    url: normalizeVideoUrl(e.target.value),
                  },
                })
              }
              placeholder="YouTube/Vimeo URL or embed"
            />
          </>
        )}
      </Row>
    </div>
  );
}

// ---- Root Component ----
export default function Builder() {
  const [mode, setMode] = useState("design");
  const [dark, setDark] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState("#ffffff");

  // restore / persist
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const restored = Array.isArray(saved.items)
          ? saved.items.map((it) => normalizeItem(it))
          : [];
        setItems(restored);
        if (Object.prototype.hasOwnProperty.call(saved, "dark")) {
          setDark(!!saved.dark);
        }
        if (saved.canvasBg) setCanvasBg(saved.canvasBg);
        if (typeof saved.showGrid === "boolean") setShowGrid(saved.showGrid);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({ items, dark, canvasBg, showGrid });
    try {
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {}
  }, [items, dark, canvasBg, showGrid]);

  // Apply dark mode class to html element for Tailwind's dark: variant
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);

  const exportJSON = () => {
    const data = JSON.stringify({ items }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    const html = generateHTML(items, { canvasBg });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm("Clear the canvas?")) {
      setItems([]);
      setSelectedId(null);
    }
  };

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div className="mx-auto max-w-[1200px] gap-4 p-4 dark:text-zinc-100">
          <TopBar
            {...{
              mode,
              setMode,
              dark,
              setDark,
              showGrid,
              setShowGrid,
              canvasBg,
              setCanvasBg,
              exportJSON,
              exportHTML,
              clearAll,
            }}
          />
          <div className="mt-4 grid grid-cols-[16rem_1fr] gap-4">
            <Sidebar />
            <Canvas
              {...{
                items,
                setItems,
                selectedId,
                setSelectedId,
                mode,
                showGrid,
                canvasBg,
              }}
            />
          </div>
        </div>
      </DndProvider>
    </div>
  );
}

// ---- Export helpers ----
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generateHTML(items, opts = {}) {
  const { canvasBg = "#ffffff" } = opts;
  const maxRight = items.reduce(
    (m, it) => Math.max(m, (it.x || 0) + (it.w || 0)),
    0
  );
  const maxBottom = items.reduce(
    (m, it) => Math.max(m, (it.y || 0) + (it.h || 0)),
    0
  );
  const exportWidth = Math.max(800, maxRight + 80);
  const exportHeight = Math.max(600, maxBottom + 80);
  const blocks = items
    .map((it) => {
      const style = `position:absolute;left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;`;
      switch (it.type) {
        case "text":
          return `<div style="${style}${inlineCommon(it.props)}padding:${
            it.props.padding
          }px;font-size:${it.props.fontSize || 16}px;text-align:${
            it.props.align || "left"
          };">${it.props.html}</div>`;
        case "image":
          return `<img src="${escapeHtml(
            it.props.src || ""
          )}" alt="${escapeHtml(
            it.props.alt || ""
          )}" style="${style}object-fit:${it.props.objectFit};${inlineCommon(
            it.props
          )}"/>`;
        case "button": {
          const cls =
            it.props.variant === "outline"
              ? `border:1px solid #4f46e5;color:#4338ca;background:transparent;`
              : it.props.variant === "ghost"
              ? `color:#4338ca;background:transparent;`
              : `background:#4f46e5;color:white;`;
          return `<a href="${escapeHtml(
            it.props.href
          )}" style="${style}${cls}display:flex;align-items:center;justify-content:center;border-radius:${
            it.props.radius
          }px;padding:${it.props.paddingY}px ${
            it.props.paddingX
          }px;">${escapeHtml(it.props.label)}</a>`;
        }
        case "card":
          return `<div style="${style}${inlineCommon(it.props)}padding:${
            it.props.padding
          }px;display:flex;gap:12px;">
            <div style="width:40%;height:100%;overflow:hidden;border-radius:12px;background:#f4f4f5;">${
              it.props.img
                ? `<img src="${escapeHtml(
                    it.props.img
                  )}" style="width:100%;height:100%;object-fit:cover;"/>`
                : ""
            }</div>
            <div style="width:60%;display:flex;flex-direction:column;">
              <h3 style="margin:0 0 4px 0;color:${
                it.props.titleColor || "#0f172a"
              };font-size:${it.props.titleSize || 18}px;font-weight:${
            it.props.titleBold ? 700 : 500
          };font-style:${
            it.props.titleItalic ? "italic" : "normal"
          }">${escapeHtml(it.props.title)}</h3>
              <p style="margin:0;color:${
                it.props.bodyColor || "#52525b"
              };font-size:${it.props.bodySize || 14}px;font-weight:${
            it.props.bodyBold ? 600 : 400
          };font-style:${
            it.props.bodyItalic ? "italic" : "normal"
          }">${escapeHtml(it.props.body)}</p>
              <div style="margin-top:auto"><a href="${escapeHtml(
                it.props.href
              )}" style="color:${
            it.props.ctaColor || "#4f46e5"
          };text-decoration:none;font:600 14px system-ui">${escapeHtml(
            it.props.cta
          )}</a></div>
            </div>
          </div>`;
        case "video":
          return `<iframe src="${escapeHtml(
            it.props.url
          )}" style="${style}border-radius:${
            it.props.radius
          }px;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        default:
          return "";
      }
    })
    .join("\n");

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Exported Page</title><style>*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;padding:0}body{background:${canvasBg};min-height:100vh;font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}#root{position:relative;width:${exportWidth}px;height:${exportHeight}px;background:${canvasBg};overflow:hidden;margin:40px auto}</style></head><body><div id="root">${blocks}</div></body></html>`;
}

function inlineCommon(p) {
  const bg = p.bg ? `background:${p.bg};` : "";
  const rad = p.radius != null ? `border-radius:${p.radius}px;` : "";
  const sh = p.shadow ? `box-shadow:0 6px 18px rgba(0,0,0,.08);` : "";
  const color = p.color ? `color:${p.color};` : "";
  return `${bg}${rad}${sh}${color}`;
}

// Helpers for UI controls
function toSixHex(input) {
  if (!input) return "";
  // Accept rgba hex like #RRGGBBAA; color input expects 6-digit
  if (/^#([0-9a-fA-F]{8})$/.test(input)) {
    return `#${input.slice(1, 7)}`;
  }
  if (/^#([0-9a-fA-F]{3})$/.test(input)) {
    return input;
  }
  if (/^#([0-9a-fA-F]{6})$/.test(input)) {
    return input;
  }
  // Fallback: try to parse rgb(a) to hex
  try {
    if (input.startsWith("rgb")) {
      const nums = input
        .replace(/rgba?\(/, "")
        .replace(/\)/, "")
        .split(",")
        .map((n) => parseInt(n.trim(), 10));
      const [r, g, b] = nums;
      const hex = `#${[r, g, b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`;
      return hex;
    }
  } catch {}
  return "#ffffff";
}

function normalizeVideoUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(
      url,
      typeof window !== "undefined" ? window.location.href : "http://localhost"
    );
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      let id = "";
      if (u.hostname === "youtu.be") {
        id = u.pathname.slice(1);
      } else if (u.searchParams.get("v")) {
        id = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2];
      }
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts.find((p) => /^\d+$/.test(p));
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return url;
}

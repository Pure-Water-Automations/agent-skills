// QA-sweep screenshot annotator. Paste into mcp__Claude_Browser__javascript_tool,
// then call annotate({...}) before taking a screenshot. Draws a highlight box +
// a callout label with the idea text directly onto the page so the screenshot is
// self-contained and the annotation lines up with the real UI.
//
// Usage:
//   annotate({ selector: "button.add-expense", label: "Idea: put this above the queue so it's the first thing you see", color: "#e11d48" })
//   annotate({ rect: {x:120,y:300,w:400,h:60}, label: "Empty state should suggest a next step", corner: "bottom" })
//   clearAnnotations()   // remove overlays (e.g. before the next idea on the same screen)
//
// Returns "annotated" / an error string. Keep labels short (a phrase, not a paragraph).
(function () {
  const ID = "__qa_annotate_layer__";
  function layer() {
    let l = document.getElementById(ID);
    if (!l) {
      l = document.createElement("div");
      l.id = ID;
      Object.assign(l.style, { position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none" });
      document.body.appendChild(l);
    }
    return l;
  }
  window.clearAnnotations = function () {
    const l = document.getElementById(ID);
    if (l) l.remove();
    return "cleared";
  };
  window.annotate = function (opts) {
    try {
      const color = opts.color || "#e11d48";
      let r = opts.rect;
      if (!r && opts.selector) {
        const el = document.querySelector(opts.selector);
        if (!el) return "annotate: selector not found: " + opts.selector;
        const b = el.getBoundingClientRect();
        r = { x: b.left, y: b.top, w: b.width, h: b.height };
      }
      if (!r) return "annotate: need selector or rect";
      const l = layer();
      // highlight box
      const box = document.createElement("div");
      Object.assign(box.style, {
        position: "fixed", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px",
        border: "3px solid " + color, borderRadius: "8px", boxShadow: "0 0 0 3px rgba(0,0,0,.15)",
        pointerEvents: "none",
      });
      l.appendChild(box);
      // callout label
      if (opts.label) {
        const lab = document.createElement("div");
        lab.textContent = opts.label;
        const below = opts.corner === "bottom" || r.y < 90;
        Object.assign(lab.style, {
          position: "fixed", left: Math.max(8, r.x) + "px",
          top: (below ? r.y + r.h + 8 : Math.max(8, r.y - 40)) + "px",
          maxWidth: "420px", background: color, color: "#fff", font: "600 13px/1.35 system-ui, sans-serif",
          padding: "7px 11px", borderRadius: "8px", boxShadow: "0 4px 14px rgba(0,0,0,.3)", pointerEvents: "none",
        });
        l.appendChild(lab);
      }
      return "annotated";
    } catch (e) { return "annotate error: " + (e && e.message); }
  };
  return "annotate() + clearAnnotations() ready";
})();

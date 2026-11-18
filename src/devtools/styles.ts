export const styles = `
.rhf-dt {
  --rhf-dt-bg: #0e101c;
  --rhf-dt-page: #081229;
  --rhf-dt-surface: #191d3a;
  --rhf-dt-surface-elevated: #1e2a4a;
  --rhf-dt-border: rgba(81, 99, 145, 0.35);
  --rhf-dt-border-input: #6577a6;
  --rhf-dt-text: #fff;
  --rhf-dt-muted: #98a4c8;
  --rhf-dt-pink: #ec5990;
  --rhf-dt-pink-solid: #d6336f;
  --rhf-dt-link: #ff7aa8;
  --rhf-dt-green: #2ecc71;
  --rhf-dt-string: #e6db74;
  --rhf-dt-literal: #bd93f9;
  --rhf-dt-sans: "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --rhf-dt-mono: Menlo, Monaco, Consolas, "Courier New", monospace;
  --rhf-dt-ease: 0.15s ease;
}

.rhf-dt *,
.rhf-dt *::before,
.rhf-dt *::after {
  box-sizing: border-box;
}

.rhf-dt button,
.rhf-dt input,
.rhf-dt summary {
  all: unset;
  box-sizing: border-box;
  font-family: inherit;
  cursor: pointer;
}

.rhf-dt button:focus-visible,
.rhf-dt input:focus-visible,
.rhf-dt summary:focus-visible {
  outline: 2px solid var(--rhf-dt-pink);
  outline-offset: 2px;
}

.rhf-dt .rhf-dt-toggle {
  position: fixed;
  z-index: 99999;
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  touch-action: none;
  cursor: grab;
  box-shadow: 0 0 0 1px rgba(236, 89, 144, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.6);
  transition: transform var(--rhf-dt-ease), box-shadow var(--rhf-dt-ease);
}

.rhf-dt .rhf-dt-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 4px rgba(236, 89, 144, 0.2), 0 12px 28px -6px rgba(0, 0, 0, 0.6);
}

.rhf-dt .rhf-dt-toggle:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.rhf-dt .rhf-dt-toggle .rhf-dt-logo {
  width: 40px;
  height: 40px;
}

.rhf-dt[data-placement^="top"] .rhf-dt-toggle { top: 12px; }
.rhf-dt[data-placement^="bottom"] .rhf-dt-toggle { bottom: 12px; }
.rhf-dt[data-placement$="right"] .rhf-dt-toggle { right: 12px; }
.rhf-dt[data-placement$="left"] .rhf-dt-toggle { left: 12px; }

.rhf-dt-logo {
  flex: none;
  display: block;
  width: 24px;
  height: 24px;
}

.rhf-dt-panel {
  position: fixed;
  z-index: 99999;
  top: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  width: 340px;
  max-width: calc(100vw - 24px);
  overflow: hidden;
  background: var(--rhf-dt-bg);
  color: var(--rhf-dt-text);
  border: 1px solid var(--rhf-dt-border);
  border-radius: 15px;
  box-shadow: 0 0 0 1px rgba(236, 89, 144, 0.06), 0 30px 80px -20px rgba(0, 0, 0, 0.6);
  font: 14px/1.6 var(--rhf-dt-sans);
  text-align: left;
  opacity: 0;
  transform: translateX(calc(100% + 12px));
  visibility: hidden;
  transition: transform 0.25s ease, opacity 0.25s ease, visibility 0s 0.25s;
}

.rhf-dt[data-placement$="left"] .rhf-dt-panel {
  right: auto;
  left: 12px;
  transform: translateX(calc(-100% - 12px));
}

.rhf-dt .rhf-dt-panel[data-open] {
  opacity: 1;
  transform: none;
  visibility: visible;
  transition-delay: 0s;
}

.rhf-dt-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  height: 52px;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--rhf-dt-border);
}

.rhf-dt-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-right: auto;
  line-height: 1;
}

.rhf-dt-header strong {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.rhf-dt-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--rhf-dt-muted);
  font-size: 12px;
}

.rhf-dt-status::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--rhf-dt-pink);
  box-shadow: 0 0 0 3px rgba(236, 89, 144, 0.2);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.rhf-dt-status[data-valid]::before {
  background: var(--rhf-dt-green);
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.2);
}

.rhf-dt .rhf-dt-icon {
  display: grid;
  place-items: center;
  flex: none;
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--rhf-dt-border);
  border-radius: 6px;
  color: var(--rhf-dt-muted);
  font-size: 13px;
  line-height: 1;
  transition: color var(--rhf-dt-ease), border-color var(--rhf-dt-ease), background-color var(--rhf-dt-ease);
}

.rhf-dt .rhf-dt-icon:hover {
  color: var(--rhf-dt-text);
  border-color: var(--rhf-dt-pink);
  background: rgba(236, 89, 144, 0.12);
}

.rhf-dt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
  padding: 12px 16px;
  background: var(--rhf-dt-surface);
  border-bottom: 1px solid var(--rhf-dt-border);
}

.rhf-dt .rhf-dt-search {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--rhf-dt-border-input);
  border-radius: 6px;
  background: var(--rhf-dt-page);
  color: var(--rhf-dt-text);
  font-size: 13px;
  cursor: text;
  transition: border-color var(--rhf-dt-ease), box-shadow var(--rhf-dt-ease);
}

.rhf-dt .rhf-dt-search::placeholder {
  color: var(--rhf-dt-muted);
}

.rhf-dt .rhf-dt-search:focus {
  border-color: var(--rhf-dt-pink);
  box-shadow: 0 0 0 3px rgba(236, 89, 144, 0.2);
}

.rhf-dt-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 14px 16px 6px;
  color: var(--rhf-dt-pink);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rhf-dt-label span {
  color: var(--rhf-dt-muted);
  font-family: var(--rhf-dt-mono);
  letter-spacing: 0;
}

.rhf-dt-fields {
  flex: 1;
  overflow: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: #4f6294 transparent;
}

.rhf-dt-empty {
  margin: 0;
  padding: 8px;
  color: var(--rhf-dt-muted);
  font-size: 13px;
}

.rhf-dt-field {
  margin-top: 4px;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: border-color var(--rhf-dt-ease), background-color var(--rhf-dt-ease);
}

.rhf-dt-field[open] {
  background: var(--rhf-dt-page);
  border-color: var(--rhf-dt-border);
}

.rhf-dt-field[data-error] {
  border-color: rgba(236, 89, 144, 0.5);
}

.rhf-dt .rhf-dt-field > summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 9px;
  transition: background-color var(--rhf-dt-ease);
}

.rhf-dt .rhf-dt-field > summary:hover {
  background: var(--rhf-dt-surface);
}

.rhf-dt-field > summary::before {
  content: "";
  flex: none;
  width: 5px;
  height: 5px;
  margin: 0 2px;
  border-right: 1.5px solid var(--rhf-dt-muted);
  border-bottom: 1.5px solid var(--rhf-dt-muted);
  transform: rotate(-45deg);
  transition: transform var(--rhf-dt-ease);
}

.rhf-dt-field[open] > summary::before {
  transform: rotate(45deg);
}

.rhf-dt-name {
  flex: 1;
  overflow: hidden;
  font-family: var(--rhf-dt-mono);
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rhf-dt-field[data-error] .rhf-dt-name {
  color: var(--rhf-dt-link);
}

.rhf-dt-tag {
  flex: none;
  padding: 0 8px;
  border: 1px solid var(--rhf-dt-border);
  border-radius: 9999px;
  color: var(--rhf-dt-muted);
  font-family: var(--rhf-dt-mono);
  font-size: 11px;
  line-height: 20px;
}

.rhf-dt dl {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 4px 12px;
  margin: 0;
  padding: 4px 12px 0 29px;
  font-family: var(--rhf-dt-mono);
  font-size: 12px;
}

.rhf-dt dt {
  color: var(--rhf-dt-muted);
}

.rhf-dt dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.rhf-dt-field[data-error] dd:not(:first-of-type) {
  color: var(--rhf-dt-link);
}

.rhf-dt code {
  font-family: var(--rhf-dt-mono);
  font-size: 12px;
  white-space: pre-wrap;
  background: none;
  color: var(--rhf-dt-text);
  padding: 0;
}

.rhf-dt code[data-type="string"] { color: var(--rhf-dt-string); }
.rhf-dt code[data-type="boolean"],
.rhf-dt code[data-type="number"] { color: var(--rhf-dt-literal); }
.rhf-dt code[data-type="undefined"] { color: var(--rhf-dt-muted); }

.rhf-dt-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 12px 29px;
}

.rhf-dt-chip {
  padding: 0 10px;
  border: 1px dashed var(--rhf-dt-border);
  border-radius: 9999px;
  color: var(--rhf-dt-muted);
  font-family: var(--rhf-dt-mono);
  font-size: 11px;
  line-height: 22px;
  text-decoration: line-through;
  transition: color var(--rhf-dt-ease), background-color var(--rhf-dt-ease), border-color var(--rhf-dt-ease);
}

.rhf-dt-chip[data-on] {
  border: 1px solid rgba(236, 89, 144, 0.5);
  background: rgba(236, 89, 144, 0.12);
  color: var(--rhf-dt-text);
  text-decoration: none;
}

.rhf-dt .rhf-dt-link {
  margin-left: auto;
  padding: 0 10px;
  border: 1px solid var(--rhf-dt-border);
  border-radius: 4px;
  color: var(--rhf-dt-muted);
  font-size: 11px;
  line-height: 22px;
  transition: color var(--rhf-dt-ease), border-color var(--rhf-dt-ease);
}

.rhf-dt .rhf-dt-link:hover {
  color: var(--rhf-dt-text);
  border-color: var(--rhf-dt-pink);
}

.rhf-dt-state {
  flex: none;
  background: var(--rhf-dt-surface);
  border-top: 1px solid var(--rhf-dt-border);
}

.rhf-dt-state .rhf-dt-label {
  padding-top: 12px;
}

.rhf-dt-state .rhf-dt-chips {
  padding: 4px 16px 14px;
}

@media (prefers-reduced-motion: reduce) {
  .rhf-dt *,
  .rhf-dt-panel {
    transition: none !important;
  }
}
`;

// assets/app.js — minimal todo wiring (vanilla DOM, no framework).
//
// Order of guards in addItem: empty-input check FIRST, then trim
// and read of input.value. Never trim before checking emptiness so
// a single space still triggers the empty-input branch.
//
// Every dynamic data-testid (todo-item / todo-toggle / todo-delete)
// is created inside the item factory below. The static ones
// (todo-input / todo-add / todo-list) live in index.html.

(function () {
  "use strict";

  const form = document.getElementById("todo-form");
  const input = document.querySelector('[data-testid="todo-input"]');
  const list = document.querySelector('[data-testid="todo-list"]');

  // -- factory --------------------------------------------------------

  function createItem(text) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.setAttribute("data-testid", "todo-item");

    const span = document.createElement("span");
    span.className = "todo-item__text";
    span.textContent = text;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "todo-item__btn";
    toggle.setAttribute("data-testid", "todo-toggle");
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "Mark done");
    toggle.textContent = "DONE";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-item__btn todo-item__btn--del";
    del.setAttribute("data-testid", "todo-delete");
    del.setAttribute("aria-label", "Delete");
    del.textContent = "DEL";

    li.append(span, toggle, del);
    return li;
  }

  // -- behaviors ------------------------------------------------------

  function addItem(rawValue) {
    // Empty check BEFORE trimming — a single space must be rejected.
    if (rawValue == null || rawValue === "" || rawValue.trim() === "") {
      input.focus();
      return;
    }
    const text = rawValue.trim();
    list.appendChild(createItem(text));
    input.value = "";
    input.focus();
  }

  function toggleItem(item) {
    const toggle = item.querySelector('[data-testid="todo-toggle"]');
    const isDone = item.classList.toggle("done");
    toggle.setAttribute("aria-pressed", isDone ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      isDone ? "Mark not done" : "Mark done"
    );
  }

  function deleteItem(item) {
    item.remove();
    input.focus();
  }

  // -- wiring ---------------------------------------------------------

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addItem(input.value);
  });

  list.addEventListener("click", function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const item = target.closest('[data-testid="todo-item"]');
    if (!item) return;
    if (target.closest('[data-testid="todo-toggle"]')) {
      toggleItem(item);
    } else if (target.closest('[data-testid="todo-delete"]')) {
      deleteItem(item);
    }
  });
})();
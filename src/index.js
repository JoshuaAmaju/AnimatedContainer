import ResizeObserver from "@juggle/resize-observer";
const SortedMap = require("collections/sorted-map");

class AnimatedContainer extends HTMLElement {
  constructor() {
    super();
    this.duration = 250;
    this._children = undefined;
    this.easing = "ease-in-out";
    this.childCount = undefined;
    this.resizeObserver = undefined;
    this.mutationObserver = undefined;
    this.domRectRep = new SortedMap();
    const root = this.attachShadow({ mode: "open" });
    this.mutationObserverConfig = { childList: true };
    const template = document.createElement("template");
    template.innerHTML = `
    <style>
      :host {
        transition: ${this.duration / 1000}s ${this.easing};
      }
    </style>
    <slot></slot>
    `;
    root.appendChild(template.content.cloneNode(true));

    this.resizeObserverCallback = this.resizeObserverCallback.bind(this);
    this.mutationObserverCallback = this.mutationObserverCallback.bind(this);
  }

  connectedCallback() {
    const scope = this;
    // Select all direct or indirect child
    this._children = this.querySelectorAll("*");
    this.childCount = this._children.length;

    // creates a representation of the dom.
    this.createDomRep(this, ...this._children);

    /** create MutationObserver instance and
     * listen for mutation events.
     */
    this.mutationObserver = new MutationObserver(this.mutationObserverCallback);

    /** create ResizeObserver instance and
     * listen for resize events.
     */
    this.resizeObserver = new ResizeObserver(this.resizeObserverCallback);
    this.setObservers();
  }

  setObservers() {
    this.resizeObserver.observe(this);
    this.mutationObserver.observe(this, this.mutationObserverConfig);

    // listen for mutation and resize events on child elements.
    [...this._children].forEach(child => {
      this.resizeObserver.observe(child);
      this.mutationObserver.observe(child, this.mutationObserverConfig);
    });
  }

  disconnectObservers() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
  }

  disconnectedCallback() {
    this.domRectRep.clear();
    this.disconnectObservers();
  }

  resizeObserverCallback(entries, observer) {
    const scope = this;
    // entries.forEach(entry => scope._animate(entry.target));

    this._animate(this);
    [...this._children].forEach(child => scope._animate(child));
  }

  mutationObserverCallback(mutationList) {
    const scope = this;
    for (let i = 0; i < mutationList.length; i++) {
      const mutation = mutationList[i];
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(node => {
          const prev = node.previousElementSibling;
          scope.createDomRep(node);

          /**
           * if new element was added, get the elements key
           * and reset its rect value in domRectRep.
           */
          if (prev && scope.childCount < mutation.target.childElementCount) {
            const props = scope.getRect(prev);
            scope.domRectRep.set(Number(node.getAttribute("data-key")), {
              top: props.top,
              width: props.width,
              height: props.height,
              left: props.left + props.width
            });
          }
        });

        scope._children = scope.querySelectorAll("*");
        scope.childCount = scope._children.length;
      }
    }

    this._animate(this);
    [...this._children].forEach(child => scope._animate(child));
  }

  createDomRep(...nodes) {
    const scope = this;
    nodes.forEach(node => {
      let key = this.rand(0, scope.domRectRep.length);

      while (this.domRectRep.has(key)) {
        key = this.rand(0, scope.domRectRep.length);
      }

      const nodeRect = scope.getRect(node);
      const rect = {
        top: nodeRect.top,
        left: nodeRect.left,
        width: nodeRect.width,
        height: nodeRect.height
      };

      scope.domRectRep.set(key, rect);
      node.setAttribute("data-key", key);
    });
  }

  rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _animate(target) {
    const scope = this;
    const key = Number(target.getAttribute("data-key"));
    const newRect = this.getRect(target);
    const oldRect = this.domRectRep.get(key);

    const computedStyle = getComputedStyle(target);
    if (
      computedStyle.position === "static" ||
      computedStyle.position === "relative"
    ) {
      target.style.position = "relative";
      target.style.top = `${oldRect.top - newRect.top}px`;
      target.style.left = `${oldRect.left - newRect.left}px`;
      target.style.transition = `${this.duration / 1000}s ${this.easing}`;

      setTimeout(() => {
        target.style.top = 0;
        target.style.left = 0;

        setTimeout(() => {
          scope.domRectRep.clear();
          target.style.removeProperty("top");
          target.style.removeProperty("left");
          target.style.removeProperty("position");
          target.style.removeProperty("transition");
          scope.createDomRep(scope, ...scope._children);
        }, this.duration);
      }, 10);
    }
  }

  getRect(element) {
    return element.getBoundingClientRect();
  }
}

customElements.define("animated-container", AnimatedContainer);

class AnimatedContainer extends HTMLElement {
  constructor() {
    super();
    this.domRectRep = {};
    this.children = undefined;
    this.childCount = undefined;
    this.resizeObserver = undefined;
    this.mutationObserver = undefined;
    this.root = this.attachShadow({ mode: "open" });
    this.mutationObserverConfig = { childList: true };
    const template = document.createElement("template");
    this.root.appendChild(template.content.cloneNode(true));

    console.log(this);
  }

  connectedCallback() {
    // Select all direct or indirect child
    this.children = this.querySelectorAll("*");
    this.childCount = this.children.length;

    /** create MutationObserver instance and
     * listen for mutation event.
     */
    this.mutationObserver = new MutationObserver();
    this.mutationObserver.observe(this, this.mutationObserverConfig);

    window.addEventListener("resize", this.resizeListener);

    // listen for mutation event on child elements.
    this.children.forEach(function(child) {
      this.mutationObserver.observe(child, this.mutationObserverConfig);
    });
  }

  disconnectedCallback() {
    this.domRectRep = {};
    this.mutationObserver.disconnect();
    window.removeEventListener("resize", this.resizeListener);
  }

  resizeListener() {}

  animate(target) {}

  getRect() {}
}

customElements.define("animated-container", AnimatedContainer);

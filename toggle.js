'use strict'

const escPress = (callback) => {
  const fn = (event) => {
    if (event.code.toLowerCase() !== 'escape') {
      return;
    }

    callback();
  };

  document.addEventListener('keyup', fn);

  return () => {
    document.removeEventListener('keyup', fn);
  };
};

const clickOutside = (elements, callback) => {
  const fn = (event) => {
    let target = event.target;

    do {
      for (const element of elements) {
        if (target === element) return;
      }

      target = target.parentNode;
    } while (target);

    callback();
  };

  document.addEventListener('click', fn);

  return () => {
    document.removeEventListener('click', fn);
  };
};

class Toggle {
  constructor(element, options = {}, classNames = {}) {
    this.element = element;
    this.options = {
      escPress: true,
      clickOutside: true,
      ...options,
    };
    this.classNames = {
      init: 'is-init-toggle',
      toggle: 'is-toggled',
      ...classNames,
    };

    this.targetElement = null;

    this.toggle = this.toggle.bind(this);
    this.toggleOn = this.toggleOn.bind(this);
    this.toggleOff = this.toggleOff.bind(this);

    this.escPressCleanup = null;
    this.clickOutsideCleanup = null;

    this.init();
  }

  init() {
    if (this.element.classList.contains(this.classNames.init)) {
      console.error(`Toggle is already initialized (id): ${this.element.dataset.id}`);
      return;
    }

    this.targetElement = document.querySelector(`[data-toggle-box="${this.element.dataset.id}"]`);

    this.setup();
    this.addEvents();

    this.element.classList.add(this.classNames.init);
  }

  setup() {
    if (!this.targetElement.hasAttribute('id')) {
      this.targetElement.id = this.element.dataset.id;
    }

    this.element.setAttribute('aria-controls', this.targetElement.id);

    if (this.isToggled()) {
      this.toggleOn(true);
    } else {
      this.toggleOff(true);
    }
  }

  isToggled() {
    return this.element.classList.contains(this.classNames.toggle);
  }

  toggle() {
    if (this.isToggled()) {
      this.toggleOff();
      return;
    }

    this.toggleOn();
  }

  toggleOn(isSetup = false) {
    if (this.isToggled() && !isSetup) {
      return;
    }

    this.element.classList.add(this.classNames.toggle);
    this.element.setAttribute('aria-expanded', 'true');

    this.targetElement.classList.add(this.classNames.toggle);
  }

  toggleOff(isSetup = false) {
    if (!this.isToggled() && !isSetup) {
      return;
    }

    this.element.classList.remove(this.classNames.toggle);
    this.element.setAttribute('aria-expanded', 'false');

    this.targetElement.classList.remove(this.classNames.toggle);
  }

  addEvents() {
    this.element.addEventListener('click', this.toggle);
    if (this.options.escPress) {
      this.escPressCleanup = escPress(this.toggleOff);
    }
    if (this.options.clickOutside) {
      this.clickOutsideCleanup = clickOutside([this.element, this.targetElement], this.toggleOff);
    }
  }

  removeEvents() {
    this.element.removeEventListener('click', this.toggle);
    if (this.options.escPress) {
      this.escPressCleanup();
    }
    if (this.options.clickOutside) {
      this.clickOutsideCleanup();
    }
  }

  destroy() {
    if (!this.element.classList.contains(this.classNames.init)) {
      console.error(`Toggle is not initialized (id): ${this.element.dataset.id}`);
      return;
    }

    this.removeEvents();

    this.targetElement = null;

    this.element.classList.remove(this.classNames.init);
  }
}

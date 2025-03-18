(function () {
    class App {
        async run() {
            await new Promise((resolve) => {
                document.addEventListener('DOMContentLoaded', function () {
                    resolve();
                }, false);
            } );

            const applicationRepository = new MockApplicationRepository();
            const applicationService = new ApplicationService(applicationRepository);
            const deviceService = new DeviceService();

            const pageVM = new PageViewModel(applicationService, deviceService);
            pageVM.model();
        }
    }

    class MetaView {
        updateContent(id, content) {
            const element = document.getElementById(id);

            element.setAttribute('content', content);
        }
    }

    class LoadingPluckView {
        constructor(id) {
            this.id = id;
        }

        remove() {
            const element = document.getElementById(this.id);

            element.parentNode.removeChild(element);
        }
    }

    class CardsComponentViewFirefoxMoveHandler {
        constructor(view) {
            this.view = view;
            this.animationTime = 250;
        }

        moveToNextSlide() {
            const slideIndex = this.view.state.slide;
            const nextSlideIndex = slideIndex + 1;

            const toReturn = ! this.view.slides.has(nextSlideIndex);
            if (toReturn) {
                return;
            }

            this.view.state.slide = nextSlideIndex;

            const nextSlideId = this.view.slides.get(nextSlideIndex);
            const nextSlideElement = document.getElementById(nextSlideId);

            const boxLeftPadding = window
                .getComputedStyle(this.view.elements.box, null)
                .getPropertyValue('padding-left');

            const correction = parseFloat(boxLeftPadding);

            const startScrollLeft = this.view.elements.box.scrollLeft;
            const endScrollLeft = nextSlideElement.offsetLeft - correction;
            const delta = endScrollLeft - startScrollLeft;

            let startTimestamp;
            let progress;
            let animationTime = this.animationTime;
            let timePast;
            let self = this;

            function animate(timestamp) {
                if (!startTimestamp){
                    startTimestamp = timestamp;
                }

                timePast = timestamp - startTimestamp;

                let progress = timePast / animationTime;
                progress = Math.min(1, progress);

                const nextScrollLeft = startScrollLeft + delta * progress;

                self.view.elements.box.scrollLeft = nextScrollLeft;

                const toAnimateNext = progress < 1;
                if (toAnimateNext) {
                    window.requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        }

        moveToPrevSlide() {
            const slideIndex = this.view.state.slide;
            const nextSlideIndex = slideIndex - 1;

            const toReturn = ! this.view.slides.has(nextSlideIndex);
            if (toReturn) {
                return;
            }

            this.view.state.slide = nextSlideIndex;

            const nextSlideId = this.view.slides.get(nextSlideIndex);
            const nextSlideElement = document.getElementById(nextSlideId);

            let endScrollLeft;

            const isFirst = nextSlideIndex === 1;
            if (isFirst) {
                endScrollLeft = 0;
            } else {
                endScrollLeft = nextSlideElement.offsetLeft;
            }

            const startScrollLeft = this.view.elements.box.scrollLeft;
            const delta = endScrollLeft - startScrollLeft;

            let startTimestamp;
            let progress;
            let animationTime = this.animationTime;
            let timePast;
            let self = this;

            function animate(timestamp) {
                if (!startTimestamp){
                    startTimestamp = timestamp;
                }

                timePast = timestamp - startTimestamp;

                let progress = timePast / animationTime;
                progress = Math.min(1, progress);

                const nextScrollLeft = startScrollLeft + delta * progress;

                self.view.elements.box.scrollLeft = nextScrollLeft;

                const toAnimateNext = progress < 1;
                if (toAnimateNext) {
                    window.requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);


        }
    }

    class CardsComponentViewDefaultMoveHandler {
        constructor(view) {
            this.view = view;
        }

        moveToNextSlide() {
            const slideIndex = this.view.state.slide;
            const nextSlideIndex = slideIndex + 1;

            const toReturn = ! this.view.slides.has(nextSlideIndex);
            if (toReturn) {
                return;
            }

            this.view.state.slide = nextSlideIndex;

            const nextSlideId = this.view.slides.get(nextSlideIndex);
            const nextSlideElement = document.getElementById(nextSlideId);

            const boxLeftPadding = window
                .getComputedStyle(this.view.elements.box, null)
                .getPropertyValue('padding-left');

            const correction = parseFloat(boxLeftPadding);

            this.view.elements.box.scrollLeft = nextSlideElement.offsetLeft - correction;
        }

        moveToPrevSlide() {
            const slideIndex = this.view.state.slide;
            const nextSlideIndex = slideIndex - 1;

            const toReturn = ! this.view.slides.has(nextSlideIndex);
            if (toReturn) {
                return;
            }

            this.view.state.slide = nextSlideIndex;

            const nextSlideId = this.view.slides.get(nextSlideIndex);
            const nextSlideElement = document.getElementById(nextSlideId);

            const isFirst = nextSlideIndex === 1;
            if (isFirst) {
                this.view.elements.box.scrollLeft = 0;
            } else {
                this.view.elements.box.scrollLeft = nextSlideElement.offsetLeft;
            }
        }
    }

    class CardsComponentView {
        constructor(boxId, leftArrowId, rightArrowId, slides) {
            this.elements = {
                box: null,
                leftArrow: null,
                rightArrow: null,
            };
            this.ids = {
                leftArrow: leftArrowId,
                rightArrow: rightArrowId,
                box: boxId
            }
            this.listeners = {
                clickLeftArrow: [],
                clickRightArrow: [],
                clickSlide: [],
                scroll: []
            };
            this.slides = slides;
            this.state = {
                slide: 1,

                scrollBlocked: false
            }
            this.slidesOffsetLeft = new Map();
            this.slideIdSlideNumber = new Map();
        }

        setMoveHandler(handler) {
            this.moveHandler = handler;
        }

        mount() {
            this.elements.box = document.getElementById(this.ids.box);

            this.elements.leftArrow = document.getElementById(this.ids.leftArrow);
            this.elements.leftArrow.addEventListener('click', () => {
                this.listeners.clickLeftArrow.forEach((listener) => listener());
            });

            this.elements.rightArrow = document.getElementById(this.ids.rightArrow);
            this.elements.rightArrow.addEventListener('click', () => {
                this.listeners.clickRightArrow.forEach((listener) => listener());
            });

            this.elements.box.addEventListener('scroll', (event) => {
                if (this.state.scrollBlocked) {
                    return;
                }

                this.state.scrollBlocked = true;
                requestAnimationFrame(() => {
                    this.listeners.scroll.forEach((listener) => {
                        listener(this.elements.box.scrollLeft);
                    })

                    this.state.scrollBlocked = false;
                });
            });

            this.slides.forEach((elementId, key) => {
                this.slideIdSlideNumber.set(elementId, key);

                const element = document.getElementById(elementId);
                element.addEventListener('click', (event) => {
                    event.preventDefault();
                    const href = event.currentTarget.getAttribute('href');
                    const id = event.currentTarget.id;

                    this.listeners.clickSlide.forEach((listener) => {
                        listener(id, href);
                    } )
                } );

                this.slidesOffsetLeft.set(elementId, element.offsetLeft);
            });
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        moveToNextSlide() {
            this.moveHandler.moveToNextSlide();
        }

        moveToPrevSlide() {
            this.moveHandler.moveToPrevSlide();
        }

        focusSlide(slideId) {
            const element = document.getElementById(slideId);

            element.focus();
        }

        snap() {
            const scrollLeft = this.elements.box.scrollLeft;

            let snapDescriptor = {
                type: 'null'
            };

            for (const [elementId, elementOffsetLeft] of this.slidesOffsetLeft) {
                const toSnap = elementOffsetLeft >= scrollLeft;
                const toContinue = ! toSnap;

                if (toContinue) {
                    continue;
                }

                snapDescriptor = {
                    type: 'slide',
                    data: {
                        id: elementId,
                        offsetLeft: elementOffsetLeft
                    }
                }

                break;
            }

            switch(snapDescriptor.type) {
                case 'slide': {
                    this.state.slide = this.slideIdSlideNumber.get(snapDescriptor.data.id);
                    if (this.state.slide === 1) {
                        this.elements.box.scrollLeft = 0;
                    } else {
                        this.elements.box.scrollLeft = snapDescriptor.data.offsetLeft;
                    }

                    break;
                }
            }
        }
    }

    class FormView {
        constructor(formId, fields, classes) {
            this.fields = fields;
            this.fieldsMap = new Map();
            this.ids = {
                form: formId
            }
            this.elements = {
                form: null
            };
            this.listeners = {
                submit: [],
                focusInputField: [],
                inputInputField: [],
                blurInputField: []
            };
            this.classes = {
                inputFieldError: classes.inputFieldError,
                inputFieldInputError: classes.inputFieldInputError
            }
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        mount() {
            for (let field of this.fields) {
                this.fieldsMap.set(field.name, field);
            }

            this.elements.form = document.getElementById(this.ids.form);
            this.elements.form.addEventListener('submit', (event) => {
                event.preventDefault();

                const eventData = {
                    fields: this.collectFields()
                }

                this.listeners.submit.forEach((listener) => {
                    listener(eventData);
                });
            });

            for (let field of this.fields) {
                switch (field.type) {
                    case 'input': {
                        const fieldElement = this.elements.form.elements[field.name];
                        fieldElement.addEventListener('focus', (event) => {
                            const fieldElement = event.target;
                            const eventData = {
                                name: fieldElement.name
                            }

                            this.listeners.focusInputField.forEach((listener) => {
                                listener(eventData)
                            })
                        });
                        fieldElement.addEventListener('input', (event) => {
                            const fieldElement = event.target;
                            const eventData = {
                                name: fieldElement.name
                            }

                            this.listeners.inputInputField.forEach((listener) => {
                                listener(eventData)
                            });
                        });
                        fieldElement.addEventListener('blur', (event) => {
                            const fieldElement = event.target;
                            const eventData = {
                                name: fieldElement.name
                            }

                            this.listeners.blurInputField.forEach((listener) => {
                                listener(eventData)
                            });
                        } )

                        break;
                    }
                }
            }
        }

        reset() {
            for (let field of this.fields) {
                switch (field.type) {
                    case 'input': {
                        const fieldElement = this.elements.form.elements[field.name];
                        fieldElement.value = '';

                        break;
                    }
                }
            }
        }

        disable() {

        }

        focusField(fieldName) {
            const fieldElement = this.elements.form.elements[fieldName];

            fieldElement.focus();
        }

        markFieldAsHavingError(fieldName, errorMessage) {
            const field = this.fieldsMap.get(fieldName);

            switch (field.type) {
                case 'input': {
                    const fieldElement = this.elements.form.elements[fieldName];
                    const fieldId = fieldElement.id;
                    const containerElement = document.querySelector(`[data-field-container="${fieldId}"]`);

                    fieldElement.classList.add(this.classes.inputFieldInputError);

                    const prevErrorElements = document.querySelectorAll(`[data-field-error="${fieldId}"]`);
                    Array.from(prevErrorElements).forEach((prevErrorElement) => {
                        prevErrorElement.parentNode.removeChild(prevErrorElement);
                    });

                    const errorElement = document.createElement('div');
                    errorElement.setAttribute('data-field-error', fieldId);
                    errorElement.classList.add(this.classes.inputFieldError);
                    errorElement.textContent = errorMessage;

                    containerElement.append(errorElement);

                    break;
                }
            }
        }

        clearFieldErrors(fieldName) {
            const field = this.fieldsMap.get(fieldName);

            switch (field.type) {
                case 'input': {
                    const fieldElement = this.elements.form.elements[fieldName];
                    const fieldId = fieldElement.id;
                    const containerElement = document.querySelector(`[data-field-container="${fieldId}"]`);

                    fieldElement.classList.remove(this.classes.inputFieldInputError);

                    const prevErrorElements = document.querySelectorAll(`[data-field-error="${fieldId}"]`);
                    Array.from(prevErrorElements).forEach((prevErrorElement) => {
                        prevErrorElement.parentNode.removeChild(prevErrorElement);
                    });

                    break;
                }
            }
        }

        collectFields() {
            const collectedFields = new Map();

            for (let field of this.fields) {
                switch (field.type) {
                    case 'input': {
                        const fieldElement = this.elements.form.elements[field.name];

                        const collectedField = {
                            type: 'input',
                            data: {
                                name: fieldElement.name,
                                value: fieldElement.value
                            }
                        }
                        collectedFields.set(field.name, collectedField);

                        break;
                    }
                }
            }

            return collectedFields;
        }
    }

    class Modal2View {
        constructor(modalId) {
            this.ids = {
                modal: modalId,
            }
            this.elements = {
                modal: '',
            }
            this.listeners = {}
            this.classes = {
                visible: 'body-c__form-modal_visible',
            }
        }

        mount() {
            this.elements.modal = document.getElementById(this.ids.modal);
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        show() {
            this.elements.modal.classList.add(this.classes.visible);
        }

        hide() {
            this.elements.modal.classList.remove(this.classes.visible);
        }
    }

    class ModalView {
        constructor(modalId, actionId) {
            this.ids = {
                modal: modalId,
                action: actionId
            }
            this.elements = {
                modal: '',
                action: ''
            }
            this.listeners = {
                clickAction: []
            }
        }

        mount() {
            this.elements.modal = document.getElementById(this.ids.modal);
            this.elements.action = document.getElementById(this.ids.action);
            this.elements.action.addEventListener('click', (event) => {
                this.listeners.clickAction.forEach((listener) => listener());
            })
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        show() {
            this.elements.modal.classList.add('body-c__form-modal_visible');
        }

        hide() {
            this.elements.modal.classList.remove('body-c__form-modal_visible');
        }
    }

    class HeroComponentViewShape {
        constructor(x, y, size, speedX, speedY, context, canvas) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speedX = speedX;
            this.speedY = speedY;
            this.context = context;
            this.canvas = canvas;
            this.blur = 30;
        }

        move() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > this.canvas.width) {
                this.speedX *= -1;
            }

            const isYReachedBottomBorder = (this.y + this.size + this.blur * 3) > this.canvas.height;
            const isYReachedTopBorder = this.y < 0;
            const isYReachedBorder = isYReachedBottomBorder || isYReachedTopBorder;

            if (isYReachedBorder) {
                this.speedY *= -1;
            }
        }

        draw() {
            this.context.beginPath();
            this.context.fillStyle = "rgba(40, 108, 255, 0.3)";
            this.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            this.context.fill();
            this.context.closePath();
        }
    }

    class HeroComponentView {
        constructor(canvasId, actionId, action2Id) {
            this.shapeCount = 8;
            this.color = '#286cff';
            this.ids = {
                canvas: canvasId,
                action: actionId,
                action2: action2Id
            }
            this.elements = {
                canvas: null,
                action: null,
                action2: null
            }
            this.shapes = [];
            this.context = null;
            this.listeners = {
                clickAction: []
            }
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        mount() {
            this.elements.action = document.getElementById(this.ids.action);
            this.elements.action.addEventListener('click', () => {
                this.listeners.clickAction.forEach((listener) => listener());
            });

            this.elements.action2 = document.getElementById(this.ids.action2);
            this.elements.action2.addEventListener('click', () => {
                this.listeners.clickAction.forEach((listener) => listener());
            });

            const canvasElement = document.getElementById(this.ids.canvas);
            this.elements.canvas = canvasElement;

            this.context = canvasElement.getContext("2d");
            this.shapes = [];

            this.updateShapesCount();
            this.updateAdditionalSize();
            this.updateShapes();



            this.animate();
        }

        fit() {
            this.shapes = [];
            this.updateShapesCount();
            this.updateAdditionalSize();
            this.updateShapes();
        }

        updateShapes() {
            this.elements.canvas.width = window.innerWidth;
            this.elements.canvas.height = window.innerHeight;
            this.elements.canvas.opacity = 0.7;

            for (let i = 0; i < this.shapeCount; i++) {
                const size = Math.random() * 100 + this.additionalSize;
                const blur = 50;
                const maxY = this.elements.canvas.height - size - blur * 3;
                const relatedY = Math.random() * this.elements.canvas.height;
                const y = Math.min(maxY, relatedY);

                this.shapes.push(
                    new HeroComponentViewShape(
                        Math.random() * this.elements.canvas.width,
                        y,
                        size,
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1,
                        this.context,
                        this.elements.canvas
                    )
                );
            }
        }

        animate() {
            this.context.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
            this.shapes.forEach((shape) => {
                shape.move();
                shape.draw();
            });
            requestAnimationFrame(this.animate.bind(this));
        }

        updateAdditionalSize() {
            if (window.innerWidth <= 480) {
                this.additionalSize = 13;
            } else if (window.innerWidth <= 768) {
                this.additionalSize = 33;
            } else {
                this.additionalSize = 50;
            }
        }

        updateShapesCount() {
            if (window.innerWidth <= 480) {
                this.shapeCount = 3;
            } else if (window.innerWidth <= 768) {
                this.shapeCount = 5;
            } else {
                this.shapeCount = 8;
            }
        }
    }

    class HTMLComponentView {
        mount() {

        }

        lockScrolling() {
            document.documentElement.classList.add('html-c_scroll-lock')
        }

        unlockScrolling() {
            document.documentElement.classList.remove('html-c_scroll-lock')
        }
    }

    class MenuComponentView {
        constructor(menuId) {
            this.ids = {
                menu: menuId
            }
            this.elements = {
                menu: null
            };
            this.listeners = {
                clickMenuItem: []
            }
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        highlightItem(identifier) {
            const menuItem = document.querySelector(`[data-related-component="${this.ids.menu}"][data-menu-item="${identifier}"]`);
            menuItem.classList.add('--highlighted');
        }

        unHighlightAllItems() {
            const elements = document.querySelectorAll(`[data-related-component="${this.ids.menu}"][data-menu-item]`);
            Array.from(elements).forEach((element) => {
                element.classList.remove('--highlighted');
            });
        }

        mount() {
            this.elements.menu = document.getElementById(this.ids.menu);

            const menuItemsElements = document.querySelectorAll(`[data-related-component="${this.ids.menu}"][data-menu-item]`);
            Array.from(menuItemsElements).forEach((menutItemElement) => {
                menutItemElement.addEventListener('click', (event) => {
                    event.preventDefault();

                    const menuItemElement = event.currentTarget;
                    const identifier = menutItemElement.getAttribute('data-menu-item');

                    let eventData = {
                        type: 'null'
                    };

                    const isAnchor = menuItemElement.tagName.toLowerCase() === 'a';
                    if (isAnchor) {
                        eventData = {
                            type: 'anchor',
                            data: {
                                identifier: identifier,
                                href: menuItemElement.getAttribute('href')
                            }
                        }
                    }

                    this.listeners.clickMenuItem.forEach((listener) => listener(eventData))
                })
            });
        }

        show() {
            this.elements.menu.classList.add('body-c__menu_expanded');
        }

        hide() {
            this.elements.menu.classList.remove('body-c__menu_expanded');
        }
    }

    class PluckView {
        constructor(id) {
            this.ids = {
                pluck: id
            }
            this.listeners = {
                click: []
            }
            this.elements = {
                pluck: null
            }
        }

        mount() {
            this.elements.pluck = document.getElementById(this.ids.pluck);
            this.elements.pluck.addEventListener('click', () => {
                this.listeners.click.forEach((listener) => listener());
            })
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        activate() {
            this.elements.pluck.classList.add('body-c__pluck_active');
        }

        deactivate() {
            this.elements.pluck.classList.remove('body-c__pluck_active');
        }
    }

    class HamburgerButtonView {
        constructor(buttonId) {
            this.ids = {
                button: buttonId
            }
            this.elements = {
                button: null
            }
            this.listeners = {
                click: []
            }
        }

        mount() {
            this.elements.button = document.getElementById(this.ids.button);
            this.elements.button.addEventListener('click', () => {
                this.listeners.click.forEach((listener) => {
                    listener();
                });
            })
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        stick() {
            this.elements.button.classList.add('hamburger-button-c_stick');
        }

        unstick() {
            this.elements.button.classList.remove('hamburger-button-c_stick');
        }

        activate() {
            this.elements.button.classList.add('hamburger-button-c_active');
        }

        deactivate() {
            this.elements.button.classList.remove('hamburger-button-c_active');
        }

        activateCross() {
            const crossElement = document.querySelector(`[data-related-component="${this.ids.button}"][data-cross]`);
            crossElement.classList.add('hamburger-button__cross_active');
        }

        deactivateCross() {
            const crossElement = document.querySelector(`[data-related-component="${this.ids.button}"][data-cross]`);
            crossElement.classList.remove('hamburger-button__cross_active');
        }

        activateLines() {
            const linesElements = document.querySelectorAll(`[data-related-component="${this.ids.button}"][data-line]`);
            Array.from(linesElements).forEach((lineElement) => {
                lineElement.classList.remove('hamburger-button-c__line_hidden');
            });
        }

        deactivateLines() {
            const linesElements = document.querySelectorAll(`[data-related-component="${this.ids.button}"][data-line]`);
            Array.from(linesElements).forEach((lineElement) => {
                lineElement.classList.add('hamburger-button-c__line_hidden');
            });
        }
    }

    class NavigatorComponentView {
        constructor(browser) {
            this.browser = browser;
        }

        mount() {

        }

        navigateHavingOffsetElement(id, offsetElementId) {
            switch (this.browser) {
                case 'firefox': {
                    const offsetElement = document.getElementById(offsetElementId);
                    const element = document.getElementById(id);

                    const endY = window.scrollY + element.getBoundingClientRect().top - offsetElement.offsetHeight;
                    const startY = window.scrollY;
                    const delta = endY - startY;

                    let start;
                    let progress;
                    let animationTime = 500;
                    let timeSpent;

                    function animate(timestamp) {
                        if (!start){
                            start = timestamp;
                        }

                        timeSpent = timestamp - start;

                        let progress = timeSpent / animationTime;
                        progress = Math.min(1, progress);

                        const nextY = startY + delta * progress;

                        window.scrollTo(0, nextY);

                        const toAnimateNext = progress < 1;
                        if (toAnimateNext) {
                            window.requestAnimationFrame(animate);
                        }
                    }

                    requestAnimationFrame(animate);

                    break;
                }
                default: {
                    const offsetElement = document.getElementById(offsetElementId);
                    const element = document.getElementById(id);

                    const y = window.scrollY + element.getBoundingClientRect().top - offsetElement.offsetHeight;

                    window.scroll({
                        top: y,
                        behavior: 'smooth'
                    });

                    break;
                }
            }

        }

        navigate(id) {
            switch (this.browser) {
                case 'firefox': {
                    const element = document.getElementById(id);

                    const endY = window.scrollY + element.getBoundingClientRect().top;
                    const startY = window.scrollY;
                    const delta = endY - startY;

                    let start;
                    let progress;
                    let animationTime = 500;
                    let timeSpent;

                    function animate(timestamp) {
                        if (!start){
                            start = timestamp;
                        }

                        timeSpent = timestamp - start;

                        let progress = timeSpent / animationTime;
                        progress = Math.min(1, progress);

                        const nextY = startY + delta * progress;

                        window.scrollTo(0, nextY);

                        const toAnimateNext = progress < 1;
                        if (toAnimateNext) {
                            window.requestAnimationFrame(animate);
                        }
                    }

                    requestAnimationFrame(animate);

                    break;
                }
                default: {
                    const element = document.getElementById(id);

                    const y = window.scrollY + element.getBoundingClientRect().top;

                    window.scroll({
                        top: y,
                        behavior: 'smooth'
                    });

                    break;
                }
            }
        }
    }

    class WindowComponentView {
        constructor() {
            this.elements = {};
            this.listeners = {
                scroll: new Map(),
                resize: new Map()
            }
            this.lastListenerId = 1;
        }

        mount() {
            document.addEventListener('scroll', (event) => {
                this.listeners.scroll.forEach((listener, id) => listener());
            }, {passive: true});

            window.addEventListener('resize', (event) => {
                this.listeners.resize.forEach((listener, id) => listener());
            } )
        }

        getScrollY() {
            return window.scrollY;
        }

        addEventListener(event, listener) {
            this.lastListenerId++;

            this.listeners[event].set(this.lastListenerId, listener);

            return this.lastListenerId;
        }

        removeEventListener(event, listenerId) {
            this.listeners[event].delete(listenerId);
        }
    }

    class DocumentComponentView {
        hasElementWithGivenSelector(selector) {
            try {
                const element = document.querySelector(selector);

                if (element) {
                    return true;
                }

                return false;
            } catch (e) {
                return false;
            }
        }
    }

    class HeaderComponentView {
        constructor(headerId) {
            this.ids = {
                header: headerId
            }
            this.listeners = {
                clickMenuItem: [],
                mouseenter: [],
                mouseleave: []
            };
            this.elements = {
                header: null
            }
        }

        mount() {
            this.elements.header = document.getElementById(this.ids.header);

            const menuItemsElements = document.querySelectorAll(`[data-related-component="${this.ids.header}"][data-menu-item]`);
            Array.from(menuItemsElements).forEach((menutItemElement) => {
                menutItemElement.addEventListener('click', (event) => {
                    event.preventDefault();

                    const menuItemElement = event.currentTarget;
                    const identifier = menutItemElement.getAttribute('data-menu-item');

                    let eventData = {
                        type: 'null'
                    };

                    const isAnchor = menuItemElement.tagName.toLowerCase() === 'a';
                    if (isAnchor) {
                        eventData = {
                            type: 'anchor',
                            data: {
                                identifier: identifier,
                                href: menuItemElement.getAttribute('href')
                            }
                        }
                    }

                    this.listeners.clickMenuItem.forEach((listener) => listener(eventData))
                })
            });

            this.elements.header.addEventListener('mouseenter', () => {
                this.listeners.mouseenter.forEach((listener) => listener());
            });

            this.elements.header.addEventListener('mouseleave', () => {
                this.listeners.mouseleave.forEach((listener) => listener());
            });
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        unstick() {
            this.elements.header.classList.remove('body-c__header_stick');
        }

        stick() {
            this.elements.header.classList.add('body-c__header_stick');
        }

        makeSolid() {
            this.elements.header.classList.add('body-c__header_solid');
        }

        makeNotSolid() {
            this.elements.header.classList.remove('body-c__header_solid');
        }

        getOffsetHeight() {
            return this.elements.header.offsetHeight;
        }
    }

    class InfoListComponentView {
        constructor(componentId) {
            this.ids = {
                component: componentId
            }
            this.listeners = {
                clickTab: []
            }
        }

        mount() {
            const tabsElements = document.querySelectorAll(`[data-tab][data-related-component="${this.ids.component}"]`);
            Array.from(tabsElements).forEach((tabElement) => {
                tabElement.addEventListener('click', (event) => {
                    const labelElement = event.currentTarget;
                    const identifier = labelElement.getAttribute('data-tab');

                    this.listeners.clickTab.forEach((listener) => listener(identifier));
                });
            })
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        expandTab(identifier) {
            const bodyElement = document.querySelector(`[data-body="${identifier}"][data-related-component="${this.ids.component}"]`);
            const contentElement = document.querySelector(`[data-content="${identifier}"][data-related-component="${this.ids.component}"]`);
            const tabElement = document.querySelector(`[data-tab="${identifier}"][data-related-component="${this.ids.component}"]`);

            tabElement.classList.add('info-list-c__tab_active');

            const contentHeight = contentElement.offsetHeight;
            const maxHeightValue = `${contentHeight}px`;

            bodyElement.style.setProperty('--max-height', maxHeightValue);

            setTimeout(() => {
                bodyElement.classList.add('info-list-c__tab-body_expanded');
                bodyElement.style.removeProperty('--max-height');
            }, 250);
        }

        collapseTab(identifier) {
            const bodyElement = document.querySelector(`[data-body="${identifier}"][data-related-component="${this.ids.component}"]`);
            const contentElement = document.querySelector(`[data-content="${identifier}"][data-related-component="${this.ids.component}"]`);
            const tabElement = document.querySelector(`[data-tab="${identifier}"][data-related-component="${this.ids.component}"]`);

            tabElement.classList.remove('info-list-c__tab_active');

            const contentHeight = contentElement.offsetHeight;
            const maxHeightValue = `${contentHeight}px`;

            bodyElement.style.setProperty('--max-height', maxHeightValue);
            bodyElement.classList.remove('info-list-c__tab-body_expanded');

            setTimeout(() => {
                bodyElement.classList.add('info-list-c__tab-body_collapsed');

                setTimeout(() => {
                    bodyElement.style.removeProperty('--max-height');
                    bodyElement.classList.remove('info-list-c__tab-body_collapsed');
                }, 250);
            }, 0);
        }
    }

    class FAQComponentView {
        constructor(componentId, actionId, previewItemsId, restItemsId, restItemsContentId) {
            this.ids = {
                component: componentId,
                action: actionId,
                previewItems: previewItemsId,
                restItems: restItemsId,
                restItemsContent: restItemsContentId
            }
            this.listeners = {
                clickAction: [],
                clickLabel: []
            }
        }

        mount() {
            const actionElement = document.getElementById(this.ids.action);
            actionElement.addEventListener('click', (event) => {
                event.preventDefault();

                this.listeners.clickAction.forEach((listener) => listener());
            });

            const labelsElements = document.querySelectorAll(`[data-label][data-related-component="${this.ids.component}"]`);
            Array.from(labelsElements).forEach((labelElement) => {
                labelElement.addEventListener('click', (event) => {
                    const labelElement = event.currentTarget;
                    const identifier = labelElement.getAttribute('data-label');

                    this.listeners.clickLabel.forEach((listener) => listener(identifier));
                });
            })
        }

        collapseItem(identifier) {
            const boxElement = document.querySelector(`[data-item-box="${identifier}"][data-related-component="${this.ids.component}"]`);
            const contentElement = document.querySelector(`[data-item-content="${identifier}"][data-related-component="${this.ids.component}"]`);
            const labelElement = document.querySelector(`[data-label="${identifier}"][data-related-component="${this.ids.component}"]`);

            labelElement.classList.remove('faq-c__label_active');

            const contentHeight = contentElement.offsetHeight;
            const maxHeightValue = `${contentHeight}px`;

            boxElement.style.setProperty('--max-height', maxHeightValue);
            boxElement.classList.remove('faq-c__item-box_expanded');

            setTimeout(() => {
                boxElement.classList.add('faq-c__item-box_collapsed');

                setTimeout(() => {
                    boxElement.style.removeProperty('--max-height');
                    boxElement.classList.remove('faq-c__item-box_collapsed');
                }, 250);
            }, 0);
        }

        expandItem(identifier) {
            const boxElement = document.querySelector(`[data-item-box="${identifier}"][data-related-component="${this.ids.component}"]`);
            const contentElement = document.querySelector(`[data-item-content="${identifier}"][data-related-component="${this.ids.component}"]`);
            const labelElement = document.querySelector(`[data-label="${identifier}"][data-related-component="${this.ids.component}"]`);

            labelElement.classList.add('faq-c__label_active');

            const contentHeight = contentElement.offsetHeight;
            const maxHeightValue = `${contentHeight}px`;

            boxElement.style.setProperty('--max-height', maxHeightValue);

            setTimeout(() => {
                boxElement.classList.add('faq-c__item-box_expanded');
                boxElement.style.removeProperty('--max-height');
            }, 250);
        }

        highlightAction() {
            const actionElement = document.getElementById(this.ids.action);
            actionElement.classList.add('faq-c__action_highlighted');
        }

        hideAction() {
            const actionElement = document.getElementById(this.ids.action);
            actionElement.classList.add('faq-c__action_hidden');
        }

        expandRestItems() {
            const containerElement = document.getElementById(this.ids.restItems);
            const contentElement = document.getElementById(this.ids.restItemsContent);

            const contentElementHeight = contentElement.offsetHeight;

            const maxHeightValue = `${contentElementHeight}px`;

            containerElement.style.setProperty('--max-height', maxHeightValue);

            setTimeout(() => {
                containerElement.classList.add('faq-c__rest-items_expanded');
                containerElement.style.removeProperty('--max-height');
            }, 400);
        }

        collapseRestItems() {

        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }
    }

    class FAQComponentViewModel {
        faqView;
        state;

        constructor() {
            this.state = {
                restItems: 'collapsed',
                items: new Map()
            }
        }

        model() {
            this.faqView = new FAQComponentView(
                'faq',
                'faq-action',
                'faq-preview-items',
                'faq-rest-items',
                'faq-rest-items-content'
            );
            this.faqView.addEventListener('clickAction', this.onClickAction.bind(this));

            this.faqView.addEventListener('clickLabel', this.onClickLabel.bind(this));

            this.faqView.mount();
        }

        onClickLabel(identifier) {
            let itemStateStrategy = 'null';
            const toUseHasStateStrategy = this.state.items.has(identifier);
            if (toUseHasStateStrategy) {
                itemStateStrategy = 'has';
            }

            switch (itemStateStrategy) {
                case 'has': {
                    const prevNextState = {
                        'collapsed': 'expanded',
                        'expanded': 'collapsed'
                    }
                    const nextState = prevNextState[this.state.items.get(identifier)];
                    this.state.items.set(identifier, nextState);

                    break;
                }
                default: {
                    this.state.items.set(identifier, 'expanded');

                    break;
                }
            }

            const nextState = this.state.items.get(identifier);
            switch (nextState) {
                case 'collapsed': {
                    this.faqView.collapseItem(identifier);

                    break;
                }
                case 'expanded': {
                    this.faqView.expandItem(identifier);

                    break;
                }
            }
        }

        async onClickAction() {
            await new Promise((resolve) => {
                setTimeout(resolve, 300);
            })

            const prevNextRestItemsState = {
                'collapsed': 'expanded',
                'expanded': 'collapsed'
            }
            this.state.restItems = prevNextRestItemsState[this.state.restItems];

            switch (this.state.restItems) {
                case 'collapsed': {
                    this.faqView.collapseRestItems();

                    break;
                }
                case 'expanded': {
                    this.faqView.highlightAction();
                    this.faqView.expandRestItems();

                    setTimeout(() => {
                        this.faqView.hideAction();
                    }, 500);

                    break;
                }
            }
        }
    }

    class CardsComponentViewModel {
        constructor(documentView, state, navigatorView, deviceService) {
            this.viewModelState = {
                snap: {
                    debounceTimeout: 0,
                    delay: 200
                }
            }
            this.state = state;
            this.deviceService = deviceService;
            this.views = {
                cards: null,
                navigator: navigatorView,
                document: documentView
            }
        }

        model() {
            const viewSlides = new Map();
            viewSlides.set(1, 'cards-slide-1')
            viewSlides.set(2, 'cards-slide-2')
            viewSlides.set(3, 'cards-slide-3')
            viewSlides.set(4, 'cards-slide-4')
            viewSlides.set(5, 'cards-slide-5')
            viewSlides.set(6, 'cards-slide-6')

            this.views.cards = new CardsComponentView(
                'cards-box',
                'cards-left-arrow',
                'cards-right-arrow',
                viewSlides,
            );

            let viewMoveHandler;
            const serviceBrowser = this.deviceService.detectBrowser();
            switch (serviceBrowser) {
                case 'firefox': {
                    viewMoveHandler = new CardsComponentViewFirefoxMoveHandler(this.views.cards);

                    break;
                }
                default: {
                    viewMoveHandler = new CardsComponentViewDefaultMoveHandler(this.views.cards);

                    break;
                }
            }
            this.views.cards.setMoveHandler(viewMoveHandler);

            this.views.cards.addEventListener('clickLeftArrow', this.onClickLeftArrow.bind(this));
            this.views.cards.addEventListener('clickRightArrow', this.onClickRightArrow.bind(this));
            this.views.cards.addEventListener('clickSlide', this.onClickSlide.bind(this));
            this.views.cards.addEventListener('scroll', this.onScroll.bind(this));

            this.views.cards.mount();
        }

        async onClickSlide(slideId, href) {
            let focusStrategy = 'default';

            if (this.state.device.isTouch) {
                focusStrategy = 'touch';
            }

            switch (focusStrategy) {
                case 'touch': {
                    this.views.cards.focusSlide(slideId);

                    break;
                }
                default: {
                    break;
                }
            }

            const isPageSection =
                href.startsWith('#') &&
                this.views.document.hasElementWithGivenSelector(href);

            let strategy = 'null';
            const toUsePageSectionStrategy = isPageSection;
            if (toUsePageSectionStrategy) {
                strategy = 'page-section';
            }

            switch (strategy) {
                case 'page-section': {
                    const isHeaderStick = this.state.stick.isStick;

                    if (isHeaderStick) {
                        const idToNavigate = href.slice(1);
                        this.views.navigator.navigateHavingOffsetElement(
                            idToNavigate,
                            this.state.header.id
                        );
                    } else {
                        const idToNavigate = href.slice(1);
                        this.views.navigator.navigate(idToNavigate);
                    }

                    break;
                }
            }
        }

        onScroll() {
            clearTimeout(this.viewModelState.snap.debounceTimeout);
            this.viewModelState.snap.debounceTimeout = setTimeout(() => {
                this.views.cards.snap();
            }, this.viewModelState.snap.delay);
        }

        onClickLeftArrow() {
            this.views.cards.moveToPrevSlide();
        }

        onClickRightArrow() {
            this.views.cards.moveToNextSlide();
        }
    }

    class InfoListComponentViewModel {
        constructor() {
            this.views = {}
            this.state = {
                tabs: new Map()
            }
        }

        model() {
            this.views.infoList = new InfoListComponentView('info-list');
            this.views.infoList.addEventListener('clickTab', this.onClickTab.bind(this));

            this.views.infoList.mount();
        }

        onClickTab(identifier) {
            let tabStateStrategy = 'null';
            const toUseHasStateStrategy = this.state.tabs.has(identifier);
            if (toUseHasStateStrategy) {
                tabStateStrategy = 'has';
            }

            switch (tabStateStrategy) {
                case 'has': {
                    const prevNextState = {
                        'collapsed': 'expanded',
                        'expanded': 'collapsed'
                    }
                    const nextState = prevNextState[this.state.tabs.get(identifier)];
                    this.state.tabs.set(identifier, nextState);

                    break;
                }
                default: {
                    this.state.tabs.set(identifier, 'expanded');

                    break;
                }
            }

            const nextState = this.state.tabs.get(identifier);
            switch (nextState) {
                case 'collapsed': {
                    this.views.infoList.collapseTab(identifier);

                    break;
                }
                case 'expanded': {
                    this.views.infoList.expandTab(identifier);

                    break;
                }
            }
        }
    }

    class ListComponentView {
        constructor(actionId, listItemsIds) {
            this.ids = {
                action: actionId,
                listItems: listItemsIds
            }
            this.listeners = {
                enterAction: [],
                clickListItem: [],
                clickAction: []
            };
            this.nodes = {
                action: null
            };
            this.listItemsNodes = new Map();
        }

        makeActionReversable() {
            const action = document.getElementById(this.ids.action);
            action.classList.add('list-c__action_has-reverse-animation');
        }

        mount() {
            this.ids.listItems.forEach((listItemId) => {
                const node = document.getElementById(listItemId);

                this.listItemsNodes.set(listItemId, node);

                node.addEventListener('click', (event) => {
                    const url = event.currentTarget.getAttribute('href');
                    const id = event.currentTarget.id;

                    this.listeners.clickListItem.forEach((listener) => {
                        listener(event, id, url);
                    })
                } )
            });

            this.nodes.action = document.getElementById(this.ids.action);
            this.nodes.action.addEventListener('mouseenter', (event) => {
                this.listeners.enterAction.forEach((listener) => listener());
            });
            this.nodes.action.addEventListener('click', (event) => {
                this.listeners.clickAction.forEach((listener) => listener());
            })
        }

        focusListItem(id) {
            const element = this.listItemsNodes.get(id);

            element.focus();
        }

        focusAction() {
            this.nodes.action.focus();
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }
    }

    class MockApplicationRepository {
        submit(application) {
            const name = application.fields.name;
            const phone = application.fields.phone;

            const isValidName = name.length > 0;
            const isValidPhone = phone.length > 0;

            const invalidFields = [];
            const toAddNameToInvalidFields = !isValidName;
            if (toAddNameToInvalidFields) {
                const invalidField = {
                    name: 'name',
                    reason: {
                        type: 'text',
                        data: {
                            text: 'Це поле необхідно заповнити'
                        }
                    }
                }
                invalidFields.push(invalidField);
            }

            const toAddPhoneToInvalidFields = !isValidPhone;
            if (toAddPhoneToInvalidFields) {
                const invalidField = {
                    name: 'phone',
                    reason: {
                        type: 'text',
                        data: {
                            text: 'Це поле необхідно заповнити'
                        }
                    }
                }
                invalidFields.push(invalidField);
            }

            return new Promise((resolve) => {
                const hasInvalidFields = invalidFields.length > 0;

                if (hasInvalidFields) {
                    resolve({
                        status: 'invalid-fields',
                        invalidFields: invalidFields
                    });
                } else {
                    resolve({
                        status: 'success',
                    });
                }
            })
        }
    }

    class InvalidFieldsException extends Error {
        constructor(fields) {
            super('Invalid fields');
            this.fields = fields;
        }
    }

    class ApplicationService {
        constructor(applicationRepository) {
            this.applicationRepository = applicationRepository;
        }

        async submit(application) {
            const result = await this.applicationRepository.submit(application);

            switch (result.status) {
                case 'invalid-fields': {
                    throw new InvalidFieldsException(result.invalidFields);
                }
                case 'success': {
                    break;
                }
            }
        }
    }

    class DeviceService {
        isTouchDevice() {
            return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
        }

        detectBrowser(){
            let browser = "";
            let c = navigator.userAgent.search("Chrome");
            let f = navigator.userAgent.search("Firefox");
            let m8 = navigator.userAgent.search("MSIE 8.0");
            let m9 = navigator.userAgent.search("MSIE 9.0");
            if (c > -1) {
                browser = "chrome";
            } else if (f > -1) {
                browser = "firefox";
            } else if (m9 > -1) {
                browser ="MSIE 9.0";
            } else if (m8 > -1) {
                browser ="MSIE 8.0";
            }
            return browser;
        }
    }

    class PageViewModel {
        constructor(applicationService, deviceService) {
            this.services = {
                application: applicationService,
                device: deviceService
            }
            this.views = {
                list: null
            };
            this.viewModels = {
                faq: null
            };
            this.state = {
                device: {
                    isTouch: false
                },
                window: {
                    scrollY: 0
                },
                stick: {
                    unstickTimeout: 0,
                    timeToUnstick: 1500,
                    isStick: true,
                },
                header: {
                    offsetHeight: 0,
                    id: 'header',
                    isSolid: false,
                },
                hamburger: {
                    activityStatus: 'inactive',
                },
                hamburgerPluck: {
                    activityState: 'inactive'
                },
                menu: {
                    visibilityStatus: 'hide'
                },
                form: {
                    submittingStatus: 'default',
                    stopToClearErrorsOnInputFocus: {
                        name: false,
                        phone: false
                    }
                },
                modalForm: {
                    submittingStatus: 'default',
                    stopToClearErrorsOnInputFocus: {
                        name: false,
                        phone: false
                    }
                },
            };
            this.listeners = {
                scrollHandleStick: 0
            }
        }

        model() {
            document.fonts.ready.then(() => {
                const loadingPluckView = new LoadingPluckView('loading-pluck');

                loadingPluckView.remove();
            });

            this.views.meta = new MetaView();
            this.views.meta.updateContent('viewport-meta-tag', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

            this.state.device.isTouch = this.services.device.isTouchDevice();

            this.views.html = new HTMLComponentView();
            this.views.hero = new HeroComponentView('hero-canvas', 'hero-action', 'hero-action-2');
            this.views.hero.addEventListener('clickAction', this.onHeroViewClickAction.bind(this));

            this.views.window = new WindowComponentView();
            this.views.window.addEventListener('resize', this.onWindowViewResize.bind(this));

            const formViewFields = [
                {
                    type: 'input',
                    name: 'name'
                },
                {
                    type: 'input',
                    name: 'phone',
                },
                {
                    type: 'submit',
                    name: 'submit',
                },
            ]
            const formViewClasses = {
                inputFieldError: 'form-c-form__text-field-error',
                inputFieldInputError: 'form-c-form__text-field-input_invalid'
            }
            this.views.form = new FormView('form', formViewFields, formViewClasses);
            this.views.form.addEventListener('submit', this.onFormViewSubmit.bind(this));
            this.views.form.addEventListener('focusInputField', this.onFormViewFocusInputField.bind(this));
            this.views.form.addEventListener('blurInputField', this.onFormViewBlurInputField.bind(this));
            this.views.form.addEventListener('inputInputField', this.onFormViewInputInputField.bind(this));


            let modalFormViewFields = [
                {
                    type: 'input',
                    name: 'name'
                },
                {
                    type: 'input',
                    name: 'phone',
                },
                {
                    type: 'submit',
                    name: 'submit',
                },
            ]
            let modalFormViewClasses = {
                inputFieldError: 'form-2-c__label-field-error',
                inputFieldInputError: 'form-2-c__input_invalid'
            }
            this.views.modalForm = new FormView('modal-form', modalFormViewFields, modalFormViewClasses);
            this.views.modalForm.addEventListener('submit', this.onModalFormViewSubmit.bind(this));
            this.views.modalForm.addEventListener('focusInputField', this.onModalFormViewFocusInputField.bind(this));
            this.views.modalForm.addEventListener('blurInputField', this.onModalFormViewBlurInputField.bind(this));
            this.views.modalForm.addEventListener('inputInputField', this.onModalFormViewInputInputField.bind(this));



            this.views.menu = new MenuComponentView('menu');
            this.views.menu.addEventListener('clickMenuItem', this.onMenuViewClickMenuItem.bind(this));

            this.views.hamburgerPluck = new PluckView('hamburger-pluck');

            this.views.formModal = new ModalView('form-modal', 'form-modal-action');
            this.views.formModal.addEventListener('clickAction', this.onFormModalViewClickAction.bind(this));

            this.views.thanksModal = new Modal2View('thanks-modal');
            this.views.thanksPluck = new PluckView('thanks-pluck');
            this.views.thanksPluck.addEventListener('click', this.onThanksPluckViewClick.bind(this));

            this.views.formPluck = new PluckView('form-pluck');

            this.views.hamburgerButton = new HamburgerButtonView('hamburger-button');
            this.views.hamburgerButton.addEventListener('click', this.onHamburgerButtonViewClick.bind(this));

            const serviceBrowser = this.services.device.detectBrowser();
            this.views.nagivator = new NavigatorComponentView(serviceBrowser);

            this.views.header = new HeaderComponentView('header');
            this.views.header.addEventListener('clickMenuItem', this.onHeaderViewClickMenuItem.bind(this));
            this.views.header.addEventListener('mouseenter', this.onHeaderViewMouseEnter.bind(this));
            this.views.header.addEventListener('mouseleave', this.onHeaderViewMouseLeave.bind(this));

            this.viewModels.faq = new FAQComponentViewModel();
            this.viewModels.faq.model();


            this.views.document = new DocumentComponentView();
            this.viewModels.cards = new CardsComponentViewModel(this.views.document, this.state, this.views.nagivator, this.services.device);
            this.viewModels.cards.model();

            this.viewModels.infoList = new InfoListComponentViewModel();
            this.viewModels.infoList.model();

            const listViewItemsIds = [
                'list-c-item-1',
                'list-c-item-2',
                'list-c-item-3',
                'list-c-item-4',
                'list-c-item-5',
                'list-c-item-6',
                'list-c-item-7',
            ]
            this.views.list = new ListComponentView('list-component-action', listViewItemsIds);
            this.views.list.addEventListener('enterAction', this.onListViewEnterAction.bind(this));
            this.views.list.addEventListener('clickAction', this.onListViewClickAction.bind(this));
            this.views.list.addEventListener('clickListItem', this.onListViewClickListItem.bind(this));

            this.views.hero.mount();
            this.views.list.mount();
            this.views.header.mount();
            this.views.hamburgerButton.mount();
            this.views.hamburgerPluck.mount();
            this.views.menu.mount();
            this.views.formPluck.mount();
            this.views.formModal.mount();
            this.views.thanksModal.mount();
            this.views.thanksPluck.mount();
            this.views.form.mount();
            this.views.modalForm.mount();
            this.views.window.mount();

            this.initStick();
        }

        onWindowViewResize() {
            this.views.hero.fit();
        }

        initStick() {
            const scrollY = this.views.window.getScrollY();
            this.state.window.scrollY = scrollY;

            const toMakeHeaderSolid = scrollY > 0;
            if (toMakeHeaderSolid) {
                this.views.header.isSolid = true;
                this.views.header.makeSolid();
            }

            this.state.header.offsetHeight = this.views.header.getOffsetHeight();
            this.state.window.scrollY = window.scrollY;

            this.tryWatchUnstick();

            this.views.window.addEventListener('scroll', this.onWindowViewScrollHandleSolidHeader.bind(this));
            this.listeners.scrollHandleStick = this.views.window.addEventListener('scroll', this.onWindowViewScrollHandleStick.bind(this));
        }

        stick() {
            this.stopToWatchUnstick();

            this.views.header.stick();
            this.views.hamburgerButton.stick();

            this.state.stick.isStick = true;

            this.tryWatchUnstick();
        }

        unstick() {
            this.state.stick.isStick = false;

            this.views.header.unstick();
            this.views.hamburgerButton.unstick();
        }

        tryWatchUnstick() {
            const toWatch = this.state.window.scrollY > this.state.header.offsetHeight;
            const toReturn = !toWatch;
            if (toReturn) {
                return;
            }

            this.watchUnstick();
        }

        watchUnstick() {
            this.state.stick.unstickTimeout = setTimeout(() => {
                this.unstick();
            }, this.state.stick.timeToUnstick);
        }

        stopToWatchUnstick() {
            clearTimeout(this.state.stick.unstickTimeout);
            this.state.stick.unstickTimeout = 0;
        }

        onWindowViewScrollHandleStick() {
            const scrollY = window.scrollY;
            const lastScrollY = this.state.window.scrollY;
            this.state.window.scrollY = scrollY;

            const delta = scrollY - lastScrollY;
            const isTopDirection = delta < 0;

            const scrollYIsNotMoreThanHeaderOffsetHeight = this.state.window.scrollY <= this.state.header.offsetHeight;

            const toStick = isTopDirection || scrollYIsNotMoreThanHeaderOffsetHeight;
            const toReturn = !toStick;

            if (toReturn) {
                this.stopToWatchUnstick();
                this.tryWatchUnstick();

                return;
            }

            const isAlreadyStick = this.state.stick.isStick;
            if (isAlreadyStick) {
                this.stopToWatchUnstick();
                this.tryWatchUnstick();

                return;
            }

            if (toStick) {
                this.stick();
            }
        }

        onWindowViewScrollHandleSolidHeader(event) {
            const scrollY = window.scrollY;
            const toMakeHeaderSolid = scrollY > 0;

            const toReturn =
                (toMakeHeaderSolid && this.state.header.isSolid) ||
                (!toMakeHeaderSolid && !this.state.header.isSolid);

            if (toReturn) {
                return;
            }

            if (toMakeHeaderSolid) {
                this.state.header.isSolid = true;
                this.views.header.makeSolid();
            } else {
                this.state.header.isSolid = false;
                this.views.header.makeNotSolid();
            }
        }

        onModalFormViewFocusInputField(eventData) {
            const name = eventData.name;

            let shouldClearErrors = true;

            if (this.state.modalForm.stopToClearErrorsOnInputFocus[name]) {
                shouldClearErrors = false;
            }

            if(shouldClearErrors) {
                this.views.modalForm.clearFieldErrors(eventData.name);
            }
        }

        onModalFormViewBlurInputField(eventData) {
            const name = eventData.name;

            this.state.modalForm.stopToClearErrorsOnInputFocus[name] = false;
        }

        onModalFormViewInputInputField(eventData) {
            const name = eventData.name;

            this.state.modalForm.stopToClearErrorsOnInputFocus[name] = false;
            this.views.modalForm.clearFieldErrors(eventData.name);
        }

        async onModalFormViewSubmit(eventData) {
            this.state.modalForm.submittingStatus = 'submitting';
            this.views.modalForm.disable();

            const viewFields = eventData.fields;

            const viewNameField = viewFields.get('name');
            const viewPhoneField = viewFields.get('phone');

            const serviceFields = {
                name: viewNameField.data.value,
                phone: viewPhoneField.data.value
            }

            const serviceApplication = {
                name: 'application',
                fields: serviceFields
            }

            try {
                await this.services.application.submit(serviceApplication);

                this.views.formModal.hide();
                this.views.formPluck.deactivate();
                this.views.modalForm.reset();
                this.views.html.lockScrolling();
                this.views.thanksPluck.activate();
                this.views.thanksModal.show();
            } catch (error) {
                let strategy = 'null';

                if (error instanceof InvalidFieldsException) {
                    strategy = 'invalid-fields';
                }

                switch (strategy) {
                    case 'invalid-fields': {
                        const invalidFields = error.fields;

                        const fieldToFocusPriority = {
                            name: 1,
                            phone: 2
                        };

                        let fieldToFocus = {
                            type: 'null'
                        };

                        invalidFields.forEach((invalidField) => {
                            const invalidFieldName = invalidField.name;
                            const reason = invalidField.reason;

                            switch (reason.type) {
                                case 'text': {
                                    const reasonText = reason.data.text;

                                    this.views.modalForm.markFieldAsHavingError(invalidFieldName, reasonText);

                                    break;
                                }
                            }

                            const fieldPriority = fieldToFocusPriority[invalidField.name];
                            const toMakeFieldFocused =
                                fieldToFocus['type'] === 'null' ||
                                fieldPriority < fieldToFocus.priority;

                            if (toMakeFieldFocused) {
                                fieldToFocus = {
                                    type: 'field',
                                    name: invalidField.name,
                                    priority: fieldPriority
                                };
                            }
                        });

                        switch (fieldToFocus.type) {
                            case 'field': {
                                this.state.modalForm.stopToClearErrorsOnInputFocus[fieldToFocus.name] = true;

                                const viewFieldName = fieldToFocus.name;

                                this.views.modalForm.focusField(viewFieldName);

                                break;
                            }
                        }

                        break;
                    }
                }
            }
        }

        onFormViewInputInputField(eventData) {
            const name = eventData.name;

            this.state.form.stopToClearErrorsOnInputFocus[name] = false;
            this.views.form.clearFieldErrors(eventData.name);
        }

        onFormViewBlurInputField(eventData) {
            const name = eventData.name;

            this.state.form.stopToClearErrorsOnInputFocus[name] = false;
        }

        onFormViewFocusInputField(eventData) {
            const name = eventData.name;

            let shouldClearErrors = true;

            if (this.state.form.stopToClearErrorsOnInputFocus[name]) {
                shouldClearErrors = false;
            }

            if(shouldClearErrors) {
                this.views.form.clearFieldErrors(eventData.name);
            }
        }

        async onFormViewSubmit(eventData) {
            this.state.form.submittingStatus = 'submitting';
            this.views.form.disable();

            const viewFields = eventData.fields;

            const viewNameField = viewFields.get('name');
            const viewPhoneField = viewFields.get('phone');

            const serviceFields = {
                name: viewNameField.data.value,
                phone: viewPhoneField.data.value
            }

            const serviceApplication = {
                name: 'application',
                fields: serviceFields
            }

            try {
                await this.services.application.submit(serviceApplication);

                this.stopToWatchUnstick();
                this.views.form.reset();
                this.views.html.lockScrolling();
                this.views.thanksPluck.activate();
                this.views.thanksModal.show();
            } catch (error) {
                let strategy = 'null';

                if (error instanceof InvalidFieldsException) {
                    strategy = 'invalid-fields';
                }

                switch (strategy) {
                    case 'invalid-fields': {
                        const invalidFields = error.fields;

                        const fieldToFocusPriority = {
                            name: 1,
                            phone: 2
                        };

                        let fieldToFocus = {
                            type: 'null'
                        };

                        invalidFields.forEach((invalidField, invalidFieldIndex) => {
                            const invalidFieldName = invalidField.name;
                            const reason = invalidField.reason;

                            switch (reason.type) {
                                case 'text': {
                                    const reasonText = reason.data.text;

                                    this.views.form.markFieldAsHavingError(invalidFieldName, reasonText);

                                    break;
                                }
                            }

                            const fieldPriority = fieldToFocusPriority[invalidField.name];
                            const toMakeFieldFocused =
                                fieldToFocus['type'] === 'null' ||
                                fieldPriority < fieldToFocus.priority;

                            if (toMakeFieldFocused) {
                                fieldToFocus = {
                                    type: 'field',
                                    name: invalidField.name,
                                    priority: fieldPriority
                                };
                            }
                        });

                        switch (fieldToFocus.type) {
                            case 'field': {
                                this.state.form.stopToClearErrorsOnInputFocus[fieldToFocus.name] = true;

                                const viewFieldName = fieldToFocus.name;

                                this.views.form.focusField(viewFieldName);


                                break;
                            }
                        }

                        break;
                    }
                }
            }
        }

        onThanksPluckViewClick() {
            this.views.thanksPluck.deactivate();
            this.views.thanksModal.hide();
            this.views.html.unlockScrolling();

            this.state.window.scrollY = window.scrollY;

            this.tryWatchUnstick();
        }

        onHeroViewClickAction() {
            this.stopToWatchUnstick();
            this.views.formModal.show();
            this.views.formPluck.activate();
            this.views.html.lockScrolling();
        }

        onFormModalViewClickAction() {
            this.tryWatchUnstick();
            this.views.formModal.hide();
            this.views.formPluck.deactivate();
            this.views.html.unlockScrolling();
        }

        onHamburgerButtonViewClick() {
            const prevNextStatus = {
                'inactive': 'active',
                'active': 'inactive'
            }
            const nextStatus = prevNextStatus[this.state.hamburger.activityStatus];

            switch (nextStatus) {
                case 'active': {
                    this.showMenu();
                    this.stopToWatchUnstick();

                    break;
                }
                case 'inactive': {
                    this.closeMenu();
                    this.tryWatchUnstick();

                    break;
                }
            }
        }

        onHeaderViewMouseEnter() {
            this.stopToWatchUnstick();
            this.views.window.removeEventListener('scroll', this.listeners.scrollHandleStick);
        }

        onHeaderViewMouseLeave() {
            this.listeners.scrollHandleStick = this.views.window.addEventListener('scroll', this.onWindowViewScrollHandleStick.bind(this));

            this.tryWatchUnstick();
        }

        onHeaderViewClickMenuItem(eventData) {
            switch (eventData.type) {
                case 'anchor': {
                    const anchorData = eventData.data
                    const isPageSection = anchorData.href.startsWith('#');

                    let strategy = 'null';
                    const toUsePageSectionStrategy = isPageSection;
                    if (toUsePageSectionStrategy) {
                        strategy = 'page-section';
                    }

                    switch (strategy) {
                        case 'page-section': {
                            const isHeaderStick = this.state.stick.isStick;

                            if (isHeaderStick) {
                                const idToNavigate = anchorData.href.slice(1);
                                this.views.nagivator.navigateHavingOffsetElement(
                                    idToNavigate,
                                    this.state.header.id
                                );
                            } else {
                                const idToNavigate = anchorData.href.slice(1);
                                this.views.nagivator.navigate(idToNavigate);
                            }

                            break;
                        }
                    }

                    break;
                }
            }
        }

        async onMenuViewClickMenuItem(eventData) {
            this.views.menu.highlightItem(eventData.data.identifier);

            await new Promise((resolve) => {
                setTimeout(resolve, 350);
            });
            const closeMenuPromise = this.closeMenu();
            this.views.menu.unHighlightAllItems();

            await closeMenuPromise;

            switch (eventData.type) {
                case 'anchor': {
                    const anchorData = eventData.data
                    const isPageSection = anchorData.href.startsWith('#');

                    let strategy = 'null';
                    const toUsePageSectionStrategy = isPageSection;
                    if (toUsePageSectionStrategy) {
                        strategy = 'page-section';
                    }

                    switch (strategy) {
                        case 'page-section': {
                            const isHeaderStick = this.state.stick.isStick;

                            if (isHeaderStick) {
                                const idToNavigate = anchorData.href.slice(1);
                                this.views.nagivator.navigateHavingOffsetElement(
                                    idToNavigate,
                                    this.state.header.id
                                );
                            } else {
                                const idToNavigate = anchorData.href.slice(1);
                                this.views.nagivator.navigate(idToNavigate);
                            }

                            break;
                        }
                    }

                    break;
                }
            }

            this.tryWatchUnstick();
        }

        onListViewEnterAction() {
            this.views.list.makeActionReversable();
        }

        onListViewClickAction() {
            this.views.list.focusAction();
        }

        async onListViewClickListItem(event, listItemId, href) {
            event.preventDefault();

            this.views.list.focusListItem(listItemId);

            let strategy = 'default';

            if (this.state.device.isTouch) {
                strategy = 'touch'
            }

            switch (strategy) {
                case 'touch': {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 400);
                    });

                    break;
                }
                default: {
                    break;
                }
            }

            const isPageSection = href.startsWith('#');

            let navigationStrategy = 'null';
            const toUsePageSectionStrategy = isPageSection;
            if (toUsePageSectionStrategy) {
                navigationStrategy = 'page-section';
            }

            switch (navigationStrategy) {
                case 'page-section': {
                    break;
                }
                default: {
                    window.location.href = href;

                    break;
                }
            }
        }

        async closeMenu() {
            const closeTimeout = 250;

            this.views.html.unlockScrolling();
            this.state.hamburger.activityStatus = 'inactive';
            this.state.menu.visibilityStatus = 'hide';
            this.state.hamburgerPluck.activityState = 'inactive';

            this.views.hamburgerButton.deactivateCross();
            this.views.hamburgerButton.activateLines();
            this.views.hamburgerButton.deactivate();
            this.views.menu.hide();
            this.views.hamburgerPluck.deactivate();

            return new Promise((resolve) => {
                setTimeout(resolve, closeTimeout);
            })
        }

        async showMenu() {
            this.views.html.lockScrolling();
            this.state.hamburger.activityStatus = 'active';
            this.state.menu.visibilityStatus = 'show';
            this.state.hamburgerPluck.activityState = 'active';

            this.views.hamburgerButton.activateCross();
            this.views.hamburgerButton.deactivateLines();
            this.views.hamburgerButton.activate();
            this.views.menu.show();
            this.views.hamburgerPluck.activate();
        }
    }

    const app = new App();
    app.run();
})();
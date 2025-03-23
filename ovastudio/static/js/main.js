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

    class MaskFieldView {
        constructor(containerId, inputId, maskId, maskSymbols, classes) {
            this.classes = {
                error: classes.error,
                inputError: classes.inputError,
                maskError: classes.maskError,
                hiddenMaskSymbol: classes.hiddenMaskSymbol,
                solidCaret: classes.solidCaret
            }
            this.ids = {
                container: containerId,
                input: inputId,
                mask: maskId
            }
            this.elements = {
                input: null,
                maskSymbols: new Map()
            }
            this.listeners = {
                input: [],
                keydown: [],
                keyup: [],
                focus: [],
                blur: [],
                updated: []
            }
            this.maskSymbolsIndexElementId = maskSymbols;
            this.maskSymbolsArrayOrderedByIndex = []
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        mount() {
            this.elements.mask = document.getElementById(this.ids.mask);
            this.elements.container = document.getElementById(this.ids.container);

            this.elements.input = document.getElementById(this.ids.input);

            this.elements.input.addEventListener('input', (event) => {
                const eventData = {
                    value: this.elements.input.value
                };

                this.listeners.input.forEach((listener) => listener(event, eventData))
            });
            this.elements.input.addEventListener('keydown', (event) => {
                const eventData = {
                    selectionStart: event.currentTarget.selectionStart,
                    selectionEnd: event.currentTarget.selectionEnd,
                    value: this.elements.input.value
                }

                this.listeners.keydown.forEach((listener) => listener(event, eventData));
            });

            this.elements.input.addEventListener('keyup', (event) => {
                const eventData = {
                    selectionStart: event.currentTarget.selectionStart,
                    selectionEnd: event.currentTarget.selectionEnd
                }

                this.listeners.keyup.forEach((listener) => listener(event, eventData));
            });

            this.elements.input.addEventListener('focus', (event) => {
                this.listeners.focus.forEach((listener) => listener());
            });

            this.elements.input.addEventListener('blur', (event) => {
                this.listeners.blur.forEach((listener) => listener());
            });

            const maskSymbolsArray = [];
            this.maskSymbolsIndexElementId.forEach((symbolElementId, symbolIndex) => {
                const record = {
                    elementId: symbolElementId,
                    index: symbolIndex
                }
                maskSymbolsArray.push(record);

                const symbolElement = document.getElementById(symbolElementId);
                this.elements.maskSymbols.set(symbolElementId, symbolElement);
            });
            maskSymbolsArray.sort((left, right) => {
                return left.index - right.index
            });
            this.maskSymbolsArrayOrderedByIndex = maskSymbolsArray;
        }

        showError(errorMessage) {
            this.elements.mask.classList.add(this.classes.maskError);

            const id = this.ids.container;

            const containerElement = this.elements.container;

            this.elements.input.classList.add(this.classes.inputError);

            const prevErrorElements = document.querySelectorAll(`[data-field-error="${id}"]`);
            Array.from(prevErrorElements).forEach((prevErrorElement) => {
                prevErrorElement.parentNode.removeChild(prevErrorElement);
            });

            const errorElement = document.createElement('div');
            errorElement.setAttribute('data-field-error', id);
            errorElement.classList.add(this.classes.error);
            errorElement.textContent = errorMessage;

            containerElement.append(errorElement);
        }

        clearErrors() {
            this.elements.mask.classList.remove(this.classes.maskError);

            const id = this.ids.container;

            const containerElement = this.elements.container;

            this.elements.input.classList.remove(this.classes.inputError);

            const prevErrorElements = document.querySelectorAll(`[data-field-error="${id}"]`);
            Array.from(prevErrorElements).forEach((prevErrorElement) => {
                prevErrorElement.parentNode.removeChild(prevErrorElement);
            });

        }

        focus() {
            this.elements.input.focus();
        }

        reset() {
            this.elements.input.value = '';
        }

        collect() {
            const fieldElement = this.elements.input;

            return {
                type: 'name.value',
                data: {
                    name: this.elements.input.name,
                    value: this.elements.input.value
                }
            }
        }

        updateValue(value) {
            this.elements.input.value = value;

            this.listeners.updated.forEach((listener) => {
                listener(value);
            })
        }

        getValue() {
            return this.elements.input.value;
        }

        getSelectionStart() {
            return this.elements.input.selectionStart;
        }

        getSelectionEnd() {
            return this.elements.input.selectionEnd;
        }

        replaceMaskSymbolAtPositionWith(position, replacement) {
            const elementId = this.maskSymbolsIndexElementId.get(position);
            const element = this.elements.maskSymbols.get(elementId);

            element.textContent = replacement;
        }

        moveCaretToPosition(position) {
            this.elements.input.selectionStart = position;
            this.elements.input.selectionEnd = position;
        }

        showCaret() {
            this.elements.input.classList.add(this.classes.solidCaret);
        }

        hideCaret() {
            this.elements.input.classList.remove(this.classes.solidCaret);
        }

        moveCaretToEnd() {
            const value = this.elements.input.value;

            this.elements.input.selectionStart =
                this.elements.input.selectionEnd =
                    this.elements.input.value.length;
        }

        hideFirstNMaskSymbols(n) {
            for (let index = 1; index <= n; index++) {
                const symbolElementId = this.maskSymbolsIndexElementId.get(index);
                const symbolElement = this.elements.maskSymbols.get(symbolElementId);

                symbolElement.classList.add(this.classes.hiddenMaskSymbol);
            }
        }

        hideMaskSymbolAt(position) {
            const symbolElementId = this.maskSymbolsIndexElementId.get(position);
            const symbolElement = this.elements.maskSymbols.get(symbolElementId);

            symbolElement.classList.add(this.classes.hiddenMaskSymbol);
        }

        showMaskSymbolAt(position) {
            const symbolElementId = this.maskSymbolsIndexElementId.get(position);
            const symbolElement = this.elements.maskSymbols.get(symbolElementId);

            symbolElement.classList.remove(this.classes.hiddenMaskSymbol);
        }

        showMaskSymbolAtIndex(index) {
            const symbolElementId = this.maskSymbolsIndexElementId.get(index);
            const symbolElement = this.elements.maskSymbols.get(symbolElementId);

            symbolElement.classList.remove(this.classes.hiddenMaskSymbol);
        }
    }

    class InputFieldView {
        constructor(containerId, inputId, classes) {
            this.ids = {
                container: containerId,
                input: inputId
            }
            this.listeners = {
                focus: [],
                input: [],
                blur: []
            };
            this.classes = {
                inputError: classes.inputError,
                error: classes.error
            }
            this.elements = {
                input: null,
                container: null
            }
        }

        mount() {
            this.elements.input = document.getElementById(this.ids.input);
            this.elements.container = document.getElementById(this.ids.container);

            this.elements.input.addEventListener('input', (event) => {
                const eventData = {
                    value: this.elements.input.value
                }

                this.listeners.input.forEach((listener) => {
                    listener(eventData);
                })
            })
        }

        getValue() {
            return this.elements.input.value;
        }

        collect() {
            const fieldElement = this.elements.input;

            return {
                type: 'name.value',
                data: {
                    name: this.elements.input.name,
                    value: this.elements.input.value
                }
            }
        }

        focus() {
            this.elements.input.focus();
        }

        reset() {
            this.elements.input.value = '';
        }

        showError(errorMessage) {
            const id = this.ids.container;

            const containerElement = this.elements.container;

            this.elements.input.classList.add(this.classes.inputError);

            const prevErrorElements = document.querySelectorAll(`[data-field-error="${id}"]`);
            Array.from(prevErrorElements).forEach((prevErrorElement) => {
                prevErrorElement.parentNode.removeChild(prevErrorElement);
            });

            const errorElement = document.createElement('div');
            errorElement.setAttribute('data-field-error', id);
            errorElement.classList.add(this.classes.error);
            errorElement.textContent = errorMessage;

            containerElement.append(errorElement);
        }

        clearErrors() {
            const id = this.ids.container;

            const containerElement = this.elements.container;

            this.elements.input.classList.remove(this.classes.inputError);

            const prevErrorElements = document.querySelectorAll(`[data-field-error="${id}"]`);
            Array.from(prevErrorElements).forEach((prevErrorElement) => {
                prevErrorElement.parentNode.removeChild(prevErrorElement);
            });

        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
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
        constructor(boxId, leftArrowId, rightArrowId, indexSlides) {
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
            this.indexSlides = indexSlides;
            this.slidesIndexes = new Map();
            this.state = {
                slide: 1,

                scrollBlocked: false
            }
            this.slideIdSlideNumber = new Map();
            this.slidesBoundaries = new Map();

            this.boxLeftPadding = 0;
            this.boxWidth = 0;
        }

        setMoveHandler(handler) {
            this.moveHandler = handler;
        }

        mount() {
            this.elements.box = document.getElementById(this.ids.box);

            this.indexSlides.forEach((id, index) => {
                this.slidesIndexes.set(id, index);
            } );

            this.update();

            this.elements.leftArrow = document.getElementById(this.ids.leftArrow);
            this.elements.leftArrow.addEventListener('click', () => {
                this.listeners.clickLeftArrow.forEach((listener) => listener());
            });

            this.elements.rightArrow = document.getElementById(this.ids.rightArrow);
            this.elements.rightArrow.addEventListener('click', () => {
                this.listeners.clickRightArrow.forEach((listener) => listener());
            });
        }

        update() {
            this.boxLeftPadding = window
                .getComputedStyle(this.elements.box, null)
                .getPropertyValue('padding-left');
            this.boxLeftPadding = parseFloat(this.boxLeftPadding);
            this.boxLeftPadding = Math.ceil(this.boxLeftPadding);

            this.boxWidth = this.elements.box.offsetWidth;

            this.indexSlides.forEach((id, index) => {
                const element = document.getElementById(id);

                this.slidesBoundaries.set(id, {
                    startOffset: element.offsetLeft,
                    endOffset: element.offsetLeft + element.offsetWidth
                })
            } );
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        moveNext() {
            const scrollLeft = this.elements.box.scrollLeft;

            for (const [slideElementId, slideBoundaries] of this.slidesBoundaries) {
                let hasVisiblePart =
                    (scrollLeft > slideBoundaries.startOffset) &&
                    (slideBoundaries.endOffset > scrollLeft);

                const toContinue = ! hasVisiblePart
                if (toContinue) {
                    continue;
                }

                const slideIndex = this.slidesIndexes.get(slideElementId);

                const nextAfterOneHasVisiblePartIndex = slideIndex + 1;
                const hasNextAfterOneHasVisiblePart = this.indexSlides.has(nextAfterOneHasVisiblePartIndex);
                if (hasNextAfterOneHasVisiblePart) {
                    const nextAfterOneHasVisiblePartSlideElementId = this.indexSlides.get(nextAfterOneHasVisiblePartIndex);
                    const nextAfterOneHasVisiblePartBoundaries = this.slidesBoundaries.get(nextAfterOneHasVisiblePartSlideElementId);
                    const distanceBetweenOneHavingVisiblePartAndNext =  nextAfterOneHasVisiblePartBoundaries.startOffset - slideBoundaries.endOffset;
                    const shouldIgnore = distanceBetweenOneHavingVisiblePartAndNext <= this.boxLeftPadding;
                    if (shouldIgnore) {
                        continue;
                    }
                }






                const relatedSlideIndex = this.slidesIndexes.get(slideElementId);
                const nextSlideIndex = relatedSlideIndex + 1;
                const hasNextSlide = this.indexSlides.has(nextSlideIndex);
                const toReturn = ! hasNextSlide;
                if (toReturn) {
                    return;
                }

                const nextSlideElementId = this.indexSlides.get(nextSlideIndex);
                const nextSlideElement = document.getElementById(nextSlideElementId);

                const correction = this.boxLeftPadding;
                this.elements.box.scrollLeft = nextSlideElement.offsetLeft - correction;

                return;
            }


            let relatedSlide;
            for (const [slideElementId, slideBoundaries] of this.slidesBoundaries) {
                const toContinue = slideBoundaries.startOffset < scrollLeft;
                if (toContinue) {
                    continue;
                }

                if (relatedSlide) {
                    const hasSmallerStartOffset = slideBoundaries.startOffset < relatedSlide.boundaries.startOffset;
                    const toContinue = ! hasSmallerStartOffset;
                    if (toContinue) {
                        continue;
                    }

                    relatedSlide = {
                        elementId: slideElementId,
                        boundaries: slideBoundaries
                    }
                } else {
                    relatedSlide = {
                        elementId: slideElementId,
                        boundaries: slideBoundaries
                    }
                }
            }

            if (relatedSlide) {
                const slideIndex = this.slidesIndexes.get(relatedSlide.elementId);
                const nextSlideIndex = slideIndex + 1;
                const hasNextSlide = this.indexSlides.has(nextSlideIndex);

                if (hasNextSlide) {
                    const nextSlideElementId = this.indexSlides.get(nextSlideIndex);
                    const nextSlideElement = document.getElementById(nextSlideElementId);

                    const correction = this.boxLeftPadding;

                    this.elements.box.scrollLeft = nextSlideElement.offsetLeft - correction;
                }

                return;
            }
        }

        movePrev() {
            const scrollLeft = this.elements.box.scrollLeft;

            const shouldMoveToStart = scrollLeft <= this.boxLeftPadding;
            if (shouldMoveToStart) {
                this.elements.box.scrollLeft = 0;

                return;
            }

            for (const [slideElementId, slideBoundaries] of this.slidesBoundaries) {
                const hasVisiblePart =
                    (slideBoundaries.startOffset < scrollLeft) &&
                    (slideBoundaries.endOffset > scrollLeft);

                const toContinue = ! hasVisiblePart;
                if (toContinue) {
                    continue;
                }

                const slideElement = document.getElementById(slideElementId);
                const correction = this.boxLeftPadding;

                this.elements.box.scrollLeft = slideElement.offsetLeft - correction;

                return;
            }

            let relatedSlide;

            for (const [slideElementId, slideBoundaries] of this.slidesBoundaries) {
                const isRightSlide = slideBoundaries.startOffset > scrollLeft;
                const toContinue = ! isRightSlide;
                if (toContinue) {
                    continue;
                }

                if (relatedSlide) {
                    const toMakeRelated = slideBoundaries.startOffset < relatedSlide.boundaries.startOffset;
                    if (toMakeRelated) {
                        relatedSlide = {
                            elementId: slideElementId,
                            boundaries: slideBoundaries
                        }
                    }
                } else {
                    relatedSlide = {
                        elementId: slideElementId,
                        boundaries: slideBoundaries
                    }
                }
            }

            if (!relatedSlide) {
                return;
            }

            const relatedSlideIndex = this.slidesIndexes.get(relatedSlide.elementId);
            const prevSlideIndex = relatedSlideIndex - 1;
            const hasSlide = prevSlideIndex > 0;

            const toReturn = ! hasSlide;
            if (toReturn) {
                return;
            }

            const slideElementId = this.indexSlides.get(prevSlideIndex);
            const slideElement = document.getElementById(slideElementId);
            const correction = this.boxLeftPadding;

            this.elements.box.scrollLeft = slideElement.offsetLeft - correction;
        }

        focusSlide(slideId) {
            const element = document.getElementById(slideId);

            element.focus();
        }
    }

    class FormView {
        constructor(formId) {
            this.ids = {
                form: formId
            }
            this.elements = {
                form: null
            };
            this.listeners = {
                submit: [],
            };
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener);
        }

        mount() {
            this.elements.form = document.getElementById(this.ids.form);
            this.elements.form.addEventListener('submit', (event) => {
                event.preventDefault();

                this.listeners.submit.forEach((listener) => {
                    listener();
                });
            });
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
        constructor(menuId, menuItemsIds) {
            this.ids = {
                menu: menuId,
                menuItems: menuItemsIds
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

        mount() {
            this.elements.menu = document.getElementById(this.ids.menu);

            this.ids.menuItems.forEach((menuItemId) => {
                const element = document.getElementById(menuItemId);
                element.addEventListener('click', (event) => {
                    event.preventDefault();

                    const menuItemElement = event.currentTarget;
                    const identifier = menuItemElement.id;

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
                });
            })
        }

        focusMenuItem(menuItemId) {
            const element = document.getElementById(menuItemId);

            element.focus();
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

        navigateInstantlyHavingOffsetElement(id, offsetElementId) {
            switch (this.browser) {
                case 'firefox': {
                    const offsetElement = document.getElementById(offsetElementId);
                    const element = document.getElementById(id);

                    const endY = window.scrollY + element.getBoundingClientRect().top - offsetElement.offsetHeight;

                    const nextY = endY;

                    window.scrollTo({
                        top: nextY,
                        behavior: "instant"
                    });

                    break;
                }
                default: {
                    const offsetElement = document.getElementById(offsetElementId);
                    const element = document.getElementById(id);

                    const y = window.scrollY + element.getBoundingClientRect().top - offsetElement.offsetHeight;

                    window.scroll({
                        top: y,
                        behavior: 'instant'
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

        navigateInstantly(id) {
            switch (this.browser) {
                case 'firefox': {
                    const element = document.getElementById(id);

                    const endY = window.scrollY + element.getBoundingClientRect().top;
                    const nextY = endY;

                    window.scrollTo({
                        top: nextY,
                        behavior: "instant"
                    });

                    break;
                }
                default: {
                    const element = document.getElementById(id);

                    const y = window.scrollY + element.getBoundingClientRect().top;

                    window.scrollTo({
                        top: y,
                        behavior: "instant"
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

        makeHover() {
            document.body.classList.add('body-c_is-hover');
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
        constructor(windowView, documentView, state, navigatorView, deviceService) {
            this.viewModelState = {

            }
            this.state = state;
            this.deviceService = deviceService;
            this.views = {
                window: windowView,
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
            this.views.window.addEventListener('resize', this.onWindowViewResize.bind(this));

            this.views.cards.mount();
        }

        onWindowViewResize() {
            this.views.cards.update();
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

        onClickLeftArrow() {
            this.views.cards.movePrev();
        }

        onClickRightArrow() {
            this.views.cards.moveNext();
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

    class FormViewModel {
        constructor(applicationService, eventBus) {
            this.services = {
                application: applicationService
            }
            this.eventBus = eventBus;
            this.state = {
                fields: {
                    name: {
                        validateOnTheFly: false
                    },
                    phone: {
                        validateOnTheFly: false
                    }
                }
            };
            this.views = {
                form: null,
                fields: {
                    phone: null,
                    name: null
                }
            };
            this.viewModels = {
                fields: {
                    phone: null
                }
            }
        }

        model() {
            this.eventBus.addEventListener('contact-form-is-submitted', this.onContactFormSubmitted.bind(this));

            const phoneFieldViewMaskSymbols = new Map();
            const symbolsCount = 18;
            for (let symbolIndex = 1; symbolIndex <= 18; symbolIndex++) {
                phoneFieldViewMaskSymbols.set(symbolIndex, `form-phone-mask-symbol-${symbolIndex}`);
            }

            this.views.fields.phone = new MaskFieldView(
                'phone-form-field',
                'phone-form-field-input',
                'phone-form-field-mask',
                phoneFieldViewMaskSymbols,
                {
                    hiddenMaskSymbol: 'form-c-form__mask-field-mask-symbol_hidden',
                    solidCaret: 'form-c-form__mask-field-input_caret-solid',
                    error: 'form-c-form__mask-field-error',
                    inputError: 'form-c-form__mask-field-input_invalid',
                    maskError: 'form-c-form__mask-field-mask_error'
                }
            );
            this.views.fields.phone.addEventListener('updated', this.onPhoneFieldViewUpdated.bind(this));

            this.viewModels.fields.phone = new PhoneMaskFieldViewModel(
                this.views.fields.phone,
                this.eventBus
            );
            this.viewModels.fields.phone.model();

            this.views.fields.name = new InputFieldView(
                'name-form-field',
                'name-form-field-input',
                {
                    error: 'form-c-form__text-field-error',
                    inputError: 'form-c-form__text-field-input_invalid'
                }
            )
            this.views.fields.name.addEventListener('input', this.onNameFieldViewInput.bind(this));
            this.views.fields.name.mount();

            this.views.form = new FormView('form');
            this.views.form.addEventListener('submit', this.onFormViewSubmit.bind(this));
            this.views.form.mount();
        }

        onContactFormSubmitted() {
            for (let fieldName in this.views.fields) {
                switch(fieldName) {
                    case 'name': {
                        const fieldView = this.views.fields[fieldName];
                        fieldView.reset();

                        break;
                    }
                    case 'phone': {
                        this.viewModels.fields.phone.reset();

                        break;
                    }
                }
            }
        }

        onPhoneFieldViewUpdated(value) {
            if (this.state.fields.phone.validateOnTheFly) {
                const pattern = /\+38\(0\d{2}\)\s\d{3}\s\d{2}\s\d{2}/;
                const isValid = pattern.test(value);

                if (isValid) {
                    this.state.fields.phone.validateOnTheFly = false;
                    this.views.fields.phone.clearErrors();
                }
            }
        }

        onNameFieldViewInput() {
            if (this.state.fields.name.validateOnTheFly) {
                const value = this.views.fields.name.getValue();
                const isValid = value.length > 0;

                if (isValid) {
                    this.state.fields.name.validateOnTheFly = false;
                    this.views.fields.name.clearErrors();
                }
            }
        }

        async onFormViewSubmit() {
            for (let fieldName in this.views.fields) {
                const fieldView = this.views.fields[fieldName];

                fieldView.clearErrors();
            }

            const viewNameField = this.views.fields.name.collect();
            const viewPhoneField = this.views.fields.phone.collect();

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

                this.eventBus.notify('contact-form-is-submitted');
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
                            const viewFieldName = invalidField.name;
                            const invalidFieldName = invalidField.name;
                            const stateFieldName = invalidField.name;
                            const reason = invalidField.reason;

                            switch (reason.type) {
                                case 'text': {
                                    const reasonText = reason.data.text;

                                    this.views.fields[viewFieldName].showError(reasonText);
                                    this.state.fields[stateFieldName].validateOnTheFly = true;

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
                                const viewFieldName = fieldToFocus.name;

                                this.views.fields[viewFieldName].focus();

                                break;
                            }
                        }

                        break;
                    }
                }
            }
        }
    }

    class ModalFormViewModel {
        constructor(applicationService, eventBus) {
            this.services = {
                application: applicationService
            }
            this.eventBus = eventBus;
            this.state = {
                fields: {
                    name: {
                        validateOnTheFly: false
                    },
                    phone: {
                        validateOnTheFly: false
                    }
                }
            };
            this.views = {
                form: null,
                fields: {
                    phone: null,
                    name: null
                }
            };
            this.viewModels = {
                fields: {
                    phone: null
                }
            }
        }

        model() {
            return;

            this.eventBus.addEventListener('modal-form-is-submitted', this.onBusModalFormSubmitted.bind(this));

            const phoneFieldViewMaskSymbols = new Map();
            const symbolsCount = 18;
            for (let symbolIndex = 1; symbolIndex <= symbolsCount; symbolIndex++) {
                phoneFieldViewMaskSymbols.set(symbolIndex, `modal-form-phone-mask-symbol-${symbolIndex}`);
            }

            this.views.fields.phone = new MaskFieldView(
                'phone-modal-form-field',
                'phone-modal-form-field-input',
                'phone-modal-form-field-mask',
                phoneFieldViewMaskSymbols,
                {
                    hiddenMaskSymbol: 'form-2-c__mask-field-mask-symbol_hidden',

                    solidCaret: 'form-c-form__mask-field-input_caret-solid',

                    error: 'form-c-form__mask-field-error',
                    inputError: 'form-2-c__mask-field-input_invalid',
                    maskError: 'form-c-form__mask-field-mask_error'
                }
            );
            this.views.fields.phone.addEventListener('updated', this.onPhoneFieldViewUpdated.bind(this));




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

            this.views.form = new FormView('modal-form', modalFormViewFields, modalFormViewClasses);
            this.views.form.addEventListener('submit', this.onModalFormViewSubmit.bind(this));
            this.views.form.addEventListener('focusInputField', this.onModalFormViewFocusInputField.bind(this));
            this.views.form.addEventListener('blurInputField', this.onModalFormViewBlurInputField.bind(this));
            this.views.form.addEventListener('inputInputField', this.onModalFormViewInputInputField.bind(this));
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

                this.eventBus.notify('modal-form-is-submitted');
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

        onBusModalFormSubmitted() {
            for (let fieldName in this.views.fields) {
                switch(fieldName) {
                    case 'name': {
                        const fieldView = this.views.fields[fieldName];
                        fieldView.reset();

                        break;
                    }
                    case 'phone': {
                        this.viewModels.fields.phone.reset();

                        break;
                    }
                }
            }
        }
    }

    class PhoneMaskFieldViewModel {
        constructor(maskFieldView, eventBus) {
            this.state = {
                fields: {
                    phone: {
                        basicMask: new Map(),

                        activeSymbolsCount: 5,
                        value: '+38(0',
                        basicValue: '+38(0',
                        length: 18,
                        selectionStart: 5,
                        selectionEnd: 5,

                        prevValue: '+38(0',
                        nextValue: '+38(0',
                        prevSelectionStart: 5,
                        nextSelectionStart: 5,
                        initialValue: '+38(0',
                        maxValueLength: 18
                    }
                }
            }
            this.eventBus = eventBus;
            this.views = {
                phone: maskFieldView
            }
        }

        model() {
            this.state.fields.phone.basicMask.set(1, {
                value: '+',
                visibility: 'hidden'
            });
            this.state.fields.phone.basicMask.set(2, {
                value: '3',
                visibility: 'hidden'
            });
            this.state.fields.phone.basicMask.set(3, {
                value: '8',
                visibility: 'hidden'
            });
            this.state.fields.phone.basicMask.set(4, {
                value: '(',
                visibility: 'hidden'
            });
            this.state.fields.phone.basicMask.set(5, {
                value: '0',
                visibility: 'hidden'
            });
            this.state.fields.phone.basicMask.set(6, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(7, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(8, {
                value: ')',
                visibility: 'visible'
            });this.state.fields.phone.basicMask.set(9, {
                value: ' ',
                visibility: 'visible'
            });this.state.fields.phone.basicMask.set(10, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(11, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(12, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(13, {
                value: ' ',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(14, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(15, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(16, {
                value: ' ',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(17, {
                value: '_',
                visibility: 'visible'
            });
            this.state.fields.phone.basicMask.set(18, {
                value: '_',
                visibility: 'visible'
            });







            this.views.phone.addEventListener('input', this.onPhoneFieldViewInput.bind(this));
            this.views.phone.addEventListener('keydown', this.onPhoneFieldViewKeyDown.bind(this));
            this.views.phone.addEventListener('keyup', this.onPhoneFieldViewKeyUp.bind(this));
            this.views.phone.addEventListener('focus', this.onPhoneFieldViewFocus.bind(this));
            this.views.phone.addEventListener('blur', this.onPhoneFieldViewBlur.bind(this));

            this.views.phone.mount();
        }

        onPhoneFieldViewKeyDown(event, eventData) {
            this.state.fields.phone.prevValue = eventData.value;
            this.state.fields.phone.prevSelectionStart = this.views.phone.getSelectionStart();
        }

        reset() {
            const nextValue = this.state.fields.phone.basicValue;
            this.views.phone.updateValue(nextValue);

            this.state.fields.phone.basicMask.forEach((descriptor, index) => {
                switch (descriptor.visibility) {
                    case 'hidden': {
                        const position = index;
                        this.views.phone.hideMaskSymbolAt(position);

                        break;
                    }
                    case 'visible': {
                        const position = index;
                        this.views.phone.showMaskSymbolAt(position);


                        break;
                    }
                }

                const position = index;
                this.views.phone.replaceMaskSymbolAtPositionWith(position, descriptor.value);
            })
        }

        onPhoneFieldViewKeyUp(event, eventData) {
        }

        onPhoneFieldViewInput(event, eventData) {
            const prevValue = this.state.fields.phone.prevValue;
            let nextValue = eventData.value;

            console.log(`Input. Prev: ${prevValue}. Next: ${nextValue}`);

            const nextSelectionStart = this.views.phone.getSelectionStart();
            const prevSelectionStart = this.state.fields.phone.prevSelectionStart;

            console.log(`Prev selection start: ${prevSelectionStart}. Next selection start: ${nextSelectionStart}`);


            const strategyDescriptor = {
                nextValue: nextValue,
                prevValue: prevValue,
                prevSelectionStart: prevSelectionStart,
                nextSelectionStart: nextSelectionStart
            }
            const nextValueStrategy = this.defineNextValueStrategy(strategyDescriptor);

            console.log(nextValueStrategy);


            switch(nextValueStrategy) {
                case 'set-initial-value': {
                    console.log('Set initial value');

                    nextValue = this.state.fields.phone.basicValue;

                    nextValue = this.testNormalizePhoneField(nextValue);
                    console.log(`Normalized value: ${nextValue}`);

                    break;
                }
                case 'has-no-place': {
                    nextValue = prevValue;

                    nextValue = this.testNormalizePhoneField(nextValue);
                    console.log(`Normalized value: ${nextValue}`);

                    break;
                }
                case 'remove-symbol': {
                    console.log('Remove symbol');

                    const indexToShowMaskSymbolAt = prevSelectionStart;
                    this.views.phone.showMaskSymbolAtIndex(indexToShowMaskSymbolAt);
                    this.views.phone.replaceMaskSymbolAtPositionWith(indexToShowMaskSymbolAt, '_');

                    switch(nextSelectionStart) {
                        case 16: {
                            this.views.phone.moveCaretToPosition(15);

                            break;
                        }
                    }

                    break;
                }
                case 'append-symbol': {
                    console.log('Append symbol');

                    const allowedSymbols = new Map();

                    allowedSymbols.set("0", true);
                    allowedSymbols.set("1", true);
                    allowedSymbols.set("2", true);
                    allowedSymbols.set("3", true);
                    allowedSymbols.set("4", true);
                    allowedSymbols.set("5", true);
                    allowedSymbols.set("6", true);
                    allowedSymbols.set("7", true);
                    allowedSymbols.set("8", true);
                    allowedSymbols.set("9", true);
                    allowedSymbols.set("0", true);

                    // const prevValueLength = prevValue.length;
                    // const nextValueLength = nextValue.length;
                    // const symbolsToAppendCount = nextValueLength - prevValueLength;
                    // const newSymbols = nextValue.substring(nextValue.length - symbolsToAppendCount);

                    const symbolPosition = nextValue.length - 1;
                    const symbol = nextValue.charAt(symbolPosition);
                    const allowed = allowedSymbols.has(symbol);

                    const toRemove = ! allowed;
                    if (toRemove) {
                        console.log('Append.Remove symbol');
                        nextValue = nextValue.substring(0, nextValue.length - 1);
                    }

                    nextValue = this.testNormalizePhoneField(nextValue);
                    console.log(`Normalized value: ${nextValue}`);

                    break;
                }
            }


            this.views.phone.updateValue(nextValue);

            for (let index = 0; index < nextValue.length; index++) {
                const replacement = nextValue.charAt(index);
                const position = index + 1;
                this.views.phone.replaceMaskSymbolAtPositionWith(position, replacement);
            }

            const symbolsToHideCount = nextValue.length;
            this.views.phone.hideFirstNMaskSymbols(symbolsToHideCount);
        }


        testNormalizePhoneField(nextValue) {
            let normalizedValue;

            if (nextValue.length === 7) {
                return `${nextValue}) `;
            }

            if(nextValue.length === 12) {
                return `${nextValue} `
            }

            if(nextValue.length === 15) {
                return `${nextValue} `
            }

            return nextValue;
        }

        defineNextValueStrategy(descriptor) {
            const toSetInitialValueStrategy =
                descriptor.nextValue.length < this.state.fields.phone.basicValue.length;
            if (toSetInitialValueStrategy) {
                return 'set-initial-value';
            }

            const hasNoPlace = descriptor.nextValue.length > this.state.fields.phone.maxValueLength;
            if (hasNoPlace) {
                return 'has-no-place';
            }

            const toRemove = (descriptor.nextSelectionStart - descriptor.prevSelectionStart) === -1;
            if (toRemove) {
                return 'remove-symbol';
            }

            const toAppend = (descriptor.nextSelectionStart - descriptor.prevSelectionStart) === 1;
            if (toAppend) {
                return 'append-symbol';
            }
        }

        onPhoneFieldViewBlur() {
            console.log('Hide caret');

            this.views.phone.hideCaret();
        }

        onPhoneFieldViewFocus() {
            setTimeout(() => {
                const minSelectionStart = this.state.fields.phone.basicValue.length;
                const selectionStart = this.views.phone.getSelectionStart();

                const toMoveToMinPosition = selectionStart < minSelectionStart;
                if (toMoveToMinPosition) {
                    console.log(`Move caret to position ${selectionStart}`);

                    const caretPosition = minSelectionStart;
                    this.views.phone.moveCaretToPosition(caretPosition);
                }

                setTimeout(() => {
                    this.views.phone.showCaret();
                }, 0);

            }, 0);
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

            const phonePattern = /\+38\(0\d{2}\)\s\d{3}\s\d{2}\s\d{2}/;
            const isValidPhone = (phonePattern.test(phone));

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

    class EventBus {
        constructor() {
            this.listeners = {
                'contact-form-is-submitted': [],
                'modal-form-is-submitted': []
            }
        }

        addEventListener(event, listener) {
            this.listeners[event].push(listener)
        }

        notify(event) {
            this.listeners[event].forEach((listener) => {
                listener();
            });
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
            };
            this.eventBus = new EventBus()
        }

        model() {
            document.fonts.ready.then(() => {
                const loadingPluckView = new LoadingPluckView('loading-pluck');

                loadingPluckView.remove();
            });

            this.eventBus.addEventListener('contact-form-is-submitted', this.onEventBusContactFormSubmitted.bind(this));
            this.eventBus.addEventListener('modal-form-is-submitted', this.onEventBusModalFormSubmitted.bind(this));

            this.views.meta = new MetaView();
            this.views.meta.updateContent('viewport-meta-tag', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

            this.state.device.isTouch = this.services.device.isTouchDevice();

            this.views.html = new HTMLComponentView();
            this.views.hero = new HeroComponentView('hero-canvas', 'hero-action', 'hero-action-2');
            this.views.hero.addEventListener('clickAction', this.onHeroViewClickAction.bind(this));

            this.views.window = new WindowComponentView();
            this.views.window.addEventListener('resize', this.onWindowViewResize.bind(this));

            this.viewModels.form = new FormViewModel(this.services.application, this.eventBus);
            this.viewModels.form.model();

            this.viewModels.modalForm = new ModalFormViewModel(this.services.application, this.eventBus);
            this.viewModels.modalForm.model();


            const menuViewItemsIds = [
                'menu-item-1',
                'menu-item-2',
                'menu-item-3',
                'menu-item-4',
                'menu-item-5',
            ]
            this.views.menu = new MenuComponentView('menu', menuViewItemsIds);
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
            const toMarkDocumentViewAsHover = ! this.state.device.isTouch;
            if (toMarkDocumentViewAsHover) {
                this.views.document.makeHover();
            }

            this.viewModels.cards = new CardsComponentViewModel(this.views.window, this.views.document, this.state, this.views.nagivator, this.services.device);
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
            // this.views.modalForm.mount();
            this.views.window.mount();

            this.initStick();
        }

        onEventBusContactFormSubmitted() {
            this.stopToWatchUnstick();
            this.views.html.lockScrolling();
            this.views.thanksPluck.activate();
            this.views.thanksModal.show();
        }

        onEventBusModalFormSubmitted() {
            this.views.formModal.hide();
            this.views.formPluck.deactivate();
            this.views.html.lockScrolling();
            this.views.thanksPluck.activate();
            this.views.thanksModal.show();
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
            this.views.menu.focusMenuItem(eventData.data.identifier);

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
                                this.views.nagivator.navigateInstantlyHavingOffsetElement(
                                    idToNavigate,
                                    this.state.header.id
                                );
                            } else {
                                const idToNavigate = anchorData.href.slice(1);
                                this.views.nagivator.navigateInstantly(idToNavigate);
                            }

                            break;
                        }
                    }

                    break;
                }
            }

            this.closeMenu();

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
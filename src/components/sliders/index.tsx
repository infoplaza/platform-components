import React from 'react'

interface ThumbProps {
    key: string
    className: string
    style: React.CSSProperties
    onMouseDown: (e: React.MouseEvent) => void
    onTouchStart: (e: React.TouchEvent) => void
    onFocus: (e: React.FocusEvent) => void
    tabIndex: number
    role: string
    'aria-orientation': 'horizontal' | 'vertical'
    'aria-valuenow': number
    'aria-valuemin': number
    'aria-valuemax': number
    'aria-label'?: string | string[]
    'aria-labelledby'?: string | string[]
    'aria-disabled': boolean
    'aria-valuetext'?: string
    ref?: (r: HTMLDivElement | null) => void
}

interface ThumbState {
    index: number
    value: number | number[]
    valueNow: number
}

interface TrackProps {
    key: string
    className: string
    style: React.CSSProperties
}

interface TrackState {
    index: number
    value: number | number[]
}

interface MarkProps {
    key: number | string
    className: string
    style: React.CSSProperties
}

interface ReactSliderProps {
    min?: number
    max?: number
    step?: number
    pageFn?: (step: number) => number
    minDistance?: number
    defaultValue?: number | number[]
    value?: number | number[]
    orientation?: 'horizontal' | 'vertical'
    className?: string
    thumbClassName?: string
    thumbActiveClassName?: string
    trackClassName?: string
    markClassName?: string
    withTracks?: boolean
    pearling?: boolean
    disabled?: boolean
    snapDragDisabled?: boolean
    invert?: boolean
    marks?: number[] | boolean | number
    moveDownByStep?: () => void
    moveUpByStep?: () => void
    onBeforeChange?: (value: number | number[], index?: number) => void
    onChange?: (value: number | number[], index?: number) => void
    onAfterChange?: (value: number | number[], index?: number) => void
    onSliderClick?: (value: number) => void
    renderThumb?: (props: ThumbProps, state: ThumbState) => React.ReactElement
    renderTrack?: (props: TrackProps, state: TrackState) => React.ReactElement
    renderMark?: (props: MarkProps) => React.ReactElement
    ariaLabel?: string | string[]
    ariaLabelledby?: string | string[]
    ariaValuetext?: string | ((state: ThumbState) => string)
}

interface ReactSliderState {
    index: number
    upperBound: number
    sliderLength: number
    thumbSize?: number
    value: number[]
    zIndices: number[]
    startValue?: number
    startPosition?: number
    pending?: boolean
}

/**
 * To prevent text selection while dragging.
 * http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
 */
function pauseEvent(e: Event) {
    if (e && e.stopPropagation) {
        e.stopPropagation()
    }
    if (e && e.preventDefault) {
        e.preventDefault()
    }

    return false
}

function stopPropagation(e: Event) {
    if (e.stopPropagation) {
        e.stopPropagation()
    }
}

function sanitizeInValue(x: number | number[] | null | undefined): number[] {
    if (x == null) {
        return []
    }

    return Array.isArray(x) ? x.slice() : [x]
}

function prepareOutValue(x: number[]): number | number[] {
    return x !== null && x.length === 1 ? x[0] : x.slice()
}

function trimSucceeding(length: number, nextValue: number[], minDistance: number, max: number) {
    for (let i = 0; i < length; i += 1) {
        const padding = max - i * minDistance
        if (nextValue[length - 1 - i] > padding) {
             
            nextValue[length - 1 - i] = padding
        }
    }
}

function trimPreceding(length: number, nextValue: number[], minDistance: number, min: number) {
    for (let i = 0; i < length; i += 1) {
        const padding = min + i * minDistance
        if (nextValue[i] < padding) {
             
            nextValue[i] = padding
        }
    }
}

function addHandlers(eventMap: Record<string, (e: Event) => void>) {
    Object.keys(eventMap).forEach(key => {
        if (typeof document !== 'undefined') {
            document.addEventListener(key, eventMap[key], false)
        }
    })
}

function removeHandlers(eventMap: Record<string, (e: Event) => void>) {
    Object.keys(eventMap).forEach(key => {
        if (typeof document !== 'undefined') {
            document.removeEventListener(key, eventMap[key], false)
        }
    })
}

function trimAlignValue(val: number, props: { min?: number; max?: number; step?: number }) {
    return alignValue(trimValue(val, props), props)
}

function alignValue(val: number, props: { min?: number; step?: number }) {
    const min = props.min || 0
    const step = props.step || 1
    const valModStep = (val - min) % step
    let alignedValue = val - valModStep

    if (Math.abs(valModStep) * 2 >= step) {
        alignedValue += valModStep > 0 ? step : -step
    }

    return parseFloat(alignedValue.toFixed(5))
}

function trimValue(val: number, props: { min?: number; max?: number }) {
    let trimmed = val
    const min = props.min || 0
    const max = props.max || 100
    if (trimmed <= min) {
        trimmed = min
    }
    if (trimmed >= max) {
        trimmed = max
    }

    return trimmed
}

class ReactSlider extends React.Component<ReactSliderProps, ReactSliderState> {
    // Instance properties
    pendingResizeTimeouts: number[] = []
    resizeObserver: ResizeObserver | null = null
    resizeElementRef: React.RefObject<HTMLDivElement | null>
    hasMoved: boolean = false
    isScrolling?: boolean
    startPosition?: number[]
    slider?: HTMLDivElement | null
    [key: `thumb${number}`]: HTMLDivElement | null | undefined
    static displayName = 'ReactSlider'

    static defaultProps = {
        min: 0,
        max: 100,
        step: 1,
        pageFn: (step: number) => step * 10,
        minDistance: 0,
        defaultValue: 0,
        orientation: 'horizontal',
        className: 'slider',
        thumbClassName: 'thumb',
        thumbActiveClassName: 'active',
        trackClassName: 'track',
        markClassName: 'mark',
        withTracks: true,
        pearling: false,
        disabled: false,
        snapDragDisabled: false,
        invert: false,
        marks: [],
        moveDownByStep: null,
        moveUpByStep: null,
        renderThumb: ({ key, ...props }: ThumbProps) => {
            return (
                <div key={key} {...(props as unknown as React.HTMLAttributes<HTMLDivElement>)} />
            )
        },
        renderTrack: ({ key, ...props }: TrackProps) => {
            return (
                <div key={key}
                    className={props.className}
                    style={props.style}
                />
            )
        },
        renderMark: (props: MarkProps) => {
            return (
                <div {...props} />
            )
        },
    }

    constructor(props: ReactSliderProps) {
        super(props)

        let value = sanitizeInValue(props.value)
        if (!value.length) {
            value = sanitizeInValue(props.defaultValue)
        }

        // array for storing resize timeouts ids
        this.pendingResizeTimeouts = []

        const zIndices = []
        for (let i = 0; i < value.length; i += 1) {
            value[i] = trimAlignValue(value[i], props)
            zIndices.push(i)
        }

        this.resizeObserver = null
        this.resizeElementRef = React.createRef<HTMLDivElement>()

        this.state = {
            index: -1,
            upperBound: 0,
            sliderLength: 0,
            value,
            zIndices,
        }
    }

    componentDidMount() {
        if (typeof window !== 'undefined' && this.resizeElementRef.current) {
            this.resizeObserver = new ResizeObserver(this.handleResize)
            this.resizeObserver.observe(this.resizeElementRef.current)
            this.resize()
        }
    }

    // Keep the internal `value` consistent with an outside `value` if present.
    // This basically allows the slider to be a controlled component.
    static getDerivedStateFromProps(props: ReactSliderProps, state: ReactSliderState): Partial<ReactSliderState> | null {
        const value = sanitizeInValue(props.value)
        if (!value.length) {
            return null
        }

        // Do not allow controlled upates to happen while we have pending updates
        if (state.pending) {
            return null
        }

        return {
            value: value.map(item => trimAlignValue(item, props)),
        }
    }

    componentDidUpdate() {
        // If an upperBound has not yet been determined (due to the component being hidden
        // during the mount event, or during the last resize), then calculate it now
        if (this.state.upperBound === 0) {
            this.resize()
        }
    }

    componentWillUnmount() {
        this.clearPendingResizeTimeouts()
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
        }
    }

    onKeyUp = () => {
        this.onEnd(undefined)
    }

    onMouseUp = () => {
        this.onEnd(this.getMouseEventMap())
    }

    onTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault()
        this.onEnd(this.getTouchEventMap())
    }

    onBlur = () => {
        this.setState({ index: -1 }, () => {
            this.onEnd(this.getKeyDownEventMap())
        })
    }

    onEnd(eventMap?: Record<string, (e: Event) => void>) {
        if (eventMap) {
            removeHandlers(eventMap)
        }
        if (this.hasMoved) {
            this.fireChangeEvent('onAfterChange')
        }

        // Allow controlled updates to continue
        this.setState({ pending: false })

        this.hasMoved = false
    }

    onMouseMove = (e: MouseEvent) => {
        // Prevent controlled updates from happening while mouse is moving
        this.setState({ pending: true })

        const position = this.getMousePosition(e)
        const diffPosition = this.getDiffPosition(position[0])
        const newValue = this.getValueFromPosition(diffPosition)
        this.move(newValue)
    }

    onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 1) {
            return
        }

        // Prevent controlled updates from happending while touch is moving
        this.setState({ pending: true })

        const position = this.getTouchPosition(e)

        if (typeof this.isScrolling === 'undefined') {
            if (this.startPosition) {
                const diffMainDir = position[0] - this.startPosition[0]
                const diffScrollDir = position[1] - this.startPosition[1]
                this.isScrolling = Math.abs(diffScrollDir) > Math.abs(diffMainDir)
            }
        }

        if (this.isScrolling) {
            this.setState({ index: -1 })

            return
        }

        const diffPosition = this.getDiffPosition(position[0])
        const newValue = this.getValueFromPosition(diffPosition)

        this.move(newValue)
    }

    onKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
            return
        }

        // Prevent controlled updates from happening while a key is pressed
        this.setState({ pending: true })

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
            case 'Left':
            case 'Down':
                e.preventDefault()
                if (this.props.moveDownByStep) {
                    this.props.moveDownByStep()
                } else {
                    this.moveDownByStep()
                }
                break
            case 'ArrowRight':
            case 'ArrowUp':
            case 'Right':
            case 'Up':
                e.preventDefault()
                if (this.props.moveUpByStep) {
                    this.props.moveUpByStep()
                } else {
                    this.moveUpByStep()
                }
                break
            case 'Home':
                e.preventDefault()
                this.move(this.props.min ?? 0)
                break
            case 'End':
                e.preventDefault()
                this.move(this.props.max ?? 100)
                break
            case 'PageDown':
                e.preventDefault()
                this.moveDownByStep((this.props.pageFn ?? ((step) => step * 10))(this.props.step ?? 1))
                break
            case 'PageUp':
                e.preventDefault()
                this.moveUpByStep((this.props.pageFn ?? ((step) => step * 10))(this.props.step ?? 1))
                break
            default:
        }
    }

    onSliderMouseDown = (e: React.MouseEvent) => {
        // do nothing if disabled or right click
        if (this.props.disabled || e.button === 2) {
            return
        }

        // Prevent controlled updates from happening while mouse is moving
        this.setState({ pending: true })

        if (!this.props.snapDragDisabled) {
            const position = this.getMousePosition(e)
            this.forceValueFromPosition(position[0], i => {
                this.start(i, position[0])
                addHandlers(this.getMouseEventMap())
            })
        }

        pauseEvent(e.nativeEvent)
    }

    onSliderClick = (e: React.MouseEvent) => {
        if (this.props.disabled) {
            return
        }

        if (this.props.onSliderClick && !this.hasMoved) {
            const position = this.getMousePosition(e.nativeEvent)

            const valueAtPos = trimAlignValue(
                this.calcValue(this.calcOffsetFromPosition(position[0])),
                this.props
            )
            this.props.onSliderClick(valueAtPos)
        }
    }

    getValue() {
        return prepareOutValue(this.state.value)
    }

    getClosestIndex(pixelOffset: number) {
        let minDist = Number.MAX_VALUE
        let closestIndex = -1

        const { value } = this.state
        const l = value.length

        for (let i = 0; i < l; i += 1) {
            const offset = this.calcOffset(value[i])
            const dist = Math.abs(pixelOffset - offset)
            if (dist < minDist) {
                minDist = dist
                closestIndex = i
            }
        }

        return closestIndex
    }

    getMousePosition(e: MouseEvent | React.MouseEvent) {
        const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : e
        return [nativeEvent[`page${this.axisKey()}` as keyof MouseEvent] as number, nativeEvent[`page${this.orthogonalAxisKey()}` as keyof MouseEvent] as number]
    }

    getTouchPosition(e: TouchEvent | React.TouchEvent) {
        const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : e
        const touch = nativeEvent.touches[0]

        return [touch[`page${this.axisKey()}` as keyof Touch] as number, touch[`page${this.orthogonalAxisKey()}` as keyof Touch] as number]
    }

    getKeyDownEventMap() {
        return {
            keydown: this.onKeyDown as (e: Event) => void,
            keyup: this.onKeyUp as (e: Event) => void,
            focusout: this.onBlur as (e: Event) => void,
        }
    }

    getMouseEventMap() {
        return {
            mousemove: this.onMouseMove as (e: Event) => void,
            mouseup: this.onMouseUp as (e: Event) => void,
        }
    }

    getTouchEventMap() {
        return {
            touchmove: this.onTouchMove as unknown as (e: Event) => void,
            touchend: this.onTouchEnd as unknown as (e: Event) => void,
        }
    }

    getValueFromPosition(position: number) {
        const thumbSize = this.state.thumbSize || 0
        const diffValue =
            (position / (this.state.sliderLength - thumbSize)) *
            (this.props.max! - this.props.min!)

        return trimAlignValue((this.state.startValue || 0) + diffValue, this.props)
    }

    getDiffPosition(position: number) {
        const startPos = this.state.startPosition || 0
        let diffPosition = position - startPos
        if (this.props.invert) {
            diffPosition *= -1
        }

        return diffPosition
    }

    // create the `keydown` handler for the i-th thumb
    createOnKeyDown = (i: number) => (e: React.FocusEvent) => {
        if (this.props.disabled) {
            return
        }
        this.start(i)
        addHandlers(this.getKeyDownEventMap())
        pauseEvent(e.nativeEvent)
    }

    // create the `mousedown` handler for the i-th thumb
    createOnMouseDown = (i: number) => (e: React.MouseEvent) => {
        // do nothing if disabled or right click
        if (this.props.disabled || e.button === 2) {
            return
        }

        // Prevent controlled updates from happending while mouse is moving
        this.setState({ pending: true })

        const position = this.getMousePosition(e)
        this.start(i, position[0])
        addHandlers(this.getMouseEventMap())
        pauseEvent(e.nativeEvent)
    }

    // create the `touchstart` handler for the i-th thumb
    createOnTouchStart = (i: number) => (e: React.TouchEvent) => {
        if (this.props.disabled || e.touches.length > 1) {
            return
        }

        // Prevent controlled updates from happending while touch is moving
        this.setState({ pending: true })

        const position = this.getTouchPosition(e)
        this.startPosition = [position[0], position[1]]
        // don't know yet if the user is trying to scroll
        this.isScrolling = undefined
        this.start(i, position[0])
        addHandlers(this.getTouchEventMap())
        stopPropagation(e.nativeEvent)
    }

    handleResize = () => {
        // setTimeout of 0 gives element enough time to have assumed its new size if
        // it is being resized
        const resizeTimeout = window.setTimeout(() => {
            // drop this timeout from pendingResizeTimeouts to reduce memory usage
            this.pendingResizeTimeouts.shift()
            this.resize()
        }, 0)

        this.pendingResizeTimeouts.push(resizeTimeout)
    }

    resize() {
        const { slider } = this
        const thumb = this[`thumb0` as keyof ReactSlider] as HTMLDivElement | null | undefined
        if (!slider || !thumb) {
            return
        }

        const sizeKey = this.sizeKey()
        // For the slider size, we want to use the client width/height, excluding any borders
        const sliderRect = slider.getBoundingClientRect()
        const sliderSize = slider[sizeKey as keyof HTMLDivElement] as number
        const sliderMax = sliderRect[this.posMaxKey() as keyof DOMRect] as number
        const sliderMin = sliderRect[this.posMinKey() as keyof DOMRect] as number
        // For the thumb size, we want to use the outer width/height, including any borders
        const thumbRect = thumb.getBoundingClientRect()
        const thumbSizeKey = sizeKey.replace('client', '').toLowerCase() as 'width' | 'height'
        const thumbSize = thumbRect[thumbSizeKey]
        const upperBound = sliderSize - thumbSize
        const sliderLength = Math.abs(sliderMax - sliderMin)

        if (
            this.state.upperBound !== upperBound ||
            this.state.sliderLength !== sliderLength ||
            this.state.thumbSize !== thumbSize
        ) {
            this.setState({
                upperBound,
                sliderLength,
                thumbSize,
            })
        }
    }

    // calculates the offset of a thumb in pixels based on its value.
    calcOffset(value: number) {
        const range = (this.props.max || 100) - (this.props.min || 0)
        if (range === 0) {
            return 0
        }
        const ratio = (value - (this.props.min || 0)) / range

        return ratio * this.state.upperBound
    }

    // calculates the value corresponding to a given pixel offset, i.e. the inverse of `calcOffset`.
    calcValue(offset: number) {
        const ratio = offset / this.state.upperBound

        return ratio * ((this.props.max || 100) - (this.props.min || 0)) + (this.props.min || 0)
    }

    calcOffsetFromPosition(position: number) {
        const { slider } = this
        if (!slider) return 0
        
        const sliderRect = slider.getBoundingClientRect()
        const sliderMax = sliderRect[this.posMaxKey() as keyof DOMRect] as number
        const sliderMin = sliderRect[this.posMinKey() as keyof DOMRect] as number
        // The `position` value passed in is the mouse position based on the window height.
        // The slider bounding rect is based on the viewport, so we must add the window scroll
        // offset to normalize the values.
        const axisKey = this.axisKey()
        const windowOffset = window[`page${axisKey}Offset` as keyof Window] as number
        const sliderStart = windowOffset + (this.props.invert ? sliderMax : sliderMin)

        let pixelOffset = position - sliderStart
        if (this.props.invert) {
            pixelOffset = this.state.sliderLength - pixelOffset
        }
        const thumbSize = this.state.thumbSize || 0
        pixelOffset -= thumbSize / 2

        return pixelOffset
    }

    // Snaps the nearest thumb to the value corresponding to `position`
    // and calls `callback` with that thumb's index.
    forceValueFromPosition(position: number, callback: (i: number) => void) {
        const pixelOffset = this.calcOffsetFromPosition(position)
        const closestIndex = this.getClosestIndex(pixelOffset)
        const nextValue = trimAlignValue(this.calcValue(pixelOffset), this.props)
        // Clone this.state.value since we'll modify it temporarily
        const value = this.state.value.slice()
        value[closestIndex] = nextValue

        // Prevents the slider from shrinking below `props.minDistance`
        for (let i = 0; i < value.length - 1; i += 1) {
            if (value[i + 1] - value[i] < (this.props.minDistance || 0)) {
                return
            }
        }

        this.fireChangeEvent('onBeforeChange')
        this.hasMoved = true
        this.setState({ value }, () => {
            callback(closestIndex)
            this.fireChangeEvent('onChange')
        })
    }

    // clear all pending timeouts to avoid error messages after unmounting
    clearPendingResizeTimeouts() {
        do {
            const nextTimeout = this.pendingResizeTimeouts.shift()

            if (nextTimeout !== undefined) {
                clearTimeout(nextTimeout)
            }
        } while (this.pendingResizeTimeouts.length)
    }

    start(i: number, position?: number) {
        const thumbRef = this[`thumb${i}` as keyof ReactSlider] as HTMLDivElement | null | undefined
        if (thumbRef) {
            thumbRef.focus()
        }

        const { zIndices } = this.state
        // remove wherever the element is
        zIndices.splice(zIndices.indexOf(i), 1)
        // add to end
        zIndices.push(i)

        this.setState(prevState => ({
            startValue: prevState.value[i],
            startPosition: position !== undefined ? position : prevState.startPosition,
            index: i,
            zIndices,
        }))
    }

    moveUpByStep(step: number = this.props.step || 1) {
        const oldValue = this.state.value[this.state.index]

        // if the slider is inverted and horizontal we want to honor the inverted value
        const newValue =
            this.props.invert && this.props.orientation === 'horizontal'
                ? oldValue - step
                : oldValue + step

        const trimAlign = trimAlignValue(newValue, this.props)
        this.move(Math.min(trimAlign, this.props.max || 100))
    }

    moveDownByStep(step: number = this.props.step || 1) {
        const oldValue = this.state.value[this.state.index]

        // if the slider is inverted and horizontal we want to honor the inverted value
        const newValue =
            this.props.invert && this.props.orientation === 'horizontal'
                ? oldValue + step
                : oldValue - step

        const trimAlign = trimAlignValue(newValue, this.props)
        this.move(Math.max(trimAlign, this.props.min || 0))
    }

    move(newValue: number) {
        // Clone this.state.value since we'll modify it temporarily
        const value = this.state.value.slice()
        const { index } = this.state
        const { length } = value
        // Short circuit if the value is not changing
        const oldValue = value[index]
        if (newValue === oldValue) {
            return
        }

        // Trigger only before the first movement
        if (!this.hasMoved) {
            this.fireChangeEvent('onBeforeChange')
        }
        this.hasMoved = true

        // if "pearling" (= thumbs pushing each other) is disabled,
        // prevent the thumb from getting closer than `minDistance` to the previous or next thumb.
        const { pearling, max, min, minDistance } = this.props
        if (!pearling) {
            if (index > 0) {
                const valueBefore = value[index - 1]
                if (newValue < valueBefore + (minDistance || 0)) {
                     
                    newValue = valueBefore + (minDistance || 0)
                }
            }

            if (index < length - 1) {
                const valueAfter = value[index + 1]
                if (newValue > valueAfter - (minDistance || 0)) {
                     
                    newValue = valueAfter - (minDistance || 0)
                }
            }
        }

        value[index] = newValue

        // if "pearling" is enabled, let the current thumb push the pre- and succeeding thumbs.
        if (pearling && length > 1) {
            if (newValue > oldValue) {
                this.pushSucceeding(value, minDistance || 0, index)
                trimSucceeding(length, value, minDistance || 0, max || 100)
            } else if (newValue < oldValue) {
                this.pushPreceding(value, minDistance || 0, index)
                trimPreceding(length, value, minDistance || 0, min || 0)
            }
        }

        // Normally you would use `shouldComponentUpdate`,
        // but since the slider is a low-level component,
        // the extra complexity might be worth the extra performance.
        this.setState({ value }, this.fireChangeEvent.bind(this, 'onChange'))
    }

    pushSucceeding(value: number[], minDistance: number, index: number) {
        let i
        let padding
        const props = { min: this.props.min || 0, step: this.props.step || 1 }
        for (
            i = index, padding = value[i] + minDistance;
            value[i + 1] !== null && value[i + 1] !== undefined && padding > value[i + 1];
            i += 1, padding = value[i] + minDistance
        ) {
             
            value[i + 1] = alignValue(padding, props)
        }
    }

    pushPreceding(value: number[], minDistance: number, index: number) {
        const props = { min: this.props.min || 0, step: this.props.step || 1 }
        for (
            let i = index, padding = value[i] - minDistance;
            value[i - 1] !== null && value[i - 1] !== undefined && padding < value[i - 1];
            i -= 1, padding = value[i] - minDistance
        ) {
             
            value[i - 1] = alignValue(padding, props)
        }
    }

    axisKey(): 'X' | 'Y' {
        if (this.props.orientation === 'vertical') {
            return 'Y'
        }

        // Defaults to 'horizontal';
        return 'X'
    }

    orthogonalAxisKey(): 'X' | 'Y' {
        if (this.props.orientation === 'vertical') {
            return 'X'
        }

        // Defaults to 'horizontal'
        return 'Y'
    }

    posMinKey(): 'top' | 'bottom' | 'left' | 'right' {
        if (this.props.orientation === 'vertical') {
            return this.props.invert ? 'bottom' : 'top'
        }

        // Defaults to 'horizontal'
        return this.props.invert ? 'right' : 'left'
    }

    posMaxKey(): 'top' | 'bottom' | 'left' | 'right' {
        if (this.props.orientation === 'vertical') {
            return this.props.invert ? 'top' : 'bottom'
        }

        // Defaults to 'horizontal'
        return this.props.invert ? 'left' : 'right'
    }

    sizeKey(): 'clientHeight' | 'clientWidth' {
        if (this.props.orientation === 'vertical') {
            return 'clientHeight'
        }

        // Defaults to 'horizontal'
        return 'clientWidth'
    }

    fireChangeEvent(event: 'onBeforeChange' | 'onChange' | 'onAfterChange') {
        const handler = this.props[event]
        if (handler) {
            handler(prepareOutValue(this.state.value), this.state.index)
        }
    }

    buildThumbStyle(offset: number, i: number): React.CSSProperties {
        const style: React.CSSProperties = {
            position: 'absolute',
            touchAction: 'none',
            willChange: this.state.index >= 0 ? this.posMinKey() : undefined,
            zIndex: this.state.zIndices.indexOf(i) + 1,
        }
        style[this.posMinKey()] = `${offset}px`

        return style
    }

    buildTrackStyle(min: number, max: number): React.CSSProperties {
        const obj: React.CSSProperties = {
            position: 'absolute',
            willChange:
                this.state.index >= 0 ? `${this.posMinKey()},${this.posMaxKey()}` : undefined,
        }
        obj[this.posMinKey()] = min
        obj[this.posMaxKey()] = max

        return obj
    }

    buildMarkStyle(offset: number): React.CSSProperties {
        return {
            position: 'absolute',
            [this.posMinKey()]: offset,
        } as React.CSSProperties
    }

    renderThumb = (style: React.CSSProperties, i: number) => {
        const className = `${this.props.thumbClassName || ''} ${this.props.thumbClassName || ''}-${i} ${
            this.state.index === i ? this.props.thumbActiveClassName || '' : ''
        }`

        const refCallback = (r: HTMLDivElement | null) => {
            (this as any)[`thumb${i}`] = r
        }

        const props: ThumbProps = {
            'key': `${this.props.thumbClassName || 'thumb'}-${i}`,
            ref: refCallback,
            className,
            style,
            'onMouseDown': this.createOnMouseDown(i),
            'onTouchStart': this.createOnTouchStart(i),
            'onFocus': this.createOnKeyDown(i),
            'tabIndex': 0,
            'role': 'slider',
            'aria-orientation': (this.props.orientation || 'horizontal') as 'horizontal' | 'vertical',
            'aria-valuenow': this.state.value[i],
            'aria-valuemin': this.props.min || 0,
            'aria-valuemax': this.props.max || 100,
            'aria-label': Array.isArray(this.props.ariaLabel)
                ? this.props.ariaLabel[i]
                : this.props.ariaLabel,
            'aria-labelledby': Array.isArray(this.props.ariaLabelledby)
                ? this.props.ariaLabelledby[i]
                : this.props.ariaLabelledby,
            'aria-disabled': this.props.disabled || false,
        }

        const state: ThumbState = {
            index: i,
            value: prepareOutValue(this.state.value),
            valueNow: this.state.value[i],
        }

        if (this.props.ariaValuetext) {
            props['aria-valuetext'] =
                typeof this.props.ariaValuetext === 'string'
                    ? this.props.ariaValuetext
                    : this.props.ariaValuetext(state)
        }

        return this.props.renderThumb!(props, state)
    }

    renderThumbs(offset: number[]) {
        const { length } = offset
        const styles: React.CSSProperties[] = []
        for (let i = 0; i < length; i += 1) {
            styles[i] = this.buildThumbStyle(offset[i], i)
        }

        const res: React.ReactElement[] = []
        for (let i = 0; i < length; i += 1) {
            res[i] = this.renderThumb(styles[i], i)
        }

        return res
    }

    renderTrack = (i: number, offsetFrom: number, offsetTo: number) => {
        const props: TrackProps = {
            key: `${this.props.trackClassName}-${i}`,
            className: `${this.props.trackClassName} ${this.props.trackClassName}-${i}`,
            style: this.buildTrackStyle(offsetFrom, this.state.upperBound - offsetTo),
        }

        const state: TrackState = {
            index: i,
            value: prepareOutValue(this.state.value),
        }

        return this.props.renderTrack!(props, state)
    }

    renderTracks(offset: number[]) {
        const tracks: React.ReactElement[] = []
        const lastIndex = offset.length - 1

        tracks.push(this.renderTrack(0, 0, offset[0]))

        for (let i = 0; i < lastIndex; i += 1) {
            tracks.push(this.renderTrack(i + 1, offset[i], offset[i + 1]))
        }

        tracks.push(this.renderTrack(lastIndex + 1, offset[lastIndex], this.state.upperBound))

        return tracks
    }

    renderMarks() {
        let marks: number[] = Array.isArray(this.props.marks) ? this.props.marks : []

        const range = (this.props.max || 100) - (this.props.min || 0) + 1

        if (typeof this.props.marks === 'boolean') {
            marks = Array.from({ length: range }).map((_, key) => key)
        } else if (typeof this.props.marks === 'number') {
            const marksStep = this.props.marks
            marks = Array.from({ length: range })
                .map((_, key) => key)
                .filter(key => key % marksStep === 0) as number[]
        }

        return marks
            .map((mark) => Number(mark))
            .sort((a, b) => a - b)
            .map(mark => {
                const offset = this.calcOffset(mark)

                const props: MarkProps = {
                    key: mark,
                    className: this.props.markClassName || '',
                    style: this.buildMarkStyle(offset),
                }

                return this.props.renderMark!(props)
            })
    }

    render() {
        const offset: number[] = []
        const { value } = this.state
        const l = value.length
        for (let i = 0; i < l; i += 1) {
            offset[i] = this.calcOffset(value[i])
        }

        const tracks = this.props.withTracks ? this.renderTracks(offset) : null
        const thumbs = this.renderThumbs(offset)
        const marks = this.props.marks ? this.renderMarks() : null

        return React.createElement(
            'div',
            {
                ref: (r: HTMLDivElement | null) => {
                    this.slider = r
                    if (this.resizeElementRef) {
                        this.resizeElementRef.current = r
                    }
                },
                style: { position: 'relative' },
                className: (this.props.className || '') + (this.props.disabled ? ' disabled' : ''),
                onMouseDown: this.onSliderMouseDown,
                onClick: this.onSliderClick,
            },
            tracks,
            thumbs,
            marks
        )
    }
}

export default ReactSlider
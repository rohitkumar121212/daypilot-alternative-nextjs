# VirtualScheduler Performance Optimization Plan

## Current Performance Issues Analysis

The application has become heavy and less smooth due to:
1. Multiple modals and complex state management
2. Frequent re-renders on scroll and interactions
3. Heavy computations in render cycles
4. Inefficient event handling
5. Large DOM manipulations

## Performance Optimization Strategies

### 1. **React Optimization Techniques**

#### A. Memoization & Callbacks
```javascript
// Wrap expensive components in React.memo
const ResourceRow = React.memo(ResourceRowComponent)
const DateHeader = React.memo(DateHeaderComponent)

// Use useMemo for expensive calculations
const visibleBookings = useMemo(() => {
  return bookings.filter(booking => /* filtering logic */)
}, [bookings, visibleDateRange])

// Use useCallback for event handlers
const handleScroll = useCallback(throttle((e) => {
  // scroll logic
}, 16), []) // 60fps throttling
```

#### B. State Optimization
```javascript
// Split large state objects into smaller, focused states
const [scrollState, setScrollState] = useState({ top: 0, left: 0 })
const [selectionState, setSelectionState] = useState(null)
const [modalStates, setModalStates] = useState({
  booking: false,
  split: false,
  skip: false
})

// Use state reducers for complex state logic
const [schedulerState, dispatch] = useReducer(schedulerReducer, initialState)
```

### 2. **Virtual Scrolling Enhancements**

#### A. Improved Virtualization
```javascript
// Add buffer zones for smoother scrolling
const bufferSize = 5
const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize)
const endIndex = Math.min(
  visibleRows.length, 
  startIndex + Math.ceil(containerHeight / rowHeight) + bufferSize * 2
)

// Implement horizontal virtualization for dates
const visibleDateRange = useMemo(() => {
  const startDateIndex = Math.floor(scrollLeft / cellWidth)
  const endDateIndex = startDateIndex + Math.ceil(containerWidth / cellWidth) + 2
  return dates.slice(startDateIndex, endDateIndex)
}, [scrollLeft, containerWidth, cellWidth, dates])
```

#### B. Scroll Performance
```javascript
// Use requestAnimationFrame for smooth scrolling
const handleScroll = useCallback((e) => {
  if (scrollTimeoutRef.current) return
  
  scrollTimeoutRef.current = requestAnimationFrame(() => {
    setScrollTop(e.target.scrollTop)
    setScrollLeft(e.target.scrollLeft)
    scrollTimeoutRef.current = null
  })
}, [])

// Implement scroll throttling
const throttledScroll = useCallback(
  throttle(handleScroll, 16), // 60fps
  [handleScroll]
)
```

### 3. **Event Handling Optimization**

#### A. Event Delegation
```javascript
// Use single event listener on container instead of multiple listeners
const handleContainerEvents = useCallback((e) => {
  const target = e.target.closest('[data-cell]')
  if (!target) return
  
  const { date, resourceId } = target.dataset
  
  switch (e.type) {
    case 'mousedown':
      handleCellMouseDown(date, resourceId, e)
      break
    case 'mouseenter':
      handleCellMouseEnter(date, resourceId, e)
      break
  }
}, [])
```

#### B. Debounced Inputs
```javascript
// Debounce search and filter inputs
const debouncedSearch = useCallback(
  debounce((term) => setSearchTerm(term), 300),
  []
)
```

### 4. **DOM Optimization**

#### A. CSS Optimizations
```css
/* Use CSS transforms for better performance */
.booking-item {
  transform: translateX(var(--x)) translateY(var(--y));
  will-change: transform;
}

/* Enable hardware acceleration */
.virtual-container {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Optimize repaints */
.resource-row {
  contain: layout style paint;
}
```

#### B. Reduce DOM Nodes
```javascript
// Use CSS positioning instead of creating wrapper divs
const BookingItem = ({ booking, style }) => (
  <div 
    className="booking-item"
    style={{
      ...style,
      '--x': `${booking.x}px`,
      '--y': `${booking.y}px`
    }}
  >
    {booking.text}
  </div>
)
```

### 5. **Data Processing Optimization**

#### A. Efficient Data Structures
```javascript
// Use Maps for O(1) lookups
const bookingsByResource = useMemo(() => {
  const map = new Map()
  bookings.forEach(booking => {
    if (!map.has(booking.resourceId)) {
      map.set(booking.resourceId, [])
    }
    map.get(booking.resourceId).push(booking)
  })
  return map
}, [bookings])

// Pre-calculate booking positions
const bookingPositions = useMemo(() => {
  return bookings.map(booking => ({
    ...booking,
    x: getDateIndex(booking.startDate) * cellWidth,
    y: getResourceIndex(booking.resourceId) * rowHeight,
    width: getBookingWidth(booking),
    height: rowHeight - 4
  }))
}, [bookings, cellWidth, rowHeight])
```

#### B. Lazy Loading
```javascript
// Load data progressively
const useProgressiveData = (initialData, batchSize = 50) => {
  const [loadedData, setLoadedData] = useState(initialData.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = useState(batchSize)
  
  const loadMore = useCallback(() => {
    if (currentIndex < initialData.length) {
      setLoadedData(prev => [
        ...prev,
        ...initialData.slice(currentIndex, currentIndex + batchSize)
      ])
      setCurrentIndex(prev => prev + batchSize)
    }
  }, [initialData, currentIndex, batchSize])
  
  return { loadedData, loadMore, hasMore: currentIndex < initialData.length }
}
```

### 6. **Modal Performance**

#### A. Lazy Modal Loading
```javascript
// Load modals only when needed
const LazyBookingModal = lazy(() => import('./BookingModal'))
const LazySplitModal = lazy(() => import('./SplitModal'))

// Use portal for better performance
const ModalPortal = ({ children }) => {
  return createPortal(children, document.body)
}
```

#### B. Modal State Management
```javascript
// Centralized modal state
const useModalManager = () => {
  const [modals, setModals] = useState({})
  
  const openModal = useCallback((modalId, props = {}) => {
    setModals(prev => ({ ...prev, [modalId]: { isOpen: true, ...props } }))
  }, [])
  
  const closeModal = useCallback((modalId) => {
    setModals(prev => ({ ...prev, [modalId]: { isOpen: false } }))
  }, [])
  
  return { modals, openModal, closeModal }
}
```

### 7. **Memory Management**

#### A. Cleanup Strategies
```javascript
// Cleanup event listeners and timeouts
useEffect(() => {
  const cleanup = () => {
    // Clear all timeouts
    clearTimeout(scrollTimeoutRef.current)
    clearTimeout(resizeTimeoutRef.current)
    
    // Remove event listeners
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('mousemove', handleMouseMove)
  }
  
  return cleanup
}, [])

// Cleanup large objects
useEffect(() => {
  return () => {
    // Clear large data structures
    bookingMapRef.current?.clear()
    resourceMapRef.current?.clear()
  }
}, [])
```

### 8. **Implementation Priority**

#### Phase 1 (Immediate - High Impact)
1. Add React.memo to ResourceRow and DateHeader components
2. Implement scroll throttling with requestAnimationFrame
3. Add useCallback to all event handlers
4. Optimize CSS with will-change and contain properties

#### Phase 2 (Short Term - Medium Impact)
1. Implement horizontal virtualization for dates
2. Add buffer zones to virtual scrolling
3. Convert to Map-based data structures
4. Implement modal lazy loading

#### Phase 3 (Long Term - Optimization)
1. Add Web Workers for heavy calculations
2. Implement progressive data loading
3. Add performance monitoring
4. Optimize bundle size with code splitting

### 9. **Performance Monitoring**

```javascript
// Add performance metrics
const usePerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`)
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    return () => observer.disconnect()
  }, [])
}

// Measure render performance
const measureRender = (componentName, fn) => {
  performance.mark(`${componentName}-start`)
  const result = fn()
  performance.mark(`${componentName}-end`)
  performance.measure(componentName, `${componentName}-start`, `${componentName}-end`)
  return result
}
```

## Expected Performance Improvements

- **Scroll Performance**: 60fps smooth scrolling
- **Initial Load**: 50-70% faster rendering
- **Memory Usage**: 30-40% reduction
- **Interaction Response**: Sub-100ms response times
- **Bundle Size**: 20-30% smaller with code splitting

## Success Metrics

1. **Frame Rate**: Maintain 60fps during scrolling
2. **Time to Interactive**: < 2 seconds
3. **Memory Usage**: < 100MB for large datasets
4. **Bundle Size**: < 500KB gzipped
5. **Lighthouse Score**: > 90 for Performance
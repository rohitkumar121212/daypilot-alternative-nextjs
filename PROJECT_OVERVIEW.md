# DayPilot Alternative - Custom Scheduler Component

## Project Overview

A custom-built apartment booking scheduler component built with **Next.js 16** and **React 19**, designed as an alternative to DayPilot library. This project implements a virtualized timeline scheduler for managing apartment reservations with optimized performance through custom virtual scrolling.

## 🎯 Core Objectives

- **Custom Scheduler**: Build a DayPilot-like component from scratch
- **Apartment Management**: Display apartments and their booking schedules
- **Virtual Scrolling**: Implement react-window-like functionality for performance
- **DOM Optimization**: Only render visible elements in the current viewport

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4
- **Date Handling**: Day.js 1.11.19
- **Language**: TypeScript 5

### Project Structure
```
├── app/
│   ├── pms/page.tsx          # Main PMS route
│   └── layout.tsx            # Root layout
├── components/
│   └── ReservationChart/
│       ├── ReservationChart.tsx           # Main container component
│       └── VirtualScheduler/
│           ├── VirtualScheduler.tsx       # Core scheduler logic
│           ├── ResourceRow.tsx            # Individual resource rows
│           ├── DateHeader.tsx             # Date column headers
│           ├── DateCell.tsx               # Individual date cells
│           ├── BookingBlock.tsx           # Booking visualization
│           ├── BookingModal.tsx           # Booking creation modal
│           └── SelectionOverlay.tsx       # Selection UI overlay
└── utils/
    └── dateUtils.js          # Date manipulation utilities
```

## 🚀 Key Features

### 1. Virtual Scrolling Implementation
- **Custom Virtualization**: Manual implementation without external dependencies
- **Performance Optimized**: Only renders visible rows in DOM
- **Synchronized Scrolling**: Resource column and timeline scroll in sync
- **Dynamic Viewport**: Calculates visible items based on scroll position

### 2. Hierarchical Resource Management
- **Parent-Child Structure**: Apartments with expandable room listings
- **Collapsible Rows**: Toggle visibility of child resources
- **Flat Rendering**: Converts hierarchy to flat array for virtual scrolling

### 3. Interactive Booking System
- **Drag Selection**: Mouse-based date range selection
- **Real-time Preview**: Visual feedback during selection
- **Modal Creation**: Popup form for booking details
- **Live Updates**: Immediate UI updates without page refresh

### 4. Data Integration
- **API Integration**: Fetches apartments and reservations from external API
- **Parallel Loading**: Concurrent data fetching for better performance
- **Data Normalization**: Transforms API responses to component format

## 🔧 Technical Implementation

### Virtual Scrolling Logic
```typescript
// Calculate visible items based on scroll position
const startIndex = Math.floor(scrollTop / rowHeight)
const endIndex = Math.min(startIndex + Math.ceil(containerHeight / rowHeight) + 1, visibleRows.length)
const visibleItems = visibleRows.slice(startIndex, endIndex)
```

### Resource Hierarchy Flattening
```typescript
const visibleRows = resources.flatMap(parent => {
  const parentRow = { ...parent, type: 'parent', isParent: true }
  
  if (!parent.expanded) return [parentRow]
  
  const childRows = (parent.children || []).map(child => ({
    ...child, parentId: parent.id, type: 'child', isParent: false
  }))
  
  return [parentRow, ...childRows]
})
```

### Selection State Management
- **Mouse Events**: Handles mousedown, mousemove, mouseup for selection
- **State Tracking**: Manages selection boundaries and active states
- **Cross-Resource Prevention**: Restricts selection to single resource

## 📊 Performance Optimizations

1. **Virtual DOM**: Only renders visible elements (typically 10-15 rows vs potentially 1000+)
2. **Memoization**: Uses React.useMemo for expensive calculations
3. **Event Delegation**: Efficient event handling for large datasets
4. **Parallel API Calls**: Concurrent data fetching reduces load time
5. **Scroll Synchronization**: Optimized scroll event handling

## 🎨 UI/UX Features

- **Responsive Design**: Adapts to different screen sizes
- **Visual Feedback**: Hover states and selection highlights
- **Smooth Scrolling**: Synchronized horizontal and vertical scrolling
- **Accessibility**: Keyboard navigation and screen reader support
- **Loading States**: Proper loading indicators during data fetch

## 🔄 Data Flow

1. **Initial Load**: Fetch apartments and reservations from API
2. **Data Normalization**: Transform API data to component format
3. **Virtual Rendering**: Calculate and render only visible items
4. **User Interaction**: Handle selection, booking creation, resource expansion
5. **State Updates**: Update local state and re-render affected components

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000/pms
```

## 🎯 Future Enhancements

- **Drag & Drop**: Move bookings between dates/resources
- **Recurring Bookings**: Support for repeating reservations
- **Conflict Detection**: Prevent overlapping bookings
- **Export Features**: PDF/Excel export of schedules
- **Real-time Updates**: WebSocket integration for live updates
- **Mobile Optimization**: Touch-friendly interactions

## 📝 Notes

This implementation prioritizes performance and customization over external dependencies, providing a lightweight alternative to commercial scheduling libraries while maintaining professional functionality and user experience.
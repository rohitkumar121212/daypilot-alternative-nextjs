import React, { memo } from 'react'
import Image from 'next/image'
import { MoonStar, LayersPlus, BedSingle, Sparkles, Dog } from 'lucide-react';

import ResourceRow from './ResourceRow'

interface SchedulerRowProps {
  virtualRow: { key: React.Key; size: number; start: number }
  row: any
  dates: string[]
  dateIndexMap: Map<string, number>
  bookingsByResourceId: Map<string, any[]>
  selection: any
  dragState: any
  availabilityByParent: any
  frontendAvailabilityByParent?: Record<string, { available: number; total: number }>
  cellWidth: number
  rowHeight: number
  onResourceRightClick: (row: any, e: React.MouseEvent) => void
  onToggleExpand: (parentId: any) => void
  onCellMouseDown: (date: string, resourceId: any, e: React.MouseEvent) => void
  onCellMouseEnter: (date: string, resourceId: any) => void
  onBookingClick: (booking: any) => void
  onBookingRightClick: (booking: any, position: any) => void
  onBookingDragStart: (booking: any, e: React.MouseEvent) => void
  isSquareUser?: boolean
}

// const CLEANING_STATUS_COLORS: Record<string, string> = {
//   dirty:     '#dbc6b2', // light red
//   clean:     '#b2dbb4', // light green
//   touch_up:  '#e3a6ff', // light yellow
//   repair:    '#bdb9aa', // light orange
//   inspect:   '#ffffff', // light blue
//   dnr:       '#f0cb75', // light purple
//   house_use: '#cafcca', // light sky
// }
const CLEANING_STATUS_COLORS: Record<string, string> = {
  dirty:     '#dbc6b2', // light beige / tan
  clean:     '#b2dbb4', // light green
  touch_up:  '#e3a6ff', // light purple / lavender
  repair:    '#bdb9aa', // light gray / taupe
  inspect:   '#ffffff', // white
  dnr:       '#f0cb75', // light yellow / mustard
  house_use: '#cafcca', // light mint green
}

/**
 * SchedulerRow
 *
 * Renders a single virtualised row in the scheduler grid. Responsible for:
 *  - TanStack Virtual absolute positioning (translateY)
 *  - Resource label cell (sticky left — stays visible on horizontal scroll)
 *  - Expand / collapse button for parent (building) rows
 *  - Timeline cell containing ResourceRow (date cells + booking blocks)
 */
const SchedulerRow = memo(({
  virtualRow,
  row,
  dates,
  dateIndexMap,
  bookingsByResourceId,
  selection,
  dragState,
  availabilityByParent,
  frontendAvailabilityByParent = {},
  cellWidth,
  rowHeight,
  onResourceRightClick,
  onToggleExpand,
  onCellMouseDown,
  onCellMouseEnter,
  onBookingClick,
  onBookingRightClick,
  onBookingDragStart,
  isSquareUser = false,
}: SchedulerRowProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: virtualRow.size,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <div className="flex border-b border-gray-200" style={{ height: '100%' }}>

        {/*
          Resource label cell.
          sticky left: stays visible when scrolling horizontally.
          z-30 keeps it above booking blocks (z-20) in the timeline cell.
        */}
        <div
          className={`w-90 min-w-90 sticky left-0 z-30 border-r border-gray-200 flex items-center hover:bg-gray-50 ${
            row.type === 'parent'
              ? 'font-semibold bg-gray-100'
              : 'text-gray-700 pr-2'
          }`}
          style={row.type === 'child' ? (row.is_lease_ending == true && row.cleaning_status ? {backgroundColor:'yellow'} : { backgroundColor: CLEANING_STATUS_COLORS[row.cleaning_status] || '#dbc6b2' }) : undefined}
          {...(row.type === 'child' && { onContextMenu: (e) => onResourceRightClick(row, e) })}
        >
          {row.type === 'parent' && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleExpand(row.id) }}
              className="mr-2 p-1 hover:bg-gray-200 rounded shrink-0"
            >
              <svg
                className={`w-4 h-4 text-gray-600 transform ${row.expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {row.type === 'child' && (
            <>
              <span className="w-2 shrink-0" />
              <div className="w-32 shrink-0 flex items-center gap-1">
                {
                  row.bed_desc && (
                    <div className="relative group flex items-center">
                      <span className='text-sm'>{`${row?.bed_desc ==='studio' ? '1' : row?.bed_desc}-`}</span>
                      <BedSingle className="cursor-help" size={16} color="#4B5563" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Bed Configuration
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )
                }
                {
                  row.min_stay && (
                    <div className="relative group flex items-center">
                      <span className='text-sm'>{`${row.min_stay}-`}</span>
                      <MoonStar className="cursor-help" size={16} color="#4B5563" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Minimum Stay (nights)
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )
                }
                {
                  row?.floor && (
                    <div className="relative group flex items-center">
                      <span className='text-sm'>{`${row?.floor}-`}</span>
                      <LayersPlus className="ml-1 cursor-help" size={16} color="#4B5563" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Floor Level
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )
                }
                
              </div>
            </>
          )}
          <div className="relative group flex-1 min-w-0">
            <span className="block truncate text-sm cursor-help">{row.name}</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {row.type === 'parent' ? 'Building' : 'Apartment'}: {row.name}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className='flex gap-1 items-center'>
          {/* {
            row.bed_desc && (
              <div className="relative group flex items-center">
                <span className='text-sm'>{`${row?.bed_desc}-`}</span>
                <BedSingle className="cursor-help" size={16} color="#4B5563" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Bed Configuration
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
          }
          {
            row.min_stay && (
              <div className="relative group flex items-center">
                <span className='text-sm'>{`${row.min_stay}-`}</span>
                <MoonStar className="cursor-help" size={16} color="#4B5563" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Minimum Stay (nights)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
           }
           {
            row?.floor && (
              <div className="relative group flex items-center">
                <span className='text-sm'>{`${row?.floor}-`}</span>
                <LayersPlus className="ml-1 cursor-help" size={16} color="#4B5563" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Floor Level
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )
           } */}
           {row.is_checkout_due && (
                  <div className="relative group">
                    🔴
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Checkout Due
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {row?.open_cases_count > 0 && (
                  <div className="relative group">
                    🛠️
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {row.open_cases_count} Open Case{row.open_cases_count > 1 ? 's' : ''}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {row.is_lease_ending && (
                  <div className="relative group">
                    🚩
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Lease Ending
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {row?.open_tasks_count > 0 && (
                  <div className="relative group">
                    ⚙️
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {row.open_tasks_count} Open Task{row.open_tasks_count > 1 ? 's' : ''}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
          {row.is_balcony_available && (
            <div className="relative group">
              <svg 
                fill="#808080" 
                height="20" 
                width="20" 
                version="1.1" 
                xmlns="http://www.w3.org/2000/svg" 
                xmlnsXlink="http://www.w3.org/1999/xlink" 
                viewBox="0 0 512 512" 
                xmlSpace="preserve" 
                stroke="#808080"
                className="cursor-help"
              >
                <g strokeWidth="0"></g>
                <g strokeLinecap="round" strokeLinejoin="round"></g>
                <g> 
                  <g> 
                    <path d="M472,280h-16H136.084c-0.016,0-0.032,0-0.048,0H56H40c-13.234,0-24,10.767-24,24c0,4.418,3.582,8,8,8s8-3.582,8-8 c0-4.411,3.589-8,8-8h6.556L27.983,407.443c-2.81,16.864,0.486,34.225,9.282,48.884L48,474.216V503c0,4.963,4.038,9,9,9h398 c4.962,0,9-4.037,9-9v-28.784l10.735-17.889c8.796-14.659,12.092-32.02,9.282-48.884L465.444,296H472c4.411,0,8,3.589,8,8 c0,4.418,3.582,8,8,8s8-3.582,8-8C496,290.767,485.234,280,472,280z M421.015,448.095L411.471,464h-23.654l5.652-14.13 c4.385-10.962,6.014-22.959,4.71-34.694L384.938,296h24.285l19.012,114.074C430.42,423.19,427.856,436.693,421.015,448.095z M346.603,464l5.335-18.69c2.368-8.292,3.223-16.856,2.541-25.456L344.659,296h24.18l13.438,120.943 c1.014,9.127-0.252,18.458-3.664,26.983L370.584,464H346.603z M304.463,464l1.646-29.252c0.096-1.711,0.131-3.449,0.104-5.168 L304.126,296h24.483l9.92,125.119c0.53,6.688-0.134,13.349-1.976,19.798L329.964,464H304.463z M264,464V296h24.124l2.091,133.83 c0.021,1.337-0.006,2.69-0.081,4.021L288.438,464H264z M223.515,464l-1.872-29.944c-0.092-1.484-0.126-2.986-0.1-4.467L223.863,296 H248v168H223.515z M100.529,464l-9.544-15.905c-6.841-11.401-9.405-24.904-7.22-38.021L102.777,296h24.285L113.82,415.176 c-1.304,11.735,0.325,23.732,4.71,34.694l5.652,14.13H100.529z M141.416,464l-8.03-20.073c-3.411-8.525-4.678-17.856-3.664-26.983 L143.161,296h24.175l-9.884,123.77c-0.691,8.658,0.175,17.28,2.575,25.627L165.376,464H141.416z M182.024,464l-6.62-23.025 c-1.867-6.491-2.541-13.197-2.003-19.932L183.387,296h24.473l-2.314,133.311c-0.034,1.902,0.01,3.834,0.129,5.742l1.81,28.947 H182.024z M43.765,410.074L62.777,296h23.78L67.983,407.443c-2.81,16.864,0.486,34.225,9.282,48.884L81.869,464h-21.34 l-9.544-15.905C44.144,436.693,41.58,423.19,43.765,410.074z M448,496H64v-16h31.992c0.005,0,0.01,0.001,0.015,0.001 c0.005,0,0.01-0.001,0.015-0.001h39.954c0.009,0,0.017,0.002,0.026,0.002c0.014,0,0.028-0.002,0.042-0.002h39.928 c0.008,0,0.016,0.002,0.024,0.002c0.009,0,0.019-0.002,0.028-0.002h159.952c0.009,0,0.019,0.002,0.028,0.002 c0.008,0,0.016-0.002,0.024-0.002h39.928c0.014,0,0.028,0.002,0.042,0.002c0.009,0,0.017-0.002,0.026-0.002h39.954 c0.005,0,0.01,0.001,0.015,0.001c0.005,0,0.01-0.001,0.015-0.001H448V496z M461.015,448.095L451.471,464h-21.34l4.604-7.673 c8.796-14.659,12.092-32.02,9.282-48.884L425.444,296h23.779l19.012,114.074C470.42,423.19,467.856,436.693,461.015,448.095z"></path> 
                    <path d="M104,264c4.418,0,8-3.582,8-8V16h288v240c0,4.418,3.582,8,8,8s8-3.582,8-8V16c0-8.822-7.178-16-16-16H112 c-8.822,0-16,7.178-16,16v240C96,260.418,99.582,264,104,264z"></path> 
                    <path d="M376,264c4.418,0,8-3.582,8-8V40c0-4.418-3.582-8-8-8H136c-4.418,0-8,3.582-8,8v216c0,4.418,3.582,8,8,8s8-3.582,8-8V136 h79.999c4.418,0,8-3.582,8-8s-3.582-8-8-8H144V48h104v208c0,4.418,3.582,8,8,8s8-3.582,8-8V136h104v120 C368,260.418,371.582,264,376,264z M264,120V48h104v72H264z"></path> 
                  </g> 
                </g>
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Balcony Available
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
          {row.is_pet_friendly && (
            <div className="relative group">
              <Dog className="cursor-help" size={22} color="#4B5563" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Pet Friendly
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
           )} 

          {row.is_refurbished && (
            <div className="relative group">
              <Sparkles className="cursor-help" size={16} color="#4B5563" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Refurbished
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
           )} 
           
           </div>
        </div>

        {/*
          Timeline cell — date cells + booking blocks for this row.
          ResourceRow handles its own internal layout (DateCell grid + BookingBlock overlays).
        */}
        <div className="relative" style={{ width: dates.length * cellWidth }}>
          <ResourceRow
            resource={row}
            dates={dates}
            dateIndexMap={dateIndexMap}
            resourceBookings={bookingsByResourceId.get(String(row.id)) || []}
            selection={selection}
            dragState={dragState}
            availabilityByParent={availabilityByParent}
            frontendAvailabilityByParent={frontendAvailabilityByParent}
            onCellMouseDown={onCellMouseDown}
            onCellMouseEnter={onCellMouseEnter}
            onBookingClick={onBookingClick}
            onBookingRightClick={onBookingRightClick}
            onBookingDragStart={onBookingDragStart}
            cellWidth={cellWidth}
            rowHeight={rowHeight}
            isSquareUser={isSquareUser}
          />
        </div>

      </div>
    </div>
  )
})

SchedulerRow.displayName = 'SchedulerRow'

export default SchedulerRow

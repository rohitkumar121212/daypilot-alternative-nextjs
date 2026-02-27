'use client'

import Image from 'next/image'

const Header = () => {
  const baseDomain="https://aperfectstay.ai"
  
  const menuItems = [
    { label: 'aPerfect Housekeeping', url: `${baseDomain}/aperfect10/gsadmin` },
    { label: 'aPerfect Team: Collaborate', url: `${baseDomain}/aperfect10/staff_accountability/report` },
    { label: 'aPerfect PMS', url: `${baseDomain}/aperfect-pms` },
    { label: 'aPerfect HRMS', url: `${baseDomain}/hrcloud/dashboard` },
    { label: 'aPerfect Dashboard', url: `${baseDomain}/select_products` }
  ]
  
  const navItems = [
    { label: 'Dashboard', hasDropdown: false },
    { label: 'PMS', hasDropdown: false },
    { label: 'Manage Properties', hasDropdown: false },
    { 
      label: 'Room Operations', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'Daily Check-in List', url: `${baseDomain}/aperfect-pms/checkin-list` },
        { label: 'Daily Check-out List', url: `${baseDomain}/aperfect-pms/checkout-list` },
        { label: 'Daily Reservations List', url: `${baseDomain}/aperfect-pms/reservation-list` },
        { label: 'Daily In-house Guest List', url: `${baseDomain}/pms/report-viewer/in-house-guests` },
        { label: 'Cancelled Bookings', url: `${baseDomain}/pms/cancelled-bookings` },
        { label: 'Temp Hold List', url: `${baseDomain}/aperfect-pms/temp-list` },
        { label: 'Housekeeping List', url: `${baseDomain}/aperfect-pms/housekeeping` },
        { label: 'Housekeeping Inspection', url: `${baseDomain}/aperfect10/gsadmin` }
      ]
    },
    { label: 'Reports', hasDropdown: false },
    { 
      label: 'Channel Manager', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'Inventory & Rates', url: `${baseDomain}/channel-operations-inventory?active_true=inventory` },
        { label: 'Bookings', url: `${baseDomain}/channel-operations-bookings?active_true=bookings` },
        { label: 'Properties', url: `${baseDomain}/channel-operations-properties?active_true=properties` },
        { label: 'Rate Plans', url: `${baseDomain}/channel-operations-rates?active_true=rooms` },
        { label: 'Manage Channels', url: `${baseDomain}/channel-operations-channels?active_true=channels` },
        { label: 'Messages', url: `${baseDomain}/channel-operations-messages?active_true=messages` },
        { label: 'Reviews', url: `${baseDomain}/channel-operations-reviews?active_true=reviews` },
      ]
    },
    { label: 'APS Channel Manager', hasDropdown: false },
    { 
      label: 'Integrations', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'aPerfect Docs: Inspections', url: `${baseDomain}/aperfect10/gsadmin` },
        { label: 'Channel Manager', url: `${baseDomain}/aperfect-pms/settings` },
        { label: 'Nuki Smart Locks', url: `${baseDomain}/aperfect10/smart-locks/all-properties` },
        { label: 'Reserve Parking', url: `${baseDomain}/manage-parking-in-building` }
      ]
    },
    { 
      label: 'Manage', 
      hasDropdown: true,
      dropdownItems: [
        { label: 'Advanced Search', url: `${baseDomain}/aperfect-pms/advanced-search` },
        { label: 'Add Agents/Clients', url: `${baseDomain}/aperfect10/cases/account/edit-all` },
        { label: 'Xero Invoice Search', url: `${baseDomain}/aperfect-pms/search-xero-invoice` },
        { label: 'Consolidated Invoice', url: `${baseDomain}/aperfect-pms/consolidated-invoice` },
        { label: 'Apartment Availability Guide', url: `${baseDomain}/aperfect-pms/weekly-availability-report` },
        { label: 'Expense Management', url: `${baseDomain}/aperfect-pms/expense-table` },
        { label: 'Damages Tracker', url: `${baseDomain}/aperfect10/damages/dashboard` },
        { label: 'Todo List', url: `${baseDomain}/aperfect-pms/todo-list` },
        { label: 'Night Audit', url: `${baseDomain}/aperfect-pms/night-audit` },
        { label: 'Group Booking', url: `${baseDomain}/aperfect-pms/check-availability` },
        { label: 'Group Billing', url: `${baseDomain}/aperfect-pms/add-reservation` },
        { label: 'GSA Arrivals', url: `${baseDomain}/gsa-arrivals` },
        { label: 'Lost and Found', url: `${baseDomain}/lost-and-found` },
        { label: 'Generate Payment Link', url: `${baseDomain}/aperfect-pms/add-payment` },
        { label: 'Settings', url: `${baseDomain}/aperfect-pms/settings` },
      ]
    }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-6 flex-1">
          {/* Logo */}
          <Image 
            src="https://aperfectstay.ai/static/images/logo_image.png" 
            alt="A Perfect Stay" 
            width={100} 
            height={30}
            className="w-auto flex-shrink-0"
          />

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="flex items-center gap-4 flex-wrap">
              <li className="relative group">
                <a href="#" className="flex items-center gap-1">
                  <Image 
                    src="/icons/9dots.png" 
                    alt="Menu" 
                    width={20} 
                    height={20}
                  />
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                
                {/* 9dots Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform translate-y-[-10px] group-hover:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-2 z-50">
                  {menuItems.map((menuItem) => (
                    <a
                      key={menuItem.label}
                      href={menuItem.url}
                      className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                    >
                      {menuItem.label}
                    </a>
                  ))}
                </div>
              </li>
              {navItems.map((item) => (
                <li key={item.label} className="relative group">
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap font-normal flex items-center gap-1"
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </a>
                  
                  {/* Dropdown Menu */}
                  {item.hasDropdown && item.dropdownItems && (
                    <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform translate-y-[-10px] group-hover:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-2 z-50">
                      {item.dropdownItems.map((dropdownItem) => (
                        <a
                          key={dropdownItem.label}
                          href={dropdownItem.url}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                        >
                          {dropdownItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">User Name</div>
            <div className="text-xs text-gray-500">user@example.com</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


/* OLD LAYOUT - Left, Middle, Right */
// const Header = () => {
//   const navItems = [
//     'Dashboard',
//     'PMS',
//     'Manage Properties',
//     'Room Operations',
//     'Reports',
//     'Channel Manager',
//     'APS Channel Manager',
//     'Integrations',
//     'Manage'
//   ]

//   return (
//     <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//       <div className="flex items-center justify-between px-6 py-3">
//         {/* Logo */}
//         <div className="flex-shrink-0">
//           <Image 
//             src="https://aperfectstay.ai/static/images/logo_image.png" 
//             alt="A Perfect Stay" 
//             width={80} 
//             height={30}
//             className="w-auto"
//           />
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 flex justify-center px-4">
//           <ul className="flex items-center gap-4 flex-wrap justify-center">
//             <li>
//               <a href="#" className="flex items-center">
//                 <Image 
//                   src="/icons/9dots.png" 
//                   alt="Menu" 
//                   width={20} 
//                   height={20}
//                 />
//               </a>
//             </li>
//             {navItems.map((item) => (
//               <li key={item}>
//                 <a
//                   href="#"
//                   className="text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap font-medium"
//                 >
//                   {item}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* User Info */}
//         <div className="flex-shrink-0 flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
//             U
//           </div>
//           <div className="text-right">
//             <div className="text-sm font-medium text-gray-900">User Name</div>
//             <div className="text-xs text-gray-500">user@example.com</div>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }

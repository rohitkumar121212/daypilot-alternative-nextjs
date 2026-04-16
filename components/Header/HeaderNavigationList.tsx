import Image from 'next/image'

interface HeaderNavigationListProps {
  user: any
}
const HeaderNavigationList = ({ user }: HeaderNavigationListProps) => {
    const baseDomain="https://aperfectstay.ai"

    const isChannexEnabled = user?.admin_details?.channex_enabled
  
    const menuItems = [
        { label: 'aPerfect Housekeeping', url: `${baseDomain}/aperfect10/gsadmin` },
        { label: 'aPerfect Team: Collaborate', url: `${baseDomain}/aperfect10/staff_accountability/report` },
        { label: 'aPerfect PMS', url: `${baseDomain}/aperfect-pms` },
        { label: 'aPerfect HRMS', url: `${baseDomain}/hrcloud/dashboard` },
        { label: 'aPerfect Dashboard', url: `${baseDomain}/select_products` }
    ]
    const allNavItems = [
        { label: 'Dashboard', hasDropdown: false, url: `${baseDomain}/perfect-property-cloud` },
        { label: 'PMS', hasDropdown: false, url: `${baseDomain}/aperfect-pms` },
        { label: 'Manage Properties', hasDropdown: false, url: `${baseDomain}/manage-pms-properties` },
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
        { label: 'Reports', hasDropdown: false, url: `${baseDomain}/aperfect-pms/all-business-reports` },
        { 
        label: 'Channel Manager', 
        hasDropdown: true,
        showCondition: isChannexEnabled, // 🎯 Conditional display
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

    // 🎯 Filter navigation items based on conditions
    const navItems = allNavItems.filter(item => {
        // If item has showCondition, check it; otherwise show by default
        return item.showCondition !== false
    })
    return (
        <nav className="flex-1 flex justify-center px-4">
            <ul className="flex items-center gap-4 flex-wrap justify-center">
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
                    <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform -translate-y-2.5 group-hover:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-50 py-2 z-50">
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
                    href={item.hasDropdown ? "#" : item.url}
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
                    <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform -translate-y-2.5 group-hover:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-50 py-2 z-50">
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
    )
}

export default HeaderNavigationList
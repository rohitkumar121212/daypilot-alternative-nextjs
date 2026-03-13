'use client'

import { useUser } from '@/contexts/UserContext'
import HeaderLogo from './HeaderLogo'
import HeaderNavigationList from './HeaderNavigationList'
import HeaderUserInfo from './HeaderUserInfo'

const Header = () => {
  const { user, isLoading, error } = useUser()
  const baseDomain="https://aperfectstay.ai"

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <HeaderLogo />
          <HeaderNavigationList user={user} />
          <HeaderUserInfo user={user} />
        </div>
      </header>
    </>
  )
}

export default Header

// Old Layout for header
{/* <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6 flex-1">
          <Image 
            src="https://aperfectstay.ai/static/images/logo_image.png" 
            alt="A Perfect Stay" 
            width={100} 
            height={30}
            className="w-auto shrink-0"
          />

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
        </div>

        <div className="shrink-0 flex items-center gap-3 relative group cursor-pointer">
           <div className="w-10 h-10 rounded-full overflow-hidden">
            {user?.company_logo_details?.url ? (<Image
              src={`https:${user.company_logo_details.url}`}
              alt="Company Logo"
              width={40}
              height={40}
              className="object-cover"
            />):(
              <Image
              src="https://aperfectstay.ai/static/images/user.png" // you can replace this later with company logo URL
              alt="Company Logo"
              width={40}
              height={40}
              className="object-cover"
            />
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user?.name || "User Name"}</div>
            <div className="text-xs text-gray-500">{user?.email || "user@example.com"}</div>
          </div>
          
          <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform -translate-y-2.5 group-hover:translate-y-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-45 py-2 z-50">
            {userMenuItems.map((menuItem) => (
              <a
                key={menuItem.label}
                href={menuItem.url}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
              >
                {menuItem.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header> */}
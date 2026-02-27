'use client'

import Image from 'next/image'

const Header = () => {
  const navItems = [
    'Dashboard',
    'PMS',
    'Manage Properties',
    'Room Operations',
    'Reports',
    'Channel Manager',
    'APS Channel Manager',
    'Integrations',
    'Manage'
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image 
            src="https://aperfectstay.ai/static/images/logo_image.png" 
            alt="A Perfect Stay" 
            width={80} 
            height={30}
            className="w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex justify-center px-4">
          <ul className="flex items-center gap-4 flex-wrap justify-center">
            <li>
              <a href="#" className="flex items-center">
                <Image 
                  src="/icons/9dots.png" 
                  alt="Menu" 
                  width={20} 
                  height={20}
                />
              </a>
            </li>
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors whitespace-nowrap font-medium"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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

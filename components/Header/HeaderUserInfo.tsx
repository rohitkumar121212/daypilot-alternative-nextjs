import Image from "next/image"
import { getUserInfoImageUrl } from "../../utils/common"
interface HeaderUserInfoProps {
  user: any
}
const HeaderUserInfo = ({user}:HeaderUserInfoProps) => {
    const baseDomain="https://aperfectstay.ai"
    const logoUrl = getUserInfoImageUrl(user?.company_logo_details?.url)
    const userMenuItems = [
    { label: 'Switch Account', url: `${baseDomain}/collaboration_access` },
    { label: 'Edit Accout Picture', url: `${baseDomain}/aperfect10/account/picture` },
    { label: 'Change Password', url: `${baseDomain}/aperfect10/account/change_password` },
    { label: 'Edit Profile', url: `${baseDomain}/aperfectstay/user/4789839916433408` },
    { label: 'Manage Billing Account', url: `${baseDomain}/billing/edit` },
    { label: 'Logout', url: `${baseDomain}/logout` }
  ]
    return (
        <div className="shrink-0 flex items-center gap-3 relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full overflow-hidden">
                {user?.company_logo_details?.url ? (
                    <Image
                        src={logoUrl || "https://aperfectstay.ai/static/images/user.png"}
                        alt="Company Logo"
                        width={40}
                        height={40}
                        className="object-cover"
                    />
                ):(
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
            <div className="text-sm font-medium text-gray-900">{`Hi ${user?.name? user?.name : "User Name"}`}</div>
            <div className="text-xs text-gray-500">{user?.email || "user@example.com"}</div>
            </div>
                
            {/* User Dropdown Menu */}
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
    )
}

export default HeaderUserInfo
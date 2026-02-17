interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="overflow-x-auto bg-gray-100 px-6 flex-shrink-0">
      <div className="flex gap-2 min-w-max py-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white bg-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Tabs

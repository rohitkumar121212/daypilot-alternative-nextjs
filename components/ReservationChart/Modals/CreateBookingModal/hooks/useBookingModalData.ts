import { useState, useEffect } from 'react'
import { proxyFetch } from '@/utils/proxyFetch'

export const useBookingModalData = (isOpen: boolean) => {
  const [caseAccounts, setCaseAccounts] = useState([])
  const [guests, setGuests] = useState([])
  const [taxSets, setTaxSets] = useState([])
  const [constants, setConstants] = useState(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true)
      
      Promise.all([
        proxyFetch('/aps-api/v1/case-accounts/'),
        proxyFetch('/aps-api/v1/guests/'),
        proxyFetch('/aps-api/v1/taxsets/'),
        fetch('https://aperfectstay.ai/aps-api/v1/constants/').then(res => res.json())
      ])
        .then(([caseAccountsData, guestsData, taxSetsData, constantsData]) => {
          // Transform accounts and taxsets to match FloatingAutocomplete format
          const transformedAccounts = caseAccountsData?.account_list?.map((account: any) => ({
            label: account['data-string'],
            value: account.account_id
          })) || []
          
          const transformedTaxSets = taxSetsData?.account_list?.map((tax: any) => ({
            label: tax['data-string'],
            value: tax.account_id
          })) || []
          
          setCaseAccounts(caseAccountsData?.data || [])
          setGuests(guestsData?.data || [])
          setTaxSets(taxSetsData?.data || [])
          setConstants({
            ...constantsData?.data,
            accounts: transformedAccounts,
            taxSets: transformedTaxSets
          })
        })
        .catch(err => console.error('Failed to fetch modal data:', err))
        .finally(() => setIsLoadingData(false))
    }
  }, [isOpen])

  return {
    caseAccounts,
    guests,
    taxSets,
    constants,
    isLoadingData
  }
}
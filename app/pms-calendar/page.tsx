export const dynamic = 'force-dynamic'

import { requireAuth } from '@/lib/auth'
import ReservationChart from "@/components/ReservationChart/ReservationChart";

const PMS = async () => {
    await requireAuth('/pms-calendar')

    return (
        <div>
            <ReservationChart />
        </div>
    )
};

export default PMS;
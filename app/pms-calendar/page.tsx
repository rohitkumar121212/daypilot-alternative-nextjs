import AuthGuard from '@/components/AuthGuard'
import ReservationChart from "@/components/ReservationChart/ReservationChart";

const PMS = () => {
    return (
        <AuthGuard>
            <div>
                <ReservationChart />
            </div>
        </AuthGuard>
    )
};

export default PMS;

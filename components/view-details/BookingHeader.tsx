import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowLeftRight,
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Database,
  Edit,
  Hash,
  KeyRound,
  Link2,
  Mail,
  Package,
  Paperclip,
  Printer,
  RefreshCw,
  Scissors,
  Star,
  UserX,
} from "lucide-react";

interface BookingHeaderProps {
  bookingId: string;
  propertyName: string;
  propertyAddress: string;
  status: string;
  onBack?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
}

const statusConfig = {
  "checked-in": {
    label: "Checked In",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  "checked-out": {
    label: "Checked Out",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: null,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: null,
  },
  reserved: {
    label: "Reserved",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: null,
  },
};

const BookingHeader = ({
  bookingId,
  propertyName,
  propertyAddress,
  status,
  onBack,
  onPrint,
  onEdit,
}: BookingHeaderProps) => {
  const statusInfo = statusConfig[status.toLowerCase() as keyof typeof statusConfig];

  return (
    <div className="flex items-start justify-between mb-8">
      {/* Left: Back + Title */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to bookings
        </button>

        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Booking {bookingId}
          </h1>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo?.className}`}
          >
            {statusInfo?.icon}
            {statusInfo?.label}
          </Badge>
        </div>

        <p className="text-sm font-semibold text-slate-700">{propertyName}</p>
        <p className="text-sm text-slate-400">{propertyAddress}</p>
      </div>

      {/* Right: ID + Actions */}
      <div className="flex flex-col items-end gap-3">
        <span className="text-xs text-slate-400 font-mono">ID: {bookingId}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Booking
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                Actions
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* BOOKING */}
              <DropdownMenuLabel>Booking</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Add Payment
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                  Currency Converter
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Ban className="w-4 h-4" />
                  Cancel Booking
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserX className="w-4 h-4 text-slate-500" />
                  Mark as No-Show
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Scissors className="w-4 h-4 text-slate-500" />
                  Partial Cancellation
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* OPERATIONS */}
              <DropdownMenuLabel>Operations</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  KeyNest
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Package className="w-4 h-4 text-slate-500" />
                  Lost &amp; Found
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  Attachments
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 text-slate-500" />
                  Reviews
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 text-slate-500" />
                  Email Status
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Clock className="w-4 h-4 text-slate-500" />
                  Recent Updates (Audit Log)
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* ADVANCED */}
              <DropdownMenuLabel>Advanced</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  Sync with Salesforce / Enq App
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link2 className="w-4 h-4 text-slate-500" />
                  Link Guest &amp; Booking
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Database className="w-4 h-4 text-slate-500" />
                  Reset Split in DB
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Hash className="w-4 h-4 text-slate-500" />
                  Enter Enquiry ID
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;

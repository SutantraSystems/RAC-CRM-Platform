import React from "react";
import {
  User,
  CalendarRange,
  CalendarDays,
  GraduationCap,
  WalletCards,
  Building2,
  CalendarClock,
  Tag,
} from "lucide-react";
import ModuleDetailsPage from "../components/common/ModuleDetailsPage";
import { InfoRow, InfoSection } from "../components/common/DetailInfo";
import PaymentForm from "../components/forms/PaymentForm";
import { paymentApi } from "../services/paymentApi";
import {
  INTAKE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  PAYMENT_CATEGORY_OPTIONS,
  formatAmount,
  getOptionLabel,
} from "../config/crmConfig";

const renderOverview = ({ item }) => (
  <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
    <InfoSection title="Student Information">
      <InfoRow icon={User} label="Student Name" value={item.student_name} />
      <InfoRow icon={CalendarRange} label="Intake" value={getOptionLabel(INTAKE_OPTIONS, item.intake, "")} />
      <InfoRow icon={CalendarDays} label="Year" value={item.year} />
      <InfoRow icon={GraduationCap} label="University" value={item.university} />
    </InfoSection>

    <InfoSection title="Payment Information">
      <InfoRow icon={WalletCards} label="Amount" value={formatAmount(item.amount) === "-" ? "" : formatAmount(item.amount)} />
      <InfoRow icon={Building2} label="Organization" value={item.organization} />
      <InfoRow icon={CalendarClock} label="Payment" value={getOptionLabel(PAYMENT_TYPE_OPTIONS, item.payment_type, "")} />
      <InfoRow icon={Tag} label="Category" value={getOptionLabel(PAYMENT_CATEGORY_OPTIONS, item.category, "")} />
    </InfoSection>
  </div>
);

export default function PaymentDetails() {
  return (
    <ModuleDetailsPage
      api={paymentApi}
      basePath="/payments"
      singular="Payment"
      plural="Payments"
      getTitle={(item) => item.student_name || "Unnamed Student"}
      getName={(item) => `the payment for ${item.student_name || "this student"}`}
      renderOverview={renderOverview}
      FormComponent={PaymentForm}
    />
  );
}
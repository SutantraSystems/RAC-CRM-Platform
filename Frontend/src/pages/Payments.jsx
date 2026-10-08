import React from "react";
import ModuleListPage from "../components/common/ModuleListPage";
import PaymentForm from "../components/forms/PaymentForm";
import { paymentApi } from "../services/paymentApi";
import {
  INTAKE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_CATEGORY_OPTIONS,
  formatAmount,
  getOptionLabel,
} from "../config/crmConfig";

const FILTER_FIELDS = [
  {
    key: "search",
    type: "search",
    placeholder: "Search student, university, organization, status, category",
  },
  { key: "intake", type: "select", options: INTAKE_OPTIONS, allLabel: "All Intakes", widthClass: "lg:w-[135px]" },
  { key: "year", type: "year" },
  { key: "payment_type", type: "select", options: PAYMENT_TYPE_OPTIONS, allLabel: "All Payments", widthClass: "lg:w-[140px]" },
  { key: "status", type: "select", options: PAYMENT_STATUS_OPTIONS, allLabel: "All Status", widthClass: "lg:w-[150px]" },
  { key: "category", type: "select", options: PAYMENT_CATEGORY_OPTIONS, allLabel: "All Categories", widthClass: "lg:w-[160px]" },
];

const COLUMNS = [
  { key: "student_name", label: "Student Name" },
  { key: "intake", label: "Intake", render: (row) => getOptionLabel(INTAKE_OPTIONS, row.intake) },
  { key: "year", label: "Year" },
  { key: "university", label: "University" },
  { key: "amount", label: "Amount", render: (row) => formatAmount(row.amount) },
  { key: "organization", label: "Organization" },
  { key: "payment_type", label: "Payment", render: (row) => getOptionLabel(PAYMENT_TYPE_OPTIONS, row.payment_type) },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className="text-sm font-medium text-slate-700">
        {getOptionLabel(PAYMENT_STATUS_OPTIONS, row.status)}
      </span>
    ),
  },
  { key: "category", label: "Category", render: (row) => getOptionLabel(PAYMENT_CATEGORY_OPTIONS, row.category) },
];

export default function Payments() {
  return (
    <ModuleListPage
      api={paymentApi}
      basePath="/payments"
      title="Payments"
      singular="Payment"
      plural="Payments"
      addLabel="Add Payment"
      filterFields={FILTER_FIELDS}
      columns={COLUMNS}
      FormComponent={PaymentForm}
      getName={(row) => `the payment for ${row.student_name || "this student"}`}
    />
  );
}
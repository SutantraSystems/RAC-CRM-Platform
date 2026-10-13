import React from "react";
import ModuleListPage from "../components/common/ModuleListPage";
import UniversityForm from "../components/forms/UniversityForm";
import {universityApi } from "../services/universityApi";

// Search box only 
const FILTER_FIELDS = [
  {
    key: "search",
    type: "search",
    placeholder: "Search name, phone, email, organisation, designation",
  },
];

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone_number", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "organisation_name", label: "Organisation Name" },
  { key: "designation", label: "Designation" },
];

export default function Universities() {
  return (
    <ModuleListPage
      api={universityApi}
      basePath="/universities"
      title="Contact List"
      singular="Contact"
      plural="Contacts"
      addLabel="Add Contact"
      filterFields={FILTER_FIELDS}
      columns={COLUMNS}
      FormComponent={UniversityForm}
      getName={(row) => row.name || "this contact"}
    />
  );
}
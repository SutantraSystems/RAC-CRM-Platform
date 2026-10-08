import React from "react";
import { User, Phone, Mail, Building2, BriefcaseBusiness } from "lucide-react";
import ModuleDetailsPage from "../components/common/ModuleDetailsPage";
import { InfoRow, InfoSection } from "../components/common/DetailInfo";
import UniversityForm from "../components/forms/UniversityForm";
import { universityApi } from "../services/universityApi";

const renderOverview = ({ item }) => (
  <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
    <InfoSection title="Contact Information">
      <InfoRow icon={User} label="Name" value={item.name} />
      <InfoRow icon={Phone} label="Phone Number" value={item.phone_number} />
      <InfoRow icon={Mail} label="Email" value={item.email} />
    </InfoSection>

    <InfoSection title="Organisation Information">
      <InfoRow icon={Building2} label="Organisation Name" value={item.organisation_name} />
      <InfoRow icon={BriefcaseBusiness} label="Designation" value={item.designation} />
    </InfoSection>
  </div>
);

export default function UniversityDetails() {
  return (
    <ModuleDetailsPage
      api={universityApi}
      basePath="/universities"
      singular="University"
      plural="Universities"
      getTitle={(item) => item.name || "Unnamed University"}
      getName={(item) => item.name || "this university"}
      renderOverview={renderOverview}
      FormComponent={UniversityForm}
    />
  );
}
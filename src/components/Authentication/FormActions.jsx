import React from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

const FormActions = ({ onCancel, submitLabel = "Save Changes" }) => (
  <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", alignItems: "center" }}>
    <SecondaryButton
      type="button"
      className="!mt-0 !w-auto !min-w-[130px] !h-[48px] !px-6 !py-2 !text-base !rounded-xl"
      onClick={onCancel}
    >
      Cancel
    </SecondaryButton>
    <PrimaryButton
      type="submit"
      className="!mt-0 !w-auto !min-w-[130px] !h-[48px] !px-6 !py-2 !text-base !rounded-xl"
    >
      {submitLabel}
    </PrimaryButton>
  </div>
);

export default FormActions;

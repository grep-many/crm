import { Button } from "@/components/ui/button";
import FormControls from "./FormControls";

const CommonForm = ({
  handleSubmit,
  buttonText = "Submit",
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled = true,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <FormControls formControls={formControls} formData={formData} setFormData={setFormData} />
      <Button type="submit" className="mt-5 w-full" disabled={isButtonDisabled}>
        {buttonText}
      </Button>
    </form>
  );
};

export default CommonForm;
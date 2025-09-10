import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormControls from "../CommonForm/FormControls";
import { toast } from "sonner";

export default function GenericModal({
  title = "Form",
  triggerElement,       
  formControls = [],    
  formData,
  setFormData,
  onSubmit,
  successMessage = "Action completed successfully!",
  validate
}) {
  const [internalData, setInternalData] = useState(formData || {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !setFormData) setInternalData(formData || {});
  }, [open, setFormData, formData]);

  const isControlled = Boolean(setFormData);
  const effectiveData = useMemo(
    () => (isControlled ? (formData || {}) : internalData),
    [isControlled, formData, internalData]
  );
  const effectiveSetter = useMemo(
    () => (isControlled ? setFormData : setInternalData),
    [isControlled, setFormData]
  );

  const handleConfirm = async () => {
    // ✅ run validation if provided
    if (typeof validate === "function") {
      const result = validate(effectiveData);
      if (result) {
        // Handle both string and array returns
        if (Array.isArray(result)) {
          if (result.length > 0) {
            result.forEach((err) => toast(err));
            return;
          }
        } else {
          toast(result);
          return;
        }
      }
    }

    try {
      await onSubmit(effectiveData);
      toast(successMessage);
      setOpen(false);
    } catch (err) {
      toast(err?.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerElement ? (
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="default">{title}</Button>
        </DialogTrigger>
      )}

      <DialogContent
        // aria-describedby="generic-dialog-description"
        className="sm:max-w-md w-full p-6 backdrop-blur-sm pointer-events-auto"
        // onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription 
            //   id="generic-dialog-description" 
            className="sr-only">
            Form dialog
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          <FormControls
            formControls={formControls}
            formData={effectiveData}
            setFormData={effectiveSetter}
          />
        </div>

        <DialogFooter className="mt-4 flex gap-2">
          <Button variant="outline" className="w-1/2" onClick={() => setOpen(false)}>
            Abort
          </Button>
          <Button onClick={handleConfirm} className="w-1/2">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function FormControls({ formControls = [], formData, setFormData }) {
  // State to manage visibility of password fields
  const [passwordVisible, setPasswordVisible] = useState({});

  const togglePassword = (name) => {
    setPasswordVisible((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderComponentByType = (ctrl) => {
    const value = formData[ctrl.name] || "";

    switch (ctrl.componentType) {
    case "input":
      if (ctrl.type === "password") {
        // Password field with toggle
        return (
          <div className="relative">
            <Input
              id={ctrl.name}
              name={ctrl.name}
              placeholder={ctrl.placeholder}
              type={passwordVisible[ctrl.name] ? "text" : "password"}
              value={value}
              onChange={(e) =>
                setFormData({ ...formData, [ctrl.name]: e.target.value })
              }
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePassword(ctrl.name)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
            >
              {passwordVisible[ctrl.name] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        );
      } else {
        return (
          <Input
            id={ctrl.name}
            name={ctrl.name}
            placeholder={ctrl.placeholder}
            type={ctrl.type}
            value={value}
            className="my-2"
            onChange={(e) =>
              setFormData({ ...formData, [ctrl.name]: e.target.value })
            }
          />
        );
      }

    case "select":
      return (
        <Select
          onValueChange={(val) =>
            setFormData({ ...formData, [ctrl.name]: val })
          }
          value={value}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={ctrl.label} />
          </SelectTrigger>
          <SelectContent>
            {ctrl.options?.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "textarea":
      return (
        <Textarea
          id={ctrl.name}
          name={ctrl.name}
          placeholder={ctrl.placeholder}
          value={value}
          onChange={(e) =>
            setFormData({ ...formData, [ctrl.name]: e.target.value })
          }
        />
      );

    default:
      return (
        <Input
          id={ctrl.name}
          name={ctrl.name}
          placeholder={ctrl.placeholder}
          type={ctrl.type}
          value={value}
          onChange={(e) =>
            setFormData({ ...formData, [ctrl.name]: e.target.value })
          }
        />
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {formControls.map((ctrl) => (
        <div key={ctrl.name}>
          <Label htmlFor={ctrl.name}>{ctrl.label}</Label>
          {renderComponentByType(ctrl)}
        </div>
      ))}
    </div>
  );
}

export default FormControls;

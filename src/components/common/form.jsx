import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const CommonForm = ({
  formControls,
  formData,
  setFormData,
  buttonText,
  onSubmit,
  isBtnDisabled = false,
  loading = false
}) => {
  const renderInputsTypeComponents = (control) => {
    const value = formData[control.name] || '';

    switch (control.componentType) {
      case 'input':
        return (
          <Input
            name={control.name}
            placeholder={control.placeholder}
            type={control.type}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [control.name]: e.target.value
              })
            }
          />
        );

      case 'select':
        return (
          <Select
            onValueChange={(val) =>
              setFormData({
                ...formData,
                [control.name]: val
              })
            }
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={control.label} />
            </SelectTrigger>
            <SelectContent>
              {control.options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            name={control.name}
            placeholder={control.placeholder}
            id={control.id}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [control.name]: e.target.value
              })
            }
          />
        );

      default:
        return (
          <Input
            name={control.name}
            placeholder={control.placeholder}
            id={control.name}
            type={control.type}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [control.name]: e.target.value
              })
            }
          />
        );
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((control) => (
          <div className="grid w-full gap-1.5" key={control.name}>
            <Label className="mb-1">{control.label}</Label>
            {renderInputsTypeComponents(control)}
          </div>
        ))}
      </div>
      <Button
        type="submit"
        className="mt-3.5 w-full"
        disabled={isBtnDisabled || loading}
      >
        {loading ? 'Please wait...' : buttonText || 'Submit'}
      </Button>
    </form>
  );
};

export default CommonForm;

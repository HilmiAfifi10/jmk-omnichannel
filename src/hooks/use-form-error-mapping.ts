import { useEffect } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

type ActionState = {
	success: boolean;
	errors?: {
		fieldErrors?: Record<string, string[] | undefined>;
		formErrors?: string[];
	};
	message?: string;
};

export function useFormErrorMapping<TFieldValues extends FieldValues>(
	state: ActionState,
	form: UseFormReturn<TFieldValues>
) {
	useEffect(() => {
		if (state.errors) {
			// Handle field-specific errors
			if (state.errors.fieldErrors) {
				Object.entries(state.errors.fieldErrors).forEach(([field, errors]) => {
					if (errors && errors.length > 0) {
						form.setError(field as Path<TFieldValues>, {
							message: errors[0],
						});
					}
				});
			}
			// Handle form-level errors
			if (state.errors.formErrors && state.errors.formErrors.length > 0) {
				toast.error(state.errors.formErrors.join(', '));
			}
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, form]);
}

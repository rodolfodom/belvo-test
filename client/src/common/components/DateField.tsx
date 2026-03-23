import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers/models';
import { Dayjs } from 'dayjs';

type DateFieldProps = {
    label: string;
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
    onError?: (error: DateValidationError) => void;
    maxDate?: Dayjs;
    fullWidth?: boolean;
    error?: boolean;
    helperText?: string;
    size?: 'small' | 'medium';
};

export function DateField({ label, value, onChange, onError, maxDate, fullWidth, error, helperText, size }: DateFieldProps) {
    return (
        <DatePicker
            label={label}
            value={value}
            onChange={onChange}
            onError={onError}
            maxDate={maxDate}
            slotProps={{
                textField: {
                    name: 'date',
                    fullWidth,
                    error,
                    helperText,
                    size,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#ffffff' } },
                },
            }}
        />
    );
}

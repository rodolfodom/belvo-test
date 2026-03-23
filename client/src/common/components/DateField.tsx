import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

type DateFieldProps = {
    label: string;
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
};

export function DateField({ label, value, onChange }: DateFieldProps) {
    return (
        <DatePicker 
            label={label}
            value={value}
            onChange={onChange}
            slotProps={{
                textField: {
                    name: 'date',
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#ffffff' } },
                },
            }}
        />
    );
}

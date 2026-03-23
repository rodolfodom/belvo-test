import { Box, Button, TextField, Modal, MenuItem, Select, InputLabel, FormControl, FormHelperText, Alert, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DateField } from '../../../common/components/DateField';
import { createTransaction } from "../../transactions/services/createTransaction";
import { useHandleAuthError } from "../../../common/hooks/useHandleAuthError";

type FormErrors = {
    reference?: string;
    account?: string;
    type?: string;
    category?: string;
    amount?: string;
    date?: string;
};

export function TransactionForm({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const handleAuthError = useHandleAuthError();

    const clearAndClose = () => {
        setDate(dayjs());
        setIsLoading(false);
        setError(null);
        setFormErrors({});
        onClose();
    };

    const clearFieldError = (field: keyof FormErrors) => {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = (reference: string, account: string, type: string, category: string, amount: string, dateValue: string | null): FormErrors => {
        const errors: FormErrors = {};
        if (!reference.trim()) errors.reference = "Reference is required";
        if (!account.trim()) errors.account = "Account is required";
        if (!type) errors.type = "Type is required";
        if (!category.trim()) errors.category = "Category is required";
        if (!amount) {
            errors.amount = "Amount is required";
        } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
            errors.amount = "Amount must be a positive number";
        }
        if (!dateValue) errors.date = "Date is required";
        return errors;
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const reference = formData.get("reference") as string;
        const account = formData.get("account") as string;
        const type = formData.get("type") as string;
        const category = formData.get("category") as string;
        const amount = formData.get("amount") as string;
        const dateValue = date ? date.format("YYYY-MM-DD") : null;

        const errors = validate(reference, account, type, category, amount, dateValue);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setIsLoading(true);
        try {
            const response = await createTransaction(reference, account, type, category, Number(amount), dateValue as string);
            if (response.status === 401 || response.status === 403) {
                handleAuthError();
                return;
            }
            if (response.status === 409) {
                setFormErrors({ reference: "A transaction with this reference already exists" });
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to create transaction");
            }
            const data = await response.json();
            console.log("Transaction created:", data);
            onSuccess?.();
            clearAndClose();
        } catch (error) {
            console.error("Error creating transaction:", error);
            setError("Failed to create transaction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={clearAndClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
                sx={{
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 24,
                    width: 440,
                    outline: 'none',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 3, pb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                        New Transaction
                    </Typography>
                    <IconButton onClick={clearAndClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {error && (
                    <Box sx={{ px: 3, pb: 1 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                <Box component="form" display="flex" flexDirection="column" gap={2.5} sx={{ px: 3, pb: 3 }} onSubmit={handleSubmit}>
                    <TextField
                        label="Reference"
                        variant="outlined"
                        name="reference"
                        error={!!formErrors.reference}
                        helperText={formErrors.reference}
                        onChange={(e) => e.target.value.trim() && clearFieldError("reference")}
                    />
                    <TextField
                        label="Account"
                        variant="outlined"
                        name="account"
                        error={!!formErrors.account}
                        helperText={formErrors.account}
                        onChange={(e) => e.target.value.trim() && clearFieldError("account")}
                    />
                    <FormControl fullWidth error={!!formErrors.type}>
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                            labelId="type-label"
                            label="Type"
                            name="type"
                            defaultValue=""
                            onChange={() => clearFieldError("type")}
                        >
                            <MenuItem value="inflow">Inflow</MenuItem>
                            <MenuItem value="outflow">Outflow</MenuItem>
                        </Select>
                        {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                    </FormControl>
                    <TextField
                        label="Category"
                        variant="outlined"
                        name="category"
                        error={!!formErrors.category}
                        helperText={formErrors.category}
                        onChange={(e) => e.target.value.trim() && clearFieldError("category")}
                    />
                    <TextField
                        label="Amount"
                        variant="outlined"
                        name="amount"
                        type="number"
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                        onChange={(e) => Number(e.target.value) > 0 && clearFieldError("amount")}
                        error={!!formErrors.amount}
                        helperText={formErrors.amount}
                    />
                    <DateField
                        label="Date"
                        value={date}
                        onChange={(d) => { setDate(d); if (d) clearFieldError("date"); }}
                        onError={(err) => {
                            if (err === "maxDate") setFormErrors((prev) => ({ ...prev, date: "Date cannot be in the future" }));
                            else if (!err) clearFieldError("date");
                        }}
                        maxDate={dayjs()}
                        fullWidth
                        error={!!formErrors.date}
                        helperText={formErrors.date}
                    />
                    <Button disabled={isLoading} variant="contained" color="primary" size="large" type="submit">
                        {isLoading ? "Creating…" : "Create Transaction"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

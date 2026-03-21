
import { Box, Button, TextField, Modal, MenuItem, Select, InputLabel, FormControl, Alert } from "@mui/material";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { Dayjs } from "dayjs";
import { DateField } from '../../../common/components/DateField';
import { createTransaction } from "../../transactions/services/createTransaction";

export function TransactionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [date, setDate] = useState<Dayjs | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearAndClose = () => {
        setDate(null);
        setIsLoading(false);
        setError(null);

        onClose();
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const account = formData.get("account");
        const type = formData.get("type");
        const category = formData.get("category");
        const amount = formData.get("amount");
        const dateValue = date ? date.format("YYYY-MM-DD") : null;
        setIsLoading(true);
        try {
            const response = await createTransaction(account as string, type as string, category as string, Number(amount), dateValue as string);
            if (!response.ok) {
                throw new Error("Failed to create transaction");
            }
            const data = await response.json();
            console.log("Transaction created:", data);
            clearAndClose();
        } catch (error) {
            console.error("Error creating transaction:", error);
            setError("Failed to create transaction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={clearAndClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center",}}>
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, boxShadow: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, }}>
                <h2>Create Transaction</h2>
                {error && <Alert severity="error">{error}</Alert>}
                <Box component="form" display="flex" flexDirection="column" gap={2} width="300px" onSubmit={handleSubmit}>
                    <TextField label="Account" variant="outlined" fullWidth margin="normal" name="account"/>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                            labelId="type-label"
                            label="Type"
                            name="type"
                        >
                            <MenuItem value="inflow">Inflow</MenuItem>
                            <MenuItem value="outflow">Outflow</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Category" variant="outlined" fullWidth margin="normal" name="category"/>
                    <TextField label="Amount" variant="outlined" fullWidth margin="normal" name="amount"/>
                    <DateField label="Date" value={date} onChange={setDate}/>
                    <Button disabled={isLoading} variant="contained" color="primary" type="submit">
                        Create Transaction
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

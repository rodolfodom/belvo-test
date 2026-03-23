import {
    Box,
    Button,
    TextField,
    Modal,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
    Alert,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DateField } from "../../../common/components/DateField";
import { createTransactions } from "../../transactions/services/createTransactions";
import { useHandleAuthError } from "../../../common/hooks/useHandleAuthError";

type RowData = {
    reference: string;
    account: string;
    type: string;
    category: string;
    amount: string;
    date: Dayjs | null;
};

type RowErrors = {
    reference?: string;
    account?: string;
    type?: string;
    category?: string;
    amount?: string;
    date?: string;
};

const emptyRow = (): RowData => ({
    reference: "",
    account: "",
    type: "",
    category: "",
    amount: "",
    date: dayjs(),
});

function validateRow(row: RowData): RowErrors {
    const errors: RowErrors = {};
    if (!row.reference.trim()) errors.reference = "Required";
    if (!row.account.trim()) errors.account = "Required";
    if (!row.type) errors.type = "Required";
    if (!row.category.trim()) errors.category = "Required";
    if (!row.amount) {
        errors.amount = "Required";
    } else if (isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
        errors.amount = "Must be positive";
    }
    if (!row.date) errors.date = "Required";
    return errors;
}

export function BulkTransactionForm({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) {
    const [rows, setRows] = useState<RowData[]>([emptyRow()]);
    const [rowErrors, setRowErrors] = useState<RowErrors[]>([{}]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleAuthError = useHandleAuthError();

    const clearAndClose = () => {
        setRows([emptyRow()]);
        setRowErrors([{}]);
        setIsLoading(false);
        setError(null);
        onClose();
    };

    const updateRow = (index: number, field: keyof RowData, value: string | Dayjs | null) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
        setRowErrors((prev) =>
            prev.map((e, i) => (i === index ? { ...e, [field]: undefined } : e))
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, emptyRow()]);
        setRowErrors((prev) => [...prev, {}]);
    };

    const removeRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
        setRowErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const errors = rows.map(validateRow);
        const hasErrors = errors.some((e) => Object.keys(e).length > 0);
        if (hasErrors) {
            setRowErrors(errors);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const payload = rows.map((r) => ({
                reference: r.reference,
                account: r.account,
                type: r.type,
                category: r.category,
                amount: Number(r.amount),
                date: r.date!.format("YYYY-MM-DD"),
            }));
            const response = await createTransactions(payload);
            if (response.status === 401 || response.status === 403) {
                handleAuthError();
                return;
            }
            if (response.status === 409) {
                const body = await response.json();
                setError(body?.message ?? "One or more transactions already exist");
                return;
            }
            if (!response.ok) {
                throw new Error("Failed to create transactions");
            }
            onSuccess?.();
            clearAndClose();
        } catch {
            setError("Failed to create transactions");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={clearAndClose}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Box
                sx={{
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: 24,
                    width: 680,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    outline: "none",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                        pt: 3,
                        pb: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Bulk Import
                    </Typography>
                    <IconButton onClick={clearAndClose} size="small" sx={{ color: "text.secondary" }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {error && (
                    <Box sx={{ px: 3, pb: 1 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                <Box sx={{ px: 3, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    {rows.map((row, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "stretch",
                                bgcolor: "#f8fafc",
                                borderRadius: 2,
                                p: 1.5,
                            }}
                        >
                            {/* Fields: two rows */}
                            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                                {/* Row 1: reference, account, type, category */}
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        label="Reference"
                                        size="small"
                                        value={row.reference}
                                        error={!!rowErrors[index]?.reference}
                                        helperText={rowErrors[index]?.reference}
                                        onChange={(e) => updateRow(index, "reference", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="Account"
                                        size="small"
                                        value={row.account}
                                        error={!!rowErrors[index]?.account}
                                        helperText={rowErrors[index]?.account}
                                        onChange={(e) => updateRow(index, "account", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <FormControl size="small" sx={{ flex: 1 }} error={!!rowErrors[index]?.type}>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            label="Type"
                                            value={row.type}
                                            onChange={(e) => updateRow(index, "type", e.target.value)}
                                        >
                                            <MenuItem value="inflow">Inflow</MenuItem>
                                            <MenuItem value="outflow">Outflow</MenuItem>
                                        </Select>
                                        {rowErrors[index]?.type && (
                                            <FormHelperText>{rowErrors[index].type}</FormHelperText>
                                        )}
                                    </FormControl>
                                    <TextField
                                        label="Category"
                                        size="small"
                                        value={row.category}
                                        error={!!rowErrors[index]?.category}
                                        helperText={rowErrors[index]?.category}
                                        onChange={(e) => updateRow(index, "category", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                                {/* Row 2: amount, date */}
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        label="Amount"
                                        size="small"
                                        type="number"
                                        value={row.amount}
                                        error={!!rowErrors[index]?.amount}
                                        helperText={rowErrors[index]?.amount}
                                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        onChange={(e) => updateRow(index, "amount", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <DateField
                                            label="Date"
                                            value={row.date}
                                            onChange={(d) => updateRow(index, "date", d)}
                                            onError={(err) => {
                                                if (err === "maxDate")
                                                    setRowErrors((prev) =>
                                                        prev.map((e, i) =>
                                                            i === index ? { ...e, date: "Cannot be in the future" } : e
                                                        )
                                                    );
                                                else if (!err)
                                                    setRowErrors((prev) =>
                                                        prev.map((e, i) =>
                                                            i === index ? { ...e, date: undefined } : e
                                                        )
                                                    );
                                            }}
                                            maxDate={dayjs()}
                                            fullWidth
                                            size="small"
                                            error={!!rowErrors[index]?.date}
                                            helperText={rowErrors[index]?.date}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            {/* Delete button spanning full height */}
                            <IconButton
                                onClick={() => removeRow(index)}
                                disabled={rows.length === 1}
                                sx={{ alignSelf: "stretch", borderRadius: 1, color: "text.secondary" }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}

                    <Button
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={addRow}
                        sx={{ alignSelf: "flex-start" }}
                    >
                        Add row
                    </Button>

                    <Button
                        disabled={isLoading}
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSubmit}
                    >
                        {isLoading ? "Importing…" : `Import ${rows.length} transaction${rows.length !== 1 ? "s" : ""}`}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

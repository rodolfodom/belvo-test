import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BarChart } from "@mui/x-charts/BarChart";
import { type Dayjs } from "dayjs";
import { fetchSummary, type AccountSummary } from "../../transactions/services/fetchSummary";

export function AccountSummaryChart() {
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [data, setData] = useState<AccountSummary[]>([]);

    useEffect(() => {
        const start = startDate?.isValid() ? startDate.format("YYYY-MM-DD") : undefined;
        const end = endDate?.isValid() ? endDate.format("YYYY-MM-DD") : undefined;
        fetchSummary(start, end).then(setData).catch(() => setData([]));
    }, [startDate, endDate]);

    const dataset = data.map((row) => ({
        account: row.account,
        inflow: parseFloat(row.total_inflow),
        outflow: Math.abs(parseFloat(row.total_outflow)),
    }));

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Summary by Account
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <DatePicker
                                label="Start date"
                                value={startDate}
                                onChange={setStartDate}
                                maxDate={endDate ?? undefined}
                                slotProps={{ textField: { size: "small" } }}
                            />
                            <DatePicker
                                label="End date"
                                value={endDate}
                                onChange={setEndDate}
                                minDate={startDate ?? undefined}
                                slotProps={{ textField: { size: "small" } }}
                            />
                        </Box>
                    </Box>

                    {dataset.length === 0 ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                            <Typography color="text.secondary">No data available</Typography>
                        </Box>
                    ) : (
                        <BarChart
                            dataset={dataset}
                            xAxis={[{
                                scaleType: "band",
                                dataKey: "account",
                                label: "Account",
                                categoryGapRatio: 0.4,
                                labelStyle: { fontWeight: 700, fontSize: 13, fill: "#1e3a5f" },
                            }]}
                            yAxis={[{
                                label: "Amount (USD)",
                                labelStyle: { fontWeight: 700, fontSize: 13, fill: "#1e3a5f" },
                            }]}
                            series={[
                                { dataKey: "inflow", label: "Inflow", color: "#2563eb" },
                                { dataKey: "outflow", label: "Outflow", color: "#dc2626" },
                            ]}
                            height={300}
                        />
                    )}
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
}

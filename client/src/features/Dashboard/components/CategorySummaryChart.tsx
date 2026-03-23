import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { fetchSummaryByCategory } from "../../transactions/services/fetchSummaryByCategory";

type CategoryEntry = { category: string; amount: number };

export function CategorySummaryChart() {
    const [inflowData, setInflowData] = useState<CategoryEntry[]>([]);
    const [outflowData, setOutflowData] = useState<CategoryEntry[]>([]);

    useEffect(() => {
        fetchSummaryByCategory()
            .then((data) => {
                const inflow = data["inflow"] ?? {};
                const outflow = data["outflow"] ?? {};
                setInflowData(
                    Object.entries(inflow).map(([category, total]) => ({
                        category,
                        amount: parseFloat(total),
                    }))
                );
                setOutflowData(
                    Object.entries(outflow).map(([category, total]) => ({
                        category,
                        amount: Math.abs(parseFloat(total)),
                    }))
                );
            })
            .catch(() => {
                setInflowData([]);
                setOutflowData([]);
            });
    }, []);

    const emptyState = (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 260 }}>
            <Typography color="text.secondary">No data available</Typography>
        </Box>
    );

    return (
        <Grid container spacing={3}>
            <Grid size={6}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Inflow by Category
                        </Typography>
                        {inflowData.length === 0 ? emptyState : (
                            <BarChart
                                dataset={inflowData}
                                xAxis={[{
                                    scaleType: "band",
                                    dataKey: "category",
                                    label: "Category",
                                    categoryGapRatio: 0.4,
                                    labelStyle: { fontWeight: 700, fontSize: 15, fill: "#1e3a5f" },
                                }]}
                                yAxis={[{
                                    label: "Amount (USD)",
                                    labelStyle: { fontWeight: 700, fontSize: 15, fill: "#1e3a5f" },
                                }]}
                                series={[{ dataKey: "amount", label: "Inflow", color: "#16a34a" }]}
                                height={260}
                            />
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={6}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Outflow by Category
                        </Typography>
                        {outflowData.length === 0 ? emptyState : (
                            <BarChart
                                dataset={outflowData}
                                xAxis={[{
                                    scaleType: "band",
                                    dataKey: "category",
                                    label: "Category",
                                    categoryGapRatio: 0.4,
                                    labelStyle: { fontWeight: 700, fontSize: 15, fill: "#1e3a5f" },
                                }]}
                                yAxis={[{
                                    label: "Amount (USD)",
                                    labelStyle: { fontWeight: 700, fontSize: 15, fill: "#1e3a5f" },
                                }]}
                                series={[{ dataKey: "amount", label: "Outflow", color: "#dc2626" }]}
                                height={260}
                            />
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

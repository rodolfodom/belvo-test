import { Card, CardContent, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";

interface StatsCardProps {
    title: string;
    footer: string;
    value: string;
    icon?: ReactNode;
    accentColor?: string;
}

export function StatsCard({ title, footer, value, icon, accentColor = "#1e3a5f" }: StatsCardProps) {
    return (
        <Card
            elevation={0}
            sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {title}
                    </Typography>
                    {icon && (
                        <Box
                            sx={{
                                color: accentColor,
                                display: 'flex',
                                bgcolor: `${accentColor}18`,
                                borderRadius: 2,
                                p: 1,
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ color: accentColor, mb: 0.5 }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {footer}
                </Typography>
            </CardContent>
        </Card>
    );
}

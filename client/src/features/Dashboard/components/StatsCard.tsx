import { Card, CardContent, Typography } from "@mui/material";

export function StatsCard({ title, footer, value }: { title: string; footer: string; value: string }) {
    return (
        <Card sx={{ minWidth: 275 }} variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {footer}
                </Typography>
            </CardContent>
        </Card>
    );
}
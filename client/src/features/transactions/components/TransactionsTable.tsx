import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';

const headCellSx = {
    fontWeight: 600,
    color: 'text.secondary',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    bgcolor: 'background.default',
};

export default function TransactionsTable() {
    const { transactions, getTransactions } = useTransactions();

    useEffect(() => {
        getTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
        >
            <Table sx={{ minWidth: 650 }} aria-label="transactions table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={headCellSx}>Reference</TableCell>
                        <TableCell align="right" sx={headCellSx}>Account</TableCell>
                        <TableCell align="right" sx={headCellSx}>Amount</TableCell>
                        <TableCell align="right" sx={headCellSx}>Date</TableCell>
                        <TableCell align="right" sx={headCellSx}>Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No transactions yet.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                '&:hover': { bgcolor: 'background.default' },
                            }}
                        >
                            <TableCell component="th" scope="row">
                                <Typography variant="body2" fontWeight={500}>
                                    {transaction.reference}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" color="text.secondary">
                                    {transaction.account}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{
                                        color: transaction.type === 'inflow' ? '#16a34a' : '#dc2626',
                                    }}
                                >
                                    {transaction.type === 'inflow' ? '+' : '-'}$
                                    {Math.abs(transaction.amount).toLocaleString()}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="body2" color="text.secondary">
                                    {transaction.date}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Chip
                                    label={transaction.type}
                                    size="small"
                                    sx={{
                                        bgcolor: transaction.type === 'inflow' ? '#dcfce7' : '#fee2e2',
                                        color: transaction.type === 'inflow' ? '#16a34a' : '#dc2626',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        border: 'none',
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

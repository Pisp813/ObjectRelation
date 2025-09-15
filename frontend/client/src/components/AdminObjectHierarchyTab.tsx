import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useObjectContext } from '@/contexts/ObjectContext';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
} from '@mui/material';
import HierarchyTypeEditDialog from './HierarchyTypeEditDialog'; // make sure path is correct

interface HierarchyType {
  id: number;
  object_type: number;
  inventory: string[];
  purchase: string[];
}

export default function AdminObjectHierarchyTab() {
  const { state } = useObjectContext();
  const selectedObject = state.selectedObject;

  const [openEdit, setOpenEdit] = useState(false);

  const { data, isLoading, error } = useQuery<HierarchyType>({
    queryKey: ['hierarchy-type', selectedObject?.id],
    enabled: !!selectedObject,
    queryFn: async () => {
      const response = await fetch(`/api/hierarchy-types/${selectedObject!.id}`);
      if (!response.ok) throw new Error('Failed to fetch hierarchy');
      return response.json();
    },
  });

  if (!selectedObject)
    return (
      <Typography variant="body1" color="textSecondary">
        Select an object to see hierarchy
      </Typography>
    );
  if (isLoading) return <Typography>Loading hierarchy...</Typography>;
  if (error)
    return (
      <Typography color="error">Failed to load hierarchy</Typography>
    );

  return (
    <Box p={3} sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h5" fontWeight={700} color="primary">
          {selectedObject.object_type} Hierarchy
        </Typography>
        {/* <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenEdit(true)}
        >
          Edit
        </Button> */}
      </Box>

      {/* Inventory table */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Inventory Columns
      </Typography>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          mb: 4,
          overflowX: 'auto',
          background: 'linear-gradient(135deg, #E3F2FD, #FFFFFF)',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              {data?.inventory.map((col, idx) => (
                <TableCell
                  key={idx}
                  sx={{
                    fontWeight: 600,
                    color: 'primary.dark',
                    textAlign: 'center',
                  }}
                >
                  <Chip
                    label={col}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {data?.inventory.map((_, idx) => (
                <TableCell key={idx} sx={{ textAlign: 'center' }}>
                  -
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Purchase table */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Purchase Columns
      </Typography>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          mb: 4,
          overflowX: 'auto',
          background: 'linear-gradient(135deg, #FCE4EC, #FFFFFF)',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'secondary.light' }}>
            <TableRow>
              {data?.purchase.map((col, idx) => (
                <TableCell
                  key={idx}
                  sx={{
                    fontWeight: 600,
                    color: 'secondary.dark',
                    textAlign: 'center',
                  }}
                >
                  <Chip
                    label={col}
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {data?.purchase.map((_, idx) => (
                <TableCell key={idx} sx={{ textAlign: 'center' }}>
                  -
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Edit dialog */}
      <HierarchyTypeEditDialog
        objectId={selectedObject.id}
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      />
    </Box>
  );
}

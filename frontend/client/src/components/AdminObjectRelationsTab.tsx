import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import { Link as LinkIcon, Edit, Delete, Lan } from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ObjectType, RelationTypeBase } from '@shared/schema';
import CreateTypeRelationDialog from './CreateTypeRelationDialog';
import EditRelationTypeDialog from './EditRelationTypeDialog';

export default function AdminRelationTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<RelationTypeBase | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: relationTypes = [] } = useQuery<RelationTypeBase[]>({
    queryKey: ['/api/relation-types'],
  });

  const { data: objectTypes = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/object-types'],
  });

  const deleteRelationTypeMutation = useMutation({
    mutationFn: async (relationTypeId: number) => apiRequest('DELETE', `/api/relation-types/${relationTypeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/relation-types'] });
      toast({ title: 'Success', description: 'Relation type deleted successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete relation type.', variant: 'destructive' });
    },
  });

  const handleDeleteRelationType = (id: number) => {
    if (confirm('Are you sure you want to delete this relation type?')) {
      deleteRelationTypeMutation.mutate(id);
    }
  };

  const handleEditRelationType = (relation: RelationTypeBase) => {
    setEditingRelation(relation);
    setIsEditDialogOpen(true);
  };

  const getObjectTypeName = (id: number) => objectTypes.find((o) => o.id === id)?.object_type || 'Unknown';

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Card sx={{ borderRadius: 4, boxShadow: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <CardHeader
          avatar={<Lan color="primary" sx={{ fontSize: 32 }} />}
          title={<Typography variant="h5" sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg, #6a11cb, #2575fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Relation Types</Typography>}
          subheader={<Typography color="text.secondary">Manage all relation types between object types.</Typography>}
        />

        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              All Relation Types
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<LinkIcon />}
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{ bgcolor: '#2575fc', '&:hover': { bgcolor: '#6a11cb' } }}
            >
              Add Relation Type
            </Button>
          </Box>

          {relationTypes.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>Primary Object Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>Secondary Object Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'white', width: 150 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relationTypes.map((relation) => (
                    <TableRow key={relation.id} hover sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                      <TableCell>
                        <Chip label={relation.name} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{getObjectTypeName(relation.primary_type)}</TableCell>
                      <TableCell>{getObjectTypeName(relation.secondary_type)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleEditRelationType(relation)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRelationType(relation.id)}
                              disabled={deleteRelationTypeMutation.isPending}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={6} color="text.secondary">
              <LinkIcon sx={{ fontSize: 60, mb: 2, color: '#2575fc' }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                No relation types found
              </Typography>
              <Typography>Create one to get started.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTypeRelationDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
      <EditRelationTypeDialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} relationType={editingRelation} />
    </Box>
  );
}

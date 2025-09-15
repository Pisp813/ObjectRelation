import { useQuery } from '@tanstack/react-query';
import { useObjectContext } from '@/contexts/ObjectContext';
import { ObjectType } from '@shared/schema';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export default function AdminObjectInformationTab() {
  const { state, dispatch } = useObjectContext();

  const { data: objects = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/object-types'],
  });

  const handleObjectSelect = (object: ObjectType) => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: object });
  };

  const filteredObjects = objects.filter(
    (obj) =>
      obj.name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      obj.description?.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }} data-testid="object-information-tab">
      {state.selectedObject && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Object Info */}
          <Card
            elevation={6}
            sx={{
              background: 'linear-gradient(135deg, #E0E7FF, #FFFFFF, #F3E8FF)',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                Object Information
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong>{' '}
                <span style={{ color: '#3f51b5' }}>{state.selectedObject.object_type}</span>
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong>{' '}
                <span style={{ color: '#555' }}>{state.selectedObject.description}</span>
              </Typography>
            </CardContent>
          </Card>

          {/* Attributes + Tables */}
{/* <Grid container spacing={3} sx = {{ width: '100%' }}> */}
  {/* Attributes */}
  {state.selectedObject.attributes?.length > 0 && (
    <Grid item xs={12}>
      <Card
        elevation={4}
        sx={{
          background: 'linear-gradient(135deg, #E8F5E9, #FFFFFF, #C8E6C9)',
          borderRadius: 3,
          width: '100%',
        }}
      >
        <CardContent>
          <Typography variant="h6" color="success.main" gutterBottom>
            Attributes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {state.selectedObject.attributes.map((attr: string, index: number) => (
              <Chip
                key={index}
                label={attr}
                color="success"
                variant="outlined"
                sx={{
                  fontWeight: '500',
                  minWidth: 120,
                  justifyContent: 'center',
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  boxShadow: 1,
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )}

  {/* Tables */}
  {state.selectedObject.tables?.length > 0 && (
    <Grid item xs={12}>
      <Card
        elevation={4}
        sx={{
          background: 'linear-gradient(135deg, #F3E5F5, #FFFFFF, #E1BEE7)',
          borderRadius: 3,
          width: '100%',
        }}
      >
        <CardContent>
          <Typography variant="h6" color="secondary" gutterBottom>
            Tables
          </Typography>
          {state.selectedObject.tables.map((table: any, index: number) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="secondary.dark"
                gutterBottom
              >
                {table.name}
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'secondary.light' }}>
                      {table.columns.map((col: string, colIndex: number) => (
                        <TableCell key={colIndex} sx={{ fontWeight: '600' }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      {table.columns.map((col: string, colIndex: number) => (
                        <TableCell key={colIndex}>-</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Grid>
  )}
{/* </Grid> */}

        </Box>
      )}
    </Box>
  );
}

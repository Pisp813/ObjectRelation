import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';

interface TableColumn {
  name: string;
  type: 'string' | 'int' | 'double' | 'boolean';
}

interface TableData {
  name: string;
  columns: TableColumn[];
  data: any[][];
}

interface DataTableProps {
  table: TableData;
  objectId: string;
}

export default function DataTable({ table, objectId }: DataTableProps) {
  const [data, setData] = useState(table.data || []);

  const handleAddRow = () => {
    const newRow = new Array(table.columns.length).fill('');
    setData([...data, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (confirm('Are you sure you want to delete this row?')) {
      setData(data.filter((_, index) => index !== rowIndex));
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = table.columns.map(col => col.name).join(',');
    const rows = data.map(row => row.join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name.replace(/\s+/g, '_').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card data-testid={`data-table-${table.name.replace(/\s+/g, '-').toLowerCase()}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{table.name}</CardTitle>
            <p className="text-muted-foreground mt-1">
              Manage {table.name.toLowerCase()} data with editable rows
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleAddRow}
              data-testid="button-add-row"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {table.columns.map((column, index) => (
                  <th 
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    data-testid={`column-header-${index}`}
                  >
                    {column.name}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} data-testid={`table-row-${rowIndex}`}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm">
                      {table.columns[colIndex].name.toLowerCase().includes('role') && typeof cell === 'string' ? (
                        <Badge className={getRoleBadgeColor(cell)}>
                          {cell}
                        </Badge>
                      ) : (
                        <input
                          type="text"
                          value={cell || ''}
                          onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                          className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1"
                          data-testid={`cell-${rowIndex}-${colIndex}`}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        data-testid={`button-edit-row-${rowIndex}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteRow(rowIndex)}
                        data-testid={`button-delete-row-${rowIndex}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No data available. Click "Add Row" to start adding data.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

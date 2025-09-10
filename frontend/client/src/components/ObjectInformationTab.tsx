import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ObjectCard from './ObjectCard';
import PropertiesTable from './PropertiesTable';
import DataTable from './DataTable';
import { useObjectContext } from '@/contexts/ObjectContext';
import { ObjectType } from '@shared/schema';

export default function ObjectInformationTab() {
  const { state, dispatch } = useObjectContext();

  const { data: objects = [] } = useQuery<ObjectType[]>({
    queryKey: ['/api/objects'],
  });

  const handleObjectSelect = (object: ObjectType) => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: object });
  };

  // Filter objects based on search query
  const filteredObjects = objects.filter(obj =>
    obj.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    obj.description.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="object-information-tab">
      {/* Objects Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-foreground mb-6">Objects Overview</h2>
        
        {/* Search Result Highlight */}
        {state.searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Search Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.searchResults.map((result, index) => (
                <ObjectCard
                  key={result.object.id}
                  object={result.object}
                  onClick={() => handleObjectSelect(result.object)}
                  isSearchResult={true}
                  data-testid={`search-result-${index}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Objects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredObjects.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              onClick={() => handleObjectSelect(object)}
            />
          ))}
        </div>

        {filteredObjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {state.searchQuery 
                ? `No objects found matching "${state.searchQuery}"` 
                : "No objects available. Create your first object to get started."
              }
            </p>
          </div>
        )}
      </div>

      {/* Object Properties Section */}
      {state.selectedObject && (
        <>
          <PropertiesTable object={state.selectedObject} />
          
          {/* Object Tables Section */}
          {state.selectedObject.tables && Array.isArray(state.selectedObject.tables) && 
           state.selectedObject.tables.length > 0 && (
            <div className="space-y-6">
              {state.selectedObject.tables.map((table: any, index: number) => (
                <DataTable
                  key={`${state.selectedObject!.id}-table-${index}`}
                  table={table}
                  objectId={state.selectedObject!.id}
                  data-testid={`data-table-${index}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

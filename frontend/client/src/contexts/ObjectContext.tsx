import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ObjectType, Relation, Hierarchy } from '@shared/schema';

interface ObjectState {
  objects: ObjectType[];
  selectedObject: ObjectType | null;
  relations: Relation[];
  hierarchies: Hierarchy[];
  activeTab: 'information' | 'relations' | 'hierarchy';
  searchResults: any[];
  searchQuery: string;
  isLoading: boolean;
}

type ObjectAction =
  | { type: 'SET_OBJECTS'; payload: ObjectType[] }
  | { type: 'SET_SELECTED_OBJECT'; payload: ObjectType | null }
  | { type: 'SET_RELATIONS'; payload: Relation[] }
  | { type: 'SET_HIERARCHIES'; payload: Hierarchy[] }
  | { type: 'SET_ACTIVE_TAB'; payload: 'information' | 'relations' | 'hierarchy' }
  | { type: 'SET_SEARCH_RESULTS'; payload: any[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_OBJECT'; payload: ObjectType }
  | { type: 'UPDATE_OBJECT'; payload: ObjectType }
  | { type: 'REMOVE_OBJECT'; payload: string };

const initialState: ObjectState = {
  objects: [],
  selectedObject: null,
  relations: [],
  hierarchies: [],
  activeTab: 'information',
  searchResults: [],
  searchQuery: '',
  isLoading: false,
};

function objectReducer(state: ObjectState, action: ObjectAction): ObjectState {
  switch (action.type) {
    case 'SET_OBJECTS':
      return { ...state, objects: action.payload };
    case 'SET_SELECTED_OBJECT':
      return { ...state, selectedObject: action.payload };
    case 'SET_RELATIONS':
      return { ...state, relations: action.payload };
    case 'SET_HIERARCHIES':
      return { ...state, hierarchies: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'ADD_OBJECT':
      return { ...state, objects: [...state.objects, action.payload] };
    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj =>
          obj.id === action.payload.id ? action.payload : obj
        ),
        selectedObject: state.selectedObject?.id === action.payload.id ? action.payload : state.selectedObject
      };
    case 'REMOVE_OBJECT':
      return {
        ...state,
        objects: state.objects.filter(obj => obj.id !== action.payload),
        selectedObject: state.selectedObject?.id === action.payload ? null : state.selectedObject
      };
    default:
      return state;
  }
}

const ObjectContext = createContext<{
  state: ObjectState;
  dispatch: React.Dispatch<ObjectAction>;
} | null>(null);

export function ObjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(objectReducer, initialState);

  return (
    <ObjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ObjectContext.Provider>
  );
}

export function useObjectContext() {
  const context = useContext(ObjectContext);
  if (!context) {
    throw new Error('useObjectContext must be used within an ObjectProvider');
  }
  return context;
}

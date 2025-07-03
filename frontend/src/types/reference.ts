export interface Collaborator {
  id: number;
  name: string;
  email: string;
}

export interface Reference {
  id: number;
  receiverId: number;
  receiver?: {
    name: string;
    email: string;
  };
  justification?: string;
  feedback?: string;
}

export interface ReferenceEvaluationFormProps {
  selectedCollaborators: Collaborator[];
  onRemoveCollaborator: (collaboratorId: number) => void;
  myReferences: Reference[];
  setMyReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
  cycleId: number;
}

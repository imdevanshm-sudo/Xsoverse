export interface RitualOption {
  id: string;
  title: string;
  subtitle: string;
  bgClass: string;
}

export interface SelectionState {
  type: 'message' | 'me';
}
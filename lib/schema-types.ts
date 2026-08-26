export type FieldType = 'text' | 'textarea' | 'image' | 'boolean' | 'number' | 'select' | 'color' | 'url';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  defaultValue?: any;
  options?: FieldOption[]; // For 'select' fields
  required?: boolean;
}

export interface ComponentSchema {
  type: string;
  label: string;
  description?: string;
  fields: FieldSchema[];
}

// A full map of Component Schemas used across the platform
export type ComponentRegistry = Record<string, ComponentSchema>;

/**
 * Utility functions for FormData operations
 */

/**
 * Converts an object to FormData
 * @param data - Object to convert to FormData
 * @param options - Configuration options
 * @returns FormData instance
 */
export function createFormData(
  data: Record<string, any>, 
  options: {
    excludeEmpty?: boolean;
    excludeNull?: boolean;
    excludeUndefined?: boolean;
    arrayHandling?: 'brackets' | 'repeat' | 'comma';
  } = {}
): FormData {
  const {
    excludeEmpty = false,
    excludeNull = true,
    excludeUndefined = true,
    arrayHandling = 'repeat'
  } = options;

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // Skip null values if configured
    if (excludeNull && value === null) return;
    
    // Skip undefined values if configured
    if (excludeUndefined && value === undefined) return;
    
    // Skip empty strings if configured
    if (excludeEmpty && value === '') return;

    // Handle arrays
    if (Array.isArray(value)) {
      handleArrayValue(formData, key, value, arrayHandling);
      return;
    }

    // Handle File objects
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // Handle Blob objects
    if (value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    // Handle objects (convert to JSON string)
    if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // Handle primitive values
    formData.append(key, String(value));
  });

  return formData;
}

/**
 * Handles array values in FormData based on the specified handling method
 */
function handleArrayValue(
  formData: FormData, 
  key: string, 
  array: any[], 
  handling: 'brackets' | 'repeat' | 'comma'
): void {
  switch (handling) {
    case 'brackets':
      // Append as key[0], key[1], etc.
      array.forEach((item, index) => {
        formData.append(`${key}[${index}]`, String(item));
      });
      break;
    
    case 'comma':
      // Append as single comma-separated string
      formData.append(key, array.join(','));
      break;
    
    case 'repeat':
    default:
      // Append multiple entries with same key
      array.forEach(item => {
        formData.append(key, String(item));
      });
      break;
  }
}

/**
 * Converts FormData back to a plain object (useful for debugging)
 * @param formData - FormData to convert
 * @returns Plain object representation
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    if (obj[key]) {
      // If key already exists, convert to array
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

/**
 * Logs FormData contents for debugging
 * @param formData - FormData to log
 * @param label - Optional label for the log
 */
export function logFormData(formData: FormData, label = 'FormData'): void {
  console.group(`${label} Contents:`);
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else if (value instanceof Blob) {
      console.log(`${key}:`, `Blob(${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}:`, value);
    }
  }
  console.groupEnd();
}

/**
 * Creates FormData with file handling for common use cases
 * @param data - Object containing form data
 * @param files - Object containing files to append
 * @returns FormData with both data and files
 */
export function createFormDataWithFiles(
  data: Record<string, any>,
  files: Record<string, File | File[]> = {}
): FormData {
  const formData = createFormData(data);
  
  Object.entries(files).forEach(([key, file]) => {
    if (Array.isArray(file)) {
      file.forEach(f => formData.append(key, f));
    } else {
      formData.append(key, file);
    }
  });
  
  return formData;
}
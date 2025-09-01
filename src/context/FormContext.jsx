import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext(undefined);

export function FormProvider({ children }) {
  const [formData, setFormData] = useState({
    profile: {},
    teaching: {},
    research: {},
    administrative: {},
    development: {},
  });

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const getSectionProgress = (section) => {
    const sectionData = formData[section];
    if (!sectionData) return 0;
    
    const totalFields = Object.keys(sectionData).length;
    const filledFields = Object.values(sectionData).filter(value => value && value !== '').length;
    
    return totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, getSectionProgress }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
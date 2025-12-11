import React from 'react';
import { AcademicModule as NewAcademicModule } from './AcademicModuleNew';
import '../styles/AcademicModule.css';

const AcademicModule = ({ onSelectItem, selectedItem }) => {
  // Usamos directamente el nuevo componente AcademicModule
  return <NewAcademicModule />;
};

export default AcademicModule;
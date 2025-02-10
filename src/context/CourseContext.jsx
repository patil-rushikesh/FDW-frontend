// CourseContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

// Create Context
const CourseContext = createContext();

// Provider Component
export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([
    { id: 1, code: "", semester: "Sem I" },
  ]);

  useEffect(() => {
    console.log("Updated Course List:", courses); // Print globally for testing
  }, [courses]);

  return (
    <CourseContext.Provider value={{ courses, setCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom Hook for accessing context
export const useCourses = () => useContext(CourseContext);

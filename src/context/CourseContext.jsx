// CourseContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeCoursesFromDatabase = async () => {
      if (isInitialized) return;

      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.dept || !userData?._id) return;

      try {
        const response = await fetch(
          `${process.env.BASE_URL}/${userData.dept}/${userData._id}/A`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        if (data['1']?.courses) {
          // Create a more complete course object
          const coursesFromDB = Object.entries(data['1'].courses).map(([courseCode, courseData]) => ({
            id: Date.now() + Math.random(),
            code: courseCode,
            semester: data['2']?.courses[courseCode]?.semester || "Sem I",
            resultData: courseData,
            coData: data['2']?.courses[courseCode] || {},
            academicData: data['4']?.courses[courseCode] || {},
            feedbackData: data['7']?.courses[courseCode] || {}
          }));
          
          setCourses(coursesFromDB);
          // Store in localStorage for persistence
          localStorage.setItem('courseData', JSON.stringify(coursesFromDB));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing courses:", error);
        // Try to load from localStorage if fetch fails
        const storedCourses = localStorage.getItem('courseData');
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses));
        }
        setIsInitialized(true);
      }
    };

    initializeCoursesFromDatabase();
  }, [isInitialized]);

  // Add a save function to persist changes
  const saveCourses = (newCourses) => {
    setCourses(newCourses);
    localStorage.setItem('courseData', JSON.stringify(newCourses));
  };

  return (
    <CourseContext.Provider value={{ 
      courses, 
      setCourses: saveCourses, 
      isInitialized 
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);
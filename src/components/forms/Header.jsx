import { useState, useEffect } from "react";
import { useCourses } from "../../context/CourseContext"; // Import context
import { Trash2 } from "lucide-react"; // Import delete icon

const Header = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const userData = JSON.parse(localStorage.getItem("userData"));

  const { courses, setCourses } = useCourses(); // Use global courses state

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), code: "", semester: "Sem I" }]); // Unique ID using Date.now()
  };

  const updateCourse = (id, field, value) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const deleteCourse = (id) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Current Time:</span>
          <span className="font-mono text-blue-600 font-medium">
            {formatDateTime(currentDateTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">User:</span>
          <span className="font-mono text-green-600 font-medium">
            {userData?.name || "User"}
          </span>
        </div>
      </div>

      {/* Course Inputs */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold text-gray-700">Courses</h2>
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex flex-wrap items-center gap-2 sm:space-x-3 mt-2"
          >
            <input
              type="text"
              placeholder="Course Code"
              value={course.code}
              onChange={(e) => updateCourse(course.id, "code", e.target.value)}
              className="border rounded-lg p-2 w-full sm:w-40"
            />
            <select
              value={course.semester}
              onChange={(e) =>
                updateCourse(course.id, "semester", e.target.value)
              }
              className="border rounded-lg p-2 w-full sm:w-auto"
            >
              <option value="Sem I">Sem I</option>
              <option value="Sem II">Sem II</option>
            </select>
            {/* Delete Button */}
            <button
              onClick={() => deleteCourse(course.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-md"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          onClick={addCourse}
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Course
        </button>
      </div>
    </div>
  );
};

export default Header;
